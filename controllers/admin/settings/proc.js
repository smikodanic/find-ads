require('rootpath')();
var express = require('express');
var router = express.Router();
var login = require('libraries/accountLoginLib.js');
var proc = require('libraries/procLib.js');


/* view render, callback function*/
var cb_render = function (res, nodeProcesses, pm2Processes) {

  var vdata = {
    nodeProcs: nodeProcesses,
    pm2Procs: pm2Processes
  };

  res.set('Content-Type', 'text/html');
  res.render('./admin/settings/proc', vdata);
};



/* Login FORM */
module.exports = function (router) {

  router.get('/', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {

      proc.isRunning(res, cb_render);

    } else {
      res.redirect('/admin');
    }

  });


  router.get('/start', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {

      proc.start(res);

    } else {
      res.redirect('/admin');
    }

  });


  router.get('/stop', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {

      proc.stop(res);

    } else {
      res.redirect('/admin');
    }

  });


  router.get('/restart', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {

      proc.restart(res, '/admin/settings/cron');

    } else {
      res.redirect('/admin');
    }

  });


  router.get('/del', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {

      proc.del(res, '/admin/settings/cron');

    } else {
      res.redirect('/admin');
    }

  });

};