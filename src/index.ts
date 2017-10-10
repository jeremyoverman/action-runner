require('source-map-support').install();

import { readdir, stat,  } from 'fs';
import { join } from 'path';
import { getConfig } from './config';

/**
 * Handles traversing the actions passed in.
 * 
 * @param   action  The name of the action (i.e., the next argument passed in)
 * @param   cwd     The current directory the switch is in
 * @param   setup   The current setup object
 */
export class Switch {
    action: string;
    cwd: string;
    setup: object;
    path: string;
    type: 'directory' | 'file';

    constructor (action: string, cwd: string, setup?: object) {
        this.action = action;
        this.cwd = cwd;
        this.path = join(this.cwd, this.action);

        // If we don't have a setup object yet, initialize it to an empty object
        this.setup = setup || {};
    }

    /**
     * Is this path a directory?
     * 
     * @param path The path to check
     */
    private checkDirectory (path: string) {
        return new Promise((resolve, reject) => {
            stat(path, (err, info) => {
                if (err) resolve(false);
                else resolve(info.isDirectory());
            });
        });
    }

    /**
     * Is this path a file?
     * 
     * @param path The path to check
     */
    private checkFile (path: string) {
        return new Promise((resolve, reject) => {
            stat(path, (err, info) => {
                if (err) resolve(false);
                else resolve(info.isFile());
            });
        });
    }

    /**
     * Get the Handler for the directory. If it doesn't exist, use the default Handler
     * 
     * @param path          The path of the handler to run, without /index.js
     * @param next_action   The next action to be run
     */
    private getHandler (path: string, next_action: string | undefined): Handler {
        let ActionHandler;
        let file = join(path, 'index');

        try {
            // Use the ActionHandler for the path if available
            ActionHandler = require(file).default;
        } catch (err) { }

        let handler;

        if (ActionHandler) {
            // If avaiable, instantiate the handler
            handler = new ActionHandler(path, next_action);
        } else {
            // If not, use the default handler
            handler = new Handler(path, next_action);
        }

        return handler;
    }

    /**
     * Run the next action
     */
    handleNextAction () {
        // Handle the next action
        this.getNextAction().then((next_action: string) => {
            // Get the handler for the directory if there is one
            let handler = this.getHandler(this.path, next_action);

            // Determine if our action is defined by a directory or a file
            if (this.type == 'directory' && handler.canRun()) {
                this.handleDirectory(handler, next_action);
            } else if (this.type === 'file') {
                this.handleFile();
            } else {
                // If it's a directory, but it can't be run with the current arguments,
                // print a help file.
                handler.printHelp();
            }
        })
        .catch((err) => {
            console.log(err);
        });
    }

    /**
     * Get the next action
     */
    getNextAction () {
        return new Promise((resolve, reject) => {
            // Figure out if the action is a directory, or a .js file
            Promise.all([
                this.checkDirectory(this.path),
                this.checkFile(this.path + '.js')
            ]).then((values) => {
                let [ isDirectory, isFile ] = values;

                // Make sure the action is either a file or a directory, but not both
                if (!isDirectory && !isFile) return reject('Action does not exist');
                if (isDirectory && isFile) return reject("You can't have a directory and action with the same name in the same directory");

                this.type = isDirectory ? 'directory' : 'file';

                // Get the next action without shifting it and resolve with it
                let next_action = process.argv[0];
                resolve(next_action);
            });
        });
    }

    /**
     * If we have a directory, run the handler setup and create a new Switch object
     * 
     * @param handler       The handler for the directory
     * @param next_action   The next action to run
     */
    handleDirectory (handler: Handler, next_action: string) {
        // Shift the action since we're done with it
        process.argv.shift();

        // Run the handler setup
        let result = handler.setup(this.setup);
        
        // The setup may return a promise, so resolve it
        Promise.resolve(result).then((setup: any) => {
            // Create a new switch with the next action with the new setup
            let next = new Switch(next_action, this.path, setup);
            next.handleNextAction();
        });
    }

    /**
     * If we have a file, get the action and run it
     */
    handleFile () {
        let file = this.path + '.js';
        let action;

        try {
            // Get the action files Action class and initialize it
            let NextAction = require(file).default;
            action = new NextAction(this.action, this.setup);
        } catch (err) {
            // If it doesn't exist, the action is set up wrong
            console.log(`Unable to load action "${this.action}"`);
            action = new Action(this.action, this.setup);
        }

        // Run the action
        action.run();
    }
}

/**
 * The action class. This is meant to be used by action files.
 * Default methods and values are here, but this is meant to be
 * extended upon.
 * 
 * @param   name    The name of the action
 * @param   setup   The final setup object
 */
export class Action {
    description: string;
    name: string;
    setup: object;
    args: string[];

    constructor(name: string, setup: object) {
        this.name = name;
        this.setup = setup;
        this.args = process.argv;
    }

    /**
     * The code to be run for the executable. Overwrite this in your action.
     */
    run() {
        console.log(`No actions have been defined for action "${this.name}"`);
    }
}

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
        console.log('\nAvailable commands: \n');

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