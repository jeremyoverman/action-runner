import * as options from '../options';
import * as action from '../action';
import TestOption from './test-action/options/test';

describe('the options module', () => {
    let test_action: string;
    let setup: action.IActionSetup;

    beforeEach(() => {
        test_action = './built/spec/test-action';
        setup = {
            flags: []
        };
    });

    describe('the parseOptions function', () => {
        let option: options.Option;
        let runSpy: jasmine.Spy;
        let getOptionSpy: jasmine.Spy;
        let _options: options.Options;

        beforeEach(() => {
            option = new options.Option(setup);
            option.params = [
                { name: 'firstParam', description: 'First Param' },
                { name: 'secondParam', description: 'Second Param' }
            ]

            runSpy = spyOn(options.Option.prototype, 'run').and.returnValue(setup);
            _options = new options.Options(test_action, setup);

            getOptionSpy = spyOn(_options, 'getOption').and.returnValue(option);
        });

        it('should ignore non-options args', () => {
            let _options = new options.Options(test_action, setup);
            _options.args = ['arg1', 'arg2'];

            let new_setup = _options.parseOptions();

            expect(new_setup.flags).toEqual([]);
        });

        it('adds all options to the setup.flags', () => {
            let _options = new options.Options(test_action, setup);
            _options.args = ['--option1', '--option2'];

            let new_setup = _options.parseOptions();

            expect(new_setup.flags).toEqual(['option1', 'option2']);
        });

        it('sends params to the run function', () => {
            _options.args = ['--option1', 'param1', 'param2'];
            _options.parseOptions();

            expect(runSpy).toHaveBeenCalledWith({
                firstParam: 'param1',
                secondParam: 'param2'
            });
        });

        it('should only pass the first param', () => {
            _options.args = ['--option1', 'param1'];
            _options.parseOptions();

            expect(runSpy).toHaveBeenCalledWith({
                firstParam: 'param1',
            });
        });
    });

    describe('the getOption method', () => {
        it('should return the default option class if no file is found', () => {
            let _options = new options.Options(test_action, setup);

            let option = _options.getOption('fake-file');

            expect(option.params.length).toEqual(0);
        });

        it('should load an options file if it exists', () => {
            let _options = new options.Options(test_action, setup);

            let option = _options.getOption('test');
            let testOption = new TestOption(setup);

            expect(option.params.length).toEqual(2);
        });
    });

    describe('the Option class', () => {
        describe('the run method', () => {
            it('should return the setup passed in', () => {
                let option = new options.Option(setup);
                let new_setup = option.run({}); 

                expect(new_setup).toEqual(setup);
            });
        });
    });
});
