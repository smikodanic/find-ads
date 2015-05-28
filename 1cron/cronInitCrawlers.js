/**
 * Cron job scheduler for crawling links and content
 * Start it from command line as a separate node process: $pm2 start 1cron/cronInitCrawlers.js
 *
 * node-cron help: https://github.com/ncb000gt/node-cron
 */

require('rootpath')();
var MongoClient = require('mongodb').MongoClient;
var logg = require('libraries/loggLib');
var CronJob = require('cron').CronJob;
var childProcess = require('child_process');

//settings
var sett = require('settings/admin');
var timeZone = sett.timeZone;
var dbName = sett.mongo.dbName;
var collLinkTasks = sett.mongo.dbColl_tasksLnk_iterate;
var collContentTasks = sett.mongo.dbColl_tasksCnt;
var nodeBinFile = sett.nodeBinFile;
var appDir = sett.appDir;


/**
 * Define cron job
 */
function defineCron(elem, key, jobCnt, scriptFilePath) {

  //logging file
  var loggFileName = 'cronStdout_dump';

  // executed when job.start(); is invoked
  var onStartExe = function () {

    var cmd = nodeBinFile; // /usr/bin/node
    var args = [
      appDir + scriptFilePath, // /homenode/find-ads/0crawler/crawllinks/tasksiteration_cli.js
      elem.id // 0 | 1 | 2 ...
    ];

    logg.craw(true, loggFileName, '----- CRON started with: ' + cmd);
    var spawnObj = childProcess.spawn(cmd, args);

    spawnObj.stdout.on('data', function (data) {
      logg.craw(false, loggFileName, 'SPAWN stdout: \n' + data);
    });

    spawnObj.stderr.on('data', function (data) {
      logg.craw(false, loggFileName, '++++++++++ SPAWN stderr: \n' + data);
    });

    spawnObj.on('close', function (code) {
      logg.craw(false, loggFileName, 'SPAWN exited with code: ' + code);
    });

  };

  // executed when job.stop(); is invoked
  var onStopExe = function () {
    logg.byWinston('info', '----- CRON stopped: ' + scriptFilePath);
  };

  //define cron job
  jobCnt[key] = new CronJob(elem.cron, onStartExe, onStopExe, false, timeZone);

}




function cronInitCrawlers(scriptFilePath, collName) {

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':28 ' + err); }

    db.collection(collName).find({}).sort({id: 1}).toArray(function (err, linkTasks_arr) { //link tasks
      if (err) { logg.byWinston('error', __filename + ':31 ' + err); }

      //cron jobs for crawling link
      var jobCnt = [];
      linkTasks_arr.forEach(function (elem, key) {


        //define cron job
        defineCron(elem, key, jobCnt, scriptFilePath);

        //start or stop cron job -depends on cronStatus variable
        if (elem.cronStatus === 'on') {

          jobCnt[key].start();

        } else {

          jobCnt[key].stop();
        }

      });

      db.close();

    });

  });

}




//execute function
cronInitCrawlers('/0crawler/crawllinks/tasksiteration_cli.js', collLinkTasks); //cron link crawling
cronInitCrawlers('/0crawler/crawlcontent/linkQueue_cli.js', collContentTasks); //cron content crawling

