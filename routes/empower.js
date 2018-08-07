const express = require('express');
const router = express.Router();
const ContentfulService = require('../services/contentful');

const contentful = new ContentfulService();

router.get('/', (req, res, next) => {
  contentful.getContent('4XgsfFlssMCewQI6mG4ccK')
    .then((data) => {
      res.render('empower', {
        title: data.items[0].fields.seoTitle,
        description: data.items[0].fields.seoDescription,
        cms: data.items[0].fields,
        route: 'empower',
        controller: 'empower',
        components: []
      })
    })
    .catch((error)=>{
      req.err = error;
      console.error("error: empower contentful", req.err);
      res.render('error', { error: req.err });
    });
});

router.get('/:slug', (req, res, next) => {
  contentful.getEmpowerArticleBySlug(req.params.slug)
    .then((articleRes) => {
      if (!articleRes.items || !articleRes.items.length) {
        throw new Error('No articles found.');
      }

      res.render('articles-article', {
        title: `Empower | ${articleRes.items[0].fields.seoTitle || "Indie Lee"}`,
        description: articleRes.items[0].fields.seoDescription,
        route: 'empower',
        article: articleRes.items[0].fields
      });
    })
    .catch((err) => {
      console.error(err);
      res.render('error', { error: err });
    });
});

module.exports = router;
