#!/usr/bin/env node

import { Switch }  from '../index';
import { join } from 'path';
import { getConfig, IActions } from '../config';
import { OptionHandler } from '../optionHandler';
import { options } from '../options';

/**
 * Get rid of the first to arguments under process.argv
 */
function cleanArgs() {
    process.argv.shift();
    process.argv.shift();
}

function printHelp (actions: IActions) {
    console.log('\nParent action not found\n\nAvailable Actions:');

    for (let action in actions) {
        console.log(`  ${action}\t${actions[action]}`);
    }

    console.log();
}

function getParentActionDirectory (actions: IActions): string | null {
    let parentAction = process.argv.shift();

    if (!parentAction || !actions[parentAction]) return null;

    return actions[parentAction];
}

function run () {
    let config = getConfig();

    // Get rid of the first two arguments
    cleanArgs();

    let optionHandler = new OptionHandler(options);

    if (optionHandler.hasOptions) {
        return optionHandler.runAllOptions();
    }

    let parentActionDirectory = getParentActionDirectory(config.actions);

    if (parentActionDirectory) {
        // Create a new Switch at the root level of actions
        new Switch('', parentActionDirectory);
    } else {
        printHelp(config.actions);
    }
}

run();