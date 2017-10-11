#!/usr/bin/env node

import { Switch, IActionSetup }  from '../switch';
import { join } from 'path';
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
    let parentActionDirectory = getParentActionDirectory(config.actions);

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
        printHelp(config.actions);
    }
}

// Get the config
let config = getConfig().then((config) => {
    // Then run the runner function
    run(config);
});