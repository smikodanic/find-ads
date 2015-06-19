/*jslint unparam: true*/
require('rootpath')();
var express = require('express');
var router = express.Router();
// var nodedump = require('nodedump').dump;
var logg = require('libraries/loggLib');
var tekstmod = require('libraries/tekstmodLib');
var setGlobal = require('libraries/setGlobalLib');
var countries = require('country-data').countries;



module.exports = function (router) {


  /* homepage */
  router.get('/', function (req, res) {

    //refresh global var dynamically
    setGlobal.latestContent('content', 5);

    //view callback function
    var cb_index = function (res, mo_searchTerms) {

      var vdata = {
        title: 'Find Ads - Search Free Classifieds',
        desc: 'Find Ads is your help when searching free classified ads. All adverts are sorted in categories and subcategories.',
        keywords: 'search classifieds, find ads, search adverts, clasifieds directory',
        searchTerms: mo_searchTerms,
        countries: countries.all
      };

      res.render('public/index', vdata);
    };

    //call model and render homepage
    var searchTerms_model = require('models/searchTerms_model');
    searchTerms_model.listPart(8, res, cb_index);
    //logging visitors
    logg.visitors(req, 'home');
  });




  /* show advert data web page */
  router.get('/:titleURI/cid:cid', function (req, res) {

    //content ID 
    var cid = req.params.cid;

    var cb_advert = function (res, moContent_arr) {

      var vdata;
      if (moContent_arr[0] !== undefined) { //if cid exists

        var title = tekstmod.beautifyText(moContent_arr[0].extract.title[2]);

        vdata = {
          title: title,
          desc: moContent_arr[0].extract.description[2].substring(0, 120),
          keywords: moContent_arr[0].extract.title[2].replace(/\s/, ','),
          content: moContent_arr[0],
          pageURL: moContent_arr[0].pageURL
        };

        res.render('public/advert', vdata);

      } else { //if cid and content dont exist

        vdata = {
          titleURI: req.params.titleURI
        };

        res.status(404).render('404', vdata);
      }

    };


    //call content model function
    var content_model = require('models/content_model');
    content_model.getDataByCid('content', cid, res, cb_advert);


    //logging visitors
    logg.visitors(req, 'advert');
  });




};