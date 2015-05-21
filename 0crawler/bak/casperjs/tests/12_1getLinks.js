/**
 * Get all links from web page http://play.webdevelopment-tutorials.com/test/03links.html
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

var links = [];

function getLinks() {
  var links = document.querySelectorAll('a');
  return Array.prototype.map.call(links, function (e) {
    return e.getAttribute('href');
  });
}

casper.start('http://play.webdevelopment-tutorials.com/test/03links.html');

casper.then(function () {
  links = this.evaluate(getLinks);
});


casper.run(function () {
  // echo results in some pretty fashion
  // this.echo(links.length + ' links found:');
  // this.echo(' - ' + links.join('\n - ')).exit();

  //echo results with JSON function
  this.echo(JSON.stringify(links));
});