/*jslint unparam: true*/

/**
 * Get text from web page and insert into MongoDB
 * via shell script MongoInsert.sh
 */
var childProcess = require("child_process");

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

casper.start('http://play.webdevelopment-tutorials.com/test/03links.html', function () {

  //this.echo(this.getHTML()); //returns complete HTML
  var html_code = this.getHTML('body'); //returns HTML inside body tag

  childProcess.execFile("/bin/bash", ["../../mongodb/MongoInsert.sh", "nest"], null, function (err, stdout, stderr) {
    this.log("execFileSTDOUT:", JSON.stringify(stdout), 'debug');
    this.log("execFileSTDERR:", JSON.stringify(stderr), 'debug');
  });

});

casper.run();