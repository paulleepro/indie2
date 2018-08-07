const express = require('express');
const router = express.Router();

const account = require('./account');
const catalog = require('./catalog');
const cart = require('./cart');
const checkout = require('./checkout');
const orders = require('./orders');
const options = require('./options');

router.all('/', (req, res, next) => {
  res.status(404).error(new Error("Not Found")).end();
});

router.use('/account', account);
router.use('/catalog', catalog);
router.use('/cart', cart);
router.use('/checkout', checkout);
router.use('/orders', orders);
router.use('/options', options);

module.exports = router;