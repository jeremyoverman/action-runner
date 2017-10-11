import { expect } from 'chai';
import { Action } from '../switch';

describe('The Action Object', () => {
    let action: Action;

    before((done) => {
        action = new Action('testAction', {});
        done();
    });

    it('looks like an action', () => {
        expect(action).to.have.all.keys([
            'name', 'setup', 'args'
        ]);
    });

    it('can be run', () => {
        expect(action.run).to.be.a('function');
    });

    it('has access to arguments', () => {
        expect(action.args).to.be.an('array');
    });
});