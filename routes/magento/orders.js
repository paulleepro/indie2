const express = require('express');
const router = express.Router();

const MagentoService = require('../../services/magento');
const magento = new MagentoService();


router.get('/', (req, res, next) => {
  if (!req.query.email) {
    console.error("GET /magento/orders - Incomplete");
    res.status(400).send("Bad Request");
    return;
  }

  magento.getOrders(req.query.email)
    .then((result) => {
      res.status(result.status || 200).send(result.data);
    })
    .catch((error) => {
      console.error("GET /magento/orders - Magento error: ", error.response);
      if (!!error && !!error.response && !!error.response.status === 401) res.clearCookie("il_t");
      res.status(!!error ? error.response.status : 500).send(!!error && error.response.data);
    });
});

router.get('/:id', (req, res, next) => {
  magento.getOrder(req.params.id)
    .then((result) => {
      res.status(result.status || 200).send(result.data);
    })
    .catch((error) => {
      console.error("GET /magento/orders/:id - Magento error: ", error.response);
      if (!!error && !!error.response && !!error.response.status === 401) res.clearCookie("il_t");
      res.status(!!error ? error.response.status : 500).send(!!error && error.response.data);
    });
});

module.exports = router;