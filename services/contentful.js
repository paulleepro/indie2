const contentful = require('contentful');

class ContentfulService {
  constructor(){
    let options = {
      // This is the space ID. A space is like a project folder in Contentful terms
      space: process.env.CONTENTFUL_SPACE_ID,
      // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
      accessToken: process.env.CONTENTFUL_API_KEY
    };

    // Use Contentful Preview API for non-production environments
    if (process.env.NODE_ENV !== 'production' && !!process.env.CONTENTFUL_HOST) {
      options.host = process.env.CONTENTFUL_HOST;
    }

    this.client = contentful.createClient(options);
  }

  getGlobalData() {
    return this.client.getEntries({
      'sys.id': "", //contentful globalData buckets id
      'include': '3'
    });
  }

  getContent(entryId) {
    // Using the get entries method to fetch a single entry so that imagery and data is expanded eliminating the need for additional api calls
    return this.client.getEntries({
      'sys.id': entryId,
      'include': '3'
    });
  }

  // Get multiple entries in a single call
  // @entryIds - [Array]
  getContents(entryIds) {
    return this.client.getEntries({
      'sys.id[in]': entryIds.join(","),
      'include': '3'
    });
  }

  // Get a single asset by ID
  getAsset(assetId) {
    return this.client.getAsset(assetId);
  }

  // Get multiple assets in a single call
  // @assetIds - [Array]
  getAssets(assetIds) {
    return this.client.getAssets({
      'sys.id[in]': assetIdsList.join(",")
    });
  }

  getAllProducts() {
    return this.client.getEntries({
      'content_type': 'product',
      'include': '3',
      'fields.disabled[ne]': 'true',
      //Whitelist all fields that won't throw circular reference issues. i.e: related products... that data needs to be fetched in a seperate call

      select: 'fields.name,fields.strapLine,fields.slug,fields.sku,fields.newItem,fields.price,fields.images,fields.secondaryImage,fields.description,fields.ingredients,fields.allIngredients,fields.video,fields.videoTranscript,fields.directions,fields.bestFor,fields.type,fields.quote,fields.aroma,fields.ritual,fields.focus,fields.productVariants,fields.seoTitle,fields.seoDescription'
    });
  }

  getRelatedProductsByParentProductSlug(slug) {
    return this.client.getEntries({
      'content_type': 'product',
      'include': '2',
      'fields.slug': slug,
      select: 'fields.relatedProducts'
    });    
  }

  getAllArticles(options) {
    return this.client.getEntries({
      'content_type': 'article',
      'include': '3',
      'order': '-sys.updatedAt',

      //Whitelist all fields that won't throw circular reference issues. i.e: related products... that data needs to be fetched in a seperate call
      'select': 'fields.title,fields.subTitle,fields.slug,fields.category,fields.publishDate,fields.body,fields.media,fields.author,fields.photographyCredit,fields.pullQuote,fields.productIntro,fields.seoTitle,fields.seoDescription',
      ...options
    });
  }

  getArticlesByCategory(category, options) {
    return this.client.getEntries({
      'content_type': 'article',
      'fields.category.sys.contentType.sys.id': 'articleCategory',
      'fields.category.fields.name': category,
      'include': '3',
      'order': '-sys.updatedAt',
      //Whitelist all fields that won't throw circular reference issues. i.e: related products... that data needs to be fetched in a seperate call
      'select': 'fields.title,fields.subTitle,fields.slug,fields.category,fields.publishDate,fields.body,fields.media,fields.author,fields.photographyCredit,fields.pullQuote,fields.productIntro,fields.seoTitle,fields.seoDescription',
      ...options
    });
  }

  getArticleBySlug(slug) {
    return this.client.getEntries({
      'content_type': 'article',
      'include': '3',
      'fields.slug': slug
    });
  }
  
  getEmpowerArticleBySlug(slug) {
    return this.client.getEntries({
      'content_type': 'empowerArticle',
      'include': '3',
      'fields.slug': slug
    });
  }

  getIngredients(options) {
    return this.client.getEntries({
      'content_type': 'ingredient',
      include: '1',
      ...options
    });
  }
  
  getIngredientBySlug(slug, options) {
    options = options || {};

    return this.client.getEntries({
      'fields.slug': slug,
      content_type: 'ingredient',
      'include': '1',
      ...options
    });
  }

  getDirtyIngredients(options) {
    return this.client.getEntries({
      'content_type': 'dirtyIngredient',
      include: '1',
      ...options
    });
  }

  getEvents(options) {
    return this.client.getEntries({
      'content_type': 'event',
      'include': '3',
      'order': '-fields.date',
      ...options
    });
  }

  getEventsByTag(tag, options) {
    return this.client.getEntries({
      'content_type': 'event',
      'fields.eventTag.sys.contentType.sys.id': 'eventTag',
      'fields.eventTag.fields.name': tag,
      'include': '3',
      'order': '-fields.date',
      ...options
    });
  }

  getEventTags(options) {
    return this.client.getEntries({
      'content_type': 'eventTag',
      'include': '1',
      ...options
    });  
  }

  getEventBySlug(slug, options) {
    options = options || {};

    return this.client.getEntries({
      'fields.slug': slug,
      content_type: 'event',
      'include': '1',
      ...options
    });    
  }

  /* Search */
  
  getProductsByQuery(query) {
    return this.client.getEntries({
      content_type: 'product',
      query: query,
      'fields.disabled[ne]': 'true',
      'include': '3',
      select: 'fields.name,fields.strapLine,fields.slug,fields.sku,fields.newItem,fields.price,fields.images,fields.secondaryImage,fields.description,fields.ingredients,fields.allIngredients,fields.video,fields.directions,fields.bestFor,fields.type,fields.quote,fields.aroma,fields.ritual,fields.focus,fields.productVariants,fields.seoTitle,fields.seoDescription'
    });
  }

  getRitualsByQuery(query) {
    return this.client.getEntries({
      content_type: 'ritual',
      query: query
    });
  }

  getFocusByQuery(query) {
    return this.client.getEntries({
      content_type: 'focus',
      query: query
    });
  }

  getArticlesByQuery(query) {
    return this.client.getEntries({
      content_type: 'article',
      query: query,
      'include': '3',
      select: 'fields.title,fields.slug'
    });
  }

  getIngredientsByQuery(query) {
    return this.client.getEntries({
      content_type: 'ingredient',
      query: query
    });
  }

  getEventsByQuery(query) {
    return this.client.getEntries({
      content_type: 'event',
      query: query
    });
  }
}

module.exports = ContentfulService;