const OPTION_REGEX = /^--?([\w\d-]*)/;

export interface IOptionMap {
    [option: string]: Function;
}

export interface IOptions {
    option: string;
    args: string[];
}

export class OptionHandler {
    optionMap: IOptionMap;
    options: IOptions[];
    hasOptions: boolean;

    constructor (optionMap: IOptionMap) {
        this.optionMap = optionMap;
        this.options = this.parseOptions();
        this.hasOptions = Boolean(this.options.length)
    }

    parseOptions () {
        if (!this.isNextParamAnOption()) return [];

        let options: IOptions[] = [];

        let current_option: IOptions = {
            option: '',
            args: []
        };

        let next_arg;
        while ((next_arg = process.argv.shift()) != undefined) {
            let match = next_arg.match(OPTION_REGEX);

            if (match) {
                if (current_option.option) {
                    options.push(current_option);
                }

                current_option = {
                    option: match[1],
                    args: []
                };
            } else {
                current_option.args.push(next_arg);
            }
        } 

        options.push(current_option);

        return options;
    }

    isNextParamAnOption () {
        return OPTION_REGEX.test(process.argv[0]);
    }

    runAllOptions () {
        for (let i = 0; i < this.options.length; i++) {
            let option = this.options[i];
            this.runOption(option.option, option.args);
        }
    }

    runOption (option: string, args: string[]) {
        if (this.optionMap[option]) {
            this.optionMap[option](args);
        } else {
            console.log(`Unkown option "${option}"`);
        }
    }
}