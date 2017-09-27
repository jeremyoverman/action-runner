import { expect } from 'chai';
import { Switch } from '../index';
import { join } from 'path';

describe('The Handler Object', () => {
    let examples = join(__dirname, 'examples');

    it ('should look like a Switch class', () => {
        let switch_class = new Switch('', examples);
        expect(switch_class).to.have.all.keys([
            'action', 'cwd', 'setup', 'path'
        ]);
    });

    it ('should store the correct properties', () => {
        let switch_class = new Switch('generate', examples);
        expect(switch_class.action).to.equal('generate');
        expect(switch_class.cwd).to.equal(examples);
        expect(switch_class.path).to.equal(join(examples, 'generate'));
    });

    describe ('the setup object', () => {
        it ('should initialize to an empty object if undefined', () => {
            let switch_class = new Switch('generate', examples);
            expect(switch_class.setup).to.deep.equal({});
        });

        it ('should be whatever is passed into it', () => {
            let switch_class = new Switch('generate', examples, {
                test: 'test'
            });

            expect(switch_class.setup).to.deep.equal({
                test: 'test'
            });
        });
    });

    describe('Processing the command chain', () => {
        describe ('passing a handler command', () => {
            it ('should print available child commands', () => {
                process.argv = ['generate'];
                let switch_class = new Switch('', examples);
            });
        });
    });
});