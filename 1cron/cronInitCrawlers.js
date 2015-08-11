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
var robotTasks = sett.mongo.dbColl_robotTasks;
var nodeBinFile = sett.nodeBinFile;
var appDir = sett.appDir;


/**
 * Define cron job
 * @param {Object} elem - an object that represent a row in task collection: {id: , name: , category: ....}
 * @param {Number} key - key value of array 'Tasks_arr'
 * @param {Array} job_arr - array of job object created with   new CronJob();
 * @param {String} scriptFilePath - path to the CLI script that will be executed by cron job: '/0crawler/crawllinks/tasksiteration_cli.js'
 */
function defineCron(elem, key, job_arr, scriptFilePath) {

  //logging file
  var loggFileName = 'cronStdout_lastCrawlingDump';

  // executed when job.start(); is invoked
  var onStartExe = function () {

    var cmd = nodeBinFile; // /usr/bin/node
    var args = [
      appDir + scriptFilePath, // /homenode/find-ads/0crawler/crawllinks/tasksiteration_cli.js
      elem.id // 0 | 1 | 2 ...
    ];


    //messaging when cron is started
    var msg_cronStart = '+++++++++ CRON INITIALIZED in cronInitCrawlers.js and spawning process: $' + cmd + ' ' + scriptFilePath + ' ' + elem.id;
    logg.craw(false, 'cronList', msg_cronStart);
    logg.craw(true, loggFileName, msg_cronStart);


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

  /**
   * EXECUTE onStartExe FUNCTION PERIODICALLY
   * @param {String} elem.cron - cron definition (6 fields: sec[0-59] min[0-59] hours[0-23] dayOfMonth[1-31] Months[0-11] dayOfWeek[0-6]):
   * example: 00 30 11 * * 1-5 Runs every weekday (Monday through Friday)at 11:30:00 AM. It does not run on Saturday or Sunday.
   *
   * @param {Function} onStartExe - function that will be called periodically (cron scheduled)
   * @param {Function} onStopExe - function that will be called when we stop cron
   * @param {Boolean} false - true starts cron job right now; false will not start cron job right now 
   * @param {String} timeZone - time zone: Europe/Zagreb
   */
  job_arr[key] = new CronJob(elem.cron, onStartExe, onStopExe, false, timeZone);

}




function cronInitCrawlers(scriptFilePath, collName) {

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':28 ' + err); }

    db.collection(collName).find({}).sort({id: 1}).toArray(function (err, Tasks_arr) { //Tasks from collection defined with 'collName' variable
      if (err) { logg.byWinston('error', __filename + ':31 ' + err); }

      //cron jobs for crawling link
      var job_arr = [];
      Tasks_arr.forEach(function (elem, key) {


        //define cron job
        defineCron(elem, key, job_arr, scriptFilePath);

        //start or stop cron job -depends on cronStatus variable
        if (elem.cronStatus === 'on') {

          job_arr[key].start();

        } else {

          job_arr[key].stop();
        }

      });

      db.close();

    });

  });

}




//execute function
cronInitCrawlers('/0crawler/crawllinks/tasksiteration_cli.js', collLinkTasks); //cron for link crawling
cronInitCrawlers('/0crawler/crawlcontent/linkQueue_cli.js', collContentTasks); //cron for content crawling
cronInitCrawlers('/0crawler/robot/robot_cli.js', robotTasks); //cron for robot crawling

