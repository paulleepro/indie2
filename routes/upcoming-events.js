const express = require('express');
const router = express.Router();
const ContentfulService = require('../services/contentful');
const contentful = new ContentfulService();
const axios = require('axios');

router.get('/', (req, res, next) => {
  axios.all([
    contentful.getContent('47WlMVLNzWsoEymC0UUwqa'),
    contentful.getEventTags()
 ]).then(axios.spread(function(pageData, eventTags) {
    res.render('upcoming-events', {
      cms: pageData.items[0].fields,
      eventTags: eventTags.items.map(i =>  i.fields),
      title: pageData.items[0].fields.seoTitle,
      description: pageData.items[0].fields.seoDescription,
      route: 'connect',
      controller: 'upcoming-events',
      components: []
    });
  }))
  .catch((error) => {
    req.err = error;
    console.error("error: upcoming events contentful", req.err);
    res.render('error', { error: req.err });
  });
});

router.get('/fetch', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  let sortFilter;

  if (req.query.sort == "upcoming") sortFilter = {"fields.date[gte]": today};
  if (req.query.sort == "past") sortFilter = {"fields.date[lt]": today};

  if (typeof req.query.series !== 'undefined') {
    contentful.getEventsByTag(req.query.series, sortFilter)
      .then((eventRes) => {
        res.json({ events: eventRes.items });
      })
      .catch((err) => {
        console.error(err);
        res.error(err);
      });   
  } else {
    contentful.getEvents(sortFilter)
      .then((eventRes) => {
        res.json({ events: eventRes.items });
      })
      .catch((err) => {
        console.error(err);
        res.error(err);
      });
  }
});

router.get('/:eventSlug', (req, res, next) => {
  contentful.getEventBySlug(req.params.eventSlug)
    .then((data) => {
      res.render('event', {
        cms: data.items[0].fields,
        title: data.items[0].fields.seoTitle,
        description: data.items[0].fields.seoDescription,
        route: 'connect'
      });
    })
    .catch((error) => {
      req.err = error;
      console.error("error: upcoming events contentful", req.err);
      res.render('error', { error: req.err });
    });
});

module.exports = router;
