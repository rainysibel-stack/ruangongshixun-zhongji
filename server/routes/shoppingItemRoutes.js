const express = require('express');
const router = express.Router();
const shoppingItemController = require('../controllers/shoppingItemController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, shoppingItemController.getShoppingItems);
router.post('/', authMiddleware, shoppingItemController.addShoppingItem);
router.post('/:id/to-fridge', authMiddleware, shoppingItemController.addToFridge);
router.delete('/:id', authMiddleware, shoppingItemController.deleteShoppingItem);

module.exports = router;
