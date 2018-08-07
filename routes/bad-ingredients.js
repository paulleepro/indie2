const express = require('express');
const router = express.Router();
const ContentfulService = require('../services/contentful');
const _ = require('lodash');

const contentful = new ContentfulService();

router.get('/', (req, res, next) => {
  contentful.getDirtyIngredients()
    .then((ingredients) => {
      if (!ingredients.items || !ingredients.items.length) { throw new Error('No ingredients found.'); }

      req.ingredients = _.sortBy(ingredients.items, (a) => {return a.fields.name});
      req.ingredientsLeft = req.ingredients.slice(0,Math.ceil(req.ingredients.length / 2));
      req.ingredientsRight = req.ingredients.slice(Math.ceil(req.ingredients.length / 2), req.ingredients.length);

      res.render('bad-ingredients', {
        title: 'Harmful & Damaging Ingredients For Your Skincare Routine',
        description: `What ingredients in everyday skincare products are actually harmful for you and your skin? Find out more here and what to avoid in your products. We go through each bad ingredient, where it's commonly found, and what you can use instead.`,
        route: 'educate',
        ingredientsLeft: req.ingredientsLeft,
        ingredientsRight: req.ingredientsRight,
        controller: 'bad-ingredients',
        components: []
      });
    })
    .catch((error)=>{
      req.err = error;
      console.error("error: ingredient bad ingredients page contentful", req.err);
      res.render('error', { error: req.err });
    });
});

module.exports = router;
