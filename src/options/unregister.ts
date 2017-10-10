import { removeAction } from '../config';
import { OptionRunner } from '../optionHandler';

export default class RegisterOption extends OptionRunner {
    description: string;

    constructor () {
        super();

        this.description = 'Remove an existing action';
    }

    handler (params: any[]) {
        removeAction(params[0]);
    }
}