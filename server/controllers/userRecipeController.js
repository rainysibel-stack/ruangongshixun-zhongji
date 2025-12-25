const { UserRecipe, Recipe, User, sequelize } = require('../models');
const { Op } = require('sequelize');

const parseCookingMinutes = (value) => {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (!str) return null;

  let minutes = 0;
  const hourMatch = str.match(/(\d+(?:\.\d+)?)\s*小时/);
  if (hourMatch) {
    minutes += Math.round(parseFloat(hourMatch[1]) * 60);
  }
  const minuteMatch = str.match(/(\d+(?:\.\d+)?)\s*分钟/);
  if (minuteMatch) {
    minutes += Math.round(parseFloat(minuteMatch[1]));
  }
  if (hourMatch || minuteMatch) return minutes;

  const numMatch = str.match(/(\d+(?:\.\d+)?)/);
  if (!numMatch) return null;
  return Math.round(parseFloat(numMatch[1]));
};

const parseTimeRange = (raw) => {
  if (typeof raw !== 'string') return { min: null, max: null };
  const v = raw.trim();
  if (!v || v === '全部') return { min: null, max: null };

  if (/^\d+\+$/.test(v)) {
    return { min: parseInt(v.slice(0, -1), 10), max: null };
  }
  if (/^\d+-\d+$/.test(v)) {
    const [min, max] = v.split('-').map((n) => parseInt(n, 10));
    return { min: Number.isFinite(min) ? min : null, max: Number.isFinite(max) ? max : null };
  }
  if (/^\d+$/.test(v)) {
    return { min: null, max: parseInt(v, 10) };
  }

  const n = v.match(/(\d+)/);
  if (!n) return { min: null, max: null };
  const minutes = parseInt(n[1], 10);
  if (!Number.isFinite(minutes)) return { min: null, max: null };

  if (v.includes('以上') || v.includes('>')) {
    return { min: minutes, max: null };
  }
  return { min: null, max: minutes };
};

// Add a system recipe to user's collection
exports.addRecipe = async (req, res, next) => {
  try {
    const { recipe_id } = req.body;
    const user_id = req.user.userId;

    // Check if recipe exists and is a system recipe
    const recipe = await Recipe.findByPk(recipe_id);
    if (!recipe) {
      return res.status(404).json({ code: 404, message: '食谱不存在' });
    }

    // Check if already added
    const existing = await UserRecipe.findOne({
      where: { user_id, recipe_id }
    });

    if (existing) {
      return res.status(400).json({ code: 400, message: '您已经添加过这个食谱了' });
    }

    // Add to user's collection
    const userRecipe = await UserRecipe.create({
      user_id,
      recipe_id,
      is_favorite: false
    });

    res.json({
      code: 200,
      message: '成功加入我的食谱',
      data: userRecipe
    });
  } catch (error) {
    next(error);
  }
};

// Remove a recipe from user's collection
exports.removeRecipe = async (req, res, next) => {
  try {
    const { recipe_id } = req.params;
    const user_id = req.user.userId;

    const deleted = await UserRecipe.destroy({
      where: { user_id, recipe_id }
    });

    if (deleted === 0) {
      return res.status(404).json({ code: 404, message: '未找到该食谱' });
    }

    res.json({
      code: 200,
      message: '已从我的食谱中移除'
    });
  } catch (error) {
    next(error);
  }
};

// Toggle favorite status
exports.toggleFavorite = async (req, res, next) => {
  try {
    const { recipe_id } = req.body;
    const user_id = req.user.userId;

    const userRecipe = await UserRecipe.findOne({
      where: { user_id, recipe_id }
    });

    if (!userRecipe) {
      // If not added yet, add it and mark as favorite
      const newUserRecipe = await UserRecipe.create({
        user_id,
        recipe_id,
        is_favorite: true
      });

      return res.json({
        code: 200,
        message: '已收藏并加入我的食谱',
        data: { is_favorite: true }
      });
    }

    // Toggle favorite status
    userRecipe.is_favorite = !userRecipe.is_favorite;
    await userRecipe.save();

    res.json({
      code: 200,
      message: userRecipe.is_favorite ? '已收藏' : '已取消收藏',
      data: { is_favorite: userRecipe.is_favorite }
    });
  } catch (error) {
    next(error);
  }
};

// Get all recipes added by user (including favorites)
exports.getMyAddedRecipes = async (req, res, next) => {
  try {
    const user_id = req.user.userId;

    // Use raw SQL query to get added recipes with their details
    const [results] = await sequelize.query(`
      SELECT 
        r.*,
        ur.is_favorite,
        ur.added_at as user_added_at
      FROM user_recipes ur
      INNER JOIN recipes r ON ur.recipe_id = r.id
      WHERE ur.user_id = ?
      ORDER BY ur.added_at DESC
    `, {
      replacements: [user_id]
    });

    const recipes = results.map(r => ({
      id: r.id,
      name: r.name,
      category: r.category,
      difficulty: r.difficulty,
      cooking_time: r.cooking_time,
      image: r.image,
      ingredients: r.ingredients,
      steps: r.steps,
      tips: r.tips,
      nutrition: r.nutrition,
      cooked_count: r.cooked_count,
      created_at: r.created_at,
      is_favorite: Boolean(r.is_favorite),
      added_at: r.user_added_at,
      is_added: true,
      is_system_recipe: true
    }));

    res.json({
      code: 200,
      data: { recipes }
    });
  } catch (error) {
    console.error('Error in getMyAddedRecipes:', error);
    next(error);
  }
};

// Get system recipes (for recipe square)
exports.getSystemRecipes = async (req, res, next) => {
  try {
    const user_id = req.user?.userId;
    const { search, category, difficulty, cooking_time, max_time, min_time } = req.query;

    const where = { user_id: null }; // System recipes have null user_id

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { ingredients: { [Op.like]: `%${search}%` } }
      ];
    }

    if (category && category !== '全部') {
      where.category = category;
    }

    if (difficulty && difficulty !== '全部') {
      where.difficulty = difficulty;
    }

    const timeRange = parseTimeRange(cooking_time);
    if (typeof min_time === 'string' && /^\d+$/.test(min_time.trim())) {
      timeRange.min = parseInt(min_time.trim(), 10);
    }
    if (typeof max_time === 'string' && /^\d+$/.test(max_time.trim())) {
      timeRange.max = parseInt(max_time.trim(), 10);
    }

    let recipes = await Recipe.findAll({
      where,
      order: [['created_at', 'DESC']]
    });

    if (timeRange.min !== null || timeRange.max !== null) {
      recipes = recipes.filter((r) => {
        const minutes = parseCookingMinutes(r.cooking_time);
        if (minutes === null) return false;
        if (timeRange.min !== null && minutes < timeRange.min) return false;
        if (timeRange.max !== null && minutes > timeRange.max) return false;
        return true;
      });
    }

    if (recipes.length === 0) {
      return res.json({
        code: 200,
        data: { recipes: [] }
      });
    }

    // If user is logged in, check which recipes they've added
    if (user_id) {
      const userRecipes = await UserRecipe.findAll({
        where: { 
          user_id,
          recipe_id: recipes.map(r => r.id)
        }
      });

      const userRecipeMap = {};
      userRecipes.forEach(ur => {
        userRecipeMap[ur.recipe_id] = {
          is_added: true,
          is_favorite: ur.is_favorite
        };
      });

      const recipesWithStatus = recipes.map(recipe => ({
        ...recipe.toJSON(),
        is_added: userRecipeMap[recipe.id]?.is_added || false,
        is_favorite: userRecipeMap[recipe.id]?.is_favorite || false
      }));

      return res.json({
        code: 200,
        data: { recipes: recipesWithStatus }
      });
    }

    res.json({
      code: 200,
      data: { recipes }
    });
  } catch (error) {
    next(error);
  }
};

// Get random system recipes
exports.getRandomSystemRecipes = async (req, res, next) => {
  try {
    const user_id = req.user?.userId;
    const limit = parseInt(req.query.limit) || 6;
    const { category, difficulty, cooking_time, max_time, min_time } = req.query;

    const where = { user_id: null };
    if (category && category !== '全部') {
      where.category = category;
    }
    if (difficulty && difficulty !== '全部') {
      where.difficulty = difficulty;
    }

    const timeRange = parseTimeRange(cooking_time);
    if (typeof min_time === 'string' && /^\d+$/.test(min_time.trim())) {
      timeRange.min = parseInt(min_time.trim(), 10);
    }
    if (typeof max_time === 'string' && /^\d+$/.test(max_time.trim())) {
      timeRange.max = parseInt(max_time.trim(), 10);
    }

    const fetchLimit = Math.max(limit * 10, 50);
    let recipes = await Recipe.findAll({
      where,
      order: sequelize.random(),
      limit: fetchLimit
    });

    if (timeRange.min !== null || timeRange.max !== null) {
      recipes = recipes.filter((r) => {
        const minutes = parseCookingMinutes(r.cooking_time);
        if (minutes === null) return false;
        if (timeRange.min !== null && minutes < timeRange.min) return false;
        if (timeRange.max !== null && minutes > timeRange.max) return false;
        return true;
      });
    }

    recipes = recipes.slice(0, limit);

    if (recipes.length === 0) {
      return res.json({
        code: 200,
        data: { recipes: [] }
      });
    }

    // If user is logged in, check which recipes they've added
    if (user_id) {
      const userRecipes = await UserRecipe.findAll({
        where: { 
          user_id,
          recipe_id: recipes.map(r => r.id)
        }
      });

      const userRecipeMap = {};
      userRecipes.forEach(ur => {
        userRecipeMap[ur.recipe_id] = {
          is_added: true,
          is_favorite: ur.is_favorite
        };
      });

      const recipesWithStatus = recipes.map(recipe => ({
        ...recipe.toJSON(),
        is_added: userRecipeMap[recipe.id]?.is_added || false,
        is_favorite: userRecipeMap[recipe.id]?.is_favorite || false
      }));

      return res.json({
        code: 200,
        data: { recipes: recipesWithStatus }
      });
    }

    res.json({
      code: 200,
      data: { recipes }
    });
  } catch (error) {
    next(error);
  }
};
