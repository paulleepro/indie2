const forEach = require('lodash/forEach');
const values = require('lodash/values');

const {ERROR_MESSAGES} = require('../constants.js');

/*
 * Utils.js
 * global utility functions script
 * 
 * Exposes a global `Utils` to all preceeding scripts. House common functions to be used across page specific js here.
 */
window.Utils = (($) => {
  function debounce(fn, delay) {
    let timer = null;
    return function () {
      let context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }

  function throttle(fn, threshhold, scope) {
    threshhold || (threshhold = 250);
    let last,
        deferTimer;
    return function () {
      let context = scope || this;

      let now = (new Date()).getTime(),
          args = arguments;
      if (last && now < last + threshhold) {
        // hold on to it
        clearTimeout(deferTimer);
        deferTimer = setTimeout(function () {
          last = now;
          fn.apply(context, args);
        }, threshhold);
      } else {
        last = now;
        fn.apply(context, args);
      }
    };
  }

  function getWindowWidthEms() {
    return $(window).width() / 16;
  }

  function getUrlQueries() {
    let queries = window.location.search;

    if (!!queries && !!queries.length) {
      queries = queries
        .slice(1, queries.length)
        .split("&")
        .reduce(function(queries, query) {
          let querySplit = query.split("="),
              key = querySplit[0],
              value = querySplit[1];

          queries[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
          return queries;
        }, {});
    } else {
      queries = {};
    }

    return queries;
  }

  function generateUrlQueries(queriesObj) {
    if (!queriesObj || typeof queriesObj !== "object" || !Object.keys(queriesObj).length) {
      return "";
    }

    let string = "?",
        queriesList = Object.keys(queriesObj).map(function(key) {
          return key + "=" + queriesObj[key];
        });

    return (string + queriesList.join("&"));
  }

  // SOURCE: https://github.com/airbnb/is-touch-device/blob/master/src/index.js
  function isTouchDevice() {
    return (
      !!(typeof window !== 'undefined' &&
        ('ontouchstart' in window ||
          (window.DocumentTouch &&
            typeof document !== 'undefined' &&
            document instanceof window.DocumentTouch))) ||
      !!(typeof navigator !== 'undefined' &&
        (navigator.maxTouchPoints || navigator.msMaxTouchPoints))
    );
  }

  function turboBind(event, selector, func) {
    // if a click event, and a touch device, and not windows then use touchstart
    if (event === 'click' && isTouchDevice() && navigator.appVersion.indexOf("Win") === -1) {
      event = 'touchend';
    }

    $(document).on(event, selector, func);
  }

  function render(component, state) {
    $(`[data-component="${component}"]`).html(Handlebars.templates[component](state));
  }

  function moneyFormat(num) {
    return `$${parseFloat(num).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}`;
  }

  function distanceBetween(lat1, lon1, lat2, lon2, unit) {
    const radlat1 = Math.PI * lat1/180,
          radlat2 = Math.PI * lat2/180,
          theta = lon1-lon2,
          radtheta = Math.PI * theta/180;

    let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI
    dist = dist * 60 * 1.1515

    if (unit=="K") { dist = dist * 1.609344; }
    if (unit=="N") { dist = dist * 0.8684; }
    return dist;
  }

  function getPasswordValidator() {
    const passwordValidator = require('password-validator');
    return new passwordValidator()
                .is().min(8)
                .has().uppercase()
                .has().lowercase()
                .has().digits()
                .has().symbols()
                .has().not().spaces()
                .is().not().oneOf(['Passw0rd', 'Password123']);
  }

  function replaceParams(string, array) {
    return string.replace(/%(\d+)/g, function(_,m) {
      return array[--m];
    });
  }

  function getMagentoErrorMessage(err) {
    let message = ERROR_MESSAGES.default;

    if (err && err.response && err.response.data && err.response.data.message) {
      message = err.response.data.message;

      if (err.response.data.parameters && err.response.data.parameters.length) {
        message = replaceParams(message, err.response.data.parameters);
      }
    }

    return message;
  }

  function getProductVariant(sku) {
    // cache variants if not exists yet
    if (!window.appData.variants) {
      window.appData.variants = {};

      forEach(values(window.appData.products), (p) => {
        if (p.productVariants) {
          forEach(p.productVariants, (variant) => {
            window.appData.variants[variant.fields.sku] = variant.fields;
          });
        }
      });
    }

    return window.appData.variants[sku];
  }

  function onKeyDown(e, cb, shouldNotBlur) {
    if (e && e.keyCode === 13) {
      e.preventDefault();
      !shouldNotBlur && e.target.blur();
      !!cb && cb();
      return false;
    }
  }

  function setCookie(cname, cvalue, exdays) {
    let d = new Date();

    if (typeof cname !== 'undefined') {
      document.cookie = cname + "=" + cvalue + "; expires=" + d.setTime(d.getTime() + (exdays*24*60*60*1000));
    }
  }

  function getCookie(cname) {
    if (typeof cname !== 'undefined') {
      let name = cname + "=",
          ca = document.cookie.split(';');

      for (let i=0; i<ca.length; i++) {
          let c = ca[i];

          while (c.charAt(0)==' ') c = c.substring(1);
          if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
      }

      return "";
    }
  }

  function checkCookie(cname) {
    if (typeof cname !== 'undefined') {
      let check = getCookie(cname);

      if (check != "") {
        return true;
      } else {
        return false;
      }
    } 
  }

  function deleteCookie(cname, path, domain) {
    if (checkCookie(cname)) {
      document.cookie = cname + "=" +
        ((path) ? ";path="+path:"")+
        ((domain) ? ";domain="+domain:"") +
        ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
    }
  }

  function phpSerialize(obj, tmpstring, count) {
    let string = '';

    if (typeof(obj) == 'object') {
      if (obj instanceof Array) {
        string = 'a:';
        tmpstring = '';
        count = 0;
        
        for (let key in obj) {
          tmpstring += phpSerialize(key, tmpstring, count);
          tmpstring += phpSerialize(obj[key], tmpstring, count);
          count++;
        }

        string += count + ':{';
        string += tmpstring;
        string += '}';
      } else if (obj instanceof Object) {
        let classname = obj.toString();

        if (classname == '[object Object]') classname = 'StdClass';

        string = 'O:' + classname.length + ':"' + classname + '":';
        tmpstring = '';
        count = 0;

        for (let key in obj) {
          tmpstring += phpSerialize(key, tmpstring, count);

          if (obj[key]) tmpstring += phpSerialize(obj[key], tmpstring, count);
          else tmpstring += phpSerialize('', tmpstring, count);

          count++;
        }

        string += count + ':{' + tmpstring + '}';
      }
    } else {
      switch (typeof(obj)) {
        case 'number':
          if (obj - Math.floor(obj) != 0) string += 'd:' + obj + ';';
          else string += 'i:' + obj + ';';
          break;
        case 'string':
          string += 's:' + obj.length + ':"' + obj + '";';
          break;
        case 'boolean':
          if (obj) string += 'b:1;';
          else string += 'b:0;';
          break;
      }
    }

    return string;
  }

  function mapThroughMap(map, cb) {
    if (!map || !(map instanceof Map)) return false;
    return Array.from(map, ([key, value]) => value).map(item => cb(item));
  }

  return {
    debounce,
    throttle,
    getWindowWidthEms,
    getUrlQueries,
    generateUrlQueries,
    isTouchDevice,
    turboBind,
    render,
    moneyFormat,
    distanceBetween,
    getPasswordValidator,
    getMagentoErrorMessage,
    getProductVariant,
    onKeyDown,
    setCookie,
    getCookie,
    checkCookie,
    deleteCookie,
    phpSerialize,
    mapThroughMap,
  }
})(jQuery);