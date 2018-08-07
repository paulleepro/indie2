/* NOTES 
 *
 * il_c stands for indielee_cart
 * il_cid stands for indielee_cartid
 * il_cst stands for indielee_cartsubtotal
 * il_cc stands for indielee_couponcode
 * il_cda stands for indielee_coupondiscountamount
 *
 */

const axios = require('axios');
const find = require('lodash/find');
const forEach = require('lodash/forEach');

window.CartService = (() => {

  // always use getCartId() to get current cart ID, since this is being updated throughout the app
  function getCartId() {
    return window.localStorage.getItem('il_cid');
  }

  function _setCartId(cartId) {
    return window.localStorage.setItem('il_cid', cartId);
  }

  function _deleteCartId() {
    return window.localStorage.removeItem('il_cid');
  }

  function getCart() {
    return new Map(JSON.parse(window.localStorage.getItem('il_c') || '[]'));
  }

  function _setCart(cart) {
    window.localStorage.setItem('il_c', JSON.stringify(Array.from(cart.entries())));
    window.dispatchEvent(new CustomEvent('cart-update'));
  }

  function _deleteCart() {
    window.localStorage.removeItem('il_c');
    window.dispatchEvent(new CustomEvent('cart-update'));
  }

  function getCartSize() {
    const cart = getCart();
    let count = 0;

    cart.forEach((line) => {
      count += line.quantity;
    });

    return count;
  }

  function getCartSubtotal() {
    const localSubtotal = window.localStorage.getItem('il_cst');

    if (!!localSubtotal) return localSubtotal;

    const cart = getCart();
    let subtotal = 0;

    cart.forEach((line) => {
      subtotal += parseInt(line.quantity) * parseFloat(line.item.price);
    });

    return subtotal;
  }

  function _setCartSubtotal(subtotal) {
    return window.localStorage.setItem('il_cst', subtotal);
  }

  function _deleteCartSubtotal() {
    return window.localStorage.removeItem('il_cst');
  }

  function getCouponCode() {
    return window.localStorage.getItem('il_cc');
  }

  function _setCouponCode(couponCode) {
    return window.localStorage.setItem('il_cc', couponCode);
  }

  function _deleteCouponCode() {
    return window.localStorage.removeItem('il_cc');
  }

  function getCouponDiscount() {
    return window.localStorage.getItem('il_cda');
  }

  function _setCouponDiscount(discount) {
    return window.localStorage.setItem('il_cda', discount);
  }

  function _deleteCouponDiscount() {
    return window.localStorage.removeItem('il_cda');
  }

  function flushCartData() {
    _deleteCartId();
    _deleteCart();
    _deleteCartSubtotal();
    _deleteCouponCode();
    _deleteCouponDiscount();
  }

  // this updates both local and Magento carts
  // Using callback here to avoid returning a Promise, since other components calling this function would have a hard time if it were to return a Promise
  function updateCart(item, quantity, total, cb) {
    quantity = parseInt(quantity);
    total = parseInt(total);
    
    // using !Number.isInteger instead of isNaN because isNaN(null) == false
    if (!item || (!Number.isInteger(quantity) && !Number.isInteger(total))) {
      alert("Something went wrong. Please refresh the page and try again!");
      return;
    }

    const resultCb = (cart, totalsRes) => {
      _setCartSubtotal(totalsRes.data.base_subtotal_with_discount);
      _setCouponDiscount(totalsRes.data.base_discount_amount);
      _setCart(cart);

      window.localStorage.setItem('il_c', JSON.stringify(Array.from(cart.entries())));
      window.dispatchEvent(new CustomEvent('cart-update'));

      !!cb && cb();
    }

    getMagentoCart()
      .then((cartData) => {
        let cart = getCart();
        const ref = cart.get(item.sku);
        const cartItem = find(cartData.items, i => i.sku == item.sku);

        // if item is not in cart yet...
        if (!ref) {
          const qty = total || quantity;
          
          cart.set(item.sku, {item, quantity: qty});

          _addMagentoCartItem({quoteId: getCartId(), sku: item.sku, qty})
            .then(totalsRes => {
              window.dataLayer = window.dataLayer || [];
              window.dataLayer.push({
                event: "EEaddToCart",
                ecommerce: {
                  currencyCode: "USD",
                  add: {
                    products: [{
                      id: item.sku,
                      name: item.name,
                      price: parseFloat(item.price),
                      variant: item.variation,
                      brand: "Indie Lee",
                      quantity: qty
                    }]
                  }
                }
              });

              resultCb(cart, totalsRes);
            })
            .catch((err) => {
              console.error(err);
              !!cb && cb();
            });
        }

        // if item is being removed from cart...
        else if (ref.quantity + quantity <= 0 || total === 0) {
          cart.delete(item.sku);

          if (cartItem) {
            _removeMagentoCartItem(cartItem.item_id)
              .then(totalsRes => {
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                  event:"EEremoveFromCart",
                  ecommerce: {
                    currencyCode:"USD",
                    remove: {
                      products: [{
                        id: item.sku,
                        name: item.name,
                        price: parseFloat(item.price),
                        variant: item.variation,
                        brand: "Indie Lee",
                        quantity: ref.quantity
                      }]
                    }
                  }
                });
                
                resultCb(cart, totalsRes);
              })
              .catch((err) => {
                console.error(err);
                !!cb && cb();
              });
          }
        } 

        // if item quantity is being updated...
        else {
          const qty = total || ref.quantity + quantity;
          
          cart.set(item.sku, {item, quantity: qty});

          window.dataLayer = window.dataLayer || [];

          if (total - ref.quantity < 0) {
            window.dataLayer.push({
              event:"EEremoveFromCart",
              ecommerce: {
                currencyCode:"USD",
                remove: {
                  products: [{
                    id: item.sku,
                    name: item.name,
                    price: parseFloat(item.price),
                    variant: item.variation,
                    brand: "Indie Lee",
                    quantity: (total - ref.quantity) * -1
                  }]
                }
              }
            });
          } else if (total - ref.quantity > 0) {
            window.dataLayer.push({
              event: "EEaddToCart",
              ecommerce: {
                currencyCode: "USD",
                add: {
                  products: [{
                    id: item.sku,
                    name: item.name,
                    price: parseFloat(item.price),
                    variant: item.variation,
                    brand: "Indie Lee",
                    quantity: total - ref.quantity 
                  }]
                }
              }
            });
          }
          
          if (cartItem) {
            _updateMagentoCartItem({quoteId: getCartId(), itemId: cartItem.item_id, sku: item.sku, qty})
              .then(totalsRes => resultCb(cart, totalsRes))
              .catch((err) => {
                console.error("_updateMagentoCartItem error: ", err);
                !!cb && cb();
              });
          } else {
            _addMagentoCartItem({quoteId: getCartId(), sku: item.sku, qty})
              .then(totalsRes => resultCb(cart, totalsRes))
              .catch((err) => {
                console.error(err);
                !!cb && cb();
              });
          }
        }
      }).catch((err) => {
        console.error("CartService.updateCart() - Failed to get Magento cart: ", err);

        // 404 means cart doesn't exist, so delete the id and try again with a new cart
        if (err && err.response && err.response.status === 404) {
          flushCartData();
          updateCart(item, quantity, total);
        }
      });
  }

  // if cart id is found, then use getMagentoCart to get saved cart
  function getMagentoCart() {
    return new Promise((resolve, reject) => {
      const request = !!AccountService.getUser() 
        ? axios.get('/magento/cart/mine')
        : axios.get(`/magento/cart/guest/${getCartId()}`);

      request
        .then((res) => {
          // only reset cart ID if user is logged in. 
          // Otherwise, need to keep guest cart alone, 
          // since only the hash IDs (vs numerical IDs) work
          if (AccountService.getUser()) _setCartId(res.data.cart.id);
          if (res.data.totals.base_subtotal_with_discount) _setCartSubtotal(res.data.totals.base_subtotal_with_discount);
          if (res.data.totals.coupon_code) _setCouponCode(res.data.totals.coupon_code);
          if (res.data.totals.base_discount_amount) _setCouponDiscount(res.data.totals.base_discount_amount);
          resolve(res.data.cart);
        })
        .catch((err) => {
          console.error(err);

          // 404 means cart doesn't exist, so make a new one and resolve
          if (err && err.response && err.response.status === 404) {
            flushCartData();

            _createMagentoCart()
              .then(res => {resolve(res)})
              .catch(err => {reject(err)});
          } else {
            reject(err);
          }
        });
    });
  }

  // if cart id is not found, create a new magento cart
  function _createMagentoCart() {
    return new Promise((resolve, reject) => {
      const request = !!AccountService.getUser()
        ? axios.post('/magento/cart/mine')
        : axios.post('/magento/cart/guest');

      request
        .then((res) => {
          _setCartId(res.data);
          _setCart(new Map());
          resolve(res);
        })
        .catch((err) => {
          console.error(err);
          reject(err);
        });
    });
  }

  // update local cart with Magento cart
  function resetCartWithMagento() {
    if (!AccountService.getUser()) return;
    
    return new Promise((resolve, reject) => {
      getMagentoCart()
        .then((cartData) => {
          const cartId = getCartId();
          const localCart = getCart();

          let newCart = new Map();
          let cartUpdateRequests = [];

          // Loop through local cart
          localCart.forEach((line) => {
            const magentoItem = find(cartData.items, i => i.sku == line.item.sku);
            
            if (!magentoItem) {
              // if no magento item, add to magento
              cartUpdateRequests.push(_addMagentoCartItem({quoteId: cartId, sku: line.item.sku, qty: line.quantity}));
              newCart.set(line.item.sku, {item: line.item, quantity: line.quantity});
            } else {
              const newQty = line.quantity + magentoItem.qty;
              // this is done only during (if local item) because doing this for magento item would duplicate the process
              // else if magento item, combine quantity and update both local item and magento item
              cartUpdateRequests.push(_updateMagentoCartItem({quoteId: cartId, itemId: magentoItem.item_id, sku: line.item.sku, qty: newQty}));
              newCart.set(line.item.sku, {item: line.item, quantity: newQty});
            }
          });

          // loop through Magento cart
          cartData.items.forEach((item) => {
            // if no local item, add to localStorage
            if (!localCart.get(item.sku)) {
              // const contentfulItem = find(window.appData.products, product => product.sku == item.sku);
              const contentfulItem = find(window.appData.products, product => {
                return !!product.productVariants 
                  ? find(product.productVariants, v => v.fields.sku == item.sku) 
                  : false;
              });
              const contentfulVariant = Utils.getProductVariant(item.sku);

              const icon = (
                !!contentfulItem.ritual && 
                !!contentfulItem.ritual.length &&
                !!contentfulItem.ritual[0].fields.icon
              )
                ? contentfulItem.ritual[0].fields.icon.fields.file.url
                : null;

              const localItem = {
                sku: item.sku,
                name: contentfulItem.name,
                slug: contentfulItem.slug,
                variation: contentfulVariant ? contentfulVariant.variation : null,
                image: (contentfulVariant && contentfulVariant.images) ? contentfulVariant.images[0].fields.file.url : null,
                price: item.price,
                icon: icon,
              };

              newCart.set(item.sku, {item: localItem, quantity: item.qty});
            }
          });

          _setCart(newCart);

          if (cartUpdateRequests.length) {
            Promise.all(cartUpdateRequests)
              .then((results) => {})
              .catch(err => console.error(err));
          }

          resolve();
        })
        .catch((err) => {
          console.error(err);
          reject(err);
        });
    });
  }

  function replaceCartWithMagento() {
    return new Promise((resolve, reject) => {
      getMagentoCart()
        .then((cartData) => {
          // prepare new local cart
          let newCart = new Map();
          let cartUpdateRequests = [];

          // only set local cart if magento cart has items
          if (!!cartData.items && !!cartData.items.length) {
            // loop through Magento cart
            cartData.items.forEach((item) => {
              const contentfulItem = find(window.appData.products, product => {
                return !!product.productVariants 
                  ? find(product.productVariants, v => v.fields.sku == item.sku) 
                  : false;
              });

              const contentfulVariant = Utils.getProductVariant(item.sku);

              const icon = (
                !!contentfulItem &&
                !!contentfulItem.ritual && 
                !!contentfulItem.ritual.length &&
                !!contentfulItem.ritual[0].fields.icon
              )
                ? contentfulItem.ritual[0].fields.icon.fields.file.url
                : null;

              const localItem = {
                sku: item.sku,
                name: contentfulItem.name,
                slug: contentfulItem.slug,
                variation: contentfulVariant ? contentfulVariant.variation : null,
                image: (contentfulVariant && contentfulVariant.images) ? contentfulVariant.images[0].fields.file.url : null,
                price: item.price,
                icon: icon,
              };

              newCart.set(item.sku, {item: localItem, quantity: item.qty});
            });
          }

          _setCart(newCart);
          resolve();
        })
        .catch((err) => {
          console.error(err);
          
          // 404 means cart doesn't exist, so delete the id and try again with a new cart
          if (err && err.response && err.response.status === 404) {
            _deleteCartId();
            replaceCartWithMagento()
              .then(res => {resolve()})
              .catch(err => {reject(err)});
          } else {
            reject(err);
          }
        });
    });
  }

  function applyMagentoCoupon(couponCode) {
    return new Promise((resolve, reject) => {
      const user = AccountService.getUser();
      const cartId = getCartId();

      if (!user && !cartId) reject("Something went wrong. Please refresh the page and try again.");
      else if (user) {
        axios.post('/magento/cart/mine/coupons', {couponCode})
          .then(res => {
            _setCouponCode(couponCode);
            _setCouponDiscount(res.data.base_discount_amount);
            _setCartSubtotal(res.data.base_subtotal_with_discount);
            resolve(res);
          })
          .catch(err => {
            console.error(err);
            reject(err);
          });
      } else {
        axios.post(`/magento/cart/guest/${cartId}/coupons`, {couponCode})
          .then(res => {
            _setCouponCode(couponCode);
            _setCouponDiscount(res.data.base_discount_amount);
            _setCartSubtotal(res.data.base_subtotal_with_discount);
            resolve(res);
          })
          .catch(err => {
            console.error(err);
            reject(err);
          });
      }
    });
  }

  function removeMagentoCoupon() {
    return new Promise((resolve, reject) => {
      const user = AccountService.getUser();
      const cartId = getCartId();
      const couponCode = getCouponCode();

      if (!couponCode || (!user && !cartId)) reject("Something went wrong. Please refresh the page and try again.");
      else if (user) {
        axios.delete('/magento/cart/mine/coupons')
          .then(res => {
            _deleteCouponCode();
            _deleteCouponDiscount();
            _setCartSubtotal(res.data.base_subtotal_with_discount);
            resolve(res);
          })
          .catch(err => {
            console.error(err);
            reject(err);
          });
      } else {
        axios.delete(`/magento/cart/guest/${cartId}/coupons`)
          .then(res => {
            _deleteCouponCode();
            _deleteCouponDiscount();
            _setCartSubtotal(res.data.base_subtotal_with_discount);
            resolve(res);
          })
          .catch(err => {
            console.error(err);
            reject(err);
          });
      }
    });
  }

  function _addMagentoCartItem(cartItem) {
    return !!AccountService.getUser()
      ? axios.post('/magento/cart/mine/item', {cartItem})
      : axios.post(`/magento/cart/guest/${getCartId()}/item`, {cartItem});
  }

  function _updateMagentoCartItem(cartItem) {
    return !!AccountService.getUser()
      ? axios.put('/magento/cart/mine/item', {cartItem})
      : axios.put(`/magento/cart/guest/${getCartId()}/item`, {cartItem});
  }

  function _removeMagentoCartItem(itemId) {
    return !!AccountService.getUser()
      ? axios.delete(`/magento/cart/mine/items/${itemId}`)
      : axios.delete(`/magento/cart/guest/${getCartId()}/items/${itemId}`);
  }

  return {
    getCartId,
    getCart,
    getCartSize,
    getCartSubtotal,
    getCouponCode,
    getCouponDiscount,
    flushCartData,
    updateCart,
    getMagentoCart,
    resetCartWithMagento,
    replaceCartWithMagento,
    applyMagentoCoupon,
    removeMagentoCoupon,
  };

})();