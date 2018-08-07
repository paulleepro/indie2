const marked = require('marked');
const moment = require('moment');
const _ = require('lodash');

module.exports = {
  marked: (data) => {
    // NOTE: What should be default value?
    return data ? marked(data) : null;
  },

  slugify: (string) => {
    return string ? string.toLowerCase().replace(/\s+/g,'-') : "";
  },

  unslugify: (string) => {
    return string ? string.split('-').join(' ') : "";
  },

  encodeURIComponent: (params) => {
    return params ? encodeURIComponent(params) : params;
  },

  alphaNumeric: (string) => {
    return string ? string.replace(/\W/g, '') : "";
  },

  internationalNumber: (string) => {
    return !!string ? "+1" + string.replace(/\W/g, '') : "";
  },

  dateFormat: (string) => {
    return moment(string).format('MMMM DD, YYYY');
  },

  dateTimeFormat: (string) => {
    return moment(string).format('MMMM DD | h:mm A');
  },

  dateGetMonth: (string) => {
    return moment(string).format('MMMM');
  },

  dateGetDay: (string) => {
    return moment(string).format('DD');
  },

  dateGetTime: (string) => {
    return moment(string).format('h:mm A');
  },

  dollarsWithoutCents: (string) => {
    return string ? string.split('.')[0] : "";
  },

  // SOURCE: https://stackoverflow.com/questions/10377700/limit-results-of-each-in-handlebars-js
  limit: (array, limit) => {
    if (!_.isArray(array)) { return []; }
    return _.slice(array, 0, limit);
  },

  slice: (array, start, end) => {
    if (!_.isArray(array)) { return []; }
    return array.slice(start, end);
  },

  hexToRgba: (hex, alpha) => {
    let c;

    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return `rgba(${[(c>>16)&255, (c>>8)&255, c&255].join(',')},${alpha})`;
    }

    return 'rbga(255,255,255,1)';
  },

  truncate: (string, length) => {
    return `${string.substr(0, length)}...`;
  },

  stringify: (obj) => {
    return JSON.stringify(obj);
  },

  moneyFormat: (num) => {
    return `$${parseFloat(num).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}`;
  },

  // SOURCE: https://stackoverflow.com/questions/8853396/logical-operator-in-a-handlebars-js-if-conditional
  ifCond: (v1, operator, v2, options) => {
    switch (operator) {
      case '==':
        return (v1 == v2) ? options.fn(this) : options.inverse(this);
      case '===':
        return (v1 === v2) ? options.fn(this) : options.inverse(this);
      case '!=':
        return (v1 != v2) ? options.fn(this) : options.inverse(this);
      case '!==':
        return (v1 !== v2) ? options.fn(this) : options.inverse(this);
      case '<':
        return (v1 < v2) ? options.fn(this) : options.inverse(this);
      case '<=':
        return (v1 <= v2) ? options.fn(this) : options.inverse(this);
      case '>':
        return (v1 > v2) ? options.fn(this) : options.inverse(this);
      case '>=':
        return (v1 >= v2) ? options.fn(this) : options.inverse(this);
      case '&&':
        return (v1 && v2) ? options.fn(this) : options.inverse(this);
      case '||':
        return (v1 || v2) ? options.fn(this) : options.inverse(this);
      default:
        return options.inverse(this);
    }
  },

  ifEven: (v1, options) => {
    return (v1 % 2) == 0? options.fn(this) : options.inverse(this); 
  },

  ifOdd: (v1, options) => {
    return (v1 % 2) == 0? options.inverse(this) : options.fn(this); 
  }
};
