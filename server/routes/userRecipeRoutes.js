const express = require('express');
const router = express.Router();
const userRecipeController = require('../controllers/userRecipeController');
const authenticate = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticate);

// Add a system recipe to user's collection
router.post('/add', userRecipeController.addRecipe);

// Remove a recipe from user's collection
router.delete('/remove/:recipe_id', userRecipeController.removeRecipe);

// Toggle favorite status
router.post('/favorite', userRecipeController.toggleFavorite);

// Get all recipes added by user
router.get('/my-added', userRecipeController.getMyAddedRecipes);

// Get system recipes (for recipe square)
router.get('/system', userRecipeController.getSystemRecipes);

// Get random system recipes
router.get('/system/random', userRecipeController.getRandomSystemRecipes);

module.exports = router;
