// =================================================================================== //
// this is a prebuild StandardError object.                                            //
// Invoke this tool when you want to catch a server error.                             //
// =================================================================================== //

import { NextFunction } from 'express';
import { AppRequest, AppResponse } from './controllerBase';
import { HttpError } from 'http-errors';
import { StandardError } from './standardError';
import configManager from '../managers/configManager';
import logManager from '../managers/logManager';

class ErrorHandlers {
    public async commonErrorHandler(err: any, req: AppRequest, res: AppResponse, next: NextFunction) {
        if (err instanceof StandardError) {
            const error = err as StandardError<any>;

            logManager.error(error.key, `-> [${error.errorCode}] : ${error.message} -> ${error.detailedMessage}`);
            logManager.error(error.key, `-> [${error.errorCode}] : ${error.stack}`);

            if (!res.headersSent) {
                let statusCode: number;

                if (error.status === 'BAD_REQUEST') statusCode = 400;
                else if (error.status === 'UNAUTHORIZED') statusCode = 401;
                else if (error.status === 'FORBIDDEN') statusCode = 403;
                else if (error.status === 'NOT_FOUND') statusCode = 404;
                else if (error.status === 'UNAVAILABLE') statusCode = 503;
                else statusCode = 500;
            }
        } else if (err instanceof HttpError) {
            const error = err as Error;

            logManager.error('AppErrorHandler', `${(err as Error).message} -> ${(err as Error).stack}`);
            res.status(err.status).json({
                errorCode: 'http_error',
                message: configManager.getConfig.SHOW_ERROR_DETAILS ? error.message : `Internal Server Error!`,
            });
        } else {
            const error = err as Error;

            logManager.error('AppErrorHandler', `${error.message} -> ${error.stack}`);
            res.status(500).json({
                errorCode: 'internal_error',
                message: configManager.getConfig.SHOW_ERROR_DETAILS ? error.message : `Internal Server Error!`,
            });
        }
    }
}

export default new ErrorHandlers();
