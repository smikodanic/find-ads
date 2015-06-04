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


  /* advert */
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
    content_model.getDataByCid('content_test', cid, res, cb_advert);


    //logging visitors
    logg.visitors(req, 'advert');
  });


};