/**
 * Get links 'robot_linkQueue_*' and sending to httpClient
 * Polling links in time interval defined by setInterval()
 * Polling interval is in miliseconds and defined by moTask.pollInterval
 */

require('rootpath')(); //enable requiring modules from application's root folder
var logg = require('libraries/loggLib');
var MongoClient = require('mongodb').MongoClient;
var timeLib = require('libraries/timeLib');
var urlmod = require('libraries/urlmod');


var settings = require('settings/admin.js');
var dbName = settings.mongo.dbName;
var collName_tasksCnt = settings.mongo.dbColl_robotTasks;


/* start polling links from robot_linkQueue_* collection */
module.exports.start = function (task_id, cb_outResults) {

  var selector = {"id": task_id};

  MongoClient.connect(dbName, function (err, db) { //mongoDB connection
    if (err) { logg.byWinston('error', __filename + ':22 ' + err); }

    db.collection(collName_tasksCnt).find(selector).toArray(function (err, moTask_arr) { //get task data using 'task_id' from 'contentTasks'
      if (err) { logg.byWinston('error', __filename + ':25 ' + err); }

      //MongoDB doc object
      var moTask = moTask_arr[0];

      //define logg file name and put in moTask object
      // moTask.loggFileName = collName_tasksCnt + '.' + task_id + 'FROM' + moTask.linkQueue + 'TO' + moTask.contentCollection;
      moTask.loggFileName = 'robot_dump';

      //log crawling start
      var msg_start = '--------- ROBOT STARTED by rob_linkQueue.js \ntask ID: ' + collName_tasksCnt + '.' + moTask.id + '\nFROM ' + moTask.linkqueueCollection + ' TO ' + moTask.contentCollection + '; \npollScript=' + moTask.pollScript + '; \nhttpclientScript=' + moTask.httpclientScript;
      logg.craw(false, moTask.loggFileName, msg_start);
      logg.craw(false, 'cronList', msg_start);



      /* Get link by link from robot_linkqueu_* and extracting new links and content. 
        new links goes into robot_linkqueue_* and content goes into robot_content. */
      var intID = setInterval(function () {

        /* get links from robot_linkqueue_* collection */
        MongoClient.connect(dbName, function (err, db) {
          if (err) { logg.byWinston('error', __filename + ':47 ' + err); }



          /*
            link selector 
              - select only links with crawlStatus 'pending'
              - select only links which are not deeper then defined in robot_linkqueue_*.crawlDepth
              - if "seedDomainOnly":"yes" then crawl and follow only web pages inside seed domain
           */
          var maxDepth = parseInt(moTask.crawlDepth, 10);
          var seedURL_hostname = urlmod.getHostname(moTask.seedURL);

          var regExpSeed;
          if (moTask.seedDomainOnly === "yes") {
            regExpSeed = new RegExp('.*' + seedURL_hostname + '.*');
          } else {
            regExpSeed = new RegExp('.*');
          }

          var linkSelector = {
            "crawlStatus": "pending",
            "crawlDepth": {$lt: maxDepth},
            "link.href": {$regex: regExpSeed}
          };




          db.collection(moTask.linkqueueCollection).find(linkSelector).sort({lid: 1}).toArray(function (err, moLink_arr) { //robot_linkqueue_* docs
            if (err) { logg.byWinston('error', __filename + ':55 ' + err); }

            var moLink = moLink_arr[0];

            //get http client script: httpClient_noderequest.js in /0crawler/crawlercontent/httpclient/ directory
            if (moLink !== undefined) {

              var httpClient = require('0crawler/robot/httpclient/' + moTask.httpclientScript);
              httpClient.runURL(moTask, moLink, cb_outResults);

            } else {
              clearInterval(intID);

              var msg_end = 'All pending links crawled in ' + moTask.linkqueueCollection + ' at ' + timeLib.nowLocale();
              cb_outResults.send(msg_end);
              cb_outResults.end();
              logg.craw(false, moTask.loggFileName, msg_end);
            }

            db.close();
          });

        });

      }, moTask.pollInterval);

      //send intID to global scope to be accessible with /stop controller
      global.intId = intID;

    });

  });

};