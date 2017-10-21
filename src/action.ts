import { IOptionParams } from './options';
import { info, messages, log, error, tabular } from './helper';

export interface IActionArg {
    name: string;
    description: string;
    optional?: boolean;
    value?: any;
}

export interface IActionInputs {
    [name: string]: string;
}

export interface IActionSetup {
    flags: string[];
    [key: string]: any;
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
    setup: IActionSetup;
    private _args: IActionArg[];
    usage: string;
    inputs: IActionInputs;

    constructor(name: string, setup: IActionSetup) {
        this.name = name;
        this.setup = setup;
    }

    canRun () {
        let required = this.args.filter((arg) => {
            return !arg.optional;
        });

        return required.length == process.argv.length;
    }

    argsValid (args: IActionArg[]) {
        let valid = true;

        args.forEach((arg, idx) => {
            let next_arg = args[idx + 1];

            if (!next_arg) return;

            if (arg.optional && !next_arg.optional) {
                valid = false;
            }
        });

        return valid;
    }

    set args (args: IActionArg[]) {
        if (!Array.isArray(args) || !this.argsValid(args)) {
            args = [];
        }

        this._args = args;
    }

    get args () {
        return this._args;
    }

    createInputs () {
        let inputs: IActionInputs = {};

        for (let idx in this.args) {
            let arg = this.args[idx];
            let value = process.argv[idx];

            inputs[arg.name] = process.argv[idx];
        }

        this.inputs = inputs;

        return inputs;
    }

    getUsage () {
        let usage_string = `\nUsage: ${this.name} `;

        if (this.args) {
            this.args.forEach(arg => {
                let str = arg.optional ? `[${arg.name}]` : arg.name;

                usage_string += str + ' ';
            });
        }

        usage_string += '\n\n';

        let descriptions: any = {};
        if (this.args) {
            this.args.forEach(arg => {
                descriptions[arg.name] = arg.description;
            });
        }

        usage_string += tabular(descriptions);

        return usage_string;
    }

    printHelp () {
        info(`Action: ${this.name}`, this.getUsage());
    }

    /**
     * The code to be run for the executable. Overwrite this in your action.
     */
    run() {
        log(messages.no_actions_defined);
    }
}