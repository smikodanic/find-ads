/*jslint unparam: true*/

/**
 * Open new casper process '../../casperjs/01getHTML_body.js'
 * get http://www.adsuu.com 
 * and retreive content from div.futer selector
 */

var childProcess = require('child_process');

var casperBinFile = '/usr/lib/node_modules/casperjs/bin/casperjs';

var casperCommandlineArgs = [
    '../../casperjs/01getHTML_body.js', //casper script
    'http://www.adsuu.com', //requested web page URL
    'div.futer' //selector
  ];

childProcess.execFile(casperBinFile, casperCommandlineArgs, function (err, stdout, stderr) {
  console.log(stdout);
});