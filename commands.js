const SchmeckleService = require('./services/schmeckle-service');
const { validate } = require('./util/validate');

function commandRegister(user, channel) {
    SchmeckleService.createAccount(user.id).then(success => {
        if (!success) {
            console.log('bad ');
        } else {
            console.log('account created');
        }
    });
}

function commandBalance(user, channel) {
    /*SQL.getBalance(user.id, (err, result) => {
        if (err) {
            console.log('No account found for ' + author.id);
        } else {
            console.log(result);
        }
    })*/
}

async function commandTransfer(user, channel, targetUser, amount) {
    const argumentsValid = validate(
        {value: targetUser, pattern: /<@\d{18}>/},
        {value: amount, pattern: /\d+/},
    );

    if (!argumentsValid) {
        channel.send('Usage: transfer [@user] [amount]');
        return;
    }

    const targetUserId = targetUser.match(/<@(\d{18})>/)[1];

    await SchmeckleService.transferFunds(user.id, targetUserId, +amount);
    channel.send('Funds transferred successfully.');
}

function commandDebug(user) {
    if (user.id !== '277146459080491008') return;

    SchmeckleService.findAll().then(result => console.log(result));
}

module.exports = {
    commandRegister,
    commandBalance,
    commandTransfer,
    commandDebug
};