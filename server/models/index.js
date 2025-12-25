const sequelize = require('../config/database');
const User = require('./User');
const Fridge = require('./Fridge');
const FridgeItem = require('./FridgeItem');
const Recipe = require('./Recipe');
const ShoppingItem = require('./ShoppingItem');
const UserRecipe = require('./UserRecipeModel');

// Define Associations

// User <-> Fridge (One-to-One)
User.hasOne(Fridge, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Fridge.belongsTo(User, { foreignKey: 'user_id' });

// Fridge <-> FridgeItem (One-to-Many)
Fridge.hasMany(FridgeItem, { foreignKey: 'fridge_id', onDelete: 'CASCADE' });
FridgeItem.belongsTo(Fridge, { foreignKey: 'fridge_id' });

// User <-> Recipe (One-to-Many)
User.hasMany(Recipe, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Recipe.belongsTo(User, { foreignKey: 'user_id' });

// User <-> ShoppingItem (One-to-Many)
User.hasMany(ShoppingItem, { foreignKey: 'user_id', onDelete: 'CASCADE' });
ShoppingItem.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  sequelize,
  User,
  Fridge,
  FridgeItem,
  Recipe,
  ShoppingItem,
  UserRecipe
};
