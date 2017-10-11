import { Action, IActionSetup } from '../switch';
import { registerNewAction } from '../config';

export default class RegisterAction extends Action {
    description = 'Register a new action';
    args = [
        {
            name: 'action',
            description: 'name of the action to be registered',
        },
        {
            name: 'path',
            description: 'path to the root of the action'
        }
    ];

    constructor (name: string, setup: IActionSetup) {
        super(name, setup);
    }

    run () {
        registerNewAction(this.inputs.action, this.inputs.path);
    }
}