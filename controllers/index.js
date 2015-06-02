/*jslint unparam: true*/
require('rootpath')();
var express = require('express');
var router = express.Router();
var nodedump = require('nodedump').dump;
var logg = require('libraries/loggLib');


/* view functions */
var cb_render = function (q, res, moContent_arr, pagination_obj) {

  var vdata = {
    title: 'Find Ads - ' + q,
    desc: 'Find Ads - Search results for query: ' + q,
    keywords: 'search classifieds, find ads, search adverts, clasifieds directory, ' + q,
    q: q,
    contentDocs: moContent_arr,
    pagination: pagination_obj
  };

  res.render('public/search', vdata);
};




module.exports = function (router) {

  /* homepage */
  router.get('/', function (req, res) {

    var vdata = {
      title: 'Find Ads - Search Free Classifieds',
      desc: 'Find Ads is your help when searching free classified ads. All adverts are sorted in categories and subcategories.',
      keywords: 'search classifieds, find ads, search adverts, clasifieds directory',
      h1: 'Find Ads'
    };

    res.render('public/index', vdata);
    // res.send(nodedump(req)).end();

    //logging visitors
    logg.visitors(req, 'home');
  });



  /* search results from form */
  router.post('/search', function (req, res) {

    var q;
    if (req.body.q !== '') { //q comes from FORM via POST
      q = req.body.q;
    } else {
      q = 'all';
    }

    var content_model = require('models/content_model');
    content_model.homeSearchOut(q, req, res, cb_render);
  });


  /* search results from pagination link */
  router.get('/search/:q/(:currentPage)?', function (req, res) {

    var q;
    if (req.params.q !== '') { //q comes from FORM via POST
      q = req.params.q;
    } else {
      q = 'all';
    }

    var content_model = require('models/content_model');
    content_model.homeSearchOut(q, req, res, cb_render);

    //logging visitors
    logg.visitors(req, 'home-search');
  });



};