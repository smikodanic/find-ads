/*jslint unparam: true*/

/**
 * Crawl web page www.adsuu.com
 * and put body content into MongoDB db.crawl_cache
 */

var childProcess = require('child_process');
var MongoClient = require('mongodb').MongoClient;

var casperBinFile = '/usr/lib/node_modules/casperjs/bin/casperjs';

var casperCommandlineArgs = [
    '../../casperjs/01getHTML_body.js', //casper script
    'http://www.adsuu.com', //requested web page URL
    'div.futer' //selector
  ];

childProcess.execFile(casperBinFile, casperCommandlineArgs, function (err, stdout, stderr) {

  var ins = {
    "body": stdout
  };

  //insert into MongoDB
  MongoClient.connect("mongodb://localhost:27017/crawler", function (err, db) {

    if (err) {
      console.log('MongoDB Error: ' + err);
    } else {
      if (ins.body !== '') {
        db.collection('all_dump').insert(ins);
        console.log('Inserted into MongoDB collection.');
      }
    }

    db.close(function () {
      console.log('MongoDB connection closed!');
    });
  });

});