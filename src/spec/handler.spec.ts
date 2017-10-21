import * as handler from '../handler';
import * as helper from '../helper';
import * as config from '../config';

describe('the handler class', () => {
    let test_action = './built/spec/test-action';

    beforeEach(() => {
        let _config = config.DEFAULT_CONFIG;

        spyOn(config, 'getConfig').and.returnValue(_config);
    });

    describe('the canRunClass method', () => {
        it('should return false if nextAction is undefined', () => {
            let _handler = new handler.Handler(test_action, undefined);
            let canRun = _handler.canRun();
            expect(canRun).toBe(false);
        });
    })

    describe('the setup method', () => {
        it('should return whatever is passed to it',  () => {
            let _handler = new handler.Handler(test_action, undefined);
            let setup = _handler.setup({
                'test': 'test'
            });

            expect(setup).toEqual({
                'test': 'test'
            });
        });
    })

    describe('the printHelp method', () => {
        it('should print a help message when the directory is good', (done) => {
            let _handler = new handler.Handler(test_action, undefined);
            let infoSpy = spyOn(helper, 'info');

            _handler.printHelp().then(() => {
                expect(infoSpy.calls.count()).toBe(1);
                done();
            }).catch((err: Error) => {
                console.log(err);
                done();
            });
        });

        it('should return a rejected the promise if the directory doesnt exist', (done) =>{
            let _handler = new handler.Handler('./this-directory-doesnt-exit', undefined);

            _handler.printHelp().then(() => {
                throw new Error('printHelp did not return an error');
            }).catch((err) => {
                expect(err.code).toEqual('ENOENT');
                done();
            });
        });
    })
});