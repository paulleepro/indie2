const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  if (!req.signedCookies.il_t) {
    console.error("/account - No token found");
    if (req.query.login === "true") res.clearCookie("il_t").redirect(302, '/?login=true');
    else res.clearCookie("il_t").redirect(302, '/?logout=true');
    return;
  }

  res.render('account', {
    title: 'Your Account',
    route: 'account',
    controller: 'account',
    components: []
  });
});

module.exports = router;
