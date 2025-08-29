const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { uploadTransactionProof } = require('../config/cloudinary');
const {
  createOrder,
  getAllOrders,
  getOrderByTrackingNumber,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus
} = require('../controllers/orderController');

// Public routes
router.post('/', uploadTransactionProof.single('transactionProof'), createOrder);
router.get('/track/:trackingNumber', getOrderByTrackingNumber);

// Admin routes
router.get('/', protect, getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, updateOrderStatus);
router.put('/:id/payment-status', protect, updatePaymentStatus);

module.exports = router;