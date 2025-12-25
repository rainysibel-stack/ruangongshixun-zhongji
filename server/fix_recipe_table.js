const { sequelize } = require('./models');

const fixRecipeTable = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');

    // Modify user_id column to allow NULL values for system recipes
    await sequelize.query('ALTER TABLE recipes MODIFY user_id INT NULL;');
    console.log('Successfully modified recipes table to allow NULL user_id');
    
    process.exit(0);
  } catch (error) {
    console.error('Failed to modify table:', error);
    process.exit(1);
  }
};

fixRecipeTable();
