const express = require('express');
const router = express.Router();
const fridgeController = require('../controllers/fridgeController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, fridgeController.getFridge);
router.get('/:fridgeId/items', authMiddleware, fridgeController.getFridgeItems);
router.post('/:fridgeId/items', authMiddleware, fridgeController.addFridgeItem);
router.delete('/items/:itemId', authMiddleware, fridgeController.deleteFridgeItem);

module.exports = router;
