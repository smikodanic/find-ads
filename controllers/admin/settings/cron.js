require('rootpath')();
var express = require('express');
var router = express.Router();
// var nodedump = require('nodedump').dump;
var login = require('libraries/accountLoginLib.js');
var cron = require('libraries/cronLib.js');


/* view render, callback function*/
var cb_render = function (res, cronProcesses, pm2Processes) {

  var vdata = {
    cronProcs: cronProcesses,
    pm2Procs: pm2Processes
  };

  res.set('Content-Type', 'text/html');
  res.render('./admin/settings/cron', vdata);
};



/* Login FORM */
module.exports = function (router) {

  router.get('/', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {

      cron.isRunning(res, cb_render);

    } else {
      res.redirect('/admin');
    }

  });


  router.get('/start', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {

      cron.start(res);

    } else {
      res.redirect('/admin');
    }

  });


  router.get('/stop', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {

      cron.stop(res);

    } else {
      res.redirect('/admin');
    }

  });


  router.get('/restart', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {

      cron.restart(res, '/admin/settings/cron');

    } else {
      res.redirect('/admin');
    }

  });


  router.get('/del', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {

      cron.del(res, '/admin/settings/cron');

    } else {
      res.redirect('/admin');
    }

  });

};