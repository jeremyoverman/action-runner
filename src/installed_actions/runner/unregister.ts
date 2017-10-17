import { Action, IActionSetup }  from '../../switch';
import { removeAction } from '../../config';

export default class UnregisterAction extends Action {
    description = 'Remove an existing action';
    args = [
        {
            name: 'action',
            description: 'name of the action to be unregistered',
        }
    ]

    constructor (name: string, setup: IActionSetup) {
        super(name, setup);
    }

    run () {
        removeAction(this.inputs.action);
    }
}