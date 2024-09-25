const fs = require('fs');
const path = require('path');
const packageJson = require('./package.json');

const version = packageJson.version;
const versionFilePath = path.join(__dirname, 'version.txt');

if (version) {
    fs.writeFileSync(versionFilePath, version, 'utf8');

    console.log(`Version ${version} written to version.txt`);
} else {
    console.error('Version number is missing in package.json');
    process.exit(1);
}