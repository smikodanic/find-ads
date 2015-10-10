/**
 * Usage of
 * object getElementInfo(String selector)
 *
 * Get element full data (just one element):
 * {
    "attributes": {
        "align": "left",
        "dir": "ltr",
        "id": "hplogo",
        "onload": "window.lol&&lol()",
        "style": "height:110px;width:276px;background:url(/images/srpr/logo1w.png) no-repeat",
        "title": "Google"
    },
    "height": 110,
    "html": "<div nowrap=\"nowrap\" style=\"color:#777;font-size:16px;font-weight:bold;position:relative;left:214px;top:70px\">France</div>",
    "nodeName": "div",
    "tag": "<div dir=\"ltr\" title=\"Google\" align=\"left\" id=\"hplogo\" onload=\"window.lol&amp;&amp;lol()\" style=\"height:110px;width:276px;background:url(/images/srpr/logo1w.png) no-repeat\"><div nowrap=\"nowrap\" style=\"color:#777;font-size:16px;font-weight:bold;position:relative;left:214px;top:70px\">France</div></div>",
    "text": "France\n",
    "visible": true,
    "width": 276,
    "x": 62,
    "y": 76
   }
 * 
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

  // gets href attribute of third A tag in document:
  /*
  {
    "attributes": {
        "href": "http://www.webdevelopment-tutorials.com",
        "target": "_blank"
    },
    "height": 21,
    "html": "http://www.webdevelopment-tutorials.com",
    "nodeName": "a",
    "tag": "<a href=\"http://www.webdevelopment-tutorials.com\" target=\"_blank\">http://www.webdevelopment-tutorials.com</a>",
    "text": "http://www.webdevelopment-tutorials.com",
    "visible": true,
    "width": 295,
    "x": 8,
    "y": 303
  }
   */
  require('utils').dump(this.getElementInfo('a:nth-of-type(3)'));
});

casper.run();