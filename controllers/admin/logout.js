/*jslint unparam: true*/

require('rootpath')(); //enable requireing modules from application root folder
var express = require('express');
var router = express.Router();
var nodedump = require('nodedump').dump;
var login = require('libraries/account_login.js');


/* Login FORM */
module.exports = function (router) {
  router.get('/', function (req, res, next) {

    login.destroy_session(req);
    res.redirect('/admin');

  });
};