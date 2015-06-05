require('rootpath')();
var express = require('express');
var router = express.Router();
// var nodedump = require('nodedump').dump;
var login = require('libraries/accountLoginLib.js');
var filedir = require('libraries/filedirLib.js');


/* view render, callback function */
var cb_render = function (req, res, extractedData) {

  var vdata = {
    httpclients: filedir.listJSFiles('0crawler/tests/httpclients/'),
    extractedData: extractedData,
    req: req //to refill the form
  };

  res.set('Content-Type', 'text/html');
  res.render('./admin/tests/httpclient', vdata);
};




module.exports = function (router) {


  router.get('/', function (req, res) {

    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {

      cb_render(req, res, '');

    } else {
      res.redirect('/admin');
    }

  });



  /* execute script from 0crawler/tests/httpclients/ */
  router.post('/', function (req, res) {

    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {

      var httpclientScript = req.body.httpclientScript; // node-request.js
      var httpClient = require('0crawler/tests/httpclients/' + httpclientScript);

      //determine which httpclient script to test
      if (httpclientScript.indexOf('node') !== -1) { //httpclient: node's http.request module

        httpClient.extractData(req, res, cb_render);

      } else if (httpclientScript.indexOf('casper') !== -1) { //httpclient: casperjs

        httpClient.casperExtract(req, res, cb_render);

      } else {

        cb_render(req, res, 'HTTP Client Script not selected!');

      }


    } else {
      res.redirect('/admin');
    }

  });



};