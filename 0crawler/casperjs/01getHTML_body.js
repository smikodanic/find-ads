/**
 * Usage of
 * string getHTML([String selector, Boolean outer])
 *
 * Get HTML tags inside selector.
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

//requested URL - comming as command line argument
var req_url = casper.cli.args[0];

//HTML selector
var sel = casper.cli.args[1];

casper.start(req_url, function () {

  //this.echo(this.getHTML()); //returns complete HTML
  this.echo(this.getHTML(sel)); //returns HTML inside selcetor 'sel': for example: body
});

casper.run();