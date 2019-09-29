const chai = require('chai');
const expect = chai.expect;
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const sinon = require('sinon');

const {Integer, oneOf} = require('../util/types');


const identityType = raw => ({value: raw});
const errorType = raw => ({error: 'I always fail'});
describe('types', function() {
    describe('Integer', function() {
        it('should validate positive integers', function() {
            expect(Integer('42')).to.deep.equal({value: 42});
            expect(Integer('0')).to.deep.equal({value: 0});
        });

        it('should not validate negative integers', function() {
            expect(Integer('-42')).to.have.property('error');
            expect(Integer('-0')).to.have.property('error');
        });

        it('should not validate floating point numbers', function() {
            expect(Integer('42.123')).to.have.property('error');
            expect(Integer('42,1')).to.have.property('error');
            expect(Integer('42.0')).to.have.property('error');
        });

        it('should not validate non-numbers', function() {
            expect(Integer('asdf')).to.have.property('error');
            expect(Integer('1x2')).to.have.property('error');
            expect(Integer('')).to.have.property('error');
        });
    });

    describe('oneOf', function() {
    });
});