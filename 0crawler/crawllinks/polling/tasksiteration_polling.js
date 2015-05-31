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
    if (err) { logg.byWinston('error', __filename + ':16 ' + err); }

    db.collection(collNameTask).find(selector).toArray(function (err, moTask_arr) { //get task data using 'task_id'
      if (err) { logg.byWinston('error', __filename + ':19 ' + err); }

      //MongoDB doc object
      var moTask = moTask_arr[0];

      //httpClient is defined inside Mongo collection: linkTasks_*
      var httpClient = require('0crawler/crawllinks/httpclient/' + moTask.httpclientScript);



      //define logg file name and put in moTask object
      moTask.loggFileName = 'crawlingLinks_dump';

      //log crawling start
      var msg_start = '--------- LINKS CRAWLING STARTED in tasksiteration.js \ntask ID: ' + collNameTask + '.' + moTask.id + '\nFROM ' + collNameTask + ' TO linkQueue_' + moTask.name + '\nhttpclientScript=' + moTask.httpclientScript;
      logg.craw(false, moTask.loggFileName, msg_start);
      logg.craw(false, 'cronList', msg_start);




      //crawl first pagination page - defined by 'firstURL' variable
      moTask.iteratingurl2 = moTask.firsturl;
      logg.craw(false, moTask.loggFileName, '0. First URL to httpClient: ' + moTask.iteratingurl2);
      httpClient.runURL(db, collNameTask, moTask, cb_outResults);




      //iterating through pagination URLs changing variable $1 - defined by 'iteratingURL' variable
      var i = parseInt(moTask.from$1, 10);
      var intID = setInterval(function () {

        if (i <= parseInt(moTask.to$1, 10)) {

          //http://www.adsuu.com/business-offer-$1/ -> http://www.adsuu.com/business-offer-1/
          moTask.iteratingurl2 = moTask.iteratingurl.replace('$1', i);

          logg.craw(false, moTask.loggFileName, i + '. URL to httpClient: ' + moTask.iteratingurl2);
          httpClient.runURL(db, collNameTask, moTask, cb_outResults);

        } else {

          clearInterval(intID); //stop crawling

          db.close();

          var timeElapsed = (i * moTask.crawlInterval) / 1000;
          var msg_end = '--------- LINKS CRAWLING FINISHED after ' + timeElapsed + ' sec; Crawled pages:' + i + ' task:' + collNameTask + '.' + moTask.id;
          logg.craw(false, moTask.loggFileName, msg_end + '\n');
          logg.craw(false, 'cronList', msg_end);


          //delaying, otherwise logg.craw will not work because cron process will be killed
          setTimeout(cb_outResults.end, 3000);
        }

        i++;


      }, moTask.crawlInterval);

      //send intID to global scope to be accessible with /stop controller
      global.intId = intID;

    });

  });
};

