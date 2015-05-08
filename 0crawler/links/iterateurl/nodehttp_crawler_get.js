/**
 * Crawler which uses NodeJS module 'http' -> method http.get(url[, callback])
 * Pages are changed by iterating pagination URLs.
 * For example: http://old.adsuu.com/business-offer-$1/
 */
require('rootpath')(); //enable requiring modules from application's root folder
var category_model = require('models/category_model');
var task_model = require('models/task_model');

var http = require('http');

/* Send error to browser */
var errSend_browser = function (err, res) {
  res.send('nodehttp_crawler.js -:' + err).end();
};


module.exports.crawl = function (res) {

  var req2 = http.get("http://play.webdevelopment-tutorials.com/test/08headers.php", function (res2) {
    if (res2.statusCode !== 200) { errSend_browser('Page not found', res); }
  });

  req2.on('response', function (res2) {

    var body = '';
    res2.on('data', function (chunk) {
      body += chunk;
    });

    res2.on('end', function () {
      // console.log(body);
      res.send(body);
    });
  });

  req2.on('error', function (err) {
    errSend_browser(err, res);
  });

};