require('rootpath')();
var express = require('express');
var router = express.Router();
// var nodedump = require('nodedump').dump;
var login = require('libraries/accountLoginLib.js');



module.exports = function (router) {

  router.get('/', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      res.redirect('/admin/tests/httpclient');
    } else {
      res.redirect('/admin');
    }

  });




};