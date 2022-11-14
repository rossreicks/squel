const fs = require('fs');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const main = async () => {
    // clean lib folder
    await exec('rimraf lib');

    // build tsc files
    await exec('tsc -p tsconfig-esm.json');
    await exec('tsc -p tsconfig-cjs.json');

    // replace versions in files
    const version = require('./package.json').version;

    const versionKey = '[VI]{version}[/VI]';

    const files = [path.join(__dirname, './lib/esm/squel.js'), path.join(__dirname, './lib/cjs/squel.js')];

    for (const file of files) {
        const content = await fs.readFileSync(file, 'utf8');

        console.log(content.includes(versionKey));

        const newContent = content.replace(versionKey, version);

        console.log(newContent);

        await fs.writeFileSync(file, newContent);
    }
};

main();
