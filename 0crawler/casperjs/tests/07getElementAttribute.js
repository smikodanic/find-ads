/**
 * Usage of
 * getElementAttribute(String selector, String attribute)
 *
 * Get value of tag attribute.
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

casper.start('http://play.webdevelopment-tutorials.com/test/03links.html', function () {

  // gets href attribute of second A tag: 
  require('utils').dump(this.getElementAttribute('a:nth-of-type(2)', 'href')); //http://play.webdevelopment-tutorials.com/test/test_slika.html
});

casper.run();