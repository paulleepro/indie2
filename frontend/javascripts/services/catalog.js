const axios = require('axios');

window.CatalogService = (() => {

  function getProductBySku(sku) {
    return axios.get(`/magento/catalog/${sku}`);
  }

  return {
    getProductBySku,
  };

})();