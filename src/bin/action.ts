#!/usr/bin/env node

import { Switch }  from '../index';
import { join } from 'path';
import { getConfig, IActions, IConfig } from '../config';
import { OptionHandler } from '../optionHandler';
import { options } from '../options';

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

    // Get a new OptionHandler with the action-runner options
    let optionsDirectory = join (__dirname, '..');
    let optionHandler = new OptionHandler(optionsDirectory);
    if (optionHandler.hasOptions) {
        // If it has options, run them and end the application
        return optionHandler.runAllOptions();
    }

    // Get the parent directory for the given action
    let parentActionDirectory = getParentActionDirectory(config.actions);

    if (parentActionDirectory) {
        // Create the Switch to handle the rest
        new Switch('', parentActionDirectory);
    } else {
        // If we couldn't get a parent directory, then then the action
        // doesn't exist in the config.
        printHelp(config.actions);
    }
}

// Get the config
let config = getConfig().then((config) => {
    // Then run the runner function
    run(config);
});