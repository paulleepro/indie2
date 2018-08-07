const express = require('express');
const router = express.Router();

const MagentoService = require('../../services/magento');
const magento = new MagentoService();


/* GET CART */
router.get('/mine', (req, res, next) => {
  if (!req.signedCookies.il_t) {
    console.error("GET /magento/cart/mine - No token found");
    res.status(401).send(new Error("Not Authorized"));
    return;
  }

  magento.getCart(req.signedCookies.il_t)
    .then((result) => {
      magento.getCartTotal(req.signedCookies.il_t)
        .then((cartRes) => {
          res.status(cartRes.status || 200).send({cart: result.data, totals: cartRes.data});
        })
        .catch((error) => {
          console.error("GET /magento/cart/mine (GET cart total) - Magento error: ", error.response);
          if (!!error && !!error.response && !!error.response.status === 401) res.clearCookie("il_t");
          res.status(!!error && !!error.response ? error.response.status : 500).send(!!error && error.response.data);
        });
    })
    .catch((error) => {
      console.error("GET /magento/cart/mine - Magento error: ", !!error && error.response);
      if (!!error && !!error.response && !!error.response.status === 401) res.clearCookie("il_t");
      res.status(!!error && !!error.response ? error.response.status : 500).send(!!error && error.response.data);
    });
});

/* GET GUEST CART */
router.get('/guest/:id', (req, res, next) => {
  magento.getGuestCart(req.params.id)
    .then((result) => {
      magento.getGuestCartTotal(req.params.id)
        .then((cartRes) => {
          res.status(cartRes.status || 200).send({cart: result.data, totals: cartRes.data});
        })
        .catch((error) => {
          console.error("GET /magento/cart/guest/:id (GET cart total) - Magento error: ", error);
          res.status(!!error && !!error.response ? error.response.status : 500).send(!!error && error.response.data);
        }); 
    })
    .catch((error) => {
      console.error("GET /magento/guest/:id - Magento error: ", !!error && error.response);
      res.status(!!error && !!error.response ? error.response.status : 500).send(!!error && error.response.data);
    });
});

/* CREATE CART */
router.post('/mine', (req, res, next) => {
  if (!req.signedCookies.il_t) {
    console.error("POST /magento/cart/mine - No token found");
    res.status(401).send(new Error("Not Authorized"));
    return;
  }

  magento.createCart(req.signedCookies.il_t)
    .then((result) => {
      res.status(result.status || 200).send(result.data);
    })
    .catch((error) => {
      console.error("POST /magento/cart/mine - Magento error: ", !!error && error.response);
      if (!!error && !!error.response && !!error.response.status === 401) res.clearCookie("il_t");
      res.status(!!error && !!error.response ? error.response.status : 500).send(!!error && error.response.data);
    });
});

/* CREATE GUEST CART */
router.post('/guest', (req, res, next) => {
  magento.createGuestCart()
    .then((result) => {
      res.status(result.status || 200).send(result.data);
    })
    .catch((error) => {
      console.error("POST /magento/cart/guest - Magento error: ", !!error && error.response);
      res.status(!!error && !!error.response ? error.response.status : 500).send(!!error && error.response.data);
    });
});

/* ADD CART ITEM */
router.post('/mine/item', (req, res, next) => {
  if (!req.signedCookies.il_t) {
    console.error("POST /magento/cart/mine/item - No token found");
    res.status(401).send(new Error("Not Authorized"));
    return;
  }

  if (!req.body.cartItem) {
    console.error("POST /magento/cart/mine/item - No cart item found");
    res.status(400).send(new Error("Bad Request"));
    return;
  }

  magento.addCartItem(req.signedCookies.il_t, req.body.cartItem)
    .then((result) => {
      magento.getCartTotal(req.signedCookies.il_t)
        .then((cartRes) => {
          res.status(cartRes.status || 200).send(cartRes.data);
        })
        .catch((error) => {
          console.error("POST /magento/cart/mine/item (GET cart total) - Magento error: ", error.response);
          if (!!error && !!error.response && !!error.response.status === 401) res.clearCookie("il_t");
          res.status(!!error && !!error.response ? error.response.status : 500).send(!!error && error.response.data);
        });
    })
    .catch((error) => {
      console.error("POST /magento/cart/mine/item - Magento error: ", error.response);
      if (!!error && !!error.response && !!error.response.status === 401) res.clearCookie("il_t");
      res.status(!!error && !!error.response ? error.response.status : 500).send(!!error && error.response.data);
    });
});

/* ADD GUEST CART ITEM */
router.post('/guest/:id/item', (req, res, next) => {
  if (!req.body.cartItem) {
   console.error("POST /magento/guest/:id/item - No cart item found");
   res.status(400).send(new Error("Bad Request"));
   return;
  }

  magento.addGuestCartItem(req.params.id, req.body.cartItem)
    .then((result) => {
      magento.getGuestCartTotal(req.params.id)
        .then((cartRes) => {
          res.status(cartRes.status || 200).send(cartRes.data);
        })
        .catch((error) => {
          console.error("POST /magento/cart/guest/:id/item (GET cart total) - Magento error: ", error.response);
          res.status(!!error && !!error.response ? error.response.status : 500).send(!!error && error.response.data);
        });  
    })
    .catch((error) => {
      console.error("POST /magento/guest/:id/item - Magento error: ", error.response);
      res.status(!!error && !!error.response ? error.response.status : 500).send(!!error && error.response.data);
    });
});

/* UPDATE CART ITEM */
router.put('/mine/item', (req, res, next) => {
  if (!req.signedCookies.il_t) {
    console.error("PUT /magento/cart/mine/item - No token found");
    res.status(401).send(new Error("Not Authorized"));
    return;
  }

  if (!req.body.cartItem) {
   console.error("PUT /magento/cart/mine/item - No cart found");
   res.status(400).send(new Error("Bad Request"));
   return;
  }

  magento.updateCartItem(req.signedCookies.il_t, req.body.cartItem)
    .then((result) => {
      magento.getCartTotal(req.signedCookies.il_t)
        .then((cartRes) => {
          res.status(cartRes.status || 200).send(cartRes.data);
        })
        .catch((error) => {
          console.error("PUT /magento/cart/mine/item (GET cart total) - Magento error: ", error.response);
          if (!!error && !!error.response && !!error.response.status === 401) res.clearCookie("il_t");
          res.status(!!error && !!error.response ? error.response.status : 500).send(!!error && error.response.data);
        });
    })
    .catch((error) => {
      console.error("PUT /magento/cart/mine/item - Magento error: ", error.response.data.errors);
      if (!!error && !!error.response && !!error.response.status === 401) res.clearCookie("il_t");
      res.status(!!error && !!error.response ? error.response.status : 500).send(!!error && error.response.data);
    });
});

/* UPDATE GUEST CART ITEM */
router.put('/guest/:id/item', (req, res, next) => {
  if (!req.body.cartItem) {
   console.error("PUT /magento/cart/:id/item - No cart found");
   res.status(400).send(new Error("Bad Request"));
   return;
  }

  magento.updateGuestCartItem(req.params.id, req.body.cartItem)
    .then((result) => {
      magento.getGuestCartTotal(req.params.id)
        .then((cartRes) => {
          res.status(cartRes.status || 200).send(cartRes.data);
        })
        .catch((error) => {
          console.error("PUT /magento/cart/guest/:id/item (GET cart total) - Magento error: ", error.response);
          res.status(!!error && !!error.response ? error.response.status : 500).send(!!error && error.response.data);
        });  
    })
    .catch((error) => {
      console.error("PUT /magento/cart/:id/item - Magento error: ", error.response);
      res.status(!!error && !!error.response ? error.response.status : 500).send(!!error && error.response.data);
    });
});

/* REMOVE CART ITEM */
router.delete('/mine/items/:id', (req, res, next) => {
  if (!req.signedCookies.il_t) {
    console.error("DELETE /magento/cart/mine/items/:id - No token found");
    res.status(401).send(new Error("Not Authorized"));
    return;
  }

  magento.removeCartItem(req.signedCookies.il_t, req.params.id)
    .then((result) => {
      magento.getCartTotal(req.signedCookies.il_t)
        .then((cartRes) => {
          res.status(cartRes.status || 200).send(cartRes.data);
        })
        .catch((error) => {
          console.error("DELETE /magento/cart/mine/items/:id (GET cart coupon) - Magento error: ", error.response);
          if (!!error && !!error.response && !!error.response.status === 401) res.clearCookie("il_t");
          res.status(!!error && !!error.response ? error.response.status : 500).send(!!error && error.response.data);
        });
    })
    .catch((error) => {
      console.error("DELETE /magento/cart/mine/items/:id - Magento error: ", error.response);
      if (!!error && !!error.response && !!error.response.status === 401) res.clearCookie("il_t");
      res.status(!!error && !!error.response ? error.response.status : 500).send(!!error && error.response.data);
    });
});

/* REMOVE GUEST CART ITEM */
router.delete('/guest/:id/items/:itemId', (req, res, next) => {
  magento.removeGuestCartItem(req.params.id, req.params.itemId)
    .then((result) => {
      magento.getGuestCartTotal(req.params.id)
        .then((cartRes) => {
          res.status(cartRes.status || 200).send(cartRes.data);
        })
        .catch((error) => {
          console.error("DELETE /magento/cart/guest/:id/items/:itemId (GET cart coupon) - Magento error: ", error.response);
          res.status(!!error && !!error.response ? error.response.status : 500).send(!!error && error.response.data);
        });  
    })
    .catch((error) => {
      console.error("DELETE /magento/cart/guest/:id/items/:itemId - Magento error: ", error.response);
      res.status(!!error && !!error.response ? error.response.status : 500).send(!!error && error.response.data);
    });
});

/* PUT CART COUPON
 * NOTE - Returns Magento cart total
 */
router.post('/mine/coupons', (req, res, next) => {
  if (!req.signedCookies.il_t) {
    console.error("POST /magento/cart/mine/coupons - No token found");
    res.status(401).send(new Error("Not Authorized"));
    return;
  }

  if (!req.body.couponCode) {
    console.error("POST /magento/cart/mine/coupons - No coupon code found");
    res.status(400).send(new Error("Bad Request"));
    return;
  }

  magento.putCartCoupon(req.signedCookies.il_t, req.body.couponCode)
    .then((result) => {
      magento.getCartTotal(req.signedCookies.il_t)
        .then((cartRes) => {
          res.status(cartRes.status || 200).send(cartRes.data);
        })
        .catch((error) => {
          console.error("POST /magento/cart/mine/coupons (GET cart coupon) - Magento error: ", error.response);
          if (!!error && !!error.response && !!error.response.status === 401) res.clearCookie("il_t");
          res.status(!!error && !!error.response ? error.response.status : 500).send(!!error && error.response.data);
        });  
    })
    .catch((error) => {
      console.error("POST /magento/cart/mine/coupons - Magento error: ", error.response);
      if (!!error && !!error.response && !!error.response.status === 401) res.clearCookie("il_t");
      res.status(!!error && !!error.response ? error.response.status : 500).send(!!error && error.response.data);
    });
});

/* PUT GUEST CART COUPON
 * NOTE - Returns Magento guest cart total
 */
router.post('/guest/:id/coupons', (req, res, next) => {
  if (!req.body.couponCode) {
    console.error("POST /magento/cart/guest/:id/coupons - No coupon code found");
    res.status(400).send(new Error("Bad Request"));
    return;
  }

  magento.putGuestCartCoupon(req.params.id, req.body.couponCode)
    .then((result) => {
      magento.getGuestCartTotal(req.params.id)
        .then((cartRes) => {
          res.status(cartRes.status || 200).send(cartRes.data);
        })
        .catch((error) => {
          console.error("POST /magento/cart/guest/:id/coupons (GET cart coupon) - Magento error: ", error.response);
          res.status(!!error && !!error.response ? error.response.status : 500).send(!!error && error.response.data);
        });  
    })
    .catch((error) => {
      console.error("POST /magento/cart/guest/:id/coupons - Magento error: ", error.response);
      res.status(!!error && !!error.response ? error.response.status : 500).send(!!error && error.response.data);
    });
});

/* REMOVE CART COUPON
 * NOTE - Returns Magento guest cart total
 */
router.delete('/mine/coupons', (req, res, next) => {
  if (!req.signedCookies.il_t) {
    console.error("DELETE /magento/cart/mine/coupons - No token found");
    res.status(401).send(new Error("Not Authorized"));
    return;
  }

  magento.removeCartCoupon(req.signedCookies.il_t)
    .then((result) => {
      magento.getCartTotal(req.signedCookies.il_t)
        .then((cartRes) => {
          res.status(cartRes.status || 200).send(cartRes.data);
        })
        .catch((error) => {
          console.error("DELETE /magento/cart/mine/coupons (GET cart coupon) - Magento error: ", error.response);
          if (!!error && !!error.response && !!error.response.status === 401) res.clearCookie("il_t");
          res.status(!!error && !!error.response ? error.response.status : 500).send(!!error && error.response.data);
        });    
    })
    .catch((error) => {
      console.error("DELETE /magento/cart/mine/coupons - Magento error: ", error.response);
      if (!!error && !!error.response && !!error.response.status === 401) res.clearCookie("il_t");
      res.status(!!error && !!error.response ? error.response.status : 500).send(!!error && error.response.data);
    })
});

/* REMOVE GUEST CART COUPON
 * NOTE - Returns Magento guest cart total
 */
router.delete('/guest/:id/coupons', (req, res, next) => {
  magento.removeGuestCartCoupon(req.params.id)
    .then((result) => {
      magento.getGuestCartTotal(req.params.id)
        .then((cartRes) => {
          res.status(cartRes.status || 200).send(cartRes.data);
        })
        .catch((error) => {
          console.error("DELETE /magento/cart/guest/:id/coupons (GET cart coupon) - Magento error: ", error.response);
          res.status(!!error && !!error.response ? error.response.status : 500).send(!!error && error.response.data);
        });  
    })
    .catch((error) => {
      console.error("DELETE /magento/cart/guest/:id/coupons - Magento error: ", error.response);
      res.status(!!error && !!error.response ? error.response.status : 500).send(!!error && error.response.data);
    });
});


module.exports = router;