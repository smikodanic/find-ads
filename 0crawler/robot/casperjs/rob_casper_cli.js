/*jslint regexp: true*/

/**
 * ****** Command: $casperjs casper_simple.js http://www.adsuu.com/35-salonapparel/ ********
 * 
 * Get HTML document with CasperJS
 *
 * This is CasperJS script which output goes to console as stdout.
 * After that NodeJS grab casper's stdout.
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


//input from command line (pageURL)
var pageURL;
if (casper.cli.args.length !== 1) {
  casper
    .echo("Usage: $casperjs casper_simple.js http://play.webdevelopment-tutorials.com/test/03links.html")
    .exit(1);
} else {
  pageURL = casper.cli.args[0];
}


/***** CASPER ****/
casper.start(pageURL, function (res2) {

  if (res2.status !== 200) {

    /**
     * IF res2.status = null THEN server not found
     * IF res2.status = 404 THEN web page not found
     */
    casper.echo('Not Found: ' + pageURL + ' res2.status: ' + res2.status);
  } else {

    var htmlDoc = this.getHTML() + ' --statusCode:' + res2.status + '--'; //html doc with added response code
    casper.echo(htmlDoc);

    // var retObj = '{statusCode:' + res2.status + ',htmlDoc: "' + this.getHTML() + '"}';
    // casper.echo(retObj);
  }

});


casper.run(function () {
  casper.exit(1);
});