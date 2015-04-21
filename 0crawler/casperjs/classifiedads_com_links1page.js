/**
 * Get all links from web page http://www.classifiedads.com/real_estate-18.html
 * and other web pages defined with pagination links '#page' + x + 'link' e.g. '#page2link'
 */

//casper-browser settings
var casper = require('casper').create({
  verbose: true,
  logLevel: 'error',
  pageSettings: {
    loadImages: true,
    loadPlugins: false,
    javascriptEnabled: true,
    viewportSize: {width: 1280, height: 1024},
    userAgent: 'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:36.0) Gecko/20100101 Firefox/36.0'
    // userAgent: 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.2 Safari/537.36'
  }
});

//crawling settings
var start_page = 'http://www.classifiedads.com/real_estate-18.html';
var a_selector = '.resultitem > div > a';
var pagination_from = 2;
var pagination_to = 5;
var category = 'Real Estate';

//variables
var links, titles, doc;

//extract a tags and map them into href array
function getHrefs() {
  var a_tags = document.querySelectorAll('.resultitem > div > a');
  return Array.prototype.map.call(a_tags, function (elem) {
    return elem.getAttribute('href');
  });
}

//extract a tags and map them into ad_title array
function getTitles() {
  var a_tags = document.querySelectorAll('.resultitem > div > a');
  return Array.prototype.map.call(a_tags, function (elem) {
    return elem.innerHTML;
  });
}

//create MongoDB document
function createDoc() {
  doc = {
    "category": category,
    "page": casper.getCurrentUrl(),
    "ad_hrefs": links,
    "ad_titles": titles
  };
  return doc;
}


/***** CASPER ****/
casper.start(start_page);

casper.then(function () {
  links = casper.evaluate(getHrefs);
  titles = casper.evaluate(getTitles);
  doc = createDoc();
});

casper.run(function () {
  casper.echo(JSON.stringify(doc, null, 4));
  casper.capture('mojtest.png');
  casper.exit();
});