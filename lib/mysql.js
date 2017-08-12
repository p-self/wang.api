const config = require("../config");

const sequelize = new require("Sequelize")(config.db, config.username, config.password, {
    host: config.host,
    dialect: 'mysql',

    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
});

module.exports = sequelize;