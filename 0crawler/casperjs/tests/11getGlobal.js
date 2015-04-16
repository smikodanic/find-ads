/**
 * Usage of
 * string getGlobal(String name)
 *
 * Get global browser property. For example: window.innerWidth
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

casper.start('http://play.webdevelopment-tutorials.com/test/03links.html', function () {

  // get all global vars: history, location
  require('utils').dump(this.getGlobal('navigator')); // document.cookie will not work
});

casper.run();

/*
getGlobal('location')
{
    "origin": "http://play.webdevelopment-tutorials.com",
    "hash": "",
    "href": "http://play.webdevelopment-tutorials.com/test/03links.html",
    "pathname": "/test/03links.html",
    "hostname": "play.webdevelopment-tutorials.com",
    "protocol": "http:",
    "port": "",
    "host": "play.webdevelopment-tutorials.com",
    "search": ""
}

getGlobal('navigator')
{
    "cookieEnabled": true,
    "language": "en-US",
    "productSub": "20030107",
    "product": "Gecko",
    "appCodeName": "Mozilla",
    "mimeTypes": {
        "length": 0
    },
    "vendorSub": "",
    "vendor": "Apple Computer, Inc.",
    "platform": "Linux i686",
    "appName": "Netscape",
    "appVersion": "5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.2 Safari/537.36",
    "userAgent": "Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.2 Safari/537.36",
    "plugins": {
        "length": 0
    },
    "onLine": false
}

getGlobal('screen')
{
    "availTop": 0,
    "width": 1024,
    "availHeight": 768,
    "height": 768,
    "availWidth": 1024,
    "availLeft": 0,
    "colorDepth": 32,
    "pixelDepth": 32
}
 */