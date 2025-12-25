const { Fridge, FridgeItem } = require('../models');

exports.getFridge = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    let fridge = await Fridge.findOne({ where: { user_id: userId } });

    if (!fridge) {
        // Should have been created at register, but just in case
        fridge = await Fridge.create({ user_id: userId });
    }

    res.status(200).json({
      code: 200,
      data: fridge
    });
  } catch (error) {
    next(error);
  }
};

exports.getFridgeItems = async (req, res, next) => {
  try {
    const { fridgeId } = req.params;
    const { view } = req.query; // 'list' or 'category' (logic handled in frontend mostly for view, but we return list here)

    // Verify fridge belongs to user
    const userId = req.user.userId;
    const fridge = await Fridge.findOne({ where: { id: fridgeId, user_id: userId } });

    if (!fridge) {
      return res.status(403).json({ code: 403, message: 'Access denied to this fridge.' });
    }

    const items = await FridgeItem.findAll({ 
      where: { fridge_id: fridgeId },
      attributes: ['id', 'ingredient_name', 'quantity', 'category', 'unit', 'added_at']
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

exports.addFridgeItem = async (req, res, next) => {
  try {
    const { fridgeId } = req.params;
    const { ingredient_name, quantity, category, unit } = req.body;
    
    const userId = req.user.userId;
    const fridge = await Fridge.findOne({ where: { id: fridgeId, user_id: userId } });

    if (!fridge) {
      return res.status(403).json({ code: 403, message: 'Access denied to this fridge.' });
    }

    const newItem = await FridgeItem.create({
      fridge_id: fridgeId,
      ingredient_name,
      quantity,
      category,
      unit
    });

    res.status(200).json({
      code: 200,
      message: `已添加${ingredient_name}(${quantity}${unit})到冰箱`,
      data: {
        itemId: newItem.id
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.deleteFridgeItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.userId;

    // Verify ownership via fridge
    const item = await FridgeItem.findByPk(itemId);
    if (!item) {
        return res.status(404).json({ code: 404, message: 'Item not found' });
    }

    const fridge = await Fridge.findOne({ where: { id: item.fridge_id, user_id: userId } });
    if (!fridge) {
        return res.status(403).json({ code: 403, message: 'Access denied' });
    }

    await item.destroy();

    res.status(200).json({
        code: 200,
        message: 'Item removed from fridge',
        data: { success: true }
    });
  } catch (error) {
    next(error);
  }
};
