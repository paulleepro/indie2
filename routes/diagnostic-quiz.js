const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  res.render('diagnostic-quiz', {
    title: 'Diagnostic Quiz',
    controller: 'diagnostic-quiz',
    components: []
  });
});

module.exports = router;
