import { Action } from '../../../switch';

export default class TemplateAction extends Action {
    constructor(name: string, setup: object) {
        super(name, setup);

        this.description = 'A template';
    }

    run () {
        let template = this.args[0];
        console.log('Generate template', template);
    }
}