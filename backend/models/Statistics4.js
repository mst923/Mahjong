const { DataTypes } = require('sequelize');
const  {sequelize}   = require("./index")
const User = require("./index").User

//このクラスは4人戦のみ
const Statistics4 = sequelize.define('Statistics4', {

    //ユーザid
    userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: User, //ユーザモデルを参照
            key: 'id'
        },
        allowNull: false,
    },

    //総試合数
    totalMatches : {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    //総局数
    totalRounds : {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    //総和了回数
    agariCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    //立直回数
    riichiCount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    //立直和了回数
    riichiAgariCount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    //総和了ポイント
    totalAgariPoints: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    //総放銃回数
    totalHojuCount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    //総放銃点数
    totalHojuPoints: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    //トップ回数
    topCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    },
    //2着回数
    secondCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        },
    //3着回数
    thirdCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        },
    //ラス回数
    lastCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        },
    //箱下回数
    hakoshitaCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        },
    //ツモ和了回数 
    tsumoAgariCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        },
    //トータルのポイント
    totalPoints: {
    type: DataTypes.FLOAT,
    allowNull: false,
    },},{

    getterMethods: {
        agariRate() {
            return this.totalRounds > 0 ? (this.agariCount / this.totalRounds) * 100 : 0;
        },
        riichiRate() {
            return this.totalRounds > 0 ? (this.riichiCount/ this.totalRounds) * 100 : 0;
        },
        riichiAgariRate() {
            return this.riichiCount > 0 ? (this.riichiAgariCount / this.riichiCount) * 100 : 0;
        },
        hojuRate() {
            return this.totalRounds > 0 ? (this.totalHojuCount / this.totalRounds) * 100 : 0;
        },
        averageHojuPoints() {
            return this.totalHojuCount > 0 ? (this.totalHojuPoints / this.totalHojuCount) : 0;
        },
        topRate() {
            return this.totalMatches > 0 ? (this.topCount / this.totalMatches) * 100 : 0;
        },
        secondRate() {
            return this.totalMatches > 0 ? (this.secondCount / this.totalMatches) * 100 : 0;
        },
        thirdRate() {
            return this.totalMatches > 0 ? (this.thirdCount / this.totalMatches) * 100 : 0;
        },
        lastRate() {
            return this.totalMatches > 0 ? (this.lastCount / this.totalMatches) * 100 : 0;
        },
        hakoshitaRate() {
            return this.totalMatches > 0 ? (this.hakoshitaCount / this.totalMatches) * 100 : 0;
        },
        averageAgariPoints(){
            return this.agariCount > 0 ? (this.totalAgariPoints / this.agariCount) : 0;
        },
        // averageRank() {
        //     return 1 * this.topRate() + 2 * this.secondRate + 3 * thirdRate + 4 * lastRate;
        // },
        tsumoAgariRate()  {
            return this.agariCount > 0 ? (this.tsumoAgariCount / this.agariCount) * 100 : 0;
        },
    }
})

// UserモデルとStatisticsモデルの関連を定義
User.hasOne(Statistics4, { foreignKey: 'userId' });
Statistics4.belongsTo(User, { foreignKey: 'userId' });

module.exports = Statistics4;