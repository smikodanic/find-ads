/*jslint regexp: true*/

/**
 * ****** Command: $casperjs classifiedads_com_ads.js http://www.classifiedads.com/medical_jobs-ad167111901.htm ********
 * 
 * Get content from classifiedads.com advertising page
 * e.g. from page like http://www.classifiedads.com/medical_jobs-ad167111901.htm
 *
 * This is CasperJS script which output goes to console.
 * Then NodeJS take the output and insert it into MongoDB database.
 */

//casper-browser settings
var casper = require('casper').create({
  verbose: true,
  logLevel: 'error',
  viewportSize: {width: 1600, height: 950},
  pageSettings: {
    loadImages: true,
    loadPlugins: false,
    javascriptEnabled: true,
    userAgent: 'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:36.0) Gecko/20100101 Firefox/36.0'
  }
});

// casper.options.viewportSize = {width: 1600, height: 950};


//input from command line
if (casper.cli.args.length < 1) {
  casper
    .echo("Usage: $casperjs classifiedads_com_ads.js http://www.classifiedads.com/medical_jobs-ad167111901.htm")
    .exit(1);
} else {
  var page_url = casper.cli.args[0];
}

//variables
var content, doc;

//strip HTML tags and clean the text
function strip_tags(str) {
  //remove HTML tags
  str = str.replace(/<\/?[^>]+(>|$)/g, "");

  //remove tab, new line, return
  str = str.replace(/(\t|\n|\r)/gm, "");

  //remove empty spaces from start and end of text
  str = str.trim();

  return str;
}


//Get ad content
function getTitle() {
  return document.querySelector('.itemtitle.beyond-title').innerHTML;
}
function getDescription() {
  return document.querySelector('.description').innerHTML;
}
function getDateCreated() {
  return document.querySelector('html body.ad div#kingwide div#king.flowcon div.nobukkit div.itemmain div.innerlisting section#sidebar.one-third div.widget.nomob table.listing-properties tbody tr td:nth-of-type(2)').innerHTML;
}
function getCity() {
  return document.querySelector('html body.ad div#kingwide div#king.flowcon div.nobukkit div.itemmain div.innerlisting section#main.two-thirds.column-last div#overview.widget div.listing-properties div:nth-of-type(2) span.last').innerHTML;
}


/***** CASPER ****/
casper.start(page_url);

casper.then(function () {
  var title = casper.evaluate(getTitle);
  var description = strip_tags(casper.evaluate(getDescription));
  var city = casper.evaluate(getCity);
  var date_created = casper.evaluate(getDateCreated);

  content = {
    "title": title,
    "description": description
  };

  doc = {
    "page_url": casper.getCurrentUrl(),  //or put just 'page_url' variable
    "content": content,
    "country": "United States",
    "city": city,
    "date_created": date_created
  };

});

casper.run(function () {
  casper.echo(JSON.stringify(doc, null, 4));
  casper.capture('../../tmp/img_captures/classifiedads_com_jobs.png');
  casper.exit();
});