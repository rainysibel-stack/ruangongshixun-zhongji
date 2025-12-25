const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FridgeItem = sequelize.define('FridgeItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fridge_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ingredient_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  quantity: {
    type: DataTypes.STRING(20)
  },
  category: {
    type: DataTypes.STRING(20)
  },
  unit: {
    type: DataTypes.STRING(20)
  },
  added_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'fridge_items',
  timestamps: false,
  indexes: [
    {
      fields: ['fridge_id']
    }
  ]
});

module.exports = FridgeItem;
