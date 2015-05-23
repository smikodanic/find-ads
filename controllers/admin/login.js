/*jslint unparam: true*/

require('rootpath')(); //enable requireing modules from application root folder
var express = require('express');
var router = express.Router();
var nodedump = require('nodedump').dump;
var login = require('libraries/accountLoginLib.js');

module.exports = function (router) {
  router.post('/', function (req, res, next) {

    var login_tf = login.checkform_user_pass(req);

    if (login_tf !== false) {

      login.set_session_from_form(req);
      res.redirect('/admin/dashboard');

    } else {

      var vdata = {
        title: 'Login to Admin Area',
        loginerror: true
      };

      res.render('./admin/index', vdata);
    }

  });
};