/**
 * Usage of
 * evaluate(Function fn[, arg1[, arg2[, …]]])
 *
 * Evaluate operations on DOM.
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

casper.start('http://play.webdevelopment-tutorials.com/test/00ajax_onclick_img.html');

casper.evaluate(function () {
  document.querySelector('button').text('Button text changed!');

  document.querySelector('button').click();
  this.echo('Clicked at ' + this.getElementInfo('button'));
});

casper.wait(3000);

casper.then(function () {
  this.echo('Image is loaded by AJAX!');
  this.echo(this.getHTML('body'));
});


casper.run();