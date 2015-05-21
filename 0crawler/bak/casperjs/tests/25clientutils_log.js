/**
 * Usage of
 * __utils__.log)
 */
var __utils__;

var casper = require('casper').create({
  verbose: false,
  logLevel: 'error',
  pageSettings: {
    loadImages: false,
    loadPlugins: false,
    javascriptEnabled: true,
    viewportSize: {width: 800, height: 600},
    userAgent: 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.2 Safari/537.36'
  }
});

casper.start('http://www.adsuusdfas.com').thenEvaluate(function () {
  __utils__.log("Can't load URL!", 'error');
});

casper.run();