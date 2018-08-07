/* NOTES 
 *
 * il_o_c stands for indielee_options_countries
 *
 */

const axios = require('axios');

window.OptionsService = (() => {

  // each country comes with its own list of regions (e.g. "us" has a list of state regions)
  function getCountries() {
    return new Promise((resolve, reject) => {
      // if already stored locally, don't have make network call
    	const countries = window.localStorage.getItem('il_o_c');

      if (countries) {
        resolve(JSON.parse(countries));
      } else {
        axios.get('/magento/options/countries')
          .then((res) => {
            window.localStorage.setItem('il_o_c', JSON.stringify(res.data));
            resolve(res.data);
          })
          .catch((err) => {
            console.error("Magento error: ", err);
            reject(err);
          });
      }
    });
  }

  return {
    getCountries,
  };

})();