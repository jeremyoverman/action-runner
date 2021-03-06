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

export class Options {
    setup: IActionSetup;
    path: string;
    args: string[];

    constructor (path: string, setup: IActionSetup) {
        this.path = join(path, 'options');
        this.setup = setup;
        this.args = process.argv;
    }

    getParams (params: IOptionParam[]) {
        let final: IOptionParams = {};

        params.forEach((param, idx) => {
            let name = param.name;
            let value = this.args.shift();

            if (value) final[name] = value;
        });

        return final;
    }

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

export class Option {
    setup: IActionSetup;
    params: IOptionParam[] = [];

    constructor (setup: IActionSetup) {
        this.setup = setup;
    }

    run (params: IOptionParams): IActionSetup {
        return this.setup;
    }
}