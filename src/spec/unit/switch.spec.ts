import * as sw from '../../switch';
import * as helper from '../../helper';
import * as action from '../../action';
import * as handler from '../../handler';
import * as config from '../../config';
import * as path from 'path';
import TestAction from '../helpers/test-action/action';

process.on('unhandledRejection', r => console.log(r))

describe('the switch class', () => {
    let test_action: string;

    beforeEach(() => {
        test_action = './built/spec/test-action';
        process.argv = [];
    });

    describe('the getNextAction method', () => {
        beforeEach(() => {
            process.argv = ['test-action'];
        });

        it('should give me the next action with a good directory', (done) => {
            let _sw = new sw.Switch('', test_action);

            _sw.getNextAction().then((action) => {
                expect(_sw.type).toBe('directory');
                expect(action).toBe('test-action');
                done();
            });
        });

        it('should give me the next action with a good file', (done) => {
            let _sw = new sw.Switch('action', test_action);

            _sw.getNextAction().then((action) => {
                expect(_sw.type).toBe('file');
                expect(action).toBe('test-action');
                done();
            });
        });

        it('should give me an error if the action doesnt exist', (done) => {
            let _sw = new sw.Switch('doesnt-exist', test_action);

            _sw.getNextAction().then((action) => {
                throw new Error('We shouldnt hit this');
            }).catch((msg: helper.IMessage) => {
                expect(msg.id).toBe(8);
                done();
            });
        });

        it('should give me an error if the action shares a directories name', (done) => {
            let dir = path.join(test_action, 'switch-test');
            let _sw = new sw.Switch('test', dir);

            _sw.getNextAction().then((action) => {
                throw new Error('We shouldnt hit this');
            }).catch((msg: helper.IMessage) => {
                expect(msg.id).toBe(9);
                done();
            });
        });
    });

    describe('the handleNextAction method', () => {
        it('should call handleDirectory if the action is a directory', (done) => {
            let _sw = new sw.Switch('', test_action);

            let handleDirectorySpy = spyOn(_sw, 'handleDirectory');

            process.argv = ['action'];

            _sw.handleNextAction().then(() => {
                expect(handleDirectorySpy).toHaveBeenCalled();

                let args = handleDirectorySpy.calls.first().args;

                expect(args[0]).toEqual(jasmine.any(handler.Handler));
                expect(args[1]).toEqual('action');
                done();
            });
        });

        it('should call handleFile if the action is a file', (done) => {
            let _sw = new sw.Switch('action', test_action);

            let handleFileSpy = spyOn(_sw, 'handleFile');

            _sw.handleNextAction().then(() => {
                expect(handleFileSpy).toHaveBeenCalled();
                done();
            });
        });

        it('should print a help message if it cant be run', (done) => {
            let _sw = new sw.Switch('switch-test', test_action);
            let printHelpSpy = spyOn(handler.Handler.prototype, 'printHelp')

            _sw.handleNextAction().then(() => {
                expect(printHelpSpy).toHaveBeenCalled();
                done();
            });
        });

        it('should reject if theres an error', (done) => {
            let _sw = new sw.Switch('doesnt-exist', test_action);

            _sw.handleNextAction().then(() => {
                throw new Error("this shouldnt get called");
            }).catch((msg: helper.IMessage) => {
                expect(msg.id).toBe(8);
                done();
            });
        });
    });

    describe('the handleFile method', () => {
        let errorSpy: jasmine.Spy;
        let printHelpSpy: jasmine.Spy;
        let createInputsSpy: jasmine.Spy;
        let runSpy: jasmine.Spy;

        beforeEach(() => {
            errorSpy = spyOn(helper, 'error');
            printHelpSpy = spyOn(action.Action.prototype, 'printHelp');
            createInputsSpy = spyOn(action.Action.prototype, 'createInputs');
            runSpy = spyOn(TestAction.prototype, 'run');
        });

        it('should print a help message if the function cant run', () => {
            let _sw = new sw.Switch('action', test_action);

            spyOn(action.Action.prototype, 'canRun').and.returnValue(false);

            _sw.handleFile();

            expect(printHelpSpy).toHaveBeenCalled();
        });

        it('should print an error if the provided args are wrong', () => {
            let _sw = new sw.Switch('action', test_action);

            let argsValidSpy = spyOn(action.Action.prototype, 'argsValid').and.returnValue(false);
            _sw.handleFile();

            expect(argsValidSpy.calls.first().args).toEqual(jasmine.any(Array));

            expect(errorSpy).toHaveBeenCalled();
        });

        it('should run the action if it can be run', () => {
            let _sw = new sw.Switch('action', test_action);

            spyOn(action.Action.prototype, 'canRun').and.returnValue(true);
            spyOn(action.Action.prototype, 'argsValid').and.returnValue(true);

            _sw.handleFile();

            expect(runSpy).toHaveBeenCalled();
        });
    });

    describe('the handleDirectory method', () => {
        let handleNextActionSpy: jasmine.Spy;

        beforeEach(() => {
            process.argv = ['test'];

            handleNextActionSpy = spyOn(sw.Switch.prototype, 'handleNextAction');
        });

        it('should setup the handler and create a new switch', (done) => {
            let _sw = new sw.Switch('', test_action);
            let _handler = new handler.Handler(test_action, 'action');

            handleNextActionSpy = handleNextActionSpy
                .and.returnValue(Promise.resolve());

            _sw.handleDirectory(_handler, 'action').then(() => {
                expect(process.argv.length).toBe(0);
                expect(handleNextActionSpy).toHaveBeenCalled();
                done();
            });
        });

        it('should reject with a message if handleNextAction fails', (done) => {
            let _sw = new sw.Switch('', test_action);
            let _handler = new handler.Handler(test_action, 'action');

            handleNextActionSpy = handleNextActionSpy
                .and.returnValue(Promise.reject(helper.messages.action_does_not_exist));

            _sw.handleDirectory(_handler, 'action').catch((msg) => {
                expect(msg.id).toBe(8);
                done();
            });
        });
    });
});