const { db, Account, Bet } = require('../db');
const logger = require('../logger');

class SchmeckleService {
    async findAll() {
        return Account.findAll().then(records => records.map(r => r.dataValues));
    }

    async createAccount(userId) {
        try {
            await Account.create({userId});
            return true;
        } catch (ex) {
            return false;
        }
    }

    async createBet(issuer, challenged, judge, details, amount) {
        return db.transaction(async (transaction) => {
            const fundsRemoved = await this._removeFunds(issuer, amount, transaction);

            if (!fundsRemoved) {
                logger.info('Not enough funds to create bet');
                return undefined;
            }

            return Bet.create({
                issuer,
                challenged,
                judge,
                details,
                amount
            }, {transaction}).then(bet => bet.id);
        });
    }

    async acceptBetForJudge(betId) {
        return Bet.update({
            judgeAccepted: true
        },
        {
            where: {id: betId}
        });
    }

    async acceptBetForParticipant(betId) {
        return db.transaction(async (transaction) => {
            const bet = await this._getBetById(betId, transaction);

            const fundsRemoved = await this._removeFunds(bet.challenged, bet.amount, transaction);

            if (!fundsRemoved) {
                return false;
            }

            await Bet.update({
                challengedAccepted: true
            },
            {
                transaction,
                where: {id: betId}
            });

            return true;
        });
    }

    async rejectBet(betId) {
        return db.transaction(async (transaction) => {
            const bet = await this._getBetById(betId, transaction);

            if (bet.winner !== null) {
                return false;
            }

            await this._addFunds(bet.issuer, bet.amount, transaction);

            if (bet.challengedAccepted) {
                await this._addFunds(bet.challenged, bet.amount, transaction);
            }

            await Bet.update({
                rejected: true
            },
            {
                transaction,
                where: {id: betId}
            });

            return true;
        });
    }

    async resolveBet(betId, winnerId) {
        return db.transaction(async (transaction) => {
            const bet = await this._getBetById(betId, transaction);

            if (bet.winner !== null) {
                return undefined;
            }

            await this._addFunds(winnerId, bet.amount * 2, transaction);

            await Bet.update({
                winner: winnerId
            },
            {
                transaction,
                where: {id: betId}
            });

            return bet;
        });
    }

    async getBetById(betId) {
        return Bet.findByPk(betId).then(bet => bet ? bet.dataValues : undefined);
    }

    async _getBetById(betId, transaction) {
        return Bet.findByPk(betId, {transaction}).then(bet => bet.dataValues);
    }

    async getBalance(userId) {
        try {
            return await this._getBalance(userId);
        } catch (err) {
            logger.error(`Account not found: ${userId}`);
            throw new Error('Account does not exist');
        }
    }

    async _getBalance(userId, transaction) {
        return Account.findByPk(userId, {transaction}).then(account => account.dataValues.balance);
    }

    async _removeFunds(userId, amount, transaction) {
        const funds = await this._getBalance(userId, transaction);

        if (funds < amount) {
            return false;
        }

        await Account.update({balance: funds - amount}, {
            transaction,
            where: {
                userId: userId
            }
        });

        return true;
    }

    async _addFunds(userId, amount, transaction) {
        const funds = await this._getBalance(userId, transaction);

        await Account.update({balance: funds + amount}, {
            transaction,
            where: {
                userId: userId
            }
        });
    }

    async transferFunds(senderId, recipientId, amount) {
        return db.transaction(async (transaction) => {
            const funds = await this._getBalance(userId, transaction);

            if (funds < amount) {
                throw new Error('Not enough funds');
            }

            const recipientRecord = await Account.findByPk(recipientId, {transaction});

            await Account.update({balance: funds - amount}, {
                transaction,
                where: {
                    userId: senderId
                }
            });

            await Account.update({balance: recipientRecord.dataValues.balance + amount}, {
                transaction,
                where: {
                    userId: recipientId
                }
            });
        })
    }
}

module.exports = new SchmeckleService();