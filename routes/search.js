const express = require('express');
const router = express.Router();
const axios = require('axios');
const ContentfulService = require('../services/contentful');


const contentful = new ContentfulService();

router.get('/query', (req, res) => {
    const queryData = {};

    axios.all([
        contentful.getProductsByQuery(req.query.searchTerms),
        contentful.getRitualsByQuery(req.query.searchTerms),
        contentful.getFocusByQuery(req.query.searchTerms),
        contentful.getIngredientsByQuery(req.query.searchTerms),
        contentful.getEventsByQuery(req.query.searchTerms)
    ])
    .then(axios.spread((products, rituals, focus, ingredients, events) => {
        queryData.products = products.items;
        queryData.rituals = rituals.items;
        queryData.focus = focus.items;
        queryData.ingredients = ingredients.items;
        queryData.events = events.items;

        if (queryData.rituals.length === 0 &&
            queryData.focus.length === 0 &&
            queryData.ingredients.length === 0 &&
            queryData.events.length === 0) {
                queryData.noResults = true;
            }

        res.send(queryData);
    }))
    .catch((err) => {
        console.error(err);
        raven.captureException(err);
        res.redirect(302, '/error');
    });
});
  
  module.exports = router;