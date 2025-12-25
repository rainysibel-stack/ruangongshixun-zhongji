const { ShoppingItem, Fridge, FridgeItem } = require('../models');

exports.getShoppingItems = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const items = await ShoppingItem.findAll({ 
      where: { user_id: userId },
      attributes: ['id', 'name', 'quantity', 'category']
    });

    res.status(200).json({
      code: 200,
      data: {
        items
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.addShoppingItem = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { name, quantity } = req.body;

    const newItem = await ShoppingItem.create({
      user_id: userId,
      name,
      quantity
    });

    res.status(200).json({
      code: 200,
      message: '已添加到采购清单',
      data: {
        itemId: newItem.id
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.addToFridge = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Find the shopping item
    const shoppingItem = await ShoppingItem.findOne({ 
      where: { id, user_id: userId } 
    });

    if (!shoppingItem) {
      return res.status(404).json({ code: 404, message: 'Shopping item not found' });
    }

    // Find user's fridge
    const fridge = await Fridge.findOne({ where: { user_id: userId } });
    if (!fridge) {
      return res.status(404).json({ code: 404, message: 'Fridge not found' });
    }

    // Auto-categorize the ingredient
    const ingredientName = shoppingItem.name.toLowerCase();
    let category = '其他';
    
    const vegetables = ['番茄', '西红柿', '土豆', '洋葱', '胡萝卜', '白菜', '菠菜', '韭菜', '芹菜', '黄瓜', '茄子', '青椒', '辣椒'];
    const meats = ['鸡蛋', '鸡肉', '猪肉', '牛肉', '鱼', '虾', '蟹', '五花肉', '鸡胸肉'];
    const seasonings = ['盐', '糖', '醋', '酱油', '料酒', '姜', '蒜', '葱', '八角', '花椒'];

    if (vegetables.some(v => ingredientName.includes(v))) {
      category = '蔬菜水果';
    } else if (meats.some(m => ingredientName.includes(m))) {
      category = '肉禽蛋奶';
    } else if (seasonings.some(s => ingredientName.includes(s))) {
      category = '调味料';
    }

    // Add to fridge
    await FridgeItem.create({
      fridge_id: fridge.id,
      ingredient_name: shoppingItem.name,
      quantity: shoppingItem.quantity || '1',
      category: category,
      unit: '' // Default to empty string as quantity usually includes unit (e.g. "200g", "2个")
    });

    // Remove from shopping list
    await shoppingItem.destroy();

    res.status(200).json({
      code: 200,
      message: `已将${shoppingItem.name}添加到冰箱`,
      data: { success: true }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteShoppingItem = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const item = await ShoppingItem.findOne({ where: { id, user_id: userId } });
    
    if (!item) {
      return res.status(404).json({ code: 404, message: 'Item not found' });
    }

    await item.destroy();

    res.status(200).json({
      code: 200,
      message: 'Item deleted',
      data: { success: true }
    });
  } catch (error) {
    next(error);
  }
};
