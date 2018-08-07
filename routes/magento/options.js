const express = require('express');
const router = express.Router();

const MagentoService = require('../../services/magento');
const magento = new MagentoService();


router.get('/countries', (req, res, next) => {
  magento.getCountries()
    .then((result) => {
      res.status(result.status || 200).send(result.data);
    })
    .catch((error) => {
      console.error("GET /magento/options/countries - Magento error: ", error);
      res.status(!!error ? error.response.status : 500).send(!!error && error.response.data);
    });
});

module.exports = router;