/**
 * Cron job scheduler for crawling links and content
 * Start it from command line as a separate node process: $pm2 start 1cron/cronInit.js
 *
 * node-cron help: https://github.com/ncb000gt/node-cron
 */

require('rootpath')();
var MongoClient = require('mongodb').MongoClient;
var logg = require('libraries/logging.js');
var time = require('libraries/timeLib.js');
var CronJob = require('cron').CronJob;
var childProcess = require('child_process');

//settings
var sett = require('settings/admin');
var timeZone = sett.timeZone;
var dbName = sett.mongo.dbName;
var collLinkTasks = sett.mongo.dbColl_tasks1;
var collContentTasks = sett.mongo.dbColl_tasksCnt;
var nodeBinFile = sett.nodeBinFile;





/* Activate content tasks */
MongoClient.connect(dbName, function (err, db) {
  if (err) { logg.me('error', __filename + ':29 ' + err); }

  db.collection(collContentTasks).find({}).sort({id: 1}).toArray(function (err, contentTasks_arr) { //content tasks
    if (err) { logg.me('error', __filename + ':32 ' + err); }

    //cron jobs for crawling content
    var jobCnt = [];
    contentTasks_arr.forEach(function (elem, key) {

      console.log(elem.id);

      // executed when job.start(); is invoked
      function onStartExe() {

        logg.me('info', 'Cron job started: ' + elem.name + ' at ' + time.nowLocale());

        var cmdLineArgs = [
          '../0crawler/crawlcontent/linkQueue_cli.js',
          elem.id
        ];

        childProcess.execFile(nodeBinFile, cmdLineArgs, function (err, stdout) {
          if (err) { console.log(err); }

          console.log(stdout);
        });

      }

      // executed when job.stop(); is invoked
      var onStopExe = function () {
        logg.me('info', 'Cron job stopped: ' + elem.name + ' at ' + time.nowLocale());
      };




      //define cron job
      jobCnt[key] = new CronJob(elem.cron, onStartExe, onStopExe, false, timeZone);




      //start or stop cron job -depends on cronStatus variable
      if (elem.cronStatus === 'on') {

        console.log('Start job: ' + elem.name);
        jobCnt[key].start();

      } else {

        jobCnt[key].stop();

      }

    });

  });

});




setInterval(function () {
  console.log(new Date().toLocaleString());
}, 1000);

