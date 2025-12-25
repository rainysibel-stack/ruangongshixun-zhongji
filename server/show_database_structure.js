const { sequelize } = require('./models');

const showDatabaseStructure = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    // Get all tables
    const [tables] = await sequelize.query("SHOW TABLES");
    console.log('📋 DATABASE TABLES:');
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });
    console.log('');

    // Show structure for each table
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`🏗️  TABLE: ${tableName.toUpperCase()}`);
      
      const [columns] = await sequelize.query(`DESCRIBE ${tableName}`);
      console.log('   Columns:');
      columns.forEach(col => {
        const nullable = col.Null === 'YES' ? 'NULL' : 'NOT NULL';
        const key = col.Key ? ` (${col.Key})` : '';
        const defaultVal = col.Default !== null ? ` DEFAULT: ${col.Default}` : '';
        const extra = col.Extra ? ` ${col.Extra}` : '';
        console.log(`     - ${col.Field}: ${col.Type} ${nullable}${key}${defaultVal}${extra}`);
      });

      // Show indexes
      const [indexes] = await sequelize.query(`SHOW INDEX FROM ${tableName}`);
      if (indexes.length > 0) {
        console.log('   Indexes:');
        const indexGroups = {};
        indexes.forEach(idx => {
          if (!indexGroups[idx.Key_name]) {
            indexGroups[idx.Key_name] = [];
          }
          indexGroups[idx.Key_name].push(idx.Column_name);
        });
        
        Object.entries(indexGroups).forEach(([indexName, columns]) => {
          const unique = indexes.find(idx => idx.Key_name === indexName)?.Non_unique === 0 ? 'UNIQUE' : '';
          console.log(`     - ${indexName}: (${columns.join(', ')}) ${unique}`);
        });
      }

      // Show foreign keys
      const [foreignKeys] = await sequelize.query(`
        SELECT 
          COLUMN_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = '${tableName}' 
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `);
      
      if (foreignKeys.length > 0) {
        console.log('   Foreign Keys:');
        foreignKeys.forEach(fk => {
          console.log(`     - ${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
        });
      }
      
      console.log('');
    }

    // Show table relationships
    console.log('🔗 TABLE RELATIONSHIPS:');
    console.log('   users (1) ←→ (1) fridges');
    console.log('   fridges (1) ←→ (n) fridge_items');
    console.log('   users (1) ←→ (n) recipes');
    console.log('   users (1) ←→ (n) shopping_items');
    console.log('   recipes.user_id can be NULL for system recipes');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database structure check failed:', error);
    process.exit(1);
  }
};

showDatabaseStructure();
