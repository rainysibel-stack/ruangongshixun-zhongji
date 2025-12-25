const { sequelize } = require('./models');

const createUserRecipesTable = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected...');

    // Create user_recipes table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS user_recipes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        recipe_id INT NOT NULL,
        is_favorite TINYINT(1) DEFAULT 0 COMMENT 'Whether this recipe is favorited by the user',
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'When the user added this recipe',
        UNIQUE KEY unique_user_recipe (user_id, recipe_id),
        KEY idx_user_id (user_id),
        KEY idx_recipe_id (recipe_id),
        KEY idx_is_favorite (is_favorite),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='User-Recipe association table for tracking which system recipes users have added';
    `);

    console.log('✅ Successfully created user_recipes table');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create table:', error);
    process.exit(1);
  }
};

createUserRecipesTable();
