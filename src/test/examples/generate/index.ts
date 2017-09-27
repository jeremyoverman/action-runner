import { Handler } from '../../../index';

export default class GenerateHandler extends Handler {
    constructor(cwd: string, next_action: string | undefined) {
        super(cwd, next_action);

        this.description = 'Generate a new object';
    }
}