const { sequelize, User, Fridge, FridgeItem, Recipe, ShoppingItem } = require('./models');

const checkDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    // Check Users
    const users = await User.findAll();
    console.log('👥 USERS TABLE:');
    console.log(`   Total users: ${users.length}`);
    users.forEach(user => {
      console.log(`   - ID: ${user.id}, Username: ${user.username}, Phone: ${user.phone}, Nickname: ${user.nickname}`);
    });
    console.log('');

    // Check Recipes
    const personalRecipes = await Recipe.findAll({ where: { user_id: { [require('sequelize').Op.not]: null } } });
    const systemRecipes = await Recipe.findAll({ where: { user_id: null } });
    
    console.log('📖 RECIPES TABLE:');
    console.log(`   Personal recipes: ${personalRecipes.length}`);
    personalRecipes.forEach(recipe => {
      console.log(`   - ${recipe.name} (${recipe.category}, ${recipe.difficulty}, ${recipe.cooking_time}) - User: ${recipe.user_id}`);
    });
    
    console.log(`   System recipes: ${systemRecipes.length}`);
    systemRecipes.forEach(recipe => {
      console.log(`   - ${recipe.name} (${recipe.category}, ${recipe.difficulty}, ${recipe.cooking_time}) - System`);
    });
    console.log('');

    // Check Fridges
    const fridges = await Fridge.findAll();
    console.log('🧊 FRIDGES TABLE:');
    console.log(`   Total fridges: ${fridges.length}`);
    fridges.forEach(fridge => {
      console.log(`   - Fridge ID: ${fridge.id}, User ID: ${fridge.user_id}`);
    });
    console.log('');

    // Check Fridge Items
    const fridgeItems = await FridgeItem.findAll();
    console.log('🥬 FRIDGE ITEMS TABLE:');
    console.log(`   Total fridge items: ${fridgeItems.length}`);
    fridgeItems.forEach(item => {
      console.log(`   - ${item.ingredient_name}: ${item.quantity}${item.unit} (${item.category}) - Fridge: ${item.fridge_id}`);
    });
    console.log('');

    // Check Shopping Items
    const shoppingItems = await ShoppingItem.findAll();
    console.log('🛒 SHOPPING ITEMS TABLE:');
    console.log(`   Total shopping items: ${shoppingItems.length}`);
    shoppingItems.forEach(item => {
      console.log(`   - ${item.name}: ${item.quantity} (${item.category}) - User: ${item.user_id}`);
    });
    console.log('');

    // Summary
    console.log('📊 DATABASE SUMMARY:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Personal Recipes: ${personalRecipes.length}`);
    console.log(`   System Recipes: ${systemRecipes.length}`);
    console.log(`   Fridges: ${fridges.length}`);
    console.log(`   Fridge Items: ${fridgeItems.length}`);
    console.log(`   Shopping Items: ${shoppingItems.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database check failed:', error);
    process.exit(1);
  }
};

checkDatabase();
