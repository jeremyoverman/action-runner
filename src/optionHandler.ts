import { join } from 'path';
import { readdir } from 'fs';
import { getConfig } from './config';

/**
 * Examples:
 *      -option
 *      --option
 *      --option-test123
 */
const OPTION_REGEX = /^--?([\w\d-]*)/;

export interface IOptionMap {
    [option: string]: OptionRunner;
}

export interface IOptions {
    option: string;
    args: string[];
}

/**
 * A class for handling options starting with -- or -
 * 
 * @param   optionMap   an option to function mapping
 */
export class OptionHandler {
    directory: string;
    optionMap: IOptionMap;
    options: IOptions[];
    hasOptions: boolean;

    constructor (directory: string) {
        this.directory = join(directory, 'options');
        this.options = this.parseOptions();
        this.hasOptions = Boolean(this.options.length)
        this.optionMap = {};

        this.createOptionMap();
    }

    loadRunner (file: string) {
        let path = join(this.directory, file);
        let runner;

        try {
            runner = new (require(path).default);
        } catch (err) {
            runner = new OptionRunner();
        }

        return runner;
    }

    createOptionMap () {
        return new Promise((resolve, reject) => {
            readdir(this.directory, (err, files) => {
                for (let idx in files) {
                    let file = files[idx];
                    let match = file.match(/(.*)\.js$/);

                    if (!match) continue;

                    let option = match[1];
                    let runner = this.loadRunner(file);

                    this.optionMap[option] = runner;
                }

                resolve();
            });
        });
    }

    /**
     * Parse the options and return an array of IOptions
     */
    parseOptions () {
        // If the first param isn't an option, don't parse
        if (!this.isNextParamAnOption()) return [];

        // Initialize and empty options array
        let options: IOptions[] = [];

        // Initialize an empty options object
        let current_option: IOptions = {
            option: '',
            args: []
        };

        let next_arg;

        // For all parameters
        while ((next_arg = process.argv.shift()) != undefined) {
            // shift the parameter and see if it's an option
            let match = next_arg.match(OPTION_REGEX);

            // If it is an option
            if (match) {
                // Check to see if we already have an option stored
                if (current_option.option) {
                    // If we do, push it to the options
                    options.push(current_option);
                }

                // Then create our new option
                current_option = {
                    option: match[1],
                    args: []
                };
            } else {
                // If it's not an options, push it to the current options args
                current_option.args.push(next_arg);
            }
        } 

        // There will always be one left over options -- push it
        options.push(current_option);

        return options;
    }

    /**
     * Is the next param an option? I.e., does it start with -- or -
     */
    isNextParamAnOption () {
        return OPTION_REGEX.test(process.argv[0]);
    }

    /**
     * Run all functions in the option map
     */
    runAllOptions () {
        this.createOptionMap().then(() => {
            for (let i = 0; i < this.options.length; i++) {
                let option = this.options[i];
                this.runOption(option.option, option.args);
            }
        });
    }

    /**
     * 
     * @param option The name of the option
     * @param args An array of parameters
     */
    runOption (option: string, args: string[]) {
        if (this.optionMap[option]) {
            this.optionMap[option].handler(args);
        } else {
            // TODO: replace this with a better helper function
            console.log(`Unkown option "${option}"`);
        }
    }
}

export class OptionRunner {
    description: string;

    handler (params: any[]) {
        console.log('Option does not exist');
    }
}