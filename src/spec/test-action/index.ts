import * as runner from '../../switch';

export default class GenerateHandler extends runner.Handler {
    constructor(cwd: string, next_action: string) {
        super(cwd, next_action);

        this.description = 'Generate a new object';
    }
}