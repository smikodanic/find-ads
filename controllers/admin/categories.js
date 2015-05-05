/*jslint unparam: true*/

var express = require('express');
var router = express.Router();
var nodedump = require('nodedump').dump;
var login = require('../../libraries/account_login.js');


/* Login FORM */
module.exports = function (router) {
  router.get('/', function (req, res) {

    res.render('./admin/categories');
  });
};