require('rootpath')();
var express = require('express');
var router = express.Router();
var login = require('libraries/accountLoginLib.js');
var filedir = require('libraries/filedirLib.js');
var sett = require('settings/admin.js');


/* view render, callback function*/
var cb_render = function (res, logDirPath, logDirName) {

  var vdata = {
    logFiles: filedir.listLogFiles(logDirPath), //list of log files inside dirPath
    dirPath: logDirPath, // /homenode/find-ads/tmp/logs/crawler
    logDirName: logDirName //crawler | winston | misc
  };

  res.set('Content-Type', 'text/html');
  res.render('./admin/logs/index.ejs', vdata);
};



/* Login FORM */
module.exports = function (router) {

  router.get('/', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {

      res.redirect('/admin/logs/crawler');

    } else {
      res.redirect('/admin');
    }

  });



  //log files in 'tmp/logs/crawler/' directory
  router.get('/:logDirName', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {

      var logDirName = req.params.logDirName;
      cb_render(res, sett.appDir + '/tmp/logs/' + logDirName + '/', logDirName);

    } else {
      res.redirect('/admin');
    }

  });



  //delete selected log files
  router.post('/delselected', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {

      //POST variables from form
      var dirPath = req.body.dirPath;
      var fileIndexes = req.body.fileIndexes;
      var logDirName = req.body.logDirName;

      filedir.delFiles(dirPath, '.log', fileIndexes);
      // console.log(JSON.stringify(fileIndexes, null, 2));

      res.redirect('/admin/logs/' + logDirName);

    } else {
      res.redirect('/admin');
    }

  });



  //delete all log files
  router.post('/delall', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {

      //POST variables from form
      var dirPath = req.body.dirPath;
      var logDirName = req.body.logDirName;

      filedir.delAllFiles(dirPath, '.log');

      res.redirect('/admin/logs/' + logDirName);

    } else {
      res.redirect('/admin');
    }

  });



  //preview content of log file
  router.get('/preview/:logDirName/:fileName', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {

      //URL variables
      var logDirName = req.params.logDirName;
      var fileName = req.params.fileName;

      //filePath
      var logDirPath = sett.appDir + '/tmp/logs/' + logDirName + '/';
      var filePath = logDirPath + fileName;

      filedir.showFile(filePath, function (err, data) {
        if (err) { throw new Error(err); }

        res.set('Content-Type', 'text/plain');
        res.send(data).end();
      });

    } else {
      res.redirect('/admin');
    }

  });




};