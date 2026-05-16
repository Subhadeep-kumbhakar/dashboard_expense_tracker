const Transaction = require('../models/Transaction');

const transactionController = {
  async createTransaction(req, res) {
    try {
      const transaction = await Transaction.create(req.userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        data: { transaction }
      });
    } catch (error) {
      console.error('Create transaction error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create transaction',
        error: error.message
      });
    }
  },

  async getTransactions(req, res) {
    try {
      const filters = {
        type: req.query.type,
        category: req.query.category,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        limit: req.query.limit ? parseInt(req.query.limit) : null
      };

      const transactions = await Transaction.findByUserId(req.userId, filters);

      res.json({
        success: true,
        data: {
          transactions,
          count: transactions.length
        }
      });
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transactions',
        error: error.message
      });
    }
  },

  async getTransaction(req, res) {
    try {
      const transaction = await Transaction.findById(req.params.id, req.userId);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      res.json({
        success: true,
        data: { transaction }
      });
    } catch (error) {
      console.error('Get transaction error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transaction',
        error: error.message
      });
    }
  },

  async updateTransaction(req, res) {
    try {
      const transaction = await Transaction.update(req.params.id, req.userId, req.body);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      res.json({
        success: true,
        message: 'Transaction updated successfully',
        data: { transaction }
      });
    } catch (error) {
      console.error('Update transaction error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update transaction',
        error: error.message
      });
    }
  },

  async deleteTransaction(req, res) {
    try {
      const transaction = await Transaction.delete(req.params.id, req.userId);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      res.json({
        success: true,
        message: 'Transaction deleted successfully'
      });
    } catch (error) {
      console.error('Delete transaction error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete transaction',
        error: error.message
      });
    }
  },

  async getStats(req, res) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'startDate and endDate are required'
        });
      }

      const stats = await Transaction.getStats(req.userId, startDate, endDate);

      res.json({
        success: true,
        data: {
          stats: {
            totalIncome: parseFloat(stats.total_income) || 0,
            totalExpenses: parseFloat(stats.total_expenses) || 0,
            netBalance: (parseFloat(stats.total_income) || 0) - (parseFloat(stats.total_expenses) || 0),
            totalTransactions: parseInt(stats.total_transactions) || 0
          }
        }
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
        error: error.message
      });
    }
  },

  async getCategoryBreakdown(req, res) {
    try {
      const { type, startDate, endDate } = req.query;

      if (!type || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'type, startDate, and endDate are required'
        });
      }

      const breakdown = await Transaction.getCategoryBreakdown(
        req.userId,
        type,
        startDate,
        endDate
      );

      res.json({
        success: true,
        data: {
          breakdown: breakdown.map(item => ({
            category: item.category,
            total: parseFloat(item.total)
          }))
        }
      });
    } catch (error) {
      console.error('Get category breakdown error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch category breakdown',
        error: error.message
      });
    }
  },

  async getMonthlyTrend(req, res) {
    try {
      const months = req.query.months ? parseInt(req.query.months) : 6;

      const trend = await Transaction.getMonthlyTrend(req.userId, months);

      res.json({
        success: true,
        data: {
          trend: trend.map(item => ({
            month: item.month,
            income: parseFloat(item.income) || 0,
            expenses: parseFloat(item.expenses) || 0,
            net: (parseFloat(item.income) || 0) - (parseFloat(item.expenses) || 0)
          }))
        }
      });
    } catch (error) {
      console.error('Get monthly trend error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch monthly trend',
        error: error.message
      });
    }
  }
};

module.exports = transactionController;
