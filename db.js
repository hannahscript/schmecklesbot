require('dotenv').config();
const dbNamespace = require('continuation-local-storage').createNamespace('sequelize');
const Sequelize = require('sequelize');
Sequelize.useCLS(dbNamespace);

const db = new Sequelize({
    dialect: 'sqlite',
    logging: true,
    storage: process.env.DB_PATH,
    define: {
        timestamps: false
    }
});

const Account = db.define('accounts', {
    userId: {
        type: Sequelize.CHAR(18),
        primaryKey: true
    },
    balance: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10
    }
});

const Bet = db.define('bets', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    issuer: {
        type: Sequelize.CHAR(18),
        allowNull: false
    },
    challenged: {
        type: Sequelize.CHAR(18),
        allowNull: false
    },
    judge: {
        type: Sequelize.CHAR(18),
        allowNull: false
    },
    details: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    amount: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    challengedAccepted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    judgeAccepted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    winner: {
        type: Sequelize.CHAR(18)
    },
    rejected: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
});

module.exports = {
    db,
    Account,
    Bet
};