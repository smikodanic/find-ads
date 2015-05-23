/*jslint unparam: true*/

var express = require('express');
var router = express.Router();
var nodedump = require('nodedump').dump;


module.exports = function (router) {

  router.get('/', function (req, res) {

    var vdata = {
      title: 'Find Ads - Search Free Classifieds',
      desc: 'Find Ads is your help when searching free classified ads. All adverts are sorted in categories and subcategories.',
      keywords: 'search classifieds, find ads, search adverts, clasifieds directory',
      h1: 'Find Ads'
    };

    res.render('public/index', vdata);
  });

};