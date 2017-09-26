# Action Runner

## Description

Action Runner let's you create simple framework for running nested actions. This works similarly to applications such as ember-cli and express-generator. With this framework, you can easily and dynamically create commands such as this:

    action generate template MyTemplate

## Installation

    npm install action-runner -g

## Usage

After installation, you will have a file structure like this:

    +-- actions
    |   +-- [Your actions go here]
    +-- index.js

Action paths will follow the directory structure under actions. A directory can have an `index.js` file in it. This file will be the commands `Handler`.

Any JavaScript file besides `index.js` will be an action that can be run.

For example, with the command `action generate template MyTemplate` your directory structure will look like this:

    +-- actions
    |  +-- generate
    |  |   +-- template.js <-- Action File for "template"
    |  |   +-- index.js <-- Handler File for "generate"
    |  +-- index.js <-- Handler File for "actions"
    +index.js

Handler File
------------

Handler files give support to actions, but are not meant to be standalone actions by themselves.

These files should import and extend the `Handler` class from `index.js`.

    import { Handler } from '../index';

    export default class GenerateHandler extends Handler {
        constructor(cwd: string, next_action: string | undefined) {
            super(cwd, next_action);
        }

        setup (setup: any) {
            return new Promise((resolve, reject) => {
                setup.myCustomProperty = 'custom property'
                resolve(setup);
            });
        }
    }

The `cwd` will be passed to the handler which will be the directory the handler is for. The `next_action` will also be passed in (i.e., if the command is `action generate template MyTemplate` the `next_action` and this is the handler for `generate`, `next_action` will be `template`).

### setup (setup: object)

The `setup` method can be overwritten to provide setup for future actions. When the initial action is generated, `setup` will be passed an empty object.

You can manipulate this object and return it, then every subsequent `Handler` and `Action` will have access to `this.setup` and can extend it themselves.

You can return either an object or a promise and the promise will be resolved before moving to the next command.

### canRun ()

By default, this checks to see if  `this.next_action` exists. If it does, it returns true, otherwise it returns false.

If this returns false, the command chain stops and a help message is printed to the screen.

Overwrite this method if you need more granular checks.

### printHelp ()

This is run when `this.canRun()` returns false. By default, this prints all child commands available.

## Action

This is the action meant to be run at the end of the command chain.

    import { Action } from '../../index';

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

When you reach an `Action` object in the command chain, the action is initialized and the `run()` method is run.

You can access the `setup` build by the `Handler`'s through `this.setup`. All arguments passed in after the action can be accessed through `this.args`.

The `description` property is used when printing help messages. It will show as such:

    Available commands:

      template      A template