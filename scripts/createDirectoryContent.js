import fs from 'fs';
import path from 'path';
import { fileContent } from '../constants/dokcerPg.js';
const CURR_DIR = process.cwd();

const createDirectoryContents = (templatePath, newProjectPath, docker) => {
    const filesToCreate = fs.readdirSync(templatePath);

    filesToCreate.forEach((file) => {
        const originFilePath = `${templatePath}/${file}`;
        const stats = fs.statSync(originFilePath);

        if (stats.isFile()) {
            const contents = fs.readFileSync(originFilePath, 'utf-8');

            if (file === '.npmignore') file = '.gitignore';

            const writePath = `${CURR_DIR}/${newProjectPath}/${file}`;
            fs.writeFileSync(writePath, contents, 'utf-8');
        } else if (stats.isDirectory()) {
            fs.mkdirSync(`${CURR_DIR}/${newProjectPath}/${file}`);

            createDirectoryContents(`${templatePath}/${file}`, `${newProjectPath}/${file}`);
        }
    });
};

export default createDirectoryContents;
