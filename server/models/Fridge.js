const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Fridge = sequelize.define('Fridge', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'fridges',
  timestamps: false
});

module.exports = Fridge;
