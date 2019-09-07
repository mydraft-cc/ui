const path = require('path');

const appRoot = path.resolve(__dirname, '..');

function root() {
    const newArgs = Array.prototype.slice.call(arguments, 0);

    return path.join.apply(path, [appRoot].concat(newArgs));
}

exports.root = root;

function removeLoaders(config, extensions) {
    const rules = config.module.rules;

    for (let i = 0; i < rules.length; i += 1) {
        const rule = rules[i];

        for (let j = 0; j < extensions.length; j += 1) {
            if (rule.test.source.indexOf(extensions[j]) >= 0) {
                rules.splice(i, 1);
                i--;
                break;
            }
        }
    }

    return config;
}

exports.removeLoaders = removeLoaders;