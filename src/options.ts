import { join, resolve } from 'path';
import { readdir } from 'fs';
import { IActionSetup } from './action';

/**
 * Examples:
 *      -option
 *      --option
 *      --option-test123
 */
const OPTION_REGEX = /^--?([\w\d-]*)/;

export interface IOptionParam {
    name: string;
    description: string;
    value?: string
}

export interface IOptionParams {
    [key: string]: string;
}

/**
 * Handles parsing the options from the command line.
 */
export class Options {
    setup: IActionSetup;
    path: string;
    args: string[];

    /**
     * @param path The base path to look for options
     * @param setup The current setup object
     */
    constructor (path: string, setup: IActionSetup) {
        this.path = join(path, 'options');
        this.setup = setup;
        this.args = process.argv;
    }

    /**
     * Takes an array of IOptionParams, and creates an object containing the names
     * from the params array and the values being process.argv args.
     * 
     * @param params an array of IOptionParam's
     */
    getParams (params: IOptionParam[]) {
        let final: IOptionParams = {};

        params.forEach((param, idx) => {
            let name = param.name;
            let value = this.args.shift();

            if (value) final[name] = value;
        });

        return final;
    }

    /**
     * Parses and processes the arguments from process.argv (stored in this.args)
     */
    parseOptions (): IActionSetup {
        if (!this.args.length) return this.setup;

        let match = this.args[0].match(OPTION_REGEX);
        this.args.shift();

        if (match) {
            let opt = match[1];
            this.setup.flags.push(opt);

            let option = this.getOption(opt);
            let params = this.getParams(option.params);

            this.setup = option.run(params);
        }

        return this.parseOptions();
    }

    /**
     * Trys to import the given option from the current /options directory, or
     * returns a base Option class
     * 
     * @param opt The name of the option
     */
    getOption (opt: string): Option {
        let module_exists: boolean;
        let file = resolve(join(this.path, opt + '.js'));

        try {
            require.resolve(file);
            module_exists = true;
        } catch (err) {
            module_exists = false;
        }

        if (module_exists) return new (require(file).default)(this.setup);
        else return new Option(this.setup);
    }
}

/**
 * A class for options. Handles processing options from the command line.
 */
export class Option {
    setup: IActionSetup;
    params: IOptionParam[] = [];

    /**
     * @param setup The current setup object
     */
    constructor (setup: IActionSetup) {
        this.setup = setup;
    }

    /**
     * This will be called with the params object when an option is parsed. It must
     * return a setup object.
     * 
     * @param params An IOptionParams object
     */
    run (params: IOptionParams): IActionSetup {
        return this.setup;
    }
}