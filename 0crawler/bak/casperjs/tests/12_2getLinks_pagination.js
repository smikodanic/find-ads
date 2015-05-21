/**
 * Get all links from web page http://www.classifiedads.com/real_estate-18.html
 * and other web pages defined with pagination links '#page' + x + 'link' e.g. '#page2link'
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
  var a_tags = document.querySelectorAll('.resultitem > div > a');
  return Array.prototype.map.call(a_tags, function (e) {
    return e.getAttribute('href');
  });
}

casper.start('http://www.classifiedads.com/real_estate-18.html');

casper.then(function () {
  links = this.evaluate(getLinks);
});

var x;
for (x = 2; x <= 7; x++) {
  casper.thenClick('#page' + x + 'link', function () {
    var links2 = this.evaluate(getLinks);
    links = links2.concat(links); //join links2 and links arrays
  });
}


casper.run(function () {
  var i;
  for (i = 0; i < links.length; i++) {
    this.echo(i + '. ' + links[i]);
  }
  this.exit();
});