const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: console.log  // ログを有効にする
});

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// const Statistics4 = require('./Statistics4')
// const Statistics3 = require('./Statistics3')

sequelize.sync()
  .then(() => console.log('Database & tables created!'))
  .catch(error => console.error('Error creating database & tables:', error));

module.exports = { User, sequelize} ;
