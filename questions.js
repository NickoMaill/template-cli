export const EXPRESS_QUESTIONS = [
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
]