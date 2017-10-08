import { readFile, writeFile } from 'fs';
const CONFIG_FILE = './config.json';

function replaceConfig (new_config: IConfig): Promise<IConfig> {
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
    excludes: string
}

export const default_config: IConfig = {
    actions: {},
    excludes: "index.js|.map$|node_modules|.json$"
};

export function registerNewAction (name: string, path: string) {
    if (!name || !path) return false;

    getConfig().then((config) => {
        config.actions[name] = path;
        replaceConfig(config);
    });
}

export function removeAction (name: string) {
    if (!name) return false;

    getConfig().then((config) => {
        delete config.actions[name];

        replaceConfig(config);
    });
}

export function createConfig(): Promise<IConfig> {
    return replaceConfig(default_config);
}

export function getConfig(): Promise<IConfig> {
    return new Promise((resolve, reject) => {
        let config: IConfig;

        try {
            config = Object.assign(default_config, require('../config.json'));
            resolve(config);
        } catch (e) {
            console.log('Config does not exist. Creating new one...');

            createConfig().then((con: IConfig) => {
                resolve(con);
            });
        }
    });
}