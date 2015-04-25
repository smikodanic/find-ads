/*jslint unparam: true*/

/**
 * Insert ad content into MongoDB
 *
 * Command: $node contentToMongo.js classifiedads_com_jobs.js
 */

//requierements
var childProcess = require('child_process');
var MongoClient = require('mongodb').MongoClient;



//input from command line
if (process.argv.length < 3) {
  console.log("ERROR: Use 3 command line parameters. ($node contentToMongo.js classifiedads_com_jobs.js)");
  process.exit();
} else {
  var casperFile = process.argv[2];
}

/**
 * Insertion into MongoDB 'ads' collection
 *
 * @param Object doc [JSON object which will be inserted into MongoDB as document]
 */
function mongoInsert(doc) {
  //MongoDB settings
  var host = "localhost";
  var port = "27017";
  var dbName = "crawler";
  var coll = 'ads';

  MongoClient.connect("mongodb://" + host + ":" + port + "/" + dbName, function (err, db) {

    if (err) {

      console.log('MongoDB connection error2: ' + err);

    } else {

      if (doc !== null) {

        //takes each element (object) from 'ins' Array and insert element into MongoDb collection
        db.collection(coll).insert(doc);

        console.log('New doc inserted into ' + dbName + '.' + coll);
      }
    }

    db.close(function () {
      console.log('MongoDB connection closed!\n');
    });
  });
}



/**
 * Calling CasperJS script
 * Command: casperjs classifiedads_com_jobs.js http://www.classifiedads.com/medical_jobs-ad167111901.htm
 * 
 * @param  Array link_arr2 [array of links e.g. page_urls which will be crawled]
 * @return null
 */
function casperCrawl(link_arr2) {

  //CasperJS settings
  var casperBinFile = '/usr/lib/node_modules/casperjs/bin/casperjs';

  var i = 0;

  setInterval(function () {

    var page_url = link_arr2[i];

    if (i < 20) {

      var casperCommandlineArgs = [
        '../casperjs/' + casperFile, //casper script
        page_url //
      ];

      console.log("\n" + i + '. Crawling ..... ' + page_url);
      console.log('Command: $casperjs ' +  casperCommandlineArgs[0] + ' ' + casperCommandlineArgs[1]);
      childProcess.execFile(casperBinFile, casperCommandlineArgs, function (err, stdout, stderr) {

        if (!err) {
          var doc = JSON.parse(stdout); //convert stdout String into ins Array
          mongoInsert(doc);
        } else {
          console.log(err);
        }

      });

    } else {
      setTimeout(function () {
        process.exit();
      }, 3000);
    }

    i++;

  }, 10000);

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

          // console.log(link_arr2);
          casperCrawl(link_arr2);

          db.close();
        }
      });

    }

  });

}

getLinks();