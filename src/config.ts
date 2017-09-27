import { readFile, writeFile } from 'fs';
const CONFIG_FILE = './config.json';

function replaceConfig (new_config: IConfig) {
    return new Promise ((resolve, reject) => {
        let new_json = JSON.stringify(new_config, null, 4);

        writeFile(CONFIG_FILE, new_json, (err) => {
            if (err) reject(err);

            resolve(new_config);
        });
    });
};

export interface IActions {
    [action: string]: string;
}

export interface IConfig {
    actions: IActions;
}

export const default_config: IConfig = {
    actions: {}
};

export function registerNewAction (name: string, path: string) {
    if (!name || !path) return false;

    let config = getConfig();
    config.actions[name] = path;

    replaceConfig(config);
}

export function removeAction (name: string) {
    if (!name) return false;

    let config = getConfig();
    delete config.actions[name];

    replaceConfig(config);
}

export function getConfig() {
    let config: IConfig = require('../config.json');

    return Object.assign(default_config, config);
}