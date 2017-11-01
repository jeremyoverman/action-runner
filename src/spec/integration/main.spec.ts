import * as app from '../../bin/main';
import * as config from '../../config';
import * as helper from '../../helper';
import * as path from 'path';

describe('The integration tests', () => {
    let errorSpy: jasmine.Spy;
    let infoSpy: jasmine.Spy;
    let logSpy: jasmine.Spy;
    let cfg: config.IConfig = {
        actionRoot: path.resolve('./built/spec/helpers'),
        actions: {},
        excludes: config.DEFAULT_CONFIG.excludes,
        locale: 'en-us'
    }

    beforeEach(() => {
        process.argv = ['node', 'action'];

        spyOn(config, 'getConfig').and.returnValue(cfg);

        errorSpy = spyOn(helper, 'error');
        infoSpy = spyOn(helper, 'info');
        logSpy = spyOn(helper, 'log');
    });

    it('should print help if you don\'t give it a parent action', (done) => {
        app.run(cfg).then(() => {
            let infoArgs = infoSpy.calls.first().args;

            expect(infoArgs[0].id).toEqual(7);
            expect(infoArgs[1]).toContain('test-action');
            expect(infoArgs[1]).toContain('built\\spec\\helpers\\test-action');

            done();
        });
    });

    it('something else', (done) => {
        process.argv.push('test-action')
        app.run(cfg).then(() => {
            console.log(logSpy.calls.all());
            console.log(infoSpy.calls.all());
            console.log(errorSpy.calls.all());

            done();
        });
    });
});