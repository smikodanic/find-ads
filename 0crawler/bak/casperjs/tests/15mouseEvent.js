/**
 * Usage of
 * mouseEvent(String type, String selector)
 *
 * Simulate mouse event.
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

casper.then(function () {
  var sel = '.boks2 a:nth-of-type(1)';
  this.mouseEvent('click', sel);
  this.echo('Clicked at ' + this.getElementAttribute(sel, 'href'));
});

casper.then(function () {
  this.echo('New page is opened!');
  this.echo(this.getHTML('h1', true));
});


casper.run();