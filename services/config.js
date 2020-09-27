const fs = require('fs');

if (!fs.existsSync('./config.json')) {
    fs.writeFileSync('./config.json', {
        refreshInterval: 30,
        threshold: 5
    });
}

function getConfig() {
    if (fs.existsSync('./config.json')) {
        return JSON.parse(fs.readFileSync('./config.json', { encoding: 'utf8' }));
    }

    return {};
}

exports.getConfig = getConfig;

exports.setConfig = (key, value) => {
    let config = getConfig();

    config[key] = value;

    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2), { encoding: 'utf8' });
}