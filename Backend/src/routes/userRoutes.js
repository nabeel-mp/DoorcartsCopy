const express = require('express');
const {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  getAllUsers
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/addresses').get(getAddresses).post(addAddress);
router.route('/addresses/:addressId').put(updateAddress).delete(deleteAddress);

router.get('/', adminOnly, getAllUsers);

module.exports = router;