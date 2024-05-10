#!/usr/bin/env node
import inquirer from 'inquirer';
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import createDirectoryContents, { setPackageContent } from './scripts/createDirectoryContent.js';
import { exec } from 'child_process';
import { expressDevInstall, expressInstall, dockerFilePg as pgsql, reactDevInstall, reactInstall } from './constants/config.js';
import { EXPRESS_QUESTIONS } from './questions.js';

String.prototype.toCapitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.toKamelCase = function () {
    const kamel = this.split(' ').join();
    return kamel.charAt(0).toLowerCase() + kamel.slice(1);
};

const CURR_DIR = process.cwd();

const __dirname = dirname(fileURLToPath(import.meta.url));

let baseInstall = [];
let baseDevInstall = [];
const CHOICES = fs.readdirSync(`${__dirname}/templates`).map((choice) => {
    return {
        name: choice.toCapitalize().replace(/([a-z])([A-Z])/g, '$1 $2'),
        value: choice,
    };
});

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
        name: 'author',
        type: 'input',
        message: 'author name : ',
    },
    {
        name: 'keywords',
        type: 'input',
        message: 'add some keywords, separated by space',
    },
    {
        name: 'repo',
        type: 'input',
        message: 'repo url : ',
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

        console.log('creating project and files...');
        fs.mkdirSync(projectPath);

        createDirectoryContents(templatePath, projectName, answers);
        setPackageContent(projectPath, answers);

        exec('git init', { cwd: projectPath });

        if (projectChoice === 'Express-Server') buildExpress(answers, projectPath);
        else if (projectChoice === 'React-Typescript') buildReact(answers);

        installDependencies(projectPath);
    });
};

const installDependencies = (projectPath) => {
    console.log('installing dependencies...');
    exec(`npm i ${baseInstall.join(' ')}`, { cwd: projectPath })
        .on('close', () => {
            console.log('installing types...');
            exec(`npm i -D ${baseDevInstall.join(' ')}`, { cwd: projectPath })
            .on('close', () => {
                console.log(`project successfully builded`);
                console.log('to launch project : npm run dev');
                console.log('to format project : npm run pretty');
                console.log('to lint project : npm run lint');
            }).kill();
        })
        .kill();
};

const buildExpress = (answers, projectPath) => {
    inquirer.prompt(EXPRESS_QUESTIONS).then((ans) => {
        if (ans.docker && answers.database !== 'noDb') {
            const dbImage = (db) => (db === 'pg' ? pgsql : '');
            console.log('creating docker file');
            exec('touch docker-compose.yml', { cwd: projectPath });
            console.log('write docker file content');
            exec(`echo \"${dbImage(ans.database)}\" >> ${projectPath}/docker-compose.yml`, { cwd: projectPath });
        }
        baseInstall = expressInstall;
        baseDevInstall = expressDevInstall;
        if (answers.database === 'pg') {
            baseInstall.push('pg', 'pg-format');
        }
    });
};

const buildReact = (answers) => {
    baseInstall = reactInstall;
    baseDevInstall = reactDevInstall;
};

wouldCreate();
