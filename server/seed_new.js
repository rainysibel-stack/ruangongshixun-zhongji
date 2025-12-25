const { sequelize, User, Fridge, FridgeItem, Recipe, ShoppingItem, UserRecipe } = require('./models');
const bcrypt = require('bcrypt');

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');

    // 1. Delete existing demo user and recreate with correct data
    await User.destroy({ where: { username: 'demo' } });
    await User.destroy({ where: { id: 1 } });
    await User.destroy({ where: { phone: '1234567890' } });
    
    const hashedPassword = await bcrypt.hash('123456', 10);
    const user = await User.create({
        id: 1,
        username: 'demo',
        phone: '1234567890',
        password: hashedPassword,
        nickname: 'demo'
    });
    console.log('Created demo user (id: 1, username: demo, phone: 1234567890, password: 123456)');
    
    // Delete existing fridge and create new one
    await Fridge.destroy({ where: { user_id: 1 } });
    await Fridge.create({ user_id: user.id });

    const fridge = await Fridge.findOne({ where: { user_id: user.id } });

    // 2. Clear existing data for this user (for idempotency)
    await Recipe.destroy({ where: { user_id: user.id } });
    await FridgeItem.destroy({ where: { fridge_id: fridge.id } });
    await ShoppingItem.destroy({ where: { user_id: user.id } });
    
    // Also clear system recipes to avoid duplicates
    await Recipe.destroy({ where: { user_id: null } });
    
    // 3. Create Personal Recipes for User
    const personalRecipes = [
      {
        user_id: user.id,
        name: '西红柿炒鸡蛋',
        category: '正餐',
        difficulty: '简单',
        cooking_time: '15分钟',
        image: '🍳',
        ingredients: JSON.stringify([
            { name: '鸡蛋', quantity: '3个' }, 
            { name: '西红柿', quantity: '2个' },
            { name: '葱', quantity: '1根' }
        ]),
        steps: JSON.stringify([
            '西红柿切块，鸡蛋打散', 
            '热锅加油，倒入蛋液炒熟盛出', 
            '锅中再加油，炒西红柿出汁',
            '倒入鸡蛋混合翻炒，加盐撒葱花出锅'
        ]),
        tips: '西红柿要去皮口感更好哦',
        nutrition: JSON.stringify({ calories: '200kcal', protein: '15g' }),
        is_favorite: true
      },
      {
        user_id: user.id,
        name: '红烧肉',
        category: '正餐',
        difficulty: '困难',
        cooking_time: '90分钟',
        image: '🥩',
        ingredients: JSON.stringify([
            { name: '五花肉', quantity: '500g' }, 
            { name: '冰糖', quantity: '20g' },
            { name: '姜', quantity: '3片' },
            { name: '八角', quantity: '2个' }
        ]),
        steps: JSON.stringify([
            '五花肉切块焯水', 
            '炒糖色，下肉翻炒上色', 
            '加水没过肉，加入调料小火慢炖',
            '大火收汁即可'
        ]),
        tips: '选五花三层的肉最好吃',
        nutrition: JSON.stringify({ calories: '800kcal', protein: '25g' }),
        is_favorite: false
      },
      {
        user_id: user.id,
        name: '水果酸奶沙拉',
        category: '甜点',
        difficulty: '简单',
        cooking_time: '5分钟',
        image: '🥗',
        ingredients: JSON.stringify([
            { name: '苹果', quantity: '1个' }, 
            { name: '香蕉', quantity: '1根' },
            { name: '酸奶', quantity: '200g' }
        ]),
        steps: JSON.stringify([
            '水果切丁', 
            '倒入酸奶搅拌均匀'
        ]),
        tips: '冷藏后风味更佳',
        nutrition: JSON.stringify({ calories: '150kcal', protein: '5g' }),
        is_favorite: true
      },
      {
          user_id: user.id,
          name: '玉米排骨汤',
          category: '汤羹',
          difficulty: '中等',
          cooking_time: '60分钟',
          image: '🥣',
          ingredients: JSON.stringify([
              { name: '排骨', quantity: '300g' },
              { name: '玉米', quantity: '1根' },
              { name: '胡萝卜', quantity: '1根' }
          ]),
          steps: JSON.stringify([
              '排骨焯水洗净',
              '玉米胡萝卜切块',
              '所有食材放入锅中加水炖煮1小时'
          ]),
          tips: '出锅前再放盐',
          nutrition: JSON.stringify({ calories: '300kcal', protein: '18g' }),
          is_favorite: false
      }
    ];

    for (const recipe of personalRecipes) {
        await Recipe.create(recipe);
    }
    console.log(`Added ${personalRecipes.length} personal recipes`);
    
    // 4. Create System Recipes (for recipe square and recommendations)
    const systemRecipes = [
        {
            user_id: null, // System recipe
            name: '麻婆豆腐',
            category: '正餐',
            difficulty: '中等',
            cooking_time: '25分钟',
            image: '🌶️',
            ingredients: JSON.stringify([
                { name: '豆腐', quantity: '1块' },
                { name: '肉末', quantity: '100g' },
                { name: '豆瓣酱', quantity: '2勺' },
                { name: '蒜', quantity: '3瓣' }
            ]),
            steps: JSON.stringify([
                '豆腐切块焯水',
                '热锅下肉末炒香',
                '加豆瓣酱炒出红油',
                '下豆腐轻炒，勾芡收汁'
            ]),
            tips: '豆腐要选嫩豆腐',
            nutrition: JSON.stringify({ calories: '280kcal', protein: '20g' }),
            is_favorite: false
        },
        {
            user_id: null,
            name: '宫保鸡丁',
            category: '正餐',
            difficulty: '中等',
            cooking_time: '20分钟',
            image: '🥜',
            ingredients: JSON.stringify([
                { name: '鸡胸肉', quantity: '200g' },
                { name: '花生米', quantity: '50g' },
                { name: '干辣椒', quantity: '5个' },
                { name: '葱', quantity: '2根' }
            ]),
            steps: JSON.stringify([
                '鸡肉切丁腌制',
                '热锅炸花生米盛起',
                '鸡丁下锅炒至变色',
                '加调料和花生米炒匀'
            ]),
            tips: '鸡肉要先腌制入味',
            nutrition: JSON.stringify({ calories: '350kcal', protein: '28g' }),
            is_favorite: false
        },
        {
            user_id: null,
            name: '蒸蛋羹',
            category: '早餐',
            difficulty: '简单',
            cooking_time: '15分钟',
            image: '🥚',
            ingredients: JSON.stringify([
                { name: '鸡蛋', quantity: '2个' },
                { name: '温水', quantity: '150ml' },
                { name: '盐', quantity: '少许' },
                { name: '香油', quantity: '几滴' }
            ]),
            steps: JSON.stringify([
                '鸡蛋打散加盐',
                '加入温水搅匀',
                '过筛去泡沫',
                '蒸锅蒸10分钟，滴香油即可'
            ]),
            tips: '水蛋比例1.5:1最嫩滑',
            nutrition: JSON.stringify({ calories: '120kcal', protein: '12g' }),
            is_favorite: false
        },
        {
            user_id: null,
            name: '银耳莲子汤',
            category: '汤羹',
            difficulty: '简单',
            cooking_time: '45分钟',
            image: '🍲',
            ingredients: JSON.stringify([
                { name: '银耳', quantity: '1朵' },
                { name: '莲子', quantity: '20颗' },
                { name: '冰糖', quantity: '适量' },
                { name: '枸杞', quantity: '10颗' }
            ]),
            steps: JSON.stringify([
                '银耳提前泡发撕小朵',
                '莲子去芯洗净',
                '所有材料入锅加水煮开',
                '转小火炖30分钟至粘稠'
            ]),
            tips: '银耳要充分泡发才能煮出胶质',
            nutrition: JSON.stringify({ calories: '80kcal', protein: '3g' }),
            is_favorite: false
        },
        {
            user_id: null,
            name: '芒果布丁',
            category: '甜点',
            difficulty: '简单',
            cooking_time: '30分钟',
            image: '🥭',
            ingredients: JSON.stringify([
                { name: '芒果', quantity: '2个' },
                { name: '牛奶', quantity: '200ml' },
                { name: '吉利丁片', quantity: '2片' },
                { name: '糖', quantity: '30g' }
            ]),
            steps: JSON.stringify([
                '芒果打成泥',
                '吉利丁片泡软',
                '牛奶加糖加热至糖融化',
                '加入吉利丁和芒果泥，倒入模具冷藏'
            ]),
            tips: '冷藏2小时以上定型更好',
            nutrition: JSON.stringify({ calories: '150kcal', protein: '4g' }),
            is_favorite: false
        },
        {
            user_id: null,
            name: '小笼包',
            category: '早餐',
            difficulty: '困难',
            cooking_time: '120分钟',
            image: '🥟',
            ingredients: JSON.stringify([
                { name: '面粉', quantity: '300g' },
                { name: '猪肉馅', quantity: '200g' },
                { name: '皮冻', quantity: '100g' },
                { name: '生抽', quantity: '2勺' }
            ]),
            steps: JSON.stringify([
                '面粉和面醒发',
                '肉馅调味加皮冻',
                '擀皮包成小笼包',
                '蒸锅大火蒸15分钟'
            ]),
            tips: '皮冻是汤汁的关键',
            nutrition: JSON.stringify({ calories: '280kcal', protein: '15g' }),
            is_favorite: false
        }
    ];
    
    for (const recipe of systemRecipes) {
        await Recipe.create(recipe);
    }
    console.log(`Added ${systemRecipes.length} system recipes`);

    // 5. Add Fridge Items
    const fridgeItems = [
        { fridge_id: fridge.id, ingredient_name: '鸡蛋', quantity: '5', unit: '个', category: '肉禽蛋奶' },
        { fridge_id: fridge.id, ingredient_name: '西红柿', quantity: '2', unit: '个', category: '蔬菜水果' },
        { fridge_id: fridge.id, ingredient_name: '牛奶', quantity: '1', unit: 'L', category: '肉禽蛋奶' },
        { fridge_id: fridge.id, ingredient_name: '生菜', quantity: '1', unit: '颗', category: '蔬菜水果' },
        { fridge_id: fridge.id, ingredient_name: '酱油', quantity: '1', unit: '瓶', category: '调味料' }
    ];

    for (const item of fridgeItems) {
        await FridgeItem.create(item);
    }
    console.log(`Added ${fridgeItems.length} fridge items`);
    
    // 6. Add Shopping Items
    const shoppingItems = [
        { user_id: user.id, name: '土豆', quantity: '3个', category: '蔬菜水果' },
        { user_id: user.id, name: '洋葱', quantity: '1个', category: '蔬菜水果' },
        { user_id: user.id, name: '胡萝卜', quantity: '2根', category: '蔬菜水果' },
        { user_id: user.id, name: '猪肉', quantity: '500g', category: '肉禽蛋奶' },
        { user_id: user.id, name: '花椒', quantity: '1包', category: '调味料' }
    ];
    
    for (const item of shoppingItems) {
        await ShoppingItem.create(item);
    }
    console.log(`Added ${shoppingItems.length} shopping items`);

    // 7. Add some user_recipes (demo user added some system recipes)
    
    // Get system recipe IDs
    const systemRecipeIds = await Recipe.findAll({
        where: { user_id: null },
        attributes: ['id'],
        limit: 3
    });
    
    if (systemRecipeIds.length > 0) {
        // Demo user adds first 2 system recipes, favorites the first one
        await sequelize.query(
            'INSERT INTO user_recipes (user_id, recipe_id, is_favorite, added_at) VALUES (?, ?, ?, NOW())',
            { replacements: [user.id, systemRecipeIds[0].id, true] }
        );
        
        if (systemRecipeIds.length > 1) {
            await sequelize.query(
                'INSERT INTO user_recipes (user_id, recipe_id, is_favorite, added_at) VALUES (?, ?, ?, NOW())',
                { replacements: [user.id, systemRecipeIds[1].id, false] }
            );
        }
        
        console.log('Added user_recipes associations (demo user added some system recipes)');
    }
    
    console.log('Seeding completed successfully!');
    console.log('Test account created: ID=1, phone=1234567890, password=123456');
    console.log('Added personal recipes, system recipes, fridge items, shopping items, and user_recipes');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
