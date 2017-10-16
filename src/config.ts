import { readFile, writeFile, mkdir, exists } from 'fs';
import { join } from 'path';

const CONFIG_FILE = join(__dirname, 'config.json');

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
    excludes: string;
    actionRoot: string
}

export const default_config: IConfig = {
    actions: {
        runner: join(__dirname, 'runner')
    },
    excludes: "^index.js$|.map$|^node_modules$|.json$|^options$",
    actionRoot: join(__dirname, 'installed_actions')
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

export function createActionsDirectory(directory: string): Promise<string|null> {
    return new Promise((resolve, reject) => {
        exists(directory, doesExist => {
            if (!doesExist) {
                mkdir(directory, err => {
                    if (err) return reject(err);

                    resolve(directory);
                });
            } else {
                resolve();
            }
        })
    });
}

export function getConfig(): Promise<IConfig> {
    return new Promise((resolve, reject) => {
        let config: IConfig;

        try {
            config = Object.assign(default_config, require(CONFIG_FILE));
            resolve(config);
        } catch (e) {
            console.log('Config does not exist. Creating new one...');

            createConfig().then((con: IConfig) => {
                resolve(con);
            });
        }
    });
}

getConfig().then(config => {
    createActionsDirectory(config.actionRoot)
        .then((directory) => {
            if (directory) console.log(`Created base actions directory at "${directory}"`);
        })
        .catch((err) => {
            console.log(`Failed to create actions directory: ${err}`);
        });
});