const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/square', authMiddleware, recipeController.getSystemRecipes);
router.post('/:id/fork', authMiddleware, recipeController.forkRecipe);
router.get('/', authMiddleware, recipeController.getRecipes);
router.post('/', authMiddleware, recipeController.createRecipe);
router.get('/:id', authMiddleware, recipeController.getRecipeById);
router.delete('/:id', authMiddleware, recipeController.deleteRecipe);
router.post('/:id/favorite', authMiddleware, recipeController.toggleFavorite);
router.post('/:id/cook', authMiddleware, recipeController.recordCooking);

module.exports = router;
