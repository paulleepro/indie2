const express = require('express');
const router = express.Router();
const ContentfulService = require('../services/contentful');

const contentful = new ContentfulService();

router.get('/', (req, res, next) => {
  contentful.getContent('4qhzkp1L6ooMuIacqE84oe')
    .then((data) => {
      res.render('frequent-questions', {
        title: data.items[0].fields.seoTitle,
        description:data.items[0].fields.seoDescription,
        route: 'connect',
        cms: data.items[0].fields,
        controller: 'frequent-questions',
        components: []
      });
    })
    .catch((error) => {
      req.err = error;
      console.error("error: index contentful", req.err);
      res.render('error', { error: req.err });
    });
});

module.exports = router;
