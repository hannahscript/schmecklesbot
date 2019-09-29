const SchmeckleService = require('./services/schmeckle-service');

async function commandRegister(user, channel) {
    SchmeckleService.createAccount(user.id).then(success => {
        if (success) {
            channel.send('Account created.');
        } else {
            channel.send('Could not create account.');
        }
    });
}

async function commandTransfer(user, channel, {to, amount}) {
    try {
        await SchmeckleService.transferFunds(user.id, to, amount);
        channel.send('Funds transferred successfully.');
    } catch (err) {
        channel.send('Recipient not found.')
    }
}

async function commandDebug(user) {
    SchmeckleService.findAll().then(result => console.log(result));
}

module.exports = {
    commandRegister,
    commandBalance,
    commandTransfer,
    commandDebug
};