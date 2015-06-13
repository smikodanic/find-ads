/*jslint unparam: true*/
require('rootpath')();
var express = require('express');
var router = express.Router();
// var nodedump = require('nodedump').dump;
var logg = require('libraries/loggLib');
var urlmod = require('libraries/urlmod');



module.exports = function (router) {


  /* browse category */
  router.get('/:cat-id:catId/(:currentPage)?', function (req, res) {

    //input vars
    var cat = req.params.cat; //category

    //transform cat
    var regCat = new RegExp('-', 'ig');
    cat = cat.replace(regCat, ' ');

    //view callback function
    var cb_list = function (res, mo_content, pagination_obj) {

      var vdata = {
        title: 'Find Ads - ' + cat,
        desc: 'Browse classifed ads by categories and its subcategories.',
        keywords: 'browse classifieds, find ads, browse adverts, clasifieds directory, category, subcategory',
        cat: cat,
        contentDocs: mo_content,
        pagination: pagination_obj,
        urlmod: urlmod //library is passed into view
      };

      res.render('public/browse', vdata);
    };


    //call model and render homepage
    var content_model = require('models/content_model');
    content_model.browse('content', req, res, cb_list);

  });

};