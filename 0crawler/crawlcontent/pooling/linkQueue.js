/**
 * Get links from MongoDB 'linkQueue_*' and sending to httpClient
 */

require('rootpath')(); //enable requiring modules from application's root folder
var logg = require('libraries/logging.js');
var MongoClient = require('mongodb').MongoClient;

var settings = require('settings/admin.js');
var dbName = settings.mongo.dbName;
var collName_tasksCnt = settings.mongo.dbColl_tasksCnt;


module.exports.start = function (task_id, cb_outResults) {

  var selector = {"id": task_id};

  MongoClient.connect(dbName, function (err, db) { //mongoDB connection
    if (err) { logg.me('error', __filename + ':15 ' + err); }

    db.collection(collName_tasksCnt).find(selector).toArray(function (err, moTask_arr) { //get task data using 'task_id' from 'contentTasks'
      if (err) { logg.me('error', __filename + ':18 ' + err); }

      //MongoDB doc object
      var moTask = moTask_arr[0];


      db.collection(moTask.linkQueue).find({}).toArray(function (err, moLinkQue_arr) {
        if (err) { logg.me('error', __filename + ':25 ' + err); }

        /* concat all 'links' arrays in all documents inside linkQueue_* collection */
        var linksAll_arr = [];

        moLinkQue_arr.forEach(function (elem) {
          linksAll_arr = linksAll_arr.concat(elem.links); //concated links
        });


        /* Get link by link and extracting content. Inserting extracted content into MongoDB collection. */
        var i = 0;
        var intID = setInterval(function () {

          if (i < linksAll_arr.length) {

            // console.log(i + '. ' + linksAll_arr[i].tekst + ' ' + linksAll_arr[i].href);

            //call httpClient only if URL has http://
            if (linksAll_arr[i].href.indexOf('http://') !== -1) {

              //get http client script: httpClient_noderequest.js in /0crawler/crawlercontent/httpclient/ directory
              var httpClient = require('0crawler/crawlcontent/httpclient/' + moTask.httpclientScript);

              httpClient.node(db, moTask, linksAll_arr[i], cb_outResults);

            } else {

              logg.me('info', __filename + ':48 Bad URL to httpClient: ' + linksAll_arr[i].href);
            }

          } else {

            clearInterval(intID); //stop crawling

            db.close();

            var timeElapsed = (i * moTask.crawlInterval) / 1000;
            console.log('Crawl content finished: ' + moTask.name + ' (Time elapsed:' + timeElapsed + 'sec)\n');
            cb_outResults.end();
          }

          i++;

        }, moTask.crawlInterval);


      });

    });

  });
};

