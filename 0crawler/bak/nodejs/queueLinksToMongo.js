/*jslint unparam: true*/

/**
 * Insert links into MongoDB
 *
 * Command: $node queueLinksToMongo.js classifiedads_com_jobs_links.js
 */

//requierements
var childProcess = require('child_process');
var MongoClient = require('mongodb').MongoClient;


//input from command line
if (process.argv.length < 3) {
  console.log("ERROR: Use 3 command line parameters. ($node queueLinksToMongo.js classifiedads_com_jobs_links.js)");
  process.exit();
} else {
  var casperFile = process.argv[2];
}

//CasperJS settings
var casperBinFile = '/usr/lib/node_modules/casperjs/bin/casperjs';
var casperCommandlineArgs = [
    '../casperjs/' + casperFile //casper script
  ];


//MongoDB settings
var host = "localhost";
var port = "27017";
var dbName = "crawler";
var requiredCollection = "link_queue";



childProcess.execFile(casperBinFile, casperCommandlineArgs, function (err, stdout, stderr) {

  var ins = JSON.parse(stdout); //convert stdout String into ins Array

  // console.log(ins);

  //insert 'ins' Array into MongoDB
  MongoClient.connect("mongodb://" + host + ":" + port + "/" + dbName, function (err, db) {

    if (err) {

      console.log('MongoDB Error: ' + err);

    } else {

      if (ins !== null) {

        //create unique index
        db.collection(requiredCollection).createIndex({"page": 1}, {unique: true});

        //takes each element (object) from 'ins' Array and insert element into MongoDb collection
        ins.forEach(function (elem_obj) { db.collection(requiredCollection).insert(elem_obj); });

        console.log('\nInsertion into collection: ' + requiredCollection);
      }
    }

    db.close(function () {
      console.log('MongoDB connection closed!');
    });
  });

});