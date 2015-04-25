/**
 * ****** Command: $casperjs classifiedads_com_links.js ********
 * 
 * Get all links from web page http://www.classifiedads.com/jobs-15.html
 * and othe pagination web pages
 * Links are defined by: '#page' + x + 'link' e.g. '#page2link'
 *
 * This is CasperJS script which outputs to console array of MongoDB docs.
 * That array is used by NodeJS where NodeJS script insert it into MongoDB database.
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
var start_page = 'http://www.classifiedads.com/jobs-15.html';
var a_selector = '.resultitem > div > a';
var pagination_from = 2;
var pagination_to = 50;

//variables
var links, titles, doc, doc_arr;

//Get ad links - a_tags array is converted into array of href values
function getLinks() {
  var a_tags = document.querySelectorAll('.resultitem > div > a');
  return Array.prototype.map.call(a_tags, function (elem) {
    return 'http:' + elem.getAttribute('href');
  });
}

//get ad titles - a_tags array is converted into array of innerHTML values
function getTitles() {
  var a_tags = document.querySelectorAll('.resultitem > div > a');
  return Array.prototype.map.call(a_tags, function (elem) {
    return elem.innerHTML;
  });
}

//create MongoDB document
function createDoc() {
  doc = {
    "category": "Jobs",
    "page": casper.getCurrentUrl(),
    "ads": {
      "link": links,
      "title": titles
    },
    "casperCrawlScript": "classifiedads_com_jobs.js"
  };
  return doc;
}


/***** CASPER ****/
casper.start(start_page);

casper.then(function () {
  links = casper.evaluate(getLinks);
  titles = casper.evaluate(getTitles);
  doc = createDoc();
  doc_arr = [doc];
});

var x;
for (x = pagination_from; x <= pagination_to; x++) {
  casper.thenClick('#page' + x + 'link', function () {
    links = casper.evaluate(getLinks);
    titles = casper.evaluate(getTitles);
    doc = createDoc();
    doc_arr = doc_arr.concat(doc); //array of MongoDB docs
  });
}

casper.run(function () {
  casper.echo(JSON.stringify(doc_arr, null, 4));
  casper.capture('../tmp/img_captures/testcapture.png');
  casper.exit();
});