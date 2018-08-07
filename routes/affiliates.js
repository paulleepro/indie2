const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  res.render('affiliates', {
    title: 'Affiliates',
    controller: 'affiliates',
    components: []
  });
});

module.exports = router;
