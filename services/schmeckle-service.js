const { db, Account } = require('../db');

class SchmeckleService {
    async findAll() {
        return Account.findAll().then(records => records.map(r => r.dataValues));
    }

    async createAccount(userId) {
        try {
            await Account.create({userId:'282581505996357632'});
            return true;
        } catch (ex) {
            return false;
        }
    }

    async transferFunds(senderId, recipientId, amount) {
        db.transaction(async (t) => {
            const senderRecord = await Account.findByPk(senderId);

            if (!senderRecord) {
                throw new Error('Sender account does not exist');
            }

            if (senderRecord.dataValues.balance < amount) {
                throw new Error('Not enough funds');
            }

            const recipientRecord = await Account.findByPk(recipientId);

            if (!recipientRecord) {
                throw new Error('Recipient account does not exist');
            }

            await Account.update({balance: senderRecord.dataValues.balance - amount}, {
                where: {
                    userId: senderId
                }
            });

            await Account.update({balance: recipientRecord.dataValues.balance + amount}, {
                where: {
                    userId: recipientId
                }
            });
        })
    }
}

module.exports = new SchmeckleService();