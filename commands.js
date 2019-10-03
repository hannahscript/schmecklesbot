const logger = require('./logger');
const client = require('./client');
const SchmeckleService = require('./services/schmeckle-service');

async function info(user, channel, {bet}) {
    const betRecord = await SchmeckleService.getBetById(bet);

    if (betRecord === undefined) {
        await channel.send(`Bet #${bet} not found.`);
    } else {
        const issuer = await client.fetchUser(betRecord.issuer).then(user => user.username);
        const challenged = await client.fetchUser(betRecord.challenged).then(user => user.username);
        const judge = await client.fetchUser(betRecord.judge).then(user => user.username);

        let description = `Bet #${bet} is between ${issuer} and ${challenged} and is being judged by ${judge}. The bet description is '${betRecord.details}'. The prize is ${betRecord.amount} schmeckles.`;
        if (betRecord.winner !== null) {
            const winner = await client.fetchUser(betRecord.winner).then(user => user.username);
            description += `The bet has already been won by ${winner}.`;
        } else if (betRecord.rejected) {
            description += 'The bet was rejected by one of the participants.';
        } else {
            if (betRecord.challengedAccepted && betRecord.judgeAccepted) {
                description += 'The bet is currently active.'
            } else {
                description += 'The bet has yet to be accepted by both the challenger and the judge.';
            }
        }

        await channel.send(description);
    }
}

async function register(user, channel) {
    SchmeckleService.createAccount(user.id).then(async (success) => {
        if (success) {
            await channel.send('Account created.');
        } else {
            await channel.send('Could not create account.');
        }
    });
}

async function forceRegister(user, channel, {newUser}) {
    if (user.id !== process.env.ADMIN_USER_ID) {
        return;
    }

    SchmeckleService.createAccount(newUser).then(async (success) => {
        if (success) {
            await channel.send('Account created.');
        } else {
            await channel.send('Could not create account.');
        }
    });
}

async function transfer(user, channel, {to, amount}) {
    try {
        await SchmeckleService.transferFunds(user.id, to, amount);
        await channel.send('Funds transferred successfully.');
    } catch (err) {
        await channel.send('Recipient not found.');
    }
}

async function bet(user, channel, {challenged, judge, details, amount}) {
    /*if (user.id === challenged) {
        await channel.send('You can\'t bet with yourself!');
        return;
    }

    if (user.id === judge || challenged === judge) {
        await channel.send('The judge cannot be in the betting party!');
        return;
    }*/

    let id;
    try {
        id = await SchmeckleService.createBet(user.id, challenged, judge, details, amount);
    } catch (err) {
        logger.error(err);
        await channel.send('You need an account for that.');
        return;
    }

    if (id === undefined) {
        await channel.send('You don\'t have the funds to honor that bet.');
    } else {
        await channel.send(`Bet #${id} has been created. To accept the bet as either judge or participant, use the 'accept' command with the bet id. To view the bet details again, use the 'info' command.`);
    }
}

async function forceAccept(user, channel, {bet, acceptingUser}) {
    if (user.id !== process.env.ADMIN_USER_ID) {
        return;
    }

    return accept({id: acceptingUser}, channel, {bet});
}

async function accept(user, channel, {bet}) {
    logger.info(`User ${user.id} called $accept for bet #${bet}`);
    const betRecord = await SchmeckleService.getBetById(bet);

    if (betRecord === undefined) {
        await channel.send(`Bet #${bet} not found.`);
        return;
    }

    if (betRecord.winner !== null) {
        await channel.send(`Bet #${bet} has already completed.`);
        return;
    }

    if (betRecord.rejected) {
        await channel.send(`Bet #${bet} has already been cancelled because either the judge or challenged participant rejected the terms.`);
        return;
    }

    if (betRecord.challenged === user.id) {
        if (betRecord.challengedAccepted) {
            await channel.send(`You already accepted to wager in bet #${bet}.`)
        } else {
            await SchmeckleService.acceptBetForParticipant(bet);
            await channel.send(`You are now participating in bet #${bet}.`);
        }
    } else if (betRecord.judge === user.id) {
        if (betRecord.judgeAccepted) {
            await channel.send(`You already accepted to judge bet #${bet}.`)
        } else {
            await SchmeckleService.acceptBetForJudge(bet);
            await channel.send(`You are now judging for bet #${bet}.`);
        }
    } else {
        await channel.send(`You are neither a participant or judge in bet #${bet}!`);
    }
}

async function reject(user, channel, {bet}) {
    const betRecord = await SchmeckleService.getBetById(bet);

    if (betRecord === undefined) {
        await channel.send(`Bet #${bet} not found.`);
        return;
    }

    if (betRecord.winner !== null) {
        await channel.send(`Bet #${bet} has already completed.`);
        return;
    }

    if (betRecord.rejected) {
        await channel.send(`Bet #${bet} has already been cancelled because either the judge or challenged participant rejected the terms.`);
        return;
    }

    if (betRecord.challenged === user.id ) {
        if (betRecord.challengedAccepted) {
            await channel.send(`You already accepted to wager bet #${bet}.`)
        } else {
            await SchmeckleService.rejectBet(bet);
            await channel.send(`Bet #${bet} has been cancelled because the challenged participant has rejected the bet.`);
        }
    } else if (betRecord.judge === user.id) {
        if (betRecord.judgeAccepted) {
            await channel.send(`You already accepted to judge bet #${bet}.`)
        } else {
            await SchmeckleService.rejectBet(bet);
            await channel.send(`Bet #${bet} has been cancelled because the nominated judge has rejected the bet.`);
        }
    } else {
        await channel.send(`You are neither a participant or judge in bet #${bet}!`);
    }
}

async function judge(user, channel, {bet, winner}) {
    const betRecord = await SchmeckleService.getBetById(bet);

    if (betRecord === undefined) {
        await channel.send(`Bet #${bet} not found.`);
        return;
    }

    if (!betRecord.judgeAccepted || !betRecord.challengedAccepted) {
        await channel.send(`Not all parties have agreed to bet #${bet} yet.`);
        return;
    }

    const completedBet = await SchmeckleService.resolveBet(bet, winner);
    if (completedBet) {
        await channel.send(`User ${completedBet.winner} has won bet #${completedBet.id}. The prize is ${completedBet.amount} schmeckle${completedBet.amount > 1 ? 's' : ''}!`)
    } else {
        await channel.send(`Bet #${bet} has already been judged.`)
    }
}

async function debug(user) {
    SchmeckleService.findAll().then(result => console.log(result));
}

async function balance(user, channel) {
    try {
        const balance = await SchmeckleService.getBalance(user.id);
        await channel.send(`Your account has ${balance} schmeckles.`);
    } catch (err) {
        await channel.send('You need an account for that!');
    }
}

async function payday(user, channel, {to, amount}) {
    if (user.id !== process.env.ADMIN_USER_ID) {
        return;
    }

    try {
        await SchmeckleService.addFunds(to, amount);
        const user = await client.fetchUser(to);
        await channel.send(`<@${user.id}>, you have been awarded ${amount} schmeckles by the Central Schmeckles Bank.`);
    } catch (err) {
        await channel.send('Recipient not found.');
    }
    
}

module.exports = {
    register,
    transfer,
    debug,
    bet,
    accept,
    reject,
    judge,
    balance,
    info,
    forceAccept,
    forceRegister,
    payday
};