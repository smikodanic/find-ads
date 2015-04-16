/**
 * Usage of
 * base64encode(String url [, String method, Object data])
 */
var casper = require('casper').create({
  verbose: true,
  logLevel: 'error',
  pageSettings: {
    loadImages: false,
    loadPlugins: false,
    javascriptEnabled: false,
    viewportSize: {width: 800, height: 600},
    userAgent: 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.2 Safari/537.36'
  }
});

var base64contents = null;
casper.start('http://play.webdevelopment-tutorials.com/test/05forms.html', function () {
  base64contents = this.base64encode('http://play.webdevelopment-tutorials.com/test/05formsp.php', 'POST', {
    user: 'sasa',
    year: '1971'
  });
});

casper.run(function () {
  this.echo(base64contents).exit();
});