import * as runner from '../../action';

export default class TemplateAction extends runner.Action {
    constructor(name: string, setup: runner.IActionSetup) {
        super(name, setup);

        this.description = 'A template';
        this.args = [
            {
                name: 'template',
                description: 'The name of the template to generate'
            }
        ];
    }

    run () {
        console.log('Generate template', this.inputs.template);
    }
}