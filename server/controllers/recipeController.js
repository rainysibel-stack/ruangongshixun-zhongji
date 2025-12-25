const { Recipe, Fridge, FridgeItem, UserRecipe, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getRecipes = async (req, res, next) => {
  try {
    const { category, sort, page = 1, limit = 10, mine, keyword, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const whereClause = {};

    if (category && category !== '全部') {
      whereClause.category = category;
    }

    if (mine === 'true') {
        whereClause.user_id = req.user.userId;
    }

    const normalizedKeyword = typeof keyword === 'string'
      ? keyword.trim()
      : typeof search === 'string'
        ? search.trim()
        : '';
    if (normalizedKeyword) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${normalizedKeyword}%` } },
        { ingredients: { [Op.like]: `%${normalizedKeyword}%` } }
      ];
    }

    let orderClause = [['created_at', 'DESC']]; // Default: latest

    if (sort === 'recent') {
       whereClause.cooked_count = { [Op.gt]: 0 };
       orderClause = [['cooked_count', 'DESC'], ['created_at', 'DESC']];
    } else if (sort === 'favorite') {
       whereClause.is_favorite = true;
    }

    const { count, rows } = await Recipe.findAndCountAll({
      where: whereClause,
      order: orderClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: [
        'id', 'name', 'category', 'difficulty', 'cooking_time', 
        'image', 'cooked_count', 'is_favorite', 'created_at',
        'ingredients' // Needed for tags in list view
      ]
    });

    res.status(200).json({
      code: 200,
      data: {
        recipes: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getSystemRecipes = async (req, res, next) => {
  try {
    const { keyword } = req.query;
    const whereClause = {
        user_id: null // System recipes
    };

    if (keyword) {
        whereClause[Op.or] = [
            { name: { [Op.like]: `%${keyword}%` } },
            // Search in ingredients (stored as JSON/String)
            // Note: This JSON search might be database specific, using simple string like for compatibility
            { ingredients: { [Op.like]: `%${keyword}%` } }
        ];
    }

    const recipes = await Recipe.findAll({
        where: whereClause,
        order: sequelize.random(), // Randomize
        limit: 20, // Limit to 20 random system recipes
        attributes: [
            'id', 'name', 'category', 'difficulty', 'cooking_time', 
            'image', 'cooked_count', 'ingredients', 'user_id'
        ]
    });

    res.status(200).json({
        code: 200,
        data: { recipes }
    });
  } catch (error) {
    next(error);
  }
};

exports.forkRecipe = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const originalRecipe = await Recipe.findByPk(id);
        if (!originalRecipe) {
            return res.status(404).json({ code: 404, message: 'Recipe not found' });
        }

        // Only system recipes can be added via association
        if (originalRecipe.user_id !== null && originalRecipe.user_id !== undefined) {
            return res.status(400).json({ code: 400, message: '只能Fork系统食谱' });
        }

        const existing = await UserRecipe.findOne({
            where: { user_id: userId, recipe_id: originalRecipe.id }
        });

        if (existing) {
            return res.status(400).json({ code: 400, message: '您已经添加过这个食谱了' });
        }

        const userRecipe = await UserRecipe.create({
            user_id: userId,
            recipe_id: originalRecipe.id,
            is_favorite: false
        });

        res.status(200).json({
            code: 200,
            message: '成功加入我的食谱',
            data: userRecipe
        });
    } catch (error) {
        next(error);
    }
};

exports.getRecipeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recipe = await Recipe.findByPk(id);

    if (!recipe) {
      return res.status(404).json({ code: 404, message: 'Recipe not found.' });
    }

    res.status(200).json({
      code: 200,
      data: recipe
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recipe = await Recipe.findByPk(id);

    if (!recipe) {
      return res.status(404).json({ code: 404, message: 'Recipe not found.' });
    }

    // Toggle boolean
    recipe.is_favorite = !recipe.is_favorite;
    await recipe.save();

    res.status(200).json({
      code: 200,
      message: recipe.is_favorite ? 'Added to favorites' : 'Removed from favorites',
      data: { is_favorite: recipe.is_favorite }
    });
  } catch (error) {
    next(error);
  }
};

exports.recordCooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recipe = await Recipe.findByPk(id);

    if (!recipe) {
      return res.status(404).json({ code: 404, message: 'Recipe not found.' });
    }

    recipe.cooked_count += 1;
    await recipe.save();

    res.status(200).json({
      code: 200,
      message: 'Cooking recorded',
      data: { cooked_count: recipe.cooked_count }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteRecipe = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    if (!userId || userId === 0) {
      return res.status(403).json({ code: 403, message: '无权限删除食谱' });
    }

    const { id } = req.params;
    const recipe = await Recipe.findByPk(id);

    if (!recipe) {
      return res.status(404).json({ code: 404, message: 'Recipe not found.' });
    }

    if (recipe.user_id === null || recipe.user_id === undefined) {
      return res.status(403).json({ code: 403, message: '不能删除系统食谱' });
    }

    if (recipe.user_id !== userId) {
      return res.status(403).json({ code: 403, message: '无权限删除该食谱' });
    }

    await UserRecipe.destroy({ where: { recipe_id: recipe.id } });
    await recipe.destroy();

    res.status(200).json({
      code: 200,
      message: 'Recipe deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.createRecipe = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { name, category, difficulty, cooking_time, image, ingredients, steps, tips, nutrition } = req.body;

    const newRecipe = await Recipe.create({
      user_id: userId,
      name,
      category,
      difficulty,
      cooking_time,
      image,
      ingredients, // Expecting JSON array
      steps,       // Expecting JSON array
      tips,
      nutrition    // Expecting JSON array
    });

    res.status(200).json({
      code: 200,
      message: 'Recipe created successfully',
      data: newRecipe
    });
  } catch (error) {
    next(error);
  }
};
