/*jslint unparam: true*/

require('rootpath')(); //enable requireing modules from application root folder
var express = require('express');
var router = express.Router();
var nodedump = require('nodedump').dump;
var login = require('libraries/accountLoginLib.js');


/* Login FORM */
module.exports = function (router) {

  router.get('/', function (req, res) {

    res.redirect('/admin');
    login.destroy_session(req);

  });

};