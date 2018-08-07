const express = require('express');
const router = express.Router();

const MagentoService = require('../../services/magento');
const magento = new MagentoService();


/* GET SHIPPING OPTIONS */
router.post('/shipping-options', (req, res, next) => {
  if (!req.signedCookies.il_t) {
    console.error("POST /magento/checkout/shipping-options - No token found");
    res.status(401).send(new Error("Not Authorized"));
    return;
  }

  if (!req.body.address) {
    console.error("POST /magento/checkout/shipping-options - No address found");
    res.status(400).send(new Error("Bad Request"));
    return;
  }

  magento.getCheckoutShippingOptions(req.signedCookies.il_t, req.body.address)
    .then((result) => {
      res.status(result.status || 200).send(result.data);
    })
    .catch((error) => {
      console.error("POST /magento/checkout/shipping-options - Magento error: ", error.response);
      if (!!error && !!error.response && !!error.response.status === 401) res.clearCookie("il_t");
      res.status(!!error ? error.response.status : 500).send(!!error && error.response.data);
    });
});

/* GET GUEST SHIPPING OPTIONS */
router.post('/guest/:cartId/shipping-options', (req, res, next) => {
  if (!req.params.cartId) {
    console.error("POST /magento/checkout/guest/:cartId/shipping-options - No cart ID found");
    res.status(400).send(new Error("Not Authorized"));
    return;
  }

  if (!req.body.address) {
    console.error("POST /magento/checkout/guest/:cartId/shipping-options - No address found");
    res.status(400).send(new Error("Bad Request"));
    return;
  }

  magento.getGuestCheckoutShippingOptions(req.params.cartId, req.body.address)
    .then((result) => {
      res.status(result.status || 200).send(result.data);
    })
    .catch((error) => {
      console.error("POST /magento/checkout/guest/:cartId/shipping-options - Magento error: ", error.response);
      res.status(!!error ? error.response.status : 500).send(!!error && error.response.data);
    });
});

/* SET SHIPPING */
router.post('/shipping', (req, res, next) => {
  if (!req.signedCookies.il_t) {
    console.error("POST /magento/checkout/shipping - No token found");
    res.status(401).send(new Error("Not Authorized"));
    return;
  }

  if (!req.body.addressInformation) {
    console.error("POST /magento/checkout/shipping - No shipping information found");
    res.status(400).send(new Error("Bad Request"));
    return;
  }

  magento.postCheckoutShipping(req.signedCookies.il_t, req.body.addressInformation)
    .then((result) => {
      res.status(result.status || 200).send(result.data);
    })
    .catch((error) => {
      console.error("GET /magento/checkout/shipping - Magento error: ", error.response);
      if (!!error && !!error.response && !!error.response.status === 401) res.clearCookie("il_t");
      res.status(!!error ? error.response.status : 500).send(!!error && error.response.data);
    });
});

/* SET GUEST SHIPPING */
router.post('/guest/:cartId/shipping', (req, res, next) => {
  if (!req.params.cartId) {
    console.error("POST /magento/guest/:cartId/shipping - No cart ID found");
    res.status(400).send(new Error("Bad Request"));
    return;
  }

  if (!req.body.addressInformation) {
    console.error("POST /magento/guest/:cartId/shipping - No shipping information found");
    res.status(400).send(new Error("Bad Request"));
    return;
  }

  magento.postGuestCheckoutShipping(req.params.cartId, req.body.addressInformation)
    .then((result) => {
      res.status(result.status || 200).send(result.data);
    })
    .catch((error) => {
      console.error("POST /magento/checkout/guest/:cartId/shipping - Magento error: ", error.response);
      res.status(!!error ? error.response.status : 500).send(!!error && error.response.data);
    });
});

/* SET BILLING */
router.post('/billing', (req, res, next) => {
  if (!req.signedCookies.il_t) {
    console.error("POST /magento/checkout/billing - No token found");
    res.status(401).send(new Error("Not Authorized"));
    return;
  }

  if (!req.body.address) {
    console.error("POST /magento/checkout/billing - No billing information found");
    res.status(400).send(new Error("Bad Request"));
    return;
  }

  magento.postCheckoutBilling(req.signedCookies.il_t, req.body.address)
    .then((result) => {
      res.status(result.status || 200).send(result.data);
    })
    .catch((error) => {
      console.error("GET /magento/checkout/billing - Magento error: ", error.response);
      if (!!error && !!error.response && !!error.response.status === 401) res.clearCookie("il_t");
      res.status(!!error ? error.response.status : 500).send(!!error && error.response.data);
    });
});

/* SET GUEST BILLING */
router.post('/guest/:cartId/billing', (req, res, next) => {
  if (!req.params.cartId) {
    console.error("POST /magento/guest/:cartId/billing - No cart ID found");
    res.status(400).send(new Error("Bad Request"));
    return;
  }

  if (!req.body.address) {
    console.error("POST /magento/guest/:cartId/billing - No billing information found");
    res.status(400).send(new Error("Bad Request"));
    return;
  }

  magento.postGuestCheckoutBilling(req.params.cartId, req.body.address)
    .then((result) => {
      res.status(result.status || 200).send(result.data);
    })
    .catch((error) => {
      console.error("POST /magento/checkout/guest/:cartId/billing - Magento error: ", error.response);
      res.status(!!error ? error.response.status : 500).send(!!error && error.response.data);
    });
});

/* PLACE ORDER */
// NOTE: For both guest and logged-in user
router.post('/', (req, res, next) => {
  if (!req.body.payload) {
    console.error("POST /magento/checkout - No payload found");
    res.status(400).send("Bad Request");
    return;
  }

  magento.postCheckout(req.body.payload)
    .then((result) => {
      res.status(result ? result.status : 200).send(result ? JSON.stringify(result.data) : "OK");
    })
    .catch((error) => {
      console.error("POST /magento/checkout - Magento error: ", error);
      res.status(!!error && !!error.response ? error.response.status : 500).send(!!error && error.response ? error.response.data : "ERROR - No message");
    });
});

module.exports = router;