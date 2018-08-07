const express = require('express');
const router = express.Router();
const ContentfulService = require('../services/contentful');
const _ = require('lodash');

const contentful = new ContentfulService();

router.get('/', (req, res, next) => {
  contentful.getIngredients()
    .then((ingredients) => {
      if (!ingredients.items || !ingredients.items.length) { throw new Error('No ingredients found.'); }
      let filteredIngredients = ingredients.items.filter((i) => typeof i.fields.image !== "undefined")
      res.render('ingredients-all', {
        title: 'Natural & Clean Skincare Ingredients In Indie Lee Products',
        description: 'What ingredients in skincare products are actually good for you? Learn all about them here, their history, where they come from, and how they can change the way you think about skincare.',
        route: 'educate',
        ingredients: _.sortBy(filteredIngredients, (a) => {return a.fields.name}),
        components: []
      });   
    })
    .catch((error)=>{
      req.err = error;
      console.error("error: ingredients contentful", req.err);
      res.render('error', { error: req.err });
    });
});

router.get('/beauty-history', (req, res, next) => {
  contentful.getContent('mF2B5jvL7UkGqWMg24CgM')
    .then((data) => {
      res.render('beauty-history', {
        cms: data.items[0].fields,
        title: data.items[0].fields.seoTitle,
        description: data.items[0].fields.seoDescription,
        route: 'educate',
        controller: 'beauty-history',
        components: []
      });
    })
    .catch((error) => {
      req.err = error;
      console.error("error: beauty history contentful", req.err);
      res.render('error', { error: req.err });
    });
});

router.get('/fetch/:slug', (req, res, next) => {
  contentful.getIngredientBySlug(req.params.slug)
    .then((ingredient) => {
      res.json({ ingredient: ingredient.items[0].fields});
    })
    .catch((error)=>{
      req.err = error;
      console.error("error: fetch ingredient contentful", req.err);
      res.error(err);
    });
});

router.get('/:slug', (req, res, next) => {
  contentful.getIngredients()
    .then((ingredients) => {
      if (!ingredients.items || !ingredients.items.length) { throw new Error('No ingredients found.'); }
      req.ingredients = _.sortBy(ingredients.items, (a) => {return a.fields.name});
      req.current = req.ingredients.findIndex((o) => o.fields.slug === req.params.slug);

      res.render('ingredients-ingredient', {
        title: req.ingredients[req.current].fields.seoTitle || `Ingredient | ${req.params.slug.replace(/-/g,' ')}`,
        description: req.ingredients[req.current].fields.seoDescription,
        ingredient: req.ingredients[req.current],
        route: 'educate',
        prev: req.current > 0 ? req.ingredients[req.current-1] : false,
        next: req.current < req.ingredients.length ? req.ingredients[req.current+1] : false,
        components: []
      });
    })
    .catch((error)=>{
      req.err = error;
      console.error("error: ingredient page contentful", req.err);
      res.render('error', { error: req.err });
    });
});

module.exports = router;
