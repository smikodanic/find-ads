/**
 * This file must have X (executing) permission.
 * 
 * Test /crawlcontent/pooling/linkQueue_pooling.js for just one URL.
 * Start crawling from command line: $node linkQueue_cli_testOneURL.js 1 http://old.adsuu.com/142802-webdevelopment/
 */


require('rootpath')();
var MongoClient = require('mongodb').MongoClient;
var logg = require('libraries/loggLib');

//DB settings
var settings = require('settings/admin.js');
var dbName = settings.mongo.dbName;
var collName_tasksCnt = settings.mongo.dbColl_tasksCnt;


//id from from command line process.argv
if (process.argv.length < 4) {
  console.log("ERROR: Use 4 command line parameters like: $node linkQueue_cli_testOneURL.js 1 http://old.adsuu.com/142802-webdevelopment/ \n");
  process.exit();
} else {
  var task_id = parseInt(process.argv[2], 10);  //use parseint to convert string into number
  var url = process.argv[3];
}


//callback: output crawling results to console
var cb_outResults = {
  send: function (rezult) {
    console.log(rezult);
  },
  end: function () {
    process.exit();
  }
};

//callback: output crawling results to null (dont display output)
var cb_outResults_null = {
  send: function () {
    return null;
  },
  end: function () {
    process.exit();
  }
};



/* start crawling from command line */
MongoClient.connect(dbName, function (err, db) { // Connect to MongoDB 'contentTasks' collection to get 'poolScript' value
  if (err) { logg.me('error', __filename + ':53 ' + err); }

  db.collection(collName_tasksCnt).find({"id": task_id}).toArray(function (err, contentTasks_arr) { //get poolScript for a given task ID
    if (err) { logg.me('error', __filename + ':56 ' + err); }

    var poolContentlinks = require('0crawler/crawlcontent/pooling/' + contentTasks_arr[0].poolScript);
    poolContentlinks.testOneURL(url, task_id, cb_outResults);

    db.close(); //close DB connection
  });

});