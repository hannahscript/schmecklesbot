const {parseCommand} = require('./command-parser');

class CommandHandler {
    constructor(prefix) {
        this.prefix = prefix;
        this.commands = {};
    }

    /*
    {
        command: 'bet',
        arguments: [
            {
                name: 'to',
                type: Types.Integer
            }
        ],
        handler: fn
    }
    */
    register(options) {
        // TODO validate options
        // no duplicate names, optional arguments last, ...
        // make function to set default properties according to scheme
        options.arguments = options.arguments || [];
        this.commands[options.name] = options;
    }

    async handle(msg) {
        if (!this._isCommand(msg)) return;

        const parsedCommand = parseCommand(msg.content, this.prefix.length);

        const commandDefinition = this.commands[parsedCommand.name];
        if (!commandDefinition) {
            await msg.channel.send(`Command ${parsedCommand.name} not found`);
            return;
        }

        const argumentResults =  {
            ...this._processNamedArguments(commandDefinition, parsedCommand),
            ...this._processPositionalArguments(commandDefinition, parsedCommand),
        };

        const argumentValues = {};
        for (const argument in argumentResults) {
            const result = argumentResults[argument];
            if (result.error) {
                await msg.channel.send(commandDefinition.usage || 'There was a problem with the supplied parameters. Sadly, this command\'s usage appears to be undocumented');
                return;
            }

            argumentValues[argument] = result.value;
        }

        await commandDefinition.handler(msg.author, msg.channel, argumentValues);
    }

    _processNamedArguments(commandDefinition, parsedCommand) {
        const argumentValues = {};
        for (const argName in parsedCommand.namedArguments) {
            const argumentDefinition = commandDefinition.arguments.find(arg => arg.name === argName);

            if (!argumentDefinition) continue; // Ignore unknown names
            
            const rawValue = parsedCommand.namedArguments[argName];
            const validation = argumentDefinition.type(rawValue);

            argumentValues[argName] = validation;
        }

        return argumentValues;
    }

    _processPositionalArguments(commandDefinition, parsedCommand) {
        const namedArguments = Object.keys(parsedCommand.namedArguments);
        const unprocessedArguments = commandDefinition.arguments.filter(arg => namedArguments.indexOf(arg.name) < 0);

        const argumentValues = {};
        for (const argumentDefinition of unprocessedArguments) {
            if (parsedCommand.positionalArguments.length === 0) {
                if (argumentDefinition.optional) break;

                argumentValues[argumentDefinition.name] = {error: 'No value specified for ' + argumentDefinition.name};
                continue;
            }

            const rawValue = parsedCommand.positionalArguments.shift();
            const validation = argumentDefinition.type(rawValue);
            
            argumentValues[argumentDefinition.name] = validation;
        }

        return argumentValues;
    }

    _isCommand(msg) {
        return msg.content.startsWith(this.prefix);
    }
}

module.exports = {
    CommandHandler
};