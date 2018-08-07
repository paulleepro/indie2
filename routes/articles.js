const express = require('express');
const router = express.Router();
const ContentfulService = require('../services/contentful');
const contentful = new ContentfulService();
const axios = require('axios');

const articleFetchLimit = 11;

router.get('/', (req, res, next) => {
  contentful.getAllArticles()
  .then((articlesRes) => {
    if (!articlesRes.items || !articlesRes.items.length) {
      throw new Error('No articles found.');
    }

    res.render('articles-all', {
      title: 'Articles',
      description: '',
      route: 'educate',
      showFilters: false,
      articles: articlesRes.items
    });
  })
  .catch((err) => {
    console.error(err);
    res.render('error', { error: err });
  });
});

router.get('/fetch', (req, res) => {
  if (typeof req.query.category !== 'undefined') {
    contentful.getArticlesByCategory( req.query.category, {skip: req.query.skip, limit: articleFetchLimit})
    .then((articlesRes) => {
      res.json({ articles: articlesRes.items });
    })
    .catch((err) => {
      console.error(err);
      res.error(err);
    });
  } else {
    contentful.getAllArticles({skip: req.query.skip, limit: articleFetchLimit})
    .then((articlesRes) => {
      res.json({ articles: articlesRes.items });
    })
    .catch((err) => {
      console.error(err);
      res.error(err);
    });
  }
});

router.get('/:slug', (req, res, next) => {
  axios.all([
    contentful.getArticleBySlug(req.params.slug),
    contentful.getAllArticles({limit: 4, 'fields.slug[ne]': req.params.slug})
  ])
  .then(axios.spread((articleRes,additionalArticlesRes) => {
    if (!articleRes.items || !articleRes.items.length) {
      throw new Error('No articles found.');
    }

    res.render('articles-article', {
      title: `Article | ${articleRes.items[0].fields.seoTitle || "Indie Lee"}`,
      description: articleRes.items[0].fields.seoDescription,
      route: 'educate',
      article: articleRes.items[0].fields,
      additionalArticles: additionalArticlesRes.items.map((a) => a.fields)
    });
  }))
  .catch((err) => {
    console.error(err);
    res.render('error', { error: err });
  });
});

module.exports = router;
