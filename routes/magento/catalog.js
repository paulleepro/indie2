const express = require('express');
const router = express.Router();

const MagentoService = require('../../services/magento');
const magento = new MagentoService();


router.get('/:sku', (req, res, next) => {
  magento.getProductBySku(req.params.sku)
    .then((result) => {
      // result data comes back as array of request objects
      res.status(result.status || 200).send(result.map(r => r.data));
    })
    .catch((error) => {
      console.error("GET /magento/catalog/:sku - Magento error: ", !!error && error.response);
      res.status(!!error ? error.response.status : 500).send(!!error && error.response.data);
    });
});

module.exports = router;