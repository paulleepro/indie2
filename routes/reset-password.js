const express = require('express');
const router = express.Router();

const MagentoService = require('../services/magento');
const magento = new MagentoService();

router.get('/', (req, res, next) => {
  if (!req.query.id || !req.query.token) {
    console.error("/reset-password - No customer ID or token found");

    res.render('reset-password', {
      title: 'Reset Password',
      route: 'account',
      controller: 'account',
      components: [],
      tokenValid: false,
    });

    return;
  }

  magento.checkResetPasswordToken(req.query.id, req.query.token)
    .then((result) => {
      res.render('reset-password', {
        title: 'Reset Password',
        route: 'account',
        controller: 'account',
        components: [],
        tokenValid: result.data,
      });
    })
    .catch((error) => {
      console.error(error);

      if (error && error.response && error.response.data && error.response.data.message && error.response.data.message === "Reset password token mismatch.") {
        res.render('reset-password', {
          title: 'Reset Password',
          route: 'account',
          controller: 'account',
          components: [],
          tokenValid: false,
        });
      } else {
        res.render('error', { error: error });
      }
    });
});

module.exports = router;