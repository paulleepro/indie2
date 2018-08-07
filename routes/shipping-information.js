const express = require('express');
const router = express.Router();
const ContentfulService = require('../services/contentful');

const contentful = new ContentfulService();

router.get('/', (req, res, next) => {
  contentful.getContent('4oJva17zCEWcsYYOiu2ukC')
    .then((data) => {
      res.render('general-content', {
        title: data.items[0].fields.seoTitle,
        description: data.items[0].fields.seoDescription,
        cms: data.items[0].fields,
        controller: 'shipping-information',
        components: []
      })
    })
    .catch((error)=>{
      req.err = error;
      console.error("error: shipping-information contentful", req.err);
      res.render('error', { error: req.err });
    });
});

module.exports = router;