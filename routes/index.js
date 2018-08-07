const express = require('express');
const router = express.Router();
const ContentfulService = require('../services/contentful');

const contentful = new ContentfulService();

/* GET home page. */
router.get('/', (req, res, next) => {
  if (req.err) res.render('error', { error: req.err });

  contentful.getContent('39Q9EssB9mK6Uw6MwqCmWW')
    .then((data) => {
      res.render('index', {
        cms: data.items[0].fields,
        title: data.items[0].fields.seoTitle,
        description: data.items[0].fields.seoDescription,
        controller: 'index'
      });
    })
    .catch((error) => {
      req.err = error;
      console.error("error: index contentful", req.err);
      res.render('error', { error: req.err });
    });
});

module.exports = router;
