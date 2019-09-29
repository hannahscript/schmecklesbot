const chai = require('chai');
const expect = chai.expect;
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const sinon = require('sinon');

const {CommandHandler} = require('../util/command-handler');


const identityType = raw => ({value: raw});
const errorType = raw => ({error: 'I always fail'});
describe('CommandHandler', function() {
    describe('handle', function() {
        before(function() {
            this.handler = new CommandHandler('$');
        });

        it('should call commands with no arguments', async function() {
            const command = sinon.spy();
            this.handler.register({
                name: 'ping',
                handler: command
            });
            const msg = {user: 'user', channel: 'channel', content: '$ping'};
    
            await this.handler.handle(msg);
    
            expect(command).to.have.been.calledWith(msg.user, msg.channel, {});
        });

        it('should call commands with correct positional arguments', async function() {
            const command = sinon.spy();
            this.handler.register({
                name: 'greet',
                arguments: [
                    {
                        name: 'greeting',
                        type: identityType
                    },
                    {
                        name: 'person',
                        type: identityType
                    }
                ],
                handler: command
            });
            const msg = {user: 'user', channel: 'channel', content: '$greet hi mark'};
    
            await this.handler.handle(msg);
    
            expect(command).to.have.been.calledWith(msg.user, msg.channel, {greeting: 'hi', person: 'mark'});
        });

        it('should call commands with correct named arguments', async function() {
            const command = sinon.spy();
            this.handler.register({
                name: 'greet',
                arguments: [
                    {
                        name: 'greeting',
                        type: identityType
                    },
                    {
                        name: 'person',
                        type: identityType
                    }
                ],
                handler: command
            });
            const msg = {user: 'user', channel: 'channel', content: '$greet person:mark greeting:"good morning'};
    
            await this.handler.handle(msg);
    
            expect(command).to.have.been.calledWith(msg.user, msg.channel, {greeting: 'good morning', person: 'mark'});
        });

        it('should arrange positional arguments correctly when some arguments have been named', async function() {
            const command = sinon.spy();
            this.handler.register({
                name: 'long',
                arguments: [
                    {
                        name: 'first',
                        type: identityType
                    },
                    {
                        name: 'second',
                        type: identityType
                    },
                    {
                        name: 'third',
                        type: identityType
                    },
                    {
                        name: 'fourth',
                        type: identityType
                    }
                ],
                handler: command
            });
            const msg = {user: 'user', channel: 'channel', content: '$long two first:one third:three four'};
    
            await this.handler.handle(msg);
    
            expect(command).to.have.been.calledWith(msg.user, msg.channel, {first: 'one', second: 'two', third: 'three', fourth: 'four'});
        });

        it('should display command usage when an argument is missing', async function() {
            const send = sinon.spy();
            const usage = 'No, like this: ...';
            this.handler.register({
                name: 'foobar',
                usage: usage,
                arguments: [
                    {
                        name: 'first',
                        type: identityType
                    },
                    {
                        name: 'second',
                        type: identityType
                    }
                ]
            });
    
            await this.handler.handle({channel: {send}, content: '$foobar irrelevant:stuff one'});
    
            expect(send).to.have.been.calledWith(usage);
        });

        it('should display command usage when an argument type does not validate', async function() {
            const send = sinon.spy();
            const usage = 'No, like this: ...';
            this.handler.register({
                name: 'foobar',
                usage: usage,
                arguments: [
                    {
                        name: 'first',
                        type: identityType
                    },
                    {
                        name: 'second',
                        type: errorType
                    }
                ]
            });
    
            await this.handler.handle({channel: {send}, content: '$foobar abc def'});
    
            expect(send).to.have.been.calledWith(usage);
        });
    })
});