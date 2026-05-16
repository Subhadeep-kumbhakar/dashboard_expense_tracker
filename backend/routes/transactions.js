const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/auth');
const { transactionValidation } = require('../middleware/validator');

router.use(authMiddleware);

router.post('/', transactionValidation, transactionController.createTransaction);
router.get('/', transactionController.getTransactions);
router.get('/stats', transactionController.getStats);
router.get('/category-breakdown', transactionController.getCategoryBreakdown);
router.get('/monthly-trend', transactionController.getMonthlyTrend);
router.get('/:id', transactionController.getTransaction);
router.put('/:id', transactionValidation, transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
