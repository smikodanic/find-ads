/*jslint unparam: true*/

var express = require('express');
var router = express.Router();
var nodedump = require('nodedump').dump;
var login = require('../../../libraries/account_login.js');


module.exports = function (router) {

  router.get('/', function (req, res, next) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      res.render('./admin/tasks/links');
    } else {
      res.redirect('/admin');
    }

  });


  router.get('/iterateurl', function (req, res, next) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      res.render('./admin/tasks/links_iterateurl');
    } else {
      res.redirect('/admin');
    }

  });
};
