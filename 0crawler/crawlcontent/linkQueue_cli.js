/**
 * Start crawling from command line: $node linkQueue_cli.js 2
 * where 2 is the task ID from 'contentTasks' collection
 * Usefull for CRON JOB.
 */


require('rootpath')();
var MongoClient = require('mongodb').MongoClient;
var logg = require('libraries/loggLib');

//DB settings
var settings = require('settings/admin.js');
var dbName = settings.mongo.dbName;
var collName_tasksCnt = settings.mongo.dbColl_tasksCnt;


//id from from command line process.argv
if (process.argv.length < 3) {
  console.log("ERROR: Use 3 command line parameters like: $node linkQueue_cli.js 2 \n");
  process.exit();
} else {
  var task_id = parseInt(process.argv[2], 10); //use parseint to convert string into number
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
MongoClient.connect(dbName, function (err, db) { // Connect to MongoDB 'contentTasks' collection to get 'pollScript' value
  if (err) { logg.byWinston('error', __filename + ':53 ' + err); }

  db.collection(collName_tasksCnt).find({"id": task_id}).toArray(function (err, contentTasks_arr) { //get pollScript for a given task ID
    if (err) { logg.byWinston('error', __filename + ':56 ' + err); }

    var pollContentlinks = require('0crawler/crawlcontent/polling/' + contentTasks_arr[0].pollScript);
    pollContentlinks.start(task_id, cb_outResults);

    db.close(); //close DB connection

    logg.craw(false, 'cronList', '+++ Links crawling: CLI SCRIPT linkQueue_cli.js execute: $node ' + contentTasks_arr[0].pollScript + ' ' + task_id);
  });

});