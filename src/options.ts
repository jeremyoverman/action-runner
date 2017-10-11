import { join } from 'path';
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

    constructor (path: string, setup: IActionSetup) {
        this.path = join(path, 'options');
        this.setup = setup;
    }

    getParams (params: IOptionParam[], start: number) {
        let final: IOptionParams = {};

        params.forEach((param, idx) => {
            let name = param.name;
            let value = process.argv.splice(start + idx, 1)[0];

            final[name] = value;
        });

        return final;
    }

    parseOptions () {
        process.argv.forEach((arg, idx) => {
            let match = arg.match(OPTION_REGEX);
            if (!match) return;

            let opt = match[1];
            this.setup.flags.push(opt);

            process.argv.splice(idx, 1);

            let option = this.getOption(opt);
            let params = this.getParams(option.params, idx);

            this.setup = option.run(params);
        });

        return this.setup;
    }

    getOption (opt: string): Option {
        let module_exists: boolean;
        let file = join(this.path, opt + '.js');

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