/**
 * Functions to start stop and monitor cron crawling
 */
// var pm2 = require('pm2');
var child = require('child_process');
var logg = require('libraries/loggLib');


//settings
require('rootpath')();
var settings = require('settings/admin');
var cronInitFile = settings.cronInitFile; // 1cron/cronInitCrawlers.js




/**
 * Check if /1cron/cronInitCrawlers.js is running by pm2
 */
module.exports.isRunning = function (res, cb_render) {

  child.exec('ps aux | grep -v grep | grep ' + cronInitFile, function (err, cronProcesses) { //get cron processes (linux processes)
    if (err) { logg.byWinston('error', __filename + ':23 ' + err); }

    child.exec('pm2 list', function (err, pm2Processes) {
      if (err) { logg.byWinston('error', __filename + ':26 ' + err); }

      cb_render(res, cronProcesses, pm2Processes);
    });

  });

};


/**
 * Start cron job process with pm2
 */
module.exports.start = function (res) {

  child.exec('pm2 start ' + cronInitFile, function (err, stdOut) {
    if (err) { logg.byWinston('error', __filename + ':42 ' + err); }

    res.redirect('/admin/settings/cron');
  });

};


/**
 * Stop cron job process with pm2
 */
module.exports.stop = function (res) {

  child.exec('pm2 stop ' + cronInitFile, function (err, stdOut) {
    if (err) { logg.byWinston('error', __filename + ':56 ' + err); }

    res.redirect('/admin/settings/cron');
  });

};


/**
 * Restart cron job when updating or inserting task
 */
module.exports.restart = function (res, redirectURL) {

  child.exec('pm2 restart ' + cronInitFile, function (err, stdOut) {
    if (err) { logg.byWinston('error', __filename + ':70 ' + err); }

    res.redirect(redirectURL);
  });

};


/**
 * Delete cron job
 */
module.exports.del = function (res, redirectURL) {

  child.exec('pm2 delete ' + cronInitFile, function (err, stdOut) {
    if (err) { logg.byWinston('error', __filename + ':70 ' + err); }

    res.redirect(redirectURL);
  });

};