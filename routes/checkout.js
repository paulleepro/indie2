const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  if (req.err) res.render('error', { error: req.err });

  res.render('checkout', {
    title: 'Checkout',
    description: 'description',
    route: 'checkout',
    controller: 'checkout'
  });
});

module.exports = router;