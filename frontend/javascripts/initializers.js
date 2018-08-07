// initializes front end scripts and libraries globally
(() => {
    // start turbolinks
    Turbolinks.start();
    // import isomorphic hbs helpers for frontend also
    Handlebars.registerHelper(require('../../utils/hbs-helpers.js'));
})();