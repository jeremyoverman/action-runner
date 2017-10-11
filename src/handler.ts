import { join } from 'path';
import { getConfig } from './config';
import { readdir } from 'fs'

/**
 * The handler class. This is meant to be using in index files of
 * a directory and extended upon.
 * 
 * @param   cwd         The current directory of the action
 * @param   nextAction  The next action to be run
 */
export class Handler {
    cwd: string;
    description: string = '';
    nextAction: string | undefined;

    constructor(cwd: string, next_action: string | undefined) {
        this.cwd = cwd;
        this.nextAction = next_action;
    }

    /**
     * Can the handler be run? Checks to see if there's a nextAction by
     * default since the handler doesn't run actions. Overwite this if
     * you need a more stringent check.
     */
    canRun(): boolean {
        return this.nextAction !== undefined;
    }

    /**
     * Every directories handler can build upon the setup object to make
     * child actions/handlers more streamlined.
     * 
     * @param setup The current setup object as of current
     */
    setup (setup: any): Promise<any> | object {
        return setup;
    }

    /**
     * Get the description of an action if availible.
     * 
     * @param file The file of the action
     */
    private getDescription (file: string) {
        let module_path = join(this.cwd, file);
        let mod;
        let description = '';

        try {
            mod = require(module_path);
            if (mod.default) {
                description = new mod.default().description;
            }
        } catch (e) { }

        return description;
    }

    /**
     * Print a help message. This by default prints all availible child commands.
     */
    printHelp() {
        console.log('\nAvailable commands:');

        readdir(this.cwd, (err, files) => {
            if (err) return console.log(err);
            
            getConfig().then((config) => {
                let excluded = new RegExp(config.excludes);

                for (let i = 0; i < files.length; i++) {
                    let command = files[i];

                    // Don't show excluded files
                    if (excluded.test(command)) continue;

                    let description = this.getDescription(command);

                    // Get rid of the extension of files
                    let match = command.match(/(.*).js/)
                    if (match) command = match[1];

                    // Print the log
                    console.log(`  ${command}\t${description}`);
                }
            });

            // Print and extra newline
            console.log();
        });
    }
}