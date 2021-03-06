/**
 * Usage of
 * string getHTML([String selector, Boolean outer])
 *
 * Get HTML tags inside selector. If outer = rtue then outer (wrapping) tag is also returned.
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

  //outer option is set to true => returns A tag also
  this.echo(this.getHTML('a:nth-of-type(1)', true)); //<a href="test_slika.html" target="_blank">test_slika.html</a>
});

casper.run();