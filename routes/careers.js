const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  res.render('careers', {
    title: 'Careers',
    controller: 'careers',
    components: []
  });
});

module.exports = router;
