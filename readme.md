# Action Runner

Action Runner let's you create simple framework for running nested actions. This works similarly to applications such as ember-cli and express-generator. With this framework, you can easily and dynamically create commands such as this:

    action MySuite generate template MyTemplate

## Installation

    npm install action-runner -g

## Overview

After installation, you should be able to access the action command with `action` at your terminal. By default, it should show you a list of available actions, with "runner" being the only available one.

Each available action at this level will be a differenct action suite. Each of these suites are directories containing the correct files and file structure for action-runner.

If you run any action without the correct parameters to perform the action, then by default action-runner will generate a help message for you help guide you along the way. Each action or handler can overwrite this help message to show more granular help.

## Usage

Action suites will follow this directory structure:

    +-- index.js
    +-- options
    |   +-- option1.js
    |   +-- option2.js
    +-- action1.js
    +-- Handler 1
        +-- index.js
        +-- action.js

A directory can have an `index.js` file in it. This file will be the commands `Handler`.

Any JavaScript file besides `index.js` will be an action that can be run.

Any JavaScript file inside of the options directory will be an `Options` Handler.

For example, with the command `action generate template MyTemplate` your directory structure will look like this:

    +-- generate
    |   +-- template.js <-- Action File for "template"
    |   +-- index.js <-- Handler File for "generate"
    +-- index.js <-- Handler File for root

Handler File
------------

Handler files give support to actions, but are not meant to be standalone actions by themselves.

These files should import and extend the `Handler` class.

    let runner = require('action-runner');

    class GenerateHandler extends runner.Handler {
        constructor(cwd, next_action) {
            super(cwd, next_action);

            this.description = 'Generate a new object';
        }
    }

    exports.default = GenerateHandler;

The `cwd` will be passed to the handler which will be the directory the handler is for. The `next_action` will also be passed in (i.e., if the command is `action generate template MyTemplate` the `next_action` and this is the handler for `generate`, `next_action` will be `template`).

### setup (setup: object)

The `setup` method can be overwritten to provide setup for future actions. When the initial action is generated, `setup` will be passed an empty object.

You can manipulate this object and return it, then every subsequent `Handler` and `Action` will have access to `this.setup` and can extend it themselves.

You can return either an object or a promise and the promise will be resolved before moving to the next command.

### canRun ()

By default, this checks to see if `this.next_action` exists. If it does, it returns true, otherwise it returns false.

If this returns false, the command chain stops and a help message is printed to the screen.

Overwrite this method if you need more granular checks.

### printHelp ()

This is run when `this.canRun()` returns false. By default, this prints all child commands available.

## Options

Options allow you to add additional flags or options to a command chain. For example, an option might look like this:

    action test-action generate --output "My Director"

Options expect to recieve the same `setup` object as the `Handler` method.

An example `Options` module may look like this:

    let runner = require('action-runner');

    class TestOption extends runner.Option {
        constructor(setup) {
            super(setup);

            this.params = [
                {
                    name: "test-arg",
                    description: "a test arg"
                }
            ];
        }
    }

    module.exports.default = TestOption;

There are two main methods/properties in the `Options` class:

### params

The `params` are optional parameters that can be passed to an `Options` class. Without `params`, the option itself will just be stored into the `flags` property on the setup object.

`params` allow you to pass additional arguments to this option such as this:

    action test-action --test "value"

In the `options/test.js` file for this action, we can supply a `params` property like this:

    this.params = [
        {
            name: "test-arg",
            description: "a test arg"
        }
    ];

This will allow us to access the parameters passed into the action in a key-value pair in the `run` method like so:

    {
        'test-arg': 'value'
    }

Also, the description field will be used in help messages.

### run

The run method will consume the `params` key values pairs from above, and return the `setup` object like a handler. For instance, with the above example, a `run` method may look like this:

    run (params) {
        console.log(params);

        return this.setup;
    }

And, when run, would give an output like so:

    > action test-action --test value
    { 'test-arg': 'value' }

## Action

This is the action meant to be run at the end of the command chain.

    let runner = require('action-runner');

    class TemplateAction extends runner.Action {
        constructor(name, setup) {
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

    exports.default = TemplateAction;

When you reach an `Action` object in the command chain, the action is initialized and the `run()` method is run.

You can access the `setup` object by the `Handler`'s through `this.setup`. All arguments passed in after the action must be handled through the `this.args` property.

The `description` property is used when printing help messages. It will show as such:

    Available commands:

      template      A template

### args

The `args` property is similar to the `params` property of the `Options`. Any arguments you need to access after the action must be added to the list, and a key/value object will be generated and stored into `this.inputs`.

For example, given this `args`:

    this.args = [
        {
            name: 'template',
            description: 'The name of the template to generate'
        }
    ];

and this `run()` method:

    run () {
        console.log('Generate template', this.inputs.template);
    }

You could expect this output:

    > action test-action generate template my-template
    Generate template my-template

An `arg` may have an optional key `optional`. `optional` keys may only be used at the end of the `args` but multiple can be used.

If an `arg` that is required is not passed into the command chain, a usage help message will appear:

    > action test-action generate template

    Usage: template template

      template      The name of the template to generate

`optional` args will also be shown in this help message with `[` and `]` around the option name:

    Usage: template template [otherarg]

      template      The name of the template to generate
      otherarg      Another optional argument