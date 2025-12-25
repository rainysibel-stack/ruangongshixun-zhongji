const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserRecipe = sequelize.define('UserRecipe', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  recipe_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  is_favorite: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  added_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_recipes',
  timestamps: false,
  indexes: [
    { name: 'unique_user_recipe', unique: true, fields: ['user_id', 'recipe_id'] },
    { name: 'idx_user_id', fields: ['user_id'] },
    { name: 'idx_recipe_id', fields: ['recipe_id'] },
    { name: 'idx_is_favorite', fields: ['is_favorite'] }
  ]
});

module.exports = UserRecipe;
