/**
 * Extract data by CasperJS
 * $npm install -g casperjs
 *
 * - can crawl redirected URL's and AJAX sites
 * - This script is generating child process and call Casper script: $casperjs /browsers/casper_simple.js http://www.adsuu.com
 *
 * http://casperjs.org/
 */
require('rootpath')();
var childProcess = require('child_process');
var cheerio = require('cheerio');

// application dir: /homenode/find-ads/
var sett = require('settings/admin');
var appDir = sett.appDir;



module.exports.casperExtract = function (req, res, cb_render) {

  //input vars
  var pageURL = req.body.pageURL;
  var data_type = req.body.data_type;
  var css_selector = req.body.css_selector;

  //casper exe file
  var casperBinFile = '/usr/lib/node_modules/casperjs/bin/casperjs';

  var casperCommandlineArgs = [
    appDir + '/0crawler/tests/casper/casper_simple.js',
    pageURL
  ];

  //child process
  childProcess.execFile(casperBinFile, casperCommandlineArgs, function (err, stdout) {

    if (err.code === 'ENOENT') {
      cb_render(req, res, __filename + ':33 ' + err);
    } else {

      var htmlDoc = stdout; //complete HTML from Casper

      //extract data from htmlDoc
      var htmlLib = require('libraries/htmlLib');
      var extractedData = htmlLib.extractData(htmlDoc, data_type, css_selector);

      if (extractedData !== '') {
        cb_render(req, res, '\nExtracted Data:\n' + extractedData);
      } else {
        cb_render(req, res, '\nHTML Output:\n' + htmlDoc);
      }


    }


  });

};