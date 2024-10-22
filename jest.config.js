module.exports = {
    preset: 'ts-jest',
    transform: {
        "^.+\\.tsx?$": "babel-jest"
    },
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    testEnvironment: 'node',
};
