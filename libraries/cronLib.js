/**
 * Functions to start stop and monitor cron crawling
 */
// var pm2 = require('pm2');
var child = require('child_process');


//settings
require('rootpath')();
var settings = require('settings/admin');
var cronInitFile = settings.cronInitFile; // 1cron/cronInit.js




/**
 * Check if /1cron/cronInit.js is running by pm2
 */
module.exports.isRunning = function (res, cb_render) {

  child.exec('ps aux | grep -v grep | grep ' + cronInitFile, function (err, cronProcesses) { //get cron processes (linux processes)
    if (err) { console.log(err); }

    child.exec('pm2 list', function (err, pm2Processes) {
      if (err) { console.log(err); }

      cb_render(res, cronProcesses, pm2Processes);
    });

  });

};


/**
 * Start cron job process with pm2
 */
module.exports.start = function (res) {

  child.exec('pm2 start ' + cronInitFile, function (err, stdOut) {
    if (err) { console.log(err); }

    res.redirect('/admin/settings/cron');
  });

};


/**
 * Stop cron job process with pm2
 */
module.exports.stop = function (res) {

  child.exec('pm2 stop ' + cronInitFile, function (err, stdOut) {
    if (err) { console.log(err); }

    res.redirect('/admin/settings/cron');
  });

};