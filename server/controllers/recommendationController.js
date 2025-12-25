const { Recipe, Fridge, FridgeItem } = require('../models');
const { Op } = require('sequelize');

exports.getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { mode = 'flexible', category, sort, scope = 'all' } = req.query; // scope: 'all' or 'mine'

    // 1. Get user's fridge items
    const fridge = await Fridge.findOne({ where: { user_id: userId } });
    if (!fridge) {
        return res.status(200).json({ code: 200, data: { recipes: [] } });
    }
    const fridgeItems = await FridgeItem.findAll({ where: { fridge_id: fridge.id } });
    const userIngredients = fridgeItems.map(item => item.ingredient_name); // Array of strings

    // 2. Build Recipe Query
    const whereClause = {};
    if (category && category !== '全部') {
        whereClause.category = category;
    }

    // Scope filter
    if (scope === 'mine') {
        whereClause.user_id = userId;
    } else {
        // All = System (user_id is null) OR Mine (user_id = userId)
        whereClause[Op.or] = [
            { user_id: userId },
            { user_id: null }
        ];
    }

    const allRecipes = await Recipe.findAll({ 
        where: whereClause,
        attributes: ['id', 'name', 'category', 'difficulty', 'cooking_time', 'image', 'cooked_count', 'is_favorite', 'ingredients', 'user_id']
    });

    // 3. Recommendation Logic
    // Basic Synonym Map (Keep existing)
    const SYNONYMS = {
        '西红柿': ['番茄'],
        '番茄': ['西红柿'],
        '土豆': ['马铃薯', '洋芋'],
        '马铃薯': ['土豆', '洋芋'],
        '鸡蛋': ['蛋'],
        '蛋': ['鸡蛋'],
        '青椒': ['柿子椒', '大椒'],
        '花菜': ['菜花'],
        '菜花': ['花菜'],
        '生抽': ['酱油'],
        '酱油': ['生抽', '老抽'],
        '老抽': ['酱油']
    };

    const recommendations = allRecipes.map(recipe => {
        let recipeIngredients = recipe.ingredients;
        
        // Robust parsing for ingredients
        if (typeof recipeIngredients === 'string') {
            try {
                recipeIngredients = JSON.parse(recipeIngredients);
            } catch (e) {
                recipeIngredients = [];
            }
        }
        if (!Array.isArray(recipeIngredients)) {
            recipeIngredients = [];
        }

        let matchCount = 0;
        const missingIngredients = [];

        recipeIngredients.forEach(ing => {
            const ingName = ing.name || ing; // Handle object or string
            
            // Check for match (Direct include or Synonym)
            const isMatch = userIngredients.some(ui => {
                // 1. Direct string match
                if (ui.includes(ingName) || ingName.includes(ui)) return true;
                
                // 2. Synonym match
                // Check if recipe ingredient has synonyms
                if (SYNONYMS[ingName]) {
                    if (SYNONYMS[ingName].some(syn => ui.includes(syn) || syn.includes(ui))) return true;
                }
                // Check if user ingredient has synonyms (less likely to key off user input but good safety)
                if (SYNONYMS[ui]) {
                    if (SYNONYMS[ui].some(syn => ingName.includes(syn) || syn.includes(ingName))) return true;
                }
                
                return false;
            });

            if (isMatch) {
                matchCount++;
            } else {
                missingIngredients.push(ingName);
            }
        });

        const totalIngredients = recipeIngredients.length;
        const matchPercent = totalIngredients === 0 ? 0 : Math.round((matchCount / totalIngredients) * 100);

        return {
            ...recipe.toJSON(),
            match_percent: matchPercent,
            missing_ingredients: missingIngredients
        };
    });

    // 4. Filter by Mode
    let filteredRecipes = [];
    if (mode === 'flexible') { // Creative mode
        // Filter out 0% matches generally, unless we want to show random stuff
        filteredRecipes = recommendations.filter(r => r.match_percent > 0);
    } else if (mode === 'surprise') {
        // "Random recommendation + Conditional filter (Simple, Fast, High match)"
        const candidates = recommendations.filter(r => 
            r.match_percent > 50 || 
            r.difficulty === '简单' || 
            (parseInt(r.cooking_time) <= 30)
        );
        filteredRecipes = candidates.sort(() => 0.5 - Math.random()).slice(0, 3);
    } else {
        // Default fallthrough (shouldn't happen with strict removed, but safe)
        filteredRecipes = recommendations.filter(r => r.match_percent > 0);
    }

    // 5. Sort
    if (sort === 'match') {
        filteredRecipes.sort((a, b) => b.match_percent - a.match_percent);
    } else if (sort === 'time') {
        // Parse time: "15分钟", "1小时" -> minutes
        const parseTime = (t) => {
            if (!t) return 999;
            if (t.includes('小时')) return parseFloat(t) * 60;
            return parseFloat(t);
        };
        filteredRecipes.sort((a, b) => parseTime(a.cooking_time) - parseTime(b.cooking_time));
    } else if (sort === 'difficulty') {
        const difficultyMap = { '简单': 1, '中等': 2, '困难': 3 };
        filteredRecipes.sort((a, b) => (difficultyMap[a.difficulty] || 2) - (difficultyMap[b.difficulty] || 2));
    }

    res.status(200).json({
      code: 200,
      data: {
        recipes: filteredRecipes
      }
    });

  } catch (error) {
    next(error);
  }
};
