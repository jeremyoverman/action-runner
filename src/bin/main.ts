#!/usr/bin/env node

import { Switch, IActionSetup }  from '../switch';
import { join } from 'path';
import { readdir } from 'fs';
import { getConfig, configExists, createConfig, IActions, IConfig } from '../config';
import { Options } from '../options';
import { tabular, log, info, messages } from '../helper';

// For development - log unhandled Promise rejections
// process.on('unhandledRejection', r => console.log(r))

/**
 * Get rid of the first to arguments under process.argv
 */
export function cleanArgs() {
    process.argv.shift();
    process.argv.shift();
}

/**
 * Print a help message
 * 
 * @param actions The available actions
 */
export function printHelp (actions: IActions) {
    log(messages.parent_action_not_found);
    info(messages.available_actions, tabular(actions));
}

/**
 * Get an IConfig object of all actions available
 * 
 * @param config the config object
 */
export function getAllActions (config: IConfig): Promise<IActions> {
    return new Promise((resolve, reject) => {
        let actions: IActions = Object.assign({}, config.actions);

        readdir(config.actionRoot, (err, dirs) => {
            if (!err) {
                dirs.forEach((action) => {
                    actions[action] = join(config.actionRoot, action);
                });
            }

            resolve(actions);
        });
    });
}

/**
 * Get the directory for the parent action from the IActions object
 * or return null if it doesn't exit
 * 
 * @param actions The IActions object
 */
export function getParentActionDirectory (actions: IActions): string | null {
    let parentAction = process.argv.shift();

    if (!parentAction || !actions[parentAction]) return null;

    return actions[parentAction];
}

/**
 * The main runner function
 */
export function run (config: IConfig) {
    // Get rid of the first two arguments
    cleanArgs();

    // Get the parent directory for the given action
    getAllActions(config).then((actions) => {
        let parentActionDirectory = getParentActionDirectory(actions);

        let setup: IActionSetup = {
            flags: []
        }

        if (parentActionDirectory) {
            // Create the Switch to handle the rest
            let options = new Options(parentActionDirectory, setup);
            setup = options.parseOptions();

            let sw = new Switch('', parentActionDirectory, setup);
            sw.handleNextAction();
        } else {
            // If we couldn't get a parent directory, then then the action
            // doesn't exist in the config.
            printHelp(actions);
        }
    });
}

let config: IConfig;

if (configExists()) {
    // Get the config
    config = getConfig();

    // Then run the runner function
    run(config);
} else {
    createConfig().then((config) => {
        log(messages.create_new_config);
        run(config);
    });
}