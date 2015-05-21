/**
 * Usage of
 * open(String location, Object Settings)
 *
 * Sending POST variables.
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

casper.start();

casper.open('http://play.webdevelopment-tutorials.com/test/05formsp.php', {
  method: 'post',
  data: {
    'user': 'sales',
    'year':  1562
  }
});

casper.then(function () {
  var h = this.getHTML('body');
  require('utils').dump(h); //"\n\n\n\n<h3>Variables</h3>\n\nuser: <b>sales</b>\n<br>year: <b>1562</b>\n\n\n\n"
});


casper.run();