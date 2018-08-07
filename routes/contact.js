const express = require('express');
const router = express.Router();
const ContentfulService = require('../services/contentful');

const contentful = new ContentfulService();

router.get('/', (req, res, next) => {
  contentful.getContent('3lZoMARHRea2Wo4GyQqG80')
    .then((data) => {
      res.render('general-content', {
        title: data.items[0].fields.seoTitle,
        description: data.items[0].fields.seoDescription,
        cms: data.items[0].fields,
        controller: 'contact',
        components: []
      })
    })
    .catch((error)=>{
      req.err = error;
      console.error("error: contact contentful", req.err);
      res.render('error', { error: req.err });
    });
});

module.exports = router;