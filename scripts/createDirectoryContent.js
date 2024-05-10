import fs from 'fs';
const CURR_DIR = process.cwd();

const createDirectoryContents = (templatePath, newProjectPath, answers) => {
    const filesToCreate = fs.readdirSync(templatePath);
    const basePath = `${CURR_DIR}/${newProjectPath}`;
    filesToCreate.forEach((file) => {
        const originFilePath = `${templatePath}/${file}`;
        const stats = fs.statSync(originFilePath);
        if (stats.isFile()) {
            const contents = fs.readFileSync(originFilePath, 'utf-8');

            if (file === '.npmignore') file = '.gitignore';

            const writePath = `${basePath}/${file}`;
            fs.writeFileSync(writePath, contents, 'utf-8');
        } else if (stats.isDirectory()) {
            fs.mkdirSync(`${basePath}/${file}`);
            createDirectoryContents(`${templatePath}/${file}`, `${newProjectPath}/${file}`, answers);
        }
    });
};

export const setPackageContent = (basePath, answers) => {
    const pack = `${basePath}/package.json`;
    fs.readFile(pack, 'utf-8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier :', err);
            return;
        }
        const keywordsArr = answers.keywords.split(" ");
        const newContent = data
        .replace('"name": "zaza"', `"name": \"${answers.projectName}\"`)
        .replace('"author": ""', `"author": "${answers.author}"`)
        .replace('"url": ""', `"url": "${answers.repo}"`)
        .replace('"keywords": []', `"keywords": ["${keywordsArr.join('","')}"]`);

        fs.writeFile(pack, newContent, "utf-8", (err) => {
            if (err) {
                console.error('Error while set package.json :', err);
                return;
            }
            console.log('package.json successfully set');
        });
    });
}

export default createDirectoryContents;
