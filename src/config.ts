import { writeFile, mkdir, exists } from 'fs';
import { join } from 'path';
import { messages, log } from './helper';

const CONFIG_FILE = join(__dirname, 'config.json');

export interface IActions {
    [action: string]: string;
}

export interface IConfig {
    actions: IActions;
    excludes: string;
    actionRoot: string;
    locale: string;
}

export const DEFAULT_CONFIG: IConfig = {
    actions: { },
    excludes: "^index.js$|.map$|^node_modules$|.json$|^options$",
    actionRoot: join(__dirname, 'installed_actions'),
    locale: 'en-us'
};

function replaceConfig (new_config: IConfig): Promise<IConfig> {
    return new Promise((resolve, reject) => {
        let new_json = JSON.stringify(new_config, null, 4);

        writeFile(CONFIG_FILE, new_json, (err) => {
            resolve(new_config);
        });
    });
};

export function registerNewAction (name: string, path: string) {
    if (!name || !path) return false;

    let config = getConfig();
    config.actions[name] = path;

    replaceConfig(config);
}

export function removeAction (name: string) {
    if (!name) return false;

    let config = getConfig()
    delete config.actions[name];

    replaceConfig(config);
}

export function createConfig(): Promise<IConfig> {
    createActionsDirectory(DEFAULT_CONFIG.actionRoot)
        .then((directory) => {
            if (directory) log(messages.create_base_directory, directory);
        })
        .catch((err) => {
            log(messages.create_base_directory_fail, err);
        });

    return replaceConfig(DEFAULT_CONFIG);
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

export function configExists () {
    try {
        require.resolve(CONFIG_FILE);
        return true;
    } catch (e) {
        return false;
    }
}

export function getConfig() {
    return Object.assign(DEFAULT_CONFIG, require(CONFIG_FILE));
}