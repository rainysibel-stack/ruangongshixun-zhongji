const bcrypt = require('bcrypt');
const { User, Fridge, Recipe, UserRecipe } = require('../models');
const { generateToken } = require('../utils/jwtUtils');

exports.register = async (req, res, next) => {
  try {
    const { username, phone, password, confirmPassword } = req.body;

    if (!username || !phone || !password) {
      return res.status(400).json({ code: 400, message: 'Username, phone and password are required.' });
    }

    const normalizedPhone = String(phone).trim();
    if (!/^\d{11}$/.test(normalizedPhone)) {
      return res.status(400).json({ code: 400, message: '手机号必须为11位数字' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ code: 400, message: 'Passwords do not match.' });
    }

    // Username is now nickname and can be duplicated, so no need to check uniqueness

    const existingPhone = await User.findOne({ where: { phone: normalizedPhone } });
    if (existingPhone) {
      return res.status(400).json({ code: 400, message: 'Phone number already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      phone: normalizedPhone,
      password: hashedPassword,
      nickname: username // Default nickname
    });

    // Create a fridge for the new user
    await Fridge.create({ user_id: newUser.id });

    const token = generateToken(newUser.id);

    res.status(200).json({
      code: 200,
      message: '注册成功',
      data: {
        userId: newUser.id,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body; // Changed from username to identifier

    const { Op } = require('sequelize');

    // Allow login with ID OR phone number
    let user;
    
    // Check if identifier is numeric (could be ID)
    if (/^\d+$/.test(identifier)) {
      // Try to find by ID first, then by phone if not found
      user = await User.findByPk(parseInt(identifier));
      if (!user) {
        user = await User.findOne({ where: { phone: identifier } });
      }
    } else {
      // Non-numeric, treat as phone number
      user = await User.findOne({ where: { phone: identifier } });
    }

    if (!user) {
      return res.status(401).json({ code: 401, message: 'Invalid ID/phone or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ code: 401, message: 'Invalid ID/phone or password.' });
    }

    const token = generateToken(user.id);

    res.status(200).json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        userInfo: {
          id: user.id,
          username: user.username,
          phone: user.phone,
          nickname: user.nickname,
          created_at: user.created_at
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'phone', 'nickname', 'created_at']
    });

    if (!user) {
      return res.status(404).json({ code: 404, message: 'User not found.' });
    }

    // Fetch Stats
    const personalRecipeCount = await Recipe.count({ where: { user_id: userId } });
    const addedSystemRecipeCount = await UserRecipe.count({ where: { user_id: userId } });
    const recipeCount = personalRecipeCount + addedSystemRecipeCount;
    
    // For 'favoriteCount', since is_favorite is on Recipe (not User-Recipe), we count all favorites.
    // Ideally this should be "My Favorites", but with current schema it's "All Favorites". 
    // Or we could count "My Recipes that are favorites" -> { user_id: userId, is_favorite: true }?
    // Let's stick to "My Favorites" meaning "Recipes I marked as favorite" which is... just all favorites in this single-user-ish schema.
    const personalFavoriteCount = await Recipe.count({ where: { user_id: userId, is_favorite: true } });
    const systemFavoriteCount = await UserRecipe.count({ where: { user_id: userId, is_favorite: true } });
    const favoriteCount = personalFavoriteCount + systemFavoriteCount;

    // "Cooked Count" - sum of cooked_count of ALL recipes? 
    // Or just a placeholder. Let's sum all cooked counts as a "Global Cooking Achievement".
    const cookedCount = await Recipe.sum('cooked_count') || 0;

    res.status(200).json({
      code: 200,
      data: {
          ...user.toJSON(),
          stats: {
              recipeCount,
              favoriteCount,
              cookedCount
          }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { nickname } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
        return res.status(404).json({ code: 404, message: 'User not found' });
    }

    if (nickname) {
        user.nickname = nickname;
        await user.save();
    }

    res.status(200).json({
        code: 200,
        message: 'Profile updated',
        data: {
            id: user.id,
            username: user.username,
            phone: user.phone,
            nickname: user.nickname
        }
    });
  } catch (error) {
    next(error);
  }
};
