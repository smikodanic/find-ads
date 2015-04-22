/*jslint unparam: true*/

/**
 * Insert ad content into MongoDB
 *
 * Command: $node contentToMongo.js classifiedads_com_jobs.js
 */

//requierements
var childProcess = require('child_process');
var MongoClient = require('mongodb').MongoClient;


function casper(link_arr2) {

  //CasperJS settings
  var casperBinFile = '/usr/lib/node_modules/casperjs/bin/casperjs';
  var casperCommandlineArgs = [
      '../casperjs/' //casper script
    ];

  childProcess.execFile(casperBinFile, casperCommandlineArgs, function (err, stdout, stderr) {

  // var ins = JSON.parse(stdout); //convert stdout String into ins Array
  // var ins = JSON.parse(stdout);

  // console.log(ins);

  });
}




/**
 * Mongodb - get links from 'link_queue' collection
 * @return null
 */
function getLinks() {

  //MongoDB settings
  var host = "localhost";
  var port = "27017";
  var dbName = "crawler";

  MongoClient.connect("mongodb://" + host + ":" + port + "/" + dbName, function (err, db) {

    if (err) {
      console.log('MongoDB connection error: ' + err);
    } else {

      //get link from 'link_queue'
      db.collection('link_queue').find({}).toArray(function (err, docs) {

        if (err) {
          console.log('MongoDb find error: ' + err);
        } else {

          var link_arr2 = [];
          docs.forEach(function (doc) {
            var link_arr = doc.ads.link;
            link_arr2 = link_arr2.concat(link_arr);
          });

          console.log(link_arr2);

          db.close();
        }
      });

    }

  });

}

getLinks();