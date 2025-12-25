const { sequelize, User, Fridge, FridgeItem, Recipe, ShoppingItem } = require('./models');
const bcrypt = require('bcrypt');

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');

    // 1. Create or Get User
    let user = await User.findOne({ where: { username: 'demo' } });
    if (!user) {
        const hashedPassword = await bcrypt.hash('123456', 10);
        user = await User.create({
            username: 'demo',
            phone: '13800138000',
            password: hashedPassword,
            nickname: '美食家小王'
        });
        console.log('Created demo user (username: demo, password: 123456)');
        
        // Create Fridge for user
        await Fridge.create({ user_id: user.id });
    } else {
        console.log('Using existing demo user');
    }

    const fridge = await Fridge.findOne({ where: { user_id: user.id } });

    // 2. Clear existing data for this user (optional, but good for idempotency)
    // await Recipe.destroy({ where: { user_id: user.id } });
    // await FridgeItem.destroy({ where: { fridge_id: fridge.id } });
    
    // 3. Create Recipes
    const recipes = [
      {
        user_id: user.id,
        name: '西红柿炒鸡蛋',
        category: '正餐',
        difficulty: '简单',
        cooking_time: '15分钟',
        image: '🍳',
        ingredients: [
            { name: '鸡蛋', quantity: '3个' }, 
            { name: '西红柿', quantity: '2个' },
            { name: '葱', quantity: '1根' }
        ],
        steps: [
            '西红柿切块，鸡蛋打散', 
            '热锅加油，倒入蛋液炒熟盛出', 
            '锅中再加油，炒西红柿出汁',
            '倒入鸡蛋混合翻炒，加盐撒葱花出锅'
        ],
        tips: '西红柿要去皮口感更好哦',
        nutrition: { calories: '200kcal', protein: '15g' },
        is_favorite: true
      },
      {
        user_id: user.id,
        name: '红烧肉',
        category: '正餐',
        difficulty: '困难',
        cooking_time: '90分钟',
        image: '🥩',
        ingredients: [
            { name: '五花肉', quantity: '500g' }, 
            { name: '冰糖', quantity: '20g' },
            { name: '姜', quantity: '3片' },
            { name: '八角', quantity: '2个' }
        ],
        steps: [
            '五花肉切块焯水', 
            '炒糖色，下肉翻炒上色', 
            '加水没过肉，加入调料小火慢炖',
            '大火收汁即可'
        ],
        tips: '选五花三层的肉最好吃',
        nutrition: { calories: '800kcal', protein: '25g' },
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
          ingredients: [
              { name: '排骨', quantity: '300g' },
              { name: '玉米', quantity: '1根' },
              { name: '胡萝卜', quantity: '1根' }
          ],
          steps: [
              '排骨焯水洗净',
              '玉米胡萝卜切块',
              '所有食材放入锅中加水炖煮1小时'
          ],
          tips: '出锅前再放盐',
          nutrition: { calories: '300kcal', protein: '18g' },
          is_favorite: false
      }
    ];

    for (const recipe of recipes) {
        await Recipe.create(recipe);
    }
    console.log(`Added ${recipes.length} recipes`);

    // 4. Add Fridge Items
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

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
