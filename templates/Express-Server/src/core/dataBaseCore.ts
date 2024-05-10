import configManager from '~/managers/configManager';
import { Client, DatabaseError, Pool, QueryResult } from 'pg';
import format from 'pg-format';
import { ApiTable, DatabaseCoreQuery, InsertFormatOut, ParamsType } from '~/core/CoreApiTypes';
import { OutputQueryRequest } from './typeCore';
import errorHandlers from './errorHandlers';
import Tools from '~/helpers/Tools';

export type DataBaseAppError = DatabaseError;

export class DatabaseCore {
    //#region Constructor
    protected readonly core: Pool;
    private readonly client: Client;
    private readonly table: ApiTable;
    private readonly formatter: (sql: string, ...args: any[]) => string;
    private readonly customTableFormater: (sql: string, ...args: any[]) => string;
    constructor(apiTable?: ApiTable) {
        this.core = new Pool({ ssl: configManager.sslConfig() });
        this.client = new Client();
        this.client.connect();
        this.table = apiTable;

        format.config();
        this.formatter = (sql, ...args) => format(sql, apiTable, ...args);
        this.customTableFormater = (sql, ...args) => format(sql, args[0], apiTable, ...args.slice(1));
    }
    //#endregion

    //#region Protected
    protected async getAll<T>(): Promise<OutputQueryRequest<T>> {
        const result = await this.databaseEngine<T>(this.formatter('SELECT *, count(*) OVER() AS "totalRecords" FROM %I'));
        return this.formatOutputData(result);
    }

    protected async getById<T>(id: number): Promise<OutputQueryRequest<T>> {
        const result = await this.databaseEngine<T>(this.formatter('SELECT *, count(*) OVER() AS "totalRecords" FROM %I WHERE id = $1'), [id]);
        return this.formatOutputData<T>(result);
    }

    protected async getByQuery<T>(query: DatabaseCoreQuery<T>): Promise<OutputQueryRequest<T>> {
        const queryFormat = this.queryString(query);
        const orderMode = query.asc ? 'ASC' : 'DESC';

        if (!query.offset) {
            query.offset = 0;
        }

        if (!query.limit) {
            query.limit = 10;
        }

        let SQLString = this.customTableFormater('SELECT %s FROM %I WHERE %s OFFSET %s LIMIT %s', queryFormat.select, queryFormat.where, query.offset, query.limit);

        if (queryFormat.join.length > 0) {
            SQLString = this.customTableFormater('SELECT %s FROM %I %s WHERE %s OFFSET %s LIMIT %s', queryFormat.select, queryFormat.join, queryFormat.where, query.offset, query.limit);
        }

        if (query.order) {
            SQLString = this.customTableFormater('SELECT %s FROM %I %s WHERE %s ORDER BY %I %s OFFSET %s LIMIT %s', queryFormat.select, queryFormat.join, queryFormat.where, query.order, orderMode, query.offset, query.limit);
        }

        const result = await this.databaseEngine<T>(SQLString, queryFormat.data);
        return this.formatOutputData(result, query.offset, query.limit);
    }

    protected async add<P>(dataToInsert: P): Promise<boolean> {
        const insertFormat = this.insertFormat<P>(dataToInsert);
        const SQLString = this.formatter('INSERT INTO %I (%s) VALUES (%s)', insertFormat.insert, insertFormat.values);
        await this.databaseEngine(SQLString, insertFormat.data);
        return true;
    }

    protected async update<T>(where: DatabaseCoreQuery): Promise<boolean> {
        const queryString = this.queryString(where);
        const SQLString = this.formatter('UPDATE %I SET %s WHERE %s', queryString.updateString, queryString.where);
        await this.databaseEngine<T>(SQLString, queryString.data);
        return true;
    }

    protected async delete(id: number): Promise<boolean> {
        await this.databaseEngine(this.formatter('DELETE FROM %I WHERE "id" = $1'), [id]);
        return true;
    }

    protected async query<T>(sqlString: string, data: any[]) {
        const queryResult = await this.databaseEngine<T>(sqlString, data);
        return queryResult;
    }

    // public async BackUpDatabase(pathToBackup?: string): Promise<void> {
    //     const databaseName = await this.Query<{ current_database: string }>('SELECT current_database()', null);
    //     this.Query('pg_dump --format=plain--file --create ~/Desktop/dump.sql ' + databaseName.rows[0].current_database, null);
    // }
    //#endregion

    //#region Private
    private async databaseEngine<T>(queryString: string, data?: any[]): Promise<QueryResult<T>> {
        try {
            return await this.core.query<T>(queryString, data ? data : null);
        } catch (error) {
            errorHandlers.errorSql('DatabaseCore.DatabaseEngine', error);
        }
    }

    private insertFormat<T>(obj: T): InsertFormatOut {
        const params = Object.keys(obj);
        const dataOutput: any[] = [];

        let i = 0;
        let values = '';

        for (const value in obj) {
            i += 1;
            values += `$${i},`;
            dataOutput.push(obj[value]);
        }

        const formatValues = values.slice(0, -1);
        const output: InsertFormatOut = {
            insert: '"' + params.join('","') + '"',
            values: formatValues,
            data: dataOutput,
        };

        return output;
    }

    private queryString(query: DatabaseCoreQuery): ParamsType {
        let updateString = '';
        let whereString = '';
        let selectString = '';
        let joinString = '';
        // const joinAlias = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

        let i = 0;
        const dataOutput: any[] = [];

        if (query.like) {
            query.like.forEach((like) => {
                i += 1;
                whereString += `("name" LIKE $${i} OR "name" LIKE $${i + 1} ) AND `;
                dataOutput.push('%' + like.toLowerCase() + '%', '%' + Tools.Capitalize(like) + '%');
                i += 1;
            });
        }

        if (query.update) {
            for (const value in query.update) {
                i++;
                updateString += `"${value}" = $${i},`;
                dataOutput.push(query.update[value]);
            }
        }

        if (query.join) {
            query.join.forEach((join) => {
                // const alias = joinAlias[index];
                joinString += `${join.type} JOIN "${join.join}" ON "${join.join}"."${join.reference}" = "${this.table}"."${join.target}" `;
            });
        }

        if (query.select) {
            query.select.forEach((element) => {
                selectString += `"${String(element)}",`;
            });
            selectString += 'count(*) OVER() AS "totalRecords"';
        } else {
            selectString = '*, count(*) OVER() AS "totalRecords"';
        }

        for (const value in query.where) {
            i++;
            if (Array.isArray(query.where[value])) {
                whereString += `"${value}" IN (${query.where[value].join(',')}) AND `;
            } else {
                whereString += `"${value}" = $${i} AND `;
                dataOutput.push(query.where[value]);
            }
        }

        const formatParams = updateString.slice(0, -1);
        const formatWhereParams = whereString.slice(0, -5);
        const output: ParamsType = {
            updateString: formatParams,
            where: formatWhereParams,
            select: selectString,
            data: dataOutput,
            join: joinString,
        };
        return output;
    }

    private filterArray(array: any[]) {
        const filteredArray = array.filter((element) => {
            if (element) {
                return true;
            }
            return false;
        });
        return filteredArray;
    }

    private formatOutputData<T>(result: QueryResult, offset?: number, limit?: number): OutputQueryRequest<T> {
        const output: any = {
            records: result.rows,
            totalRecords: 0,
        };

        if (result.rowCount === 0) {
            output.message = 'records not founds';
        } else {
            output.totalRecords = parseInt(result.rows[0].totalRecords);
            output.offset = offset;
            output.limit = limit;
        }
        output.records.forEach((records) => {
            delete records.totalRecords;
        });
        return output;
    }
    //#endregion
}