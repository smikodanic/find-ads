/**
 * Get links from MongoDB 'linkQueue_*' and sending to httpClient
 * Polling links in time interval defined by setInterval()
 * Polling interval in miliseconds defined by moTask.pollInterval
 */

require('rootpath')(); //enable requiring modules from application's root folder
var logg = require('libraries/loggLib');
var MongoClient = require('mongodb').MongoClient;

var settings = require('settings/admin.js');
var dbName = settings.mongo.dbName;
var collName_tasksCnt = settings.mongo.dbColl_tasksCnt;


/* start polling links from linkQueue_* collection */
module.exports.start = function (task_id, cb_outResults) {

  var selector = {"id": task_id};

  MongoClient.connect(dbName, function (err, db) { //mongoDB connection
    if (err) { logg.byWinston('error', __filename + ':22 ' + err); }

    db.collection(collName_tasksCnt).find(selector).toArray(function (err, moTask_arr) { //get task data using 'task_id' from 'contentTasks'
      if (err) { logg.byWinston('error', __filename + ':25 ' + err); }

      //MongoDB doc object
      var moTask = moTask_arr[0];


      db.collection(moTask.linkQueue).find({}).toArray(function (err, moLinkQue_arr) {
        if (err) { logg.byWinston('error', __filename + ':32 ' + err); }

        /* concat all 'links' arrays in all documents inside linkQueue_* collection */
        var linksAll_arr = [];

        moLinkQue_arr.forEach(function (elem) {
          linksAll_arr = linksAll_arr.concat(elem.links); //concated links
        });



        //define logg file name and put in moTask object
        // moTask.loggFileName = collName_tasksCnt + '.' + task_id + 'FROM' + moTask.linkQueue + 'TO' + moTask.contentCollection;
        moTask.loggFileName = 'crawlingContent_dump';

        //log crawling start
        var msg_start = '--------- CONTENT CRAWLING STARTED in linkQueue_polling.js \ntask ID: ' + collName_tasksCnt + '.' + moTask.id + '\nFROM ' + moTask.linkQueue + ' TO ' + moTask.contentCollection + '; \npollScript=' + moTask.pollScript + '; \nhttpclientScript=' + moTask.httpclientScript + '; \nLinks total:' + linksAll_arr.length;
        logg.craw(false, moTask.loggFileName, msg_start);
        logg.craw(false, 'cronList', msg_start);



        /* Get link by link and extracting content. Inserting extracted content into MongoDB collection. */
        var i = 0;
        var intID = setInterval(function () {

          if (i < linksAll_arr.length) {

            // console.log(i + '. ' + linksAll_arr[i].tekst + ' ' + linksAll_arr[i].href);

            //call httpClient only if URL has http://
            if (linksAll_arr[i] !== undefined && linksAll_arr[i].href.indexOf('http://') !== -1) {

              //get http client script: httpClient_noderequest.js in /0crawler/crawlercontent/httpclient/ directory
              var httpClient = require('0crawler/crawlcontent/httpclient/' + moTask.httpclientScript);

              //logg URL
              logg.craw(false, moTask.loggFileName, i + '. URL to httpClient: ' + linksAll_arr[i].href);

              httpClient.runURL(db, moTask, linksAll_arr[i], i, cb_outResults);

            } else if (linksAll_arr[i] === undefined) {

              logg.craw(false, moTask.loggFileName, 'Bad URL to httpClient: linksAll_arr[i]=' + linksAll_arr[i]);
            } else {

              logg.craw(false, moTask.loggFileName, 'Bad URL to httpClient: ' + linksAll_arr[i].href);
            }

          } else {

            clearInterval(intID); //stop crawling

            db.close();

            var timeElapsed = (i * moTask.pollInterval) / 1000;

            //logg crawling end
            var msg_end = '--------- CONTENT CRAWLING FINISHED after ' + timeElapsed + ' sec; Crawled pages:' + i + ' task:' + collName_tasksCnt + '.' + moTask.id;
            logg.craw(false, moTask.loggFileName, msg_end + '\n');
            logg.craw(false, 'cronList', msg_end);

            //delaying, otherwise logg.craw will not work because cron process will be killed
            setTimeout(cb_outResults.end, 3000);
          }

          i++;

        }, moTask.pollInterval);

        //send intID to global scope to be accessible with /stop controller
        global.intId = intID;

      });

    });

  });
};





/**
 * Test only one URL
 * @param  {string} url           - URL to be tested: http://www.adsuu.com/3-nodejs/
 * @param  {number} task_id       - task ID from contentTasks collection
 * @param  {function} cb_outResults - callback which displays results with res.write() or console.log()
 * @return {undefined}               - no return
 */
module.exports.testOneURL = function (url, task_id, cb_outResults) {

  var selector = {"id": task_id};

  MongoClient.connect(dbName, function (err, db) { //mongoDB connection
    if (err) { logg.byWinston('error', __filename + ':101 ' + err); }

    db.collection(collName_tasksCnt).find(selector).toArray(function (err, moTask_arr) { //get task data using 'task_id' from 'contentTasks'
      if (err) { logg.byWinston('error', __filename + ':104 ' + err); }

      //MongoDB doc object
      var moTask = moTask_arr[0];

      //define link object
      var link = {
        href: url
      };

      //calling once
      var i = 1;
      var intID = setInterval(function () {

        if (i === 1) {

          //get http client script: httpClient_noderequest.js in /0crawler/crawlercontent/httpclient/ directory
          var httpClient = require('0crawler/crawlcontent/httpclient/' + moTask.httpclientScript);
          httpClient.runURL(db, moTask, link, 1, cb_outResults);

        } else {
          clearInterval(intID); //stop crawling

          db.close();

          var timeElapsed = (i * moTask.pollInterval) / 1000;
          console.log('Crawl content finished: ' + moTask.name + ' (Time elapsed:' + timeElapsed + 'sec)\n');
          cb_outResults.end();
        }

        i++;

      }, moTask.pollInterval);


    });

  });
};

