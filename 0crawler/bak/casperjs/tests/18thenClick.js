/**
 * Usage of
 * thenClick(String selector[, Function then])
 *
 * Simulate click event.
 *
 * CAUTION: On target="_blank" will not work.
 *
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

casper.start('http://adsuu.com');

var sel = 'a[href="/advert/post.php"]';
casper.thenClick(sel, function () {
  this.echo('Clicked at ' + this.getElementAttribute(sel, 'href'));
});

casper.wait(5000);

casper.then(function () {
  this.echo('New page is opened!');
  this.echo(this.getHTML('form', true));
});


casper.run();