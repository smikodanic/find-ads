/*jslint unparam: true*/
require('rootpath')();
var express = require('express');
var router = express.Router();
var nodedump = require('nodedump').dump;
var logg = require('libraries/loggLib');



module.exports = function (router) {



  /* homepage */
  router.get('/', function (req, res) {

    //view callback function
    var cb_index = function (res, mo_searchTerms) {

      var vdata = {
        title: 'Find Ads - Search Free Classifieds',
        desc: 'Find Ads is your help when searching free classified ads. All adverts are sorted in categories and subcategories.',
        keywords: 'search classifieds, find ads, search adverts, clasifieds directory',
        h1: 'Find Ads',
        searchTerms: mo_searchTerms
      };

      res.render('public/index', vdata);
    };

    //call model and render homepage
    var searchTerms_model = require('models/searchTerms_model');
    searchTerms_model.listPart(25, res, cb_index);

    //logging visitors
    logg.visitors(req, 'home');
  });




  /* show advert data web page */
  router.get('/:titleURI/cid:cid', function (req, res) {

    //content ID 
    var cid = req.params.cid;

    var cb_advert = function (res, moContent_arr) {
      var vdata = {
        title: moContent_arr[0].extract.title[2],
        desc: moContent_arr[0].extract.title[2],
        keywords: moContent_arr[0].extract.title[2],
        p: moContent_arr[0].extract.description[2]

      };

      res.render('public/advert', vdata);
    };

    //call content model function
    var content_model = require('models/content_model');
    content_model.getDataByCid('content', cid, res, cb_advert);


    //logging visitors
    logg.visitors(req, 'advert');
  });




};