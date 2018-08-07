const ContentfulService = require('../services/contentful');
const _ = require('lodash');
const contentful = new ContentfulService();

module.exports = (req, res, next) => {
  if (req.err) res.render('error', { error: req.err });

  if (req.app.locals.productsInitialized) {
    next();
  } else {
    req.app.locals.bundleJS = process.env.NODE_ENV === 'development' ? 'bundle.js' : 'bundle.min.js';
    req.app.locals.productsInitialized = true;

    contentful.getAllProducts()
      .then((data) => {
        req.app.locals.appData = {
          products: {},
          segments: {
            ritual: {},
            focus: {}
          }
        };
    
        //build segments
        _.forEach(data.items, (prod, i) => { 
          _.set(req.app.locals.appData.products, prod.fields.slug, prod.fields);
          
          _.forEach(prod.fields.ritual, (rit) => { buildSegment('ritual', rit, prod) });
          _.forEach(prod.fields.focus, (foc) => { buildSegment('focus', foc, prod) });
        });

        //sort segments as per client
        _.forEach(req.app.locals.appData.segments.ritual, (rit) => {
          //sort each ritual by products focus
          let face = [],
              clarity = [],
              sensitive = [],
              repair = [],
              body = [];

          _.forEach(rit.products, (prod) => {
            switch (prod.focus[0].fields.name) {
              case "Face For All":
                face.push(prod);
                break;
              case "Clarity":
                clarity.push(prod);
                break;
              case "Sensitive":
                sensitive.push(prod);
                break;
              case "Repair + Renewal":
                repair.push(prod);
                break;
              case "Body Basics":
                body.push(prod);
                break;
            }
          })
          rit.products = [...face, ...clarity, ...sensitive, ...repair, ...body];
        });

        _.forEach(req.app.locals.appData.segments.focus, (foc) => {
          //sort each ritual by products focus
          let prepare = [],
              perfect = [],
              prevent = [],
              protect = [],
              boost = [];

          _.forEach(foc.products, (prod) => {
            switch (prod.ritual[0].fields.name) {
              case "Prepare":
                prepare.push(prod);
                break;
              case "Perfect":
                perfect.push(prod);
                break;
              case "Prevent":
                prevent.push(prod);
                break;
              case "Protect":
                protect.push(prod);
                break;
              case "Boost":
                boost.push(prod);
                break;
            }
          })
          foc.products = [...prepare, ...perfect, ...prevent, ...protect, ...boost];
        });
    
        next();
      })
      .catch((error) => {
        req.err = error;
        console.error('error: get all products contentful', req.err);
        res.render('error', { error: req.err });
      });
  }

  function buildSegment(segmentType, segment, item) {
    let segmentName = segment.fields.name.toLowerCase();

    if (_.isUndefined(req.app.locals.appData.segments[segmentType][segmentName])) { 
      req.app.locals.appData.segments[segmentType][segmentName] = 
      {
        name: segment.fields.name,
        description: segment.fields.description,
        slug: segment.fields.slug,
        icon: segment.fields.icon,
        detailedIcon: segment.fields.detailedIcon,
        hexColor: segment.fields.hexColor,
        mobileBackground: segment.fields.mobileBackground,
        products: [],
        seoTitle: segment.fields.seoTitle,
        seoDescription: segment.fields.seoDescription,
        featuredProducts: segment.fields.featuredProducts
      };
    }

    req.app.locals.appData.segments[segmentType][segmentName].products.push(item.fields);
  }
};