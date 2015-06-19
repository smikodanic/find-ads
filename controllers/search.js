/*jslint unparam: true*/
require('rootpath')();
var express = require('express');
var router = express.Router();
// var nodedump = require('nodedump').dump;
var logg = require('libraries/loggLib');
var urlmod = require('libraries/urlmod');
var countries = require('country-data').countries;


/* view functions */
var cb_render = function (q, category, country, res, moContent_arr, pagination_obj) {

  //define Country Name
  var countryName;
  if (country !== -1) {
    countryName = countries.all[country].name;
  } else {
    countryName = 'all countries';
  }

  //define Category Name
  var categoryName;
  if (category !== -1) {
    categoryName = GLOBfindads.categories[category].category;
  } else {
    categoryName = 'all categories';
  }

  var vdata = {
    title: 'Find Ads - ' + q,
    desc: 'Find Ads - Search results for query: ' + q,
    keywords: 'search classifieds, find ads, search adverts, clasifieds directory, ' + q,
    q: q,
    categoryName: categoryName,
    countryName: countryName,
    contentDocs: moContent_arr,
    pagination: pagination_obj,
    urlmod: urlmod //library is passed into view
  };

  res.render('public/search', vdata);
};




module.exports = function (router) {


  /* search results from form */
  router.post('/', function (req, res) {

    var content_model = require('models/content_model');
    content_model.homeSearchOut('content', req, res, cb_render);
  });



  /* search results from pagination link */
  router.get('/:q/:category/:country/(:currentPage([0-9]+))?', function (req, res) { //currentPage can only be a number

    var content_model = require('models/content_model');
    content_model.homeSearchOut('content', req, res, cb_render);

    //logging visitors
    logg.visitors(req, 'home-search');
  });



  /* list all search terms */
  router.get('/terms/list/(:currentPage([0-9]+))?', function (req, res) { //currentPage can only be a number

    var cb_terms = function (res, mo_searchTerms, pagination_obj) {
      var vdata = {
        title: 'All serch terms',
        desc: 'List all search queries.',
        keywords: 'search queries, search terms, list of all search terms',
        searchTerms: mo_searchTerms,
        pagination: pagination_obj
      };

      res.render('public/terms', vdata);
    };

    //call model and render homepage
    var searchTerms_model = require('models/searchTerms_model');
    searchTerms_model.listAll(req, res, cb_terms);
  });



};