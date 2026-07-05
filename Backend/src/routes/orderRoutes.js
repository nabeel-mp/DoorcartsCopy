const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  confirmOrder,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/:id', getOrderById);

router.get('/', adminOnly, getAllOrders);
router.put('/:id/confirm', adminOnly, confirmOrder);
router.put('/:id/status', adminOnly, updateOrderStatus);

module.exports = router;