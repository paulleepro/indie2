const express = require('express');
const router = express.Router();

const AirtableService = require('../services/airtable');
const airtable = new AirtableService();

router.get('/store-locations', (req, res) => {
  airtable.getStoreLocations(req.query)
    .then((response) => {
      res.status(200).send(response);
    }).catch((error) => {
      console.error(error);
      res.status(500).send({error});
    });
});

module.exports = router;