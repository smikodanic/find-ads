/**
 * Usage of
 * setHttpAuth(String username, String password)
 *
 * Sending username and password for login purposes. 
 * Works on Apache's .htaccess AuthUserFile /home/com_wreetee/www/public_html/.htpasswd 
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

casper.setHttpAuth('sasa_user', 'pass');
casper.open('http://www.adsuu.com/account/adslist.php');

casper.then(function () {
  var h = this.getHTML('body');
  require('utils').dump(h);
});


casper.run();