/**
 * Functions to start stop and monitor cron crawling
 */
var forever = require('forever');
var child = require('child_process');


//settings
require('rootpath')();
var settings = require('settings/admin');
var cronInitFile = settings.cronInitFile; // 1cron/cronInit.js




/**
 * Check if /1cron/cronInit.js is running by forever
 */
module.exports.isRunning = function (res, cb_render) {

  child.exec('ps aux | grep -v grep | grep ' + cronInitFile, function (err, cronProcesses) { //get cron processes (linux processes)
    if (err) { console.log(err); }

    child.exec('forever list', function (err, foreverProcesses) {

      cb_render(res, cronProcesses, foreverProcesses);
    });

  });

};


/**
 * Start cron job process with forever
 */
module.exports.start = function (res) {

  child.exec('forever start ' + cronInitFile, function (err, stdOut) {
    if (err) { console.log(err); }

    res.redirect('/admin/settings/cron');
  });

};


/**
 * Stop cron job process with forever
 */
module.exports.stop = function (res) {

  child.exec('forever stop ' + cronInitFile, function (err, stdOut) {
    if (err) { console.log(err); }

    res.redirect('/admin/settings/cron');
  });

};