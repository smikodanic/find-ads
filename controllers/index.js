/*jslint unparam: true*/

var express = require('express');
var router = express.Router();
var nodedump = require('nodedump').dump;


module.exports = function (router) {

  router.get('/', function (req, res, next) {
    res.render('public/index');
  });

};