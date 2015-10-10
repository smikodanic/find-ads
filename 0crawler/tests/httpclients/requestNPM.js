/**
 * Extract data by 'request' NPM module
 * $npm install --save request
 *
 *  - Redirected URLs can be crawled too
 * - Also support https
 *
 * https://www.npmjs.com/package/request
 * https://github.com/request/request
 */

require('rootpath')();
var url = require('url');

//httpclient is NPM request ($npm install request)
var request = require('request');

module.exports.extractData = function (req, res, cb_render) {

  //input vars
  var pageURL = req.body.pageURL;
  var data_type = req.body.data_type;
  var css_selector = req.body.css_selector;

  //URL object
  var url_obj = url.parse(pageURL);

  request({
    url: pageURL,
    qs: {}, //Query string data
    method: 'GET',
    followRedirect: true,
    followAllRedirects: false, //follow non-GET redirects
    maxRedirects: 2,
    removeRefererHeader: false, //remove referer after redirection
    headers: {
      'Host': url_obj.host,
      'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:36.0) Gecko/20100101 Firefox/36.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      // 'Accept-Encoding': 'gzip, deflate',
      'Referer': 'http://www.find-ads.com',
      'Cookie': '',
      'Connection': 'keep-alive'
    }
  }, function (err, res2, htmlDoc) {

    if (err) {
      cb_render(req, res, err);
    } else if (res2.statusCode !== 200) {
      cb_render(req, res, 'ERROR: Response not 200: ' + pageURL + '; Response is:' + res2.statusCode);
    } else {

      //extract data from htmlDoc
      var htmlLib = require('libraries/htmlLib');
      var extractedData = htmlLib.extractData(htmlDoc, data_type, css_selector);

      if (extractedData !== '') {
        cb_render(req, res, 'Status:' + res2.statusCode + '\n\nExtracted Data:\n' + extractedData);
      } else {
        cb_render(req, res, 'Status:' + res2.statusCode + '\n\nExtracted Data:\n' + htmlDoc);
      }

    }

  });


};