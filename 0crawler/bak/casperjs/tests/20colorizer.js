/**
 * Usage of
 * array getElementsInfo(String selector)
 *
 * Get array of all elements with full data:
 */
var colorizer = require('colorizer').create('Colorizer');

var casper = require('casper').create({
  verbose: true,
  logLevel: 'error',
  pageSettings: {
    loadImages: false,
    loadPlugins: false,
    javascriptEnabled: true,
    viewportSize: {width: 800, height: 600},
    userAgent: 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.2 Safari/537.36'
  }
});

console.log(colorizer.colorize("Hello World info", "INFO"));
console.log(colorizer.colorize("Hello World error", "ERROR"));
console.log(colorizer.colorize("Hello World comment", "COMMENT"));
console.log(colorizer.colorize("Hello World warning", "WARNING"));

casper.exit();