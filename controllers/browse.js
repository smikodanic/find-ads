/*jslint unparam: true*/
require('rootpath')();
var express = require('express');
var router = express.Router();
// var nodedump = require('nodedump').dump;
var logg = require('libraries/loggLib');
var urlmod = require('libraries/urlmod');



module.exports = function (router) {


  /* browse by category */
  router.get('/:cat-id:catId/(:currentPage([0-9]+))?', function (req, res) {

    //input vars
    var inputParams = {
      cat: req.params.cat,
      catId: parseInt(req.params.catId, 10),
      subcat: req.params.subcat,
      subcatKey: parseInt(req.params.subcatKey, 10)
    };

    //transform cat
    var regCat = new RegExp('-', 'ig');
    var cat_title = inputParams.cat.replace(regCat, ' ');

    //view callback function
    var cb_list = function (res, mo_content, pagination_obj) {

      var vdata = {
        title: 'Find Ads in ' + cat_title + ' category',
        desc: 'Browse classifed ads by categories and its subcategories. Current category: ' + cat_title,
        keywords: 'adverts, ads, ' + cat_title + ' category',
        cat_title: cat_title,
        subcat_title: '',
        inputParams: inputParams,
        contentDocs: mo_content,
        pagination: pagination_obj,
        urlmod: urlmod //library is passed into view
      };

      res.render('public/browse', vdata);
    };


    //call model and render homepage
    var content_model = require('models/content_model');
    content_model.browse('content', inputParams, req, res, cb_list);

  });




  /* browse by subcategory */
  router.get('/:cat-id:catId/:subcat-key:subcatKey/(:currentPage([0-9]+))?', function (req, res) {

    //input vars
    var inputParams = {
      cat: req.params.cat,
      catId: parseInt(req.params.catId, 10),
      subcat: req.params.subcat,
      subcatKey: parseInt(req.params.subcatKey, 10)
    };

    //transform cat
    var regCat = new RegExp('-', 'ig');
    var cat_title = inputParams.cat.replace(regCat, ' ');
    var subcat_title = inputParams.subcat.replace(regCat, ' ');

    //view callback function
    var cb_list = function (res, mo_content, pagination_obj) {

      var vdata = {
        title: 'Find Ads in ' + cat_title + ', ' + subcat_title + ' category ' + '(' + pagination_obj.countNum + ')',
        desc: 'Browse classifed ads by categories and its subcategories. Current category: ' + cat_title + ' ' + subcat_title,
        keywords: 'adverts, ads, ' + cat_title + ' category,' + subcat_title + ' subcategory',
        cat_title: cat_title,
        subcat_title: subcat_title,
        inputParams: inputParams,
        contentDocs: mo_content,
        pagination: pagination_obj,
        urlmod: urlmod //library is passed into view
      };

      res.render('public/browse', vdata);
    };


    //call model and render homepage
    var content_model = require('models/content_model');
    content_model.browse('content', inputParams, req, res, cb_list);

  });






};