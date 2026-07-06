const express = require('express');
const { getWallet, topUpWallet, withdrawFromWallet } = require('../controllers/walletController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getWallet);
router.post('/topup', topUpWallet);
router.post('/withdraw', withdrawFromWallet);

module.exports = router;