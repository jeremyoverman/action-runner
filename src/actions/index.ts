import { Handler } from '../index';

export default class GenerateHandler extends Handler {
    constructor(cwd: string, next_action: string | undefined) {
        super(cwd, next_action);
    }

    setup (setup: any) {
        return new Promise((resolve, reject) => {
            setup.test = 'test';
            resolve(setup);
        });
    }
}