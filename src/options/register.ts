import { registerNewAction } from '../config';
import { OptionRunner } from '../optionHandler';

export default class RegisterOption extends OptionRunner {
    description: string;

    constructor () {
        super();

        this.description = 'Register a new action';
    }

    handler (params: any[]) {
        registerNewAction(params[0], params[1]);
    }
}