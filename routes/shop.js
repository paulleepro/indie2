const express = require('express');
const router = express.Router();
const _ = require('lodash');
const axios = require('axios');

const MagentoService = require('../services/magento');
const magento = new MagentoService();

const ContentfulService = require('../services/contentful');
const contentful = new ContentfulService();


router.use((req, res, next) => {
  req.activeSegment = req.path.indexOf('focus') > -1 ? 'focus' : 'ritual';
  next();
});

router.get('/', (req, res, next) => {
  if (req.err) res.render('error', { error: req.err });

  res.redirect('/shop/ritual');
});

router.get('/ritual', (req, res, next) => {
  if (req.err) res.render('error', { error: req.err });

  res.render('shop-all', {
    activeSegment: req.activeSegment,
    route: 'shop',
    title: 'Shop Skincare Ritual | Prepare, Perfect, Prevent, Protect, Boost',
    description: `We believe in keeping routines simple, effective and personal. That’s why we created the 4 Ps and a B ritual. This customizable approach to skincare uses our clean, efficacious formulas to deliver makeup-optional skin. Look for the corresponding icon on each package to determine what is right for you.`
  });
});

router.get('/focus', (req, res, next) => {
  if (req.err) res.render('error', { error: req.err });

  res.render('shop-all', {
    activeSegment: req.activeSegment,
    route: 'shop',
    title: 'Shop Skincare Focus | Face For All, Clarity, Sensitive, Body Basics',
    description: 'Using our iconic color banding, each product category is grouped by skin focus. Combine Ritual icons and Focus colors to create a complete set for your daily skincare needs.'
  });
});

router.get('/ritual/:slug', (req, res, next) => {
  if (req.err) res.render('error', { error: req.err });
  let ritual = Object.values(req.app.locals.appData.segments.ritual).find((i) => i.slug === req.params.slug);

  res.render('shop-category', {
    title: ritual.seoTitle || `Shop by Ritual | ${req.params.slug.replace(/-/g, ' ')}`,
    description: ritual.seoDescription || ritual.description,
    ritual: ritual,
    route: 'shop'
  });
});

router.get('/focus/:slug', (req, res, next) => {
  if (req.err) res.render('error', { error: req.err });
  let focus = Object.values(req.app.locals.appData.segments.focus).find((i) => i.slug === req.params.slug);

  res.render('shop-category', {
    title: focus.seoTitle || `Shop by Focus | ${req.params.slug.replace(/-/g, ' ')}`,
    description: focus.seoDescription || focus.description,
    focus: focus,
    route: 'shop'
  });
});

router.get('/products/:slug', (req, res, next) => {
  if (req.err) res.render('error', { error: req.err });
  req.product = req.app.locals.appData.products[req.params.slug];

  //get products related products api cal, add to beginning of array
  //then get magento api calls for data for all variants
  axios.all([contentful.getRelatedProductsByParentProductSlug(req.params.slug), ...req.product.productVariants.map((v) => magento.getProductBySku(v.fields.sku))])
    .then(axios.spread((relatedProductsRes, ...magentoRes) => {
      res.render('shop-product', {
        productSlug: req.params.slug,
        product: req.product,
        /*
         * magentoRes[n][1].data = inventory
         * magentoRes[n][1].data[0] = 1st warehouse
         * magentoRes[n][1].data[1] = 2nd warehouse
         * note: if either warehouse has product in stock, it can be added to cart
         */
        magento: magentoRes.map(function(prod) {
          return {
            inStock: prod[1].data.length > 1 ? (prod[1].data[0].is_in_stock || prod[1].data[1].is_in_stock) : false, 
            // could be a simple product or a product variant
            product: prod[0].data
          }
        }),
        selectedVariant: req.product.productVariants[0],
        relatedProducts: relatedProductsRes.items[0].fields.relatedProducts,
        route: 'shop',
        title: req.product.seoTitle || `Product | ${req.params.slug.replace(/-/g, ' ')}`,
        description: req.product.seoDescription || req.product.description
      });
    }))
    .catch((err) => {
      console.error(err);
      res.render('error', { error: err });
    });
});

module.exports = router;
