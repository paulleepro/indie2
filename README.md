# Indie Lee

Super light Node app with a Contentful CMS.

## Main Stack

**Backend**
* Node
* Express
* Handlebars
* Sass
* Contenful
* Axios

**Frontend**
* jQuery
* Tachyons
* Turbolinks

**Build**
* Gulp

## Local Setup

1. Create your `.env` file in the project root directory and include the following environment variables (request values from another developer):

	```
	NODE_ENV=development
	CONTENTFUL_API_KEY=[API_KEY]
	CONTENTFUL_SPACE_ID=[SPACE_ID]
	MAGENTO_URL=[URL]
	MAGENTO_ACCESS_TOKEN=[ACCESS_TOKEN]
	```

2. Run the following:

	```
	npm install
	npm run dev
	```

## Local Production

To run production on local:

1. Update `NODE_ENV=production` in `.env` 
2. Run the following: 

	```
	npm run start
	```

## Repo Organization

### Server

All serverside files are placed in respective directories at project root. The main Express server runs in `app.js`, using Handlebars to render all views serverside and serve static HTML for SEO.

### Client

Clientside static files should be added to `/public` in their respective folders. Global JS/CSS files are added to the main layout view, and route-specific files are added in the route modules.

### Routes

Routes are packaged individually into controller modules and included on the main `app.js` server. Each route controller handles data fetches and file inclusions. The main layout view is configured to inject the route-specific files as link or script tags.

### Stylesheets

All styles are written in Sass and compiled into CSS using `node-sass-middleware`. The final CSS file is included on the layout view.

## Build Flow

### JS

Gulp imports, transpiles, concatentates, and minifies all JS files into a single `bundle.js` file, which is linked in the layout head.

### CSS

Gulp imports, transpiles and minifies all SASS files into a single `style.min.js` file, which is linked in the layout head.

### Environments

On development, gulp will run its version of `nodemon` to spin up a web server. Otherwise, gulp build task is run, followed by the regulor node process at `www`.

Files are not minified in development and the server global router will serve `bundle.js`. All else, gulp will run the minifier and the server will serve `bundle.min.js`. 

Sourcemaps are included in development and staging for readable debugging, but excluded in production..