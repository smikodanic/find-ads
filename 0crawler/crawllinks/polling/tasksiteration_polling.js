require('rootpath')(); //enable requiring modules from application's root folder
var logg = require('libraries/loggLib.js');
var MongoClient = require('mongodb').MongoClient;

//settings
var sett = require('settings/admin.js');
var dbName = sett.mongo.dbName;
var collNameTask = sett.mongo.dbColl_tasksLnk_iterate;


module.exports.start = function (task_id, cb_outResults) {

  var selector = {"id": task_id};

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.me('error', __filename + ':16 ' + err); }

    db.collection(collNameTask).find(selector).toArray(function (err, moTask_arr) { //get task data using 'task_id'
      if (err) { logg.me('error', __filename + ':19 ' + err); }

      //MongoDB doc object
      var moTask = moTask_arr[0];

      //httpClient is defined inside Mongo collection: linkTasks_*
      var httpClient = require('0crawler/crawllinks/httpclient/' + moTask.httpclientScript);


      //define logg file name and put in moTask object
      moTask.loggFileName = collNameTask + '.' + moTask.id + 'TO' + 'linkQueue_' + moTask.name;
      moTask.loggFileName2 = collNameTask + '.' + moTask.id + 'TO' + 'linkQueue_' + moTask.name + '-results';

      //first logg: header with date
      var msg0 = '--------- START CRAWLING LINKS from ' + collNameTask + '; name=' + moTask.name + '; httpclientScript=' + moTask.httpclientScript;
      logg.craw(false, moTask.loggFileName, msg0);
      logg.craw(true, moTask.loggFileName2, msg0);

      //crawl first pagination page - defined by 'firstURL' variable
      moTask.iteratingurl2 = moTask.firsturl;
      logg.craw(false, moTask.loggFileName, 'First URL to httpClient: ' + moTask.iteratingurl2);
      httpClient.runURL(db, collNameTask, moTask, cb_outResults);




      //iterating through pagination URLs changing variable $1 - defined by 'iteratingURL' variable
      var i = moTask.from$1;
      var intID = setInterval(function () {

        if (i <= moTask.to$1) {

          //http://www.adsuu.com/business-offer-$1/ -> http://www.adsuu.com/business-offer-1/
          moTask.iteratingurl2 = moTask.iteratingurl.replace('$1', i);

          logg.craw(false, moTask.loggFileName, 'URL to httpClient: ' + moTask.iteratingurl2);
          httpClient.runURL(db, collNameTask, moTask, cb_outResults);

        } else {

          clearInterval(intID); //stop crawling

          db.close();

          var timeElapsed = (i * moTask.crawlInterval) / 1000;
          logg.craw(false, moTask.loggFileName, '--------- CRAWL TASK FINISHED: ' + moTask.name + ' (Time elapsed:' + timeElapsed + 'sec)\n\n');

          cb_outResults.end();
        }

        i++;


      }, moTask.crawlInterval);

      //send intID to global scope to be accessible with /stop controller
      global.intId = intID;

    });

  });
};

