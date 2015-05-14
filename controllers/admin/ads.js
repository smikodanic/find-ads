/*jslint unparam: true*/

require('rootpath')(); //enable requireing modules from application root folder
var express = require('express');
var router = express.Router();
var nodedump = require('nodedump').dump;
var login = require('libraries/account_login.js');

/* CALLBACK VARIATIONS */
var cb_list_Console = function (res, moDocs_arr) {
  console.log(JSON.stringify(moDocs_arr, null, 2));
};
var cb_list_Nodedump = function (res, moDocs_arr) {
  res.send(nodedump(moDocs_arr)).end();
};
var cb_list_Render = function (category, res, moDocs_arr, pagination_obj) {
  var vdata = {
    category: category,
    moDocs_arr: moDocs_arr,
    pagination: pagination_obj
  };
  res.render('./admin/ads', vdata);
};


/* Ads Listing */
module.exports = function (router) {

  router.get('/:category/:currentPage?', function (req, res, next) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {

      //loading model and perform list_ads() method with callback cb_list_*
      var ads_model = require('../../models/ads_model.js');
      ads_model.list_ads(req, res, cb_list_Render);

    } else {
      res.redirect('/admin');
    }

  });






};