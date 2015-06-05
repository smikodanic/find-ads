/**
 * Generating Node's child process and execute CasperJS script
 * CasperJS returns complete HTML document. Not part of it.
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
    appDir + '/0crawler/browsers/casper_simple.js',
    pageURL
  ];

  //child process
  childProcess.execFile(casperBinFile, casperCommandlineArgs, function (err, stdout) {
    console.log(err.code);
    if (err.code === 'ENOENT') {
      cb_render(req, res, __filename + ':33 ' + err);
    } else {

      console.log(JSON.stringify(stdout, null, 2));
      var htmlDoc = stdout; //complete HTML from Casper

      $ = cheerio.load(htmlDoc);

      // extract data from pageURL using CSS selectors: text, html, image or URL
      var extractedData;
      if (data_type === 'text') {
        extractedData = $(css_selector).text();
      } else if (data_type === 'html') {
        extractedData = $(css_selector).html();
      } else if (data_type === 'href') {
        extractedData = $(css_selector).attr('href');
      } else if (data_type === 'src') {
        extractedData = $(css_selector).attr('src');
      } else { //data_type === 'attr'
        var css_selector_arr = css_selector.split(',');
        extractedData = $(css_selector_arr[0].trim()).attr(css_selector_arr[1].trim());
      }

      if (extractedData !== '') {
        cb_render(req, res, '\nExtracted Data:\n' + extractedData);
      } else {
        cb_render(req, res, '\nHTML Output:\n' + htmlDoc);
      }
      

    }


  });

};