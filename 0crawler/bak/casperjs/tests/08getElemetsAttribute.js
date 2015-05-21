/**
 * Usage of
 * array getElementsAttribute(String selector, String attribute)
 *
 * Get array of attributes of all tags in document.
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

  // gets href attribute of all A tags:
  /* [
    "test_slika.html",
    "http://play.webdevelopment-tutorials.com/test/test_slika.html",
    "http://www.webdevelopment-tutorials.com",
    "http://www.yahoo.com",
    "ugly.jpg"
  ]
  */
  require('utils').dump(this.getElementsAttribute('a', 'href'));
});

casper.run();