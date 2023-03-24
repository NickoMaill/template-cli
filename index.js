#!/usr/bin/env node

import inquirer from 'inquirer';
import fs from 'fs';
import ora from 'ora';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import createDirectoryContents from './scripts/createDirectoryContent.js';
import { exec } from 'child_process';
import { fileContent as pgsql} from './constants/dokcerPg.js';

String.prototype.toCapitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

String.prototype.toKamelCase = function() {
    const kamel = this.split(" ").join();
    return kamel.charAt(0).toLowerCase() + kamel.slice(1);
}

const CURR_DIR = process.cwd();

const __dirname = dirname(fileURLToPath(import.meta.url));

const CHOICES = fs.readdirSync(`${__dirname}/templates`).map((choice) => {
    return {
        name: choice.toCapitalize().replace(/([a-z])([A-Z])/g, '$1 $2'),
        value: choice,
    }
})

const QUESTION = [
    {
        name: 'isSure',
        type: 'list',
        message: 'These templates is fully builded with typescript and webpack are you sure to proceed ? ',
        choices: [
            {
                name: 'Yes i do',
                value: true,
            },
            {
                name: "No i don't",
                value: false,
            },
        ],
    },
];

const QUESTIONS = [
    {
        name: 'projectChoice',
        type: 'list',
        message: 'what project template would you like to generate ?',
        choices: CHOICES,
    },
    {
        name: 'projectName',
        type: 'input',
        message: 'project name : ',
        validate: (input) => {
            if (/^([A-Za-z\-\\_\d])+$/.test(input)) return true;
            else return 'Project name may only includes letters, numbers, underscores and hashes';
        },
    },
    {
        name: 'docker',
        type: 'list',
        message: 'Do you want to use docker ?',
        choices: [
            {
                name: 'yes',
                value: true,
            },
            {
                name: 'no',
                value: true,
            },
        ],
    },
    {
        name: 'database',
        type: 'list',
        message: 'Do you want tu use database ?',
        choices: [
            {
                name: 'yes PostgreSQL',
                value: 'pg',
            },
            {
                name: 'yes mySql',
                value: 'mySql',
            },
            {
                name: 'no database, thank you',
                value: 'noDb',
            },
        ],
    },
    {
        name: 'seque',
        type: 'list',
        message: 'Do you want to add sequelize',
        choices: [
            {
                name: 'yes',
                value: true,
            },
            {
                name: 'no',
                value: true,
            },
        ],
    },
];

const wouldCreate = () => {
    inquirer.prompt(QUESTION).then((answers) => {
        if (answers.isSure) {
            promptToCreate();
        } else {
            console.log('we are sorry... maybe you should learn typescript !');
            return;
        }
    });
};

const promptToCreate = () => {
    inquirer.prompt(QUESTIONS).then((answers) => {
        const projectChoice = answers.projectChoice;
        const projectName = answers.projectName;
        const templatePath = `${__dirname}/templates/${projectChoice}`;
        const projectPath = `${CURR_DIR}/${projectName}`;

        console.log('creating project and files');
        fs.mkdirSync(projectPath);
        createDirectoryContents(templatePath, projectName, answers.docker);
        exec('git init', { cwd: projectPath });

        if (answers.docker && answers.database !== "noDb") {
            const dbImage = (db) => db === "pg" ? pgsql : "";

            exec("touch docker-compose.yml", { cwd: projectPath });
            exec(`echo \"${dbImage(answers.database)}\" >> ${projectPath}/docker-compose.yml`, { cwd: projectPath })
        }

        console.log('installing dependencies...');
        exec('npm i express cookie-parser cors cross-env dotenv dotenv-webpack esbuild express-async-errors express-list-endpoints helmet http-errors moment morgan node-fetch@2.6.1 winston xss webpack-shell-plugin uuid tslib multer', { cwd: projectPath }).on('close', () => {
            console.log('installing types...');
            exec('npm un -D @types/cookie-parser @types/cors @types/express @types/express-list-endpoints @types/http-errors @types/morgan @types/multer @types/node-fetch@2.6.2 @types/request @types/uuid copy-webpack-plugin kill-port prettier resolve-tspaths ts-loader ts-node tsconfig-paths tslint typescript webpack webpack-cli webpack-node-externals', { cwd: projectPath });
        }).on('close', () => {
            console.log(`project successfully builded`);
        })
    });
};

wouldCreate();
