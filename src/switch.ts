require('source-map-support').install();

import { readdir, stat } from 'fs';
import { join } from 'path';
import { Action } from './action';
import { Handler } from './handler';
import { log, messages } from './helper';

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
            log(err);
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
                if (!isDirectory && !isFile) return reject(messages.action_does_not_exist);
                if (isDirectory && isFile) return reject(messages.cant_have_duplicate_action);

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

        // Get the action files Action class and initialize it
        let NextAction = require(file).default;
        let action = new NextAction(this.action, this.setup);

        action.run();
    }
}

export { Action, IActionArg, IActionInputs, IActionSetup } from './action';
export { Handler } from './handler';
export { Option } from './options';