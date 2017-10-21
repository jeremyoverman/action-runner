import * as action from '../action';
import * as helper from '../helper';
import * as config from '../config';

describe('the action module', () => {
    let _args: action.IActionArg[];

    beforeEach(() => {
        let _config = config.DEFAULT_CONFIG;

        spyOn(config, 'getConfig').and.returnValue(_config);

        process.argv = ['test1', 'test2'];
        _args = [
            {
                'name': 'arg1',
                'description': 'Argument 1'
            },
            {
                'name': 'arg2',
                'description': 'Argument 2'
            },
        ];
    });

    it('should instantiate', () => {
        let _action = new action.Action('test-action', {
            flags: []
        });

        expect(typeof _action).toBe('object');
    });

    describe('setting the args', () => {
        let _action: action.Action;

        beforeEach(() => {
            _action = new action.Action('test-action', {
                flags: []
            });
        });

        it('should set args properties', () => {
            _action.args = _args;

            expect(_action.args).toBe(_args);
        });

        it('should allow optional properties at the end', () => {
            _args.push({
                'name': 'arg3',
                'description': 'Argument 3 (Optional)',
                'optional': true
            });

            _action.args = _args;
            
            expect(_action.args).toBe(_args);
        });

        it('should not allow optional arguments in the middle', () => {
            _args.push({
                'name': 'arg3',
                'description': 'Argument 3 (Optional)',
                'optional': true
            });

            _args.push({
                'name': 'arg4',
                'description': 'Required argument at the end'
            });

            _action.args = _args

            expect(_action.args).toEqual([]);
        });
    });

    describe('getting inputs', () => {
        describe('and sending the correct args', () => {
            it('should return the correct inputs', () => {
                let _action = new action.Action('test-action', {
                    flags: []
                });

                _action.args = _args;
                _action.inputs = _action.createInputs();

                expect(_action.inputs).toEqual({
                    arg1: 'test1',
                    arg2: 'test2'
                });
            });
        });

        describe('the canRun method', () => {
            it('should return false if too few inputs', () => {
                process.argv = ['test1'];

                let _action = new action.Action('test-action', {
                    flags: []
                });

                _action.args = _args;

                console.log(_action.canRun());

                expect(_action.canRun()).toBe(false);
            });
        });
    });

    describe('the printHelp method', () => {
        let infoSpy: jasmine.Spy;
        let _action: action.Action;

        beforeEach(() => {
            _action = new action.Action('test-action', {
                flags: []
            });

            infoSpy = spyOn(helper, 'info');
        });

        it('should print the help message when no args are present', () => {
            _action.printHelp();

            expect(infoSpy.calls.first().args[0]).toBe('Action: test-action');
            expect(infoSpy.calls.first().args[1]).toBe('\nUsage: test-action \n\n');
            expect(infoSpy).toHaveBeenCalled();
        });

        it('should print the help message with example usage', () => {
            _action.args = _args;
            _action.printHelp();
            
            expect(infoSpy.calls.first().args[1]).toContain('Usage: test-action arg1 arg2');
        });

        it('should print the help message with optional argument', () => {
            _args.push({
                'name': 'arg3',
                'description': 'Argument 3 (Optional)',
                'optional': true
            });

            _action.args = _args;
            _action.printHelp();
            
            expect(infoSpy.calls.first().args[1]).toContain('Usage: test-action arg1 arg2 [arg3]');
        });
    });

    describe('running the action', () => {
        it('should log a message', () => {
            let logSpy = spyOn(helper, 'log');
            let _action = new action.Action('test-action', {
                flags: []
            });

            _action.run();

            expect(logSpy).toHaveBeenCalled();
        });
    });;
});