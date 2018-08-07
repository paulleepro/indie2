const express = require('express');
const router = express.Router();

const MagentoService = require('../../services/magento');
const magento = new MagentoService();

const isEmail = require('validator/lib/isEmail');


router.post('/', (req, res, next) => {
  if (
    !req.body.customer ||
    !req.body.customer.email ||
    !req.body.customer.firstname || 
    !req.body.customer.lastname ||
    !req.body.password
  ) {
    console.error("POST /magento/account - Incomplete");
    res.status(400).send("Bad Request");
    return;
  }

  magento.createUser(req.body)
    .then((result) => {
      res.status(result.status || 200).send(result.data);
    })
    .catch((error) => {
      console.error("POST /magento/account - Magento error:", error.response);
      res.status(!!error ? error.response.status : 500).send(!!error && error.response.data);
    });
});

router.post('/email-is-available', (req, res, next) => {
  if (!req.body.email) {
    console.error("POST /magento/account/email-is-available - No email found");
    res.status(400).send("Bad Request");
    return;
  }

  magento.checkEmail(req.body.email)
    .then((result) => {
      res.status(result.status || 200).send(result.data);
    })
    .catch((error) => {
      console.error("POST /magento/account/email-is-available - Magento error: ", error.response);
      res.status(!!error ? error.response.status : 500).send(!!error && error.response.data);
    });
});

// NOTE: Generate auth token, then store as signed cookie for future customer-related requests
router.post('/authorize', (req, res, next) => {
  if (
    !req.body.email || 
    !req.body.password || 
    typeof !req.body.email === 'string' ||
    typeof !req.body.password === 'string' || 
    !req.body.email.length ||
    !req.body.password.length ||
    !isEmail(req.body.email)
  ) {
    console.error("POST /magento/account/authorize - Email or password missing");
    res.status(400).send("Bad Request");
    return;
  }

  magento.authorizeUser(req.body.email, req.body.password)
    .then((result) => {
      res
        .cookie('il_t', encodeURIComponent(result.data), {
          expires: new Date(Date.now() + 3600000), // Expiration = 1 hour = default Magento user token expiration
          secure: process.env.NODE_ENV !== "development",
          sameSite: true,
          httpOnly: true,
          signed: true
        })
        .status(result.status || 200)
        .send({status: result.status, message: "OK"});
    })
    .catch((error) => {
      console.error("POST /magento/account/authorize - Magento error: ", error.response);
      res.status(!!error ? error.response.status : 500).send(!!error && error.response.data);
    });
});

router.get('/me', (req, res, next) => {
  if (!req.signedCookies.il_t) {
    console.error("GET /magento/account/me - No token found");
    res.status(401).send(new Error("Not Authorized"));
    return;
  }

  magento.getUser(req.signedCookies.il_t)
    .then((result) => {
      res.status(result.status || 200).send(result.data);
    })
    .catch((error) => {
      console.error("GET /magento/account/me - Magento error: ", error.response);
      if (!!error && !!error.response && !!error.response.status === 401) res.clearCookie("il_t");
      res.status(!!error ? error.response.status : 500).send(!!error && error.response.data);
    });
});

router.put('/me', (req, res, next) => {
  if (!req.signedCookies.il_t) {
    console.error("PUT /magento/account/me - No token found");
    res.status(401).send(new Error("Not Authorized"));
    return;
  }

  if (!req.body.customer) {
    console.error("PUT /magento/account/me - User object missing");
    res.status(400).send("Bad Request");
    return;
  }

  magento.updateUser(req.signedCookies.il_t, {customer: req.body.customer})
    .then((result) => {
      res.status(result.status || 201).send(result.data);
    })
    .catch((error) => {
      console.error("PUT /magento/account/me - Magento error: ", error.response);
      if (!!error && !!error.response && !!error.response.status === 401) res.clearCookie("il_t");
      res.status(!!error ? error.response.status : 500).send(!!error && error.response.data);
    });
});

router.delete('/addresses/:id', (req, res, next) => {
  if (!req.signedCookies.il_t) {
    console.error("DELETE /magento/account/address - No token found");
    res.status(401).send(new Error("Not Authorized"));
    return;
  }

  magento.deleteUserAddress(req.params.id)
    .then((result) => {
      res.status(result.status || 200).send(result.data);
    })
    .catch((error) => {
      console.error("DELETE /magento/account/address - Magento error: ", error.response);
      if (!!error && !!error.response && !!error.response.status === 401) res.clearCookie("il_t");
      res.status(!!error && !!error.response ? error.response.status : 500).send(!!error && !!error.response ? error.response.data : "OK");
    });
});

router.put('/password', (req, res, next) => {
  if (!req.signedCookies.il_t) {
    console.error("PUT /magento/account/password - No token found");
    res.status(401).send(new Error("Not Authorized"));
    return;
  }

  if (!req.body.currentPassword || !req.body.newPassword) {
    console.error("PUT /magento/account/password - Incomplete");
    res.status(400).send("Bad Request");
    return;
  }

  magento.updateUserPassword(req.signedCookies.il_t, req.body.currentPassword, req.body.newPassword)
    .then((result) => {
      res.status(result.status || 201).send(result.data);
    })
    .catch((error) => {
      console.error("PUT /magento/account/password - Magento error: ", error.response);
      if (!!error && !!error.response && !!error.response.status === 401) res.clearCookie("il_t");
      res.status(!!error ? error.response.status : 500).send(!!error && error.response.data);
    });
});

router.post('/request-reset-password', (req, res, next) => {
  if (!req.body.email) {
    console.error("POST /magento/account/request-reset-password - Incomplete");
    res.status(400).send("Bad Request");
    return;
  }

  magento.requestUserPassword(req.body.email)
    .then((result) => {
      res.status(result.status || 200).send(result.data);
    })
    .catch((error) => {
      console.error("POST /magento/account/request-reset-password - Magento error: ", error.response);
      res.status(!!error ? error.response.status : 500).send(!!error && error.response.data);
    });
});

router.post('/reset-password', (req, res, next) => {
  if (!req.body.email || !req.body.password || !req.body.token) {
    console.error("POST /magento/account/reset-password - Incomplete");
    res.status(400).send("Bad Request");
    return;
  }

  magento.resetPassword({
    email: req.body.email, 
    newPassword: req.body.password, 
    resetToken: req.body.token
  })
    .then((result) => {
      res.status(result.status || 200).send(result.data);
    })
    .catch((error) => {
      console.error("POST /magento/account/reset-password - Magento error: ", error.response);
      res.status(!!error ? error.response.status : 500).send(!!error && error.response.data);
    });
});

router.post('/logout', (req, res, next) => {
  res.clearCookie('il_t').status(200).send({status: 200, message: "OK"});
});

module.exports = router;