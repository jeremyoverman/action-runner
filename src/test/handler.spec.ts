import { expect } from 'chai';
import { Handler } from '../index';

describe('The Handler Object', () => {
    it('looks like a Handler object', () => {
        let handler = new Handler('.', 'testAction');
        expect(handler).to.have.all.keys([
            'cwd', 'description', 'nextAction'
        ]);
    });

    describe('the canRun function', () => {
        it ("can't run if there's no next_action", () => {
            let handler = new Handler('.', undefined);
            expect(handler.canRun()).to.be.false;
        });

        it ("can run if there's a next_action", () => {
            let handler = new Handler('.', 'testAction');
            expect(handler.canRun()).to.be.true;
        });
    });

    describe('the setup function', () => {
        let handler = new Handler('.', 'testAction');
        let setup = handler.setup({
            test: 'test'
        });

        it ('returns the setup passed to it', () => {
            expect(setup).to.deep.equal({
                test: 'test'
            });
        })
    });

    describe('the printHelp function', () => {
        let handler = new Handler('.', 'testAction');
        it ('exists', () => {
            expect(handler.printHelp).to.exist;
        });
    });
});