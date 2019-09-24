require('dotenv').config();
const Sequelize = require('sequelize');

const db = new Sequelize({
    dialect: 'sqlite',
    logging: false,
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

module.exports = {
    db,
    Account
};