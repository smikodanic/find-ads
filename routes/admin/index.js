/*jslint unparam: true*/

var express = require('express');
var router = express.Router();
var nodedump = require('nodedump').dump;
var login = require('../../libraries/accountLoginLib.js');


/* Login FORM */
router.get('/', function (req, res) {

  var vdata = {
      title: 'Login to Admin Area',
      loginerror: false
    };

  res.render('./admin/index', vdata);
});


/* Set session from FORM if username and password are ok */
router.post('/', function (req, res, next) {

  var login_tf = login.checkform_user_pass(req);

  if (login_tf !== false) {

    login.set_session_from_form(req);
    res.redirect('/admin/dashboard.html');

  } else {

    var vdata = {
      title: 'Login to Admin Area',
      loginerror: true
    };

    res.render('./admin/index', vdata);
  }

});


/* Logout */
router.get('/logout', function (req, res, next) {

  login.destroy_session(req);
  res.redirect('/admin');

});


/* Dashboard admin page  */
router.get('/dashboard.html', function (req, res, next) {

  //check if username and password are good in session storage
  var sess_tf = login.checksess_user_pass(req);

  if (sess_tf) {
    res.render('./admin/dashboard');
  } else {
    res.redirect('/admin');
  }

});


module.exports = router;
