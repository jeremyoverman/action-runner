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
        this.inputs = this.createInputs();
        this.args = [];
    }

    set args (args: IActionArg[]) {
        args.forEach((arg, idx) => {
            let next_arg = args[idx + 1];

            if (!next_arg) return;

            if (arg.optional && !next_arg.optional) {
                error(messages.optional_args_must_be_at_end);
            }
        });

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

            if (value === undefined && !arg.optional) {
                this.printHelp();
                error(messages.action_called_without_correct_args);
            }

            inputs[arg.name] = process.argv[idx];
        }

        return inputs;
    }

    getUsage () {
        let usage_string = `\nUsage: ${this.name} `;

        this.args.forEach(arg => {
            let str = arg.optional ? `[${arg.name}]` : arg.name;

            usage_string += str + ' ';
        });

        usage_string += '\n\n';

        let descriptions: any = {};
        this.args.forEach(arg => {
            descriptions[arg.name] = arg.description;
        });

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