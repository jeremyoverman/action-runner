import * as action from '../action';

describe('the action module', () => {
    let _action: action.Action;

    beforeEach(() => {
        _action = new action.Action('test-action', {
            flags: []
        });
    });

    it('instantiates', () => {
        expect(typeof _action).toBe('object');
    });

    describe('setting the args', () => {
        let _args: action.IActionArg[];

        beforeEach(() => {
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

        it('sets args properties', () => {
            _action.args = _args;

            expect(_action.args).toBe(_args);
        });

        it('allows optional properties at the end', () => {
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

            expect(() => {
                _action.args = _args
            }).toThrowError();
        });
    });
});