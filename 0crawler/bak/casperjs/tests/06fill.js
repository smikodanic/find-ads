/**
 * Usage of
 * fill(String selector, Object values[, Boolean submit])
 *
 * Filling HTML forms and submitting.
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

casper.start('http://play.webdevelopment-tutorials.com/test/05forms.html', function () {
  this.fill('form[method="post"]', {
    'user': 'Sasa',
    'year': 1971
  }, true); //true execute form submition
});

casper.then(function () {
  this.echo(this.getHTML());
});

casper.run();