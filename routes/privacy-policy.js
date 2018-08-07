const express = require('express');
const router = express.Router();
const ContentfulService = require('../services/contentful');

const contentful = new ContentfulService();

router.get('/', (req, res, next) => {
  contentful.getContent('7DWj6bJEickQ8ceAkcc6s')
    .then((data) => {
      res.render('general-content', {
        title: data.items[0].fields.seoTitle,
        description: data.items[0].fields.seoDescription,
        cms: data.items[0].fields,
        controller: 'privacy-policy',
        components: []
      })
    })
    .catch((error)=>{
      req.err = error;
      console.error("error: privacy-policy contentful", req.err);
      res.render('error', { error: req.err });
    });
});

module.exports = router;