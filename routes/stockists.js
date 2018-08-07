const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  res.render('stockists', {
    title: 'Where To Buy Indie Lee Skincare Products In-Store | Indie Lee',
    description: 'What stores carry Indie Lee? Find where you can pick-up Indie Lee skincare products today! Enter your zipcode to find the nearest carrier of Indie Lee products now.',
    controller: 'stockists',
    components: []
  });
});

module.exports = router;
