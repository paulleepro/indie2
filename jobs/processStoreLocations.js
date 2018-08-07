require('dotenv').config();

const AirtableService = require('../services/airtable');
const airtable = new AirtableService();

airtable.processStoreLocations()
  .then((response) => {})
  .catch((error) => {
    console.error(error);
    res.status(500).send({error});
  });
