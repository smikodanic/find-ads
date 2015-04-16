/**
 * Usage of
 * each(Array array, Function fn)
 */
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

var links = [
  'http://www.adsuu.com/',
  'http://yahoo.com/',
  'http://bing.com/'
];

casper.start();

casper.each(links, function (self, link) {
  this.thenOpen(link, function () {
    this.echo(this.getTitle() + " - " + link);
  });
});

casper.run();
