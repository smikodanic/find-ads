require('rootpath')(); //enable requireing modules from application root folder
var express = require('express');
var router = express.Router();
var childProcess = require('child_process');
var login = require('libraries/account_login.js');

//settings
var settings = require('settings/admin.js');

module.exports = function (router) {


  /*
   * Test One URL for content crawling
   */
  router.get('/oneurl/(:task_id/:linkQueue)?', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {

      var vdata = {
        task_id: req.params.task_id,
        linkQueue: req.params.linkQueue
      };

      res.render('admin/crawlcontent/testOneurl', vdata);

    } else {
      res.redirect('/admin');
    }

  });

  //controller for iframe console in /views/admin/crawlcontent/testOneurl.ejs - fill IFRAME's src attribute with this URL
  router.get('/oneurl/childprocess/:task_id/:url', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {

      //input from URL
      var task_id = req.params.task_id;
      var url = req.params.url;
      url = decodeURIComponent(url);

      /* create child process and execute file */
      // var jsFile = './0crawler/crawlcontent/proba.js';
      var jsFile = './0crawler/crawlcontent/linkQueue_cli_testOneURL.js';
      var cmdLineArgs = [jsFile, task_id, url];

      //start child process
      childProcess.execFile(settings.nodeBinFile, cmdLineArgs, function (err, stdout) {

        res.set({
          'Content-Type': 'text/plain'
        });

        if (!err) {
          res.send(stdout).end();
        } else {
          res.send(' ' + err).end();
        }

      });

    } else {
      res.redirect('/admin');
    }

  });


};
