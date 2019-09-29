const chai = require('chai');
const expect = chai.expect;

const {parseCommand} = require('../util/command-parser');

describe('parse', function() {
    it('should return the correct name with empty arguments', function() {
        const input = '$ping';

        const parsedCommand = parseCommand(input, 1);

        expect(parsedCommand.name).to.equal('ping');
    });

    it('should return the correct name with empty arguments for prefix length greater than one', function() {
        const prefixLength = 2;
        const input = '$$ping';

        const parsedCommand = parseCommand(input, prefixLength);

        expect(parsedCommand.name).to.equal('ping');
    });

    it('should return the correct name and positional arguments in order', function() {
        const input = '$ping one two';

        const parsedCommand = parseCommand(input, 1);

        expect(parsedCommand.name).to.equal('ping');
        expect(parsedCommand.positionalArguments).to.deep.equal(['one', 'two']);
    });

    it('should return the correct name and named arguments', function() {
        const input = '$ping first:one second:two';

        const parsedCommand = parseCommand(input, 1);

        expect(parsedCommand.name).to.equal('ping');
        expect(parsedCommand.namedArguments).to.deep.equal({first: 'one', second: 'two'});
    });

    it('should return the correct name and both kinds of arguments', function() {
        const input = '$ping second:two first fourth:four third fifth';

        const parsedCommand = parseCommand(input, 1);

        expect(parsedCommand.name).to.equal('ping');
        expect(parsedCommand.positionalArguments).to.deep.equal(['first', 'third', 'fifth']);
        expect(parsedCommand.namedArguments).to.deep.equal({fourth: 'four', second: 'two'});
    });

    it('should ignore colons if they are quoted', function() {
        const input = '$ping fact:"fish:goes:blub"';

        const parsedCommand = parseCommand(input, 1);

        expect(parsedCommand.name).to.equal('ping');
        expect(parsedCommand.namedArguments).to.deep.equal({fact: 'fish:goes:blub'});
    });

    it('should collect whitespace for arguments if it is quoted', function() {
        const input = '$ping fact:"fish goes blub"';

        const parsedCommand = parseCommand(input, 1);

        expect(parsedCommand.name).to.equal('ping');
        expect(parsedCommand.namedArguments).to.deep.equal({fact: 'fish goes blub'});
    });
});