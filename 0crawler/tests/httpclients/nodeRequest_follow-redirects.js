/**
 * Extract data by 'follow-redirects' NPM module
 * $npm install --save request
 *
 * - can crawl redirected URL's
 *
 * https://www.npmjs.com/package/follow-redirects
 */

require('rootpath')();
var url = require('url');

//'follow-redirects' module is used insted of 'http' module
var http = require('follow-redirects').http;
var https = require('follow-redirects').https;

/**
 * HTTP client created by NodeJS module - http.request()
 * @param  {object} req      - request object
 * @param  {object} res      - response object
 * @param  {function} cb_render - callback function for displaying results in browser or console
 * @return {object}               null
 */
module.exports.extractData = function (req, res, cb_render) {

  //input vars
  var pageURL = req.body.pageURL;
  var data_type = req.body.data_type;
  var css_selector = req.body.css_selector;

  //url object
  var url_obj = url.parse(pageURL);

  //HTTP client options
  var options = {
    hostname: url_obj.host,
    port: 80,
    path: url_obj.path,
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:36.0) Gecko/20100101 Firefox/36.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      // 'Accept-Encoding': 'gzip, deflate'
    }
  };


  // HTTP request using NodeJS 'http' module (http.request)
  var req2 = http.request(options, function (res2) {
      if (res2.statusCode !== 200) { cb_render(req, res, 'ERROR: Response not 200: ' + pageURL + '; Response is:' + res2.statusCode); }

      //get htmlDoc from chunks of data
      var htmlDoc = '';
      res2.on('data', function (chunk) {
        htmlDoc += chunk;
      });

      res2.on('end', function () {

        //extract data from htmlDoc
        var htmlLib = require('libraries/htmlLib');
        var extractedData = htmlLib.extractData(htmlDoc, data_type, css_selector);

        if (extractedData !== '') {
          cb_render(req, res, 'Status:' + res2.statusCode + '\n\nExtracted Data:\n' + extractedData);
        } else {
          cb_render(req, res, 'Status:' + res2.statusCode + '\n\nExtracted Data:\n' + htmlDoc);
        }

      });

    });


  req2.on('error', function (err) {
    cb_render(req, res, 'http.request error: ' + err + ' pageURL:' + pageURL);
  });

  req2.end();


};