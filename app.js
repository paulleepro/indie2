require('dotenv').config();

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const sassMiddleware = require('node-sass-middleware');
const marked = require('marked');
const hbs = require('hbs');
const hbsutils = require('hbs-utils')(hbs);
const hbsHelpers = require('./utils/hbs-helpers');
const globalData = require('./utils/global-data.js');

const index = require('./routes/index');
const account = require('./routes/account');
const shop = require('./routes/shop');
const articles = require('./routes/articles');
const ingredients = require('./routes/ingredients');
const badIngredients = require('./routes/bad-ingredients');
const diagnosticQuiz = require('./routes/diagnostic-quiz');
const upcomingEvents = require('./routes/upcoming-events');
const stockists = require('./routes/stockists');
const frequentQuestions = require('./routes/frequent-questions');
const careers = require('./routes/careers');
const affiliates = require('./routes/affiliates');
const empower = require('./routes/empower');
const checkout = require('./routes/checkout');
const search = require('./routes/search');
const termsConditions = require('./routes/terms-conditions');
const privacyPolicy = require('./routes/privacy-policy');
const shippingInformation = require('./routes/shipping-information');
const contact = require('./routes/contact');
const resetPassword = require('./routes/reset-password');
const redirects = require('./routes/redirects');
const magento = require('./routes/magento');
const airtable = require('./routes/airtable');

const app = express();

app.disable('x-powered-by');

// if staging env is set ask for user and password
if (process.env.NODE_ENV === 'staging') {

  const basicAuth = require('express-basic-auth');

  app.use(basicAuth({
    users: { 'admin': 'supersecret' },
    challenge: true,
    realm: 'Imb4T3st4pp'
  }));

}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// setup partials
hbsutils.registerPartials(__dirname + '/views/partials');
hbsutils.registerWatchedPartials(__dirname + '/views/partials');

// setup components
hbsutils.registerPartials(__dirname + '/views/components');
hbsutils.registerWatchedPartials(__dirname + '/views/components');

// setup hbs helpers
hbs.registerHelper(hbsHelpers);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser("$p2Ty0uGPI6s"));
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

//api routes before global data
app.use('/magento', magento);
app.use('/airtable', airtable);
//global data
app.use('/', globalData);
//page routes
app.use('/', index);
app.use('/account', account);
app.use('/shop', shop);
app.use('/beauty-articles', articles);
app.use('/ingredients', ingredients);
app.use('/bad-ingredients', badIngredients);
app.use('/diagnostic-quiz', diagnosticQuiz);
app.use('/upcoming-events', upcomingEvents);
app.use('/stockists', stockists);
app.use('/frequent-questions', frequentQuestions);
app.use('/careers', careers);
app.use('/affiliates', affiliates);
app.use('/empower', empower);
app.use('/checkout', checkout);
app.use('/search', search);
app.use('/terms-conditions', termsConditions);
app.use('/privacy-policy', privacyPolicy);
app.use('/shipping-information', shippingInformation);
app.use('/contact', contact);
app.use('/reset-password', resetPassword);

app.use(redirects);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
