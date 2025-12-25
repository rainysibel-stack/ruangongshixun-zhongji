const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Recipe = sequelize.define('Recipe', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(20)
  },
  difficulty: {
    type: DataTypes.STRING(20)
  },
  cooking_time: {
    type: DataTypes.STRING(20)
  },
  image: {
    type: DataTypes.STRING(200)
  },
  ingredients: {
    type: DataTypes.JSON
  },
  steps: {
    type: DataTypes.JSON
  },
  tips: {
    type: DataTypes.TEXT
  },
  nutrition: {
    type: DataTypes.JSON
  },
  is_favorite: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  cooked_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'recipes',
  timestamps: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['category'] },
    { fields: ['is_favorite'] },
    { fields: ['cooked_count'] },
    { fields: ['created_at'] }
  ]
});

module.exports = Recipe;
