import { Option, IOptionParams } from '../../../../options'
import { IActionSetup } from '../../../../action';

export default class TestOption extends Option {
    constructor (setup: IActionSetup) {
        super(setup);

        this.params = [
            { name: 'firstParam', description: 'First Param' },
            { name: 'secondParam', description: 'Second Param' }
        ];
    }

    run (params: IOptionParams): IActionSetup {
        return this.setup;
    }
}