#!/usr/bin/env node

import { Switch, IActionSetup }  from '../switch';
import { join } from 'path';
import { readdir } from 'fs';
import { getConfig, IActions, IConfig } from '../config';
import { Options } from '../options';

/**
 * Get rid of the first to arguments under process.argv
 */
function cleanArgs() {
    process.argv.shift();
    process.argv.shift();
}

/**
 * Print a helper message with all available actions
 * 
 * @param actions The IActions object
 */
function printHelp (actions: IActions) {
    console.log('\nParent action not found\n\nAvailable Actions:');

    for (let action in actions) {
        console.log(`  ${action}\t${actions[action]}`);
    }

    console.log();
}

/**
 * Get an IConfig object of all actions available
 * 
 * @param config the config object
 */
function getAllActions (config: IConfig): Promise<IActions> {
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
function getParentActionDirectory (actions: IActions): string | null {
    let parentAction = process.argv.shift();

    if (!parentAction || !actions[parentAction]) return null;

    return actions[parentAction];
}

/**
 * The main runner function
 */
function run (config: IConfig) {
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

// Get the config
let config = getConfig().then((config) => {
    // Then run the runner function
    run(config);
});