import { IOptionParams } from './options';

export interface IActionArg {
    name: string;
    description: string;
    optional?: boolean;
    value?: any;
}

export interface IActionInput {
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

    constructor(name: string, setup: IActionSetup) {
        this.name = name;
        this.setup = setup;
    }

    set args (args: IActionArg[]) {
        args.forEach((arg, idx) => {
            let next_arg = args[idx + 1];

            if (!next_arg) return;

            if (arg.optional && !next_arg.optional) {
                console.log('Error: optional arguments must be at the end of args');
                process.exit(1);
            }
        });

        this._args = args;
    }

    get args () {
        return this._args;
    }

    get inputs () {
        let inputs: IActionInput = {};

        for (let idx in this.args) {
            let arg = this.args[idx];
            let value = process.argv[idx];

            if (value === undefined && !arg.optional) {
                 this.printUsage();
                 process.exit(1);
            }

            inputs[arg.name] = process.argv[idx];
        }

        return inputs;
    }

    printUsage () {
        let usage_string = `\nUsage: ${this.name} `;

        this.args.forEach(arg => {
            let str = arg.optional ? `[${arg.name}]` : arg.name;

            usage_string += str + ' ';
        });

        console.log(usage_string + '\n');

        this.args.forEach(arg => {
            if (arg.description) {
                console.log(`  ${arg.name}\t${arg.description}`);
            }
        });
    }

    /**
     * The code to be run for the executable. Overwrite this in your action.
     */
    run() {
        console.log(`No actions have been defined for action "${this.name}"`);
    }
}