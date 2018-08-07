/* NOTES 
 *
 * il_so stands for indielee_shippingoption
 * il_sa stands for indielee_shippingaddress
 *
 */

const axios = require('axios');

window.CheckoutService = (() => {

  function getMagentoShippingOptions(address) {
    return new Promise((resolve, reject) => {
      const request = !!AccountService.getUser()
        ? axios.post('/magento/checkout/shipping-options', {address})
        : axios.post(`/magento/checkout/guest/${CartService.getCartId()}/shipping-options`, {address});

      request
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          console.error(err);
          reject(err);
        });
    });
  }

  function setMagentoShipping(addressInformation) {
    return new Promise((resolve, reject) => {
      const request = !!AccountService.getUser()
        ? axios.post('/magento/checkout/shipping', {addressInformation})
        : axios.post(`/magento/checkout/guest/${CartService.getCartId()}/shipping`, {addressInformation});

      request
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          console.error(err);
          reject(err);
        });
    });
  }

  function setMagentoBilling(address) {
    return new Promise((resolve, reject) => {
      const request = !!AccountService.getUser()
        ? axios.post('/magento/checkout/billing', {address})
        : axios.post(`/magento/checkout/guest/${CartService.getCartId()}/billing`, {address});

      request
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          console.error(err);
          reject(err);
        });
    });
  }

  function createOrder(payload) {
    return axios.post('/magento/checkout', {payload});
  }

  return {
    getMagentoShippingOptions,
    setMagentoShipping,
    setMagentoBilling,
    createOrder,
  };

})();