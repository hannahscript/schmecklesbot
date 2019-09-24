class CommandHandler {
    constructor(prefix) {
        this.prefix = prefix;
        this.commands = {};
    }

    addCommand(name, fn) {
        this.commands[name] = fn;
    }

    handle(msg) {
        if (!msg.content.startsWith(this.prefix)) return;

        console.log('Handling ' + msg + ' for user ' + msg.author.id)

        let [command, ...args] = msg.content.split(' ');
        command = command.slice(this.prefix.length);

        const commandFn = this.commands[command];
        if (commandFn) {
            commandFn(msg.author, msg.channel, ...args);
        } else {
            console.log('Command not found');
        }
    }
}

module.exports = {
    CommandHandler
};