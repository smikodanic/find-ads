/*jslint unparam: true*/
/**
 * Functions to start stop and monitor cron crawling
 *
 * Start the crawler with: $pm2 start bin/www -n 'crawler'
 */

require('rootpath')();
var child = require('child_process');
var logg = require('libraries/loggLib');
var pm2 = require('pm2');




/**
 * Check if node is running by pm2
 */
module.exports.isRunning = function (res, cb_render) {

  child.exec('ps aux | grep node', function (err, nodeProcesses) { //get node processes (linux processes)
    if (err) { logg.byWinston('error', __filename + ':19 ' + err); }

    child.exec('pm2 list', function (err, pm2Processes) {
      if (err) { logg.byWinston('error', __filename + ':21 ' + err); }

      cb_render(res, nodeProcesses, pm2Processes);
    });

  });

};


/**
 * Start cron job process with pm2
 */
module.exports.start = function (res) {

  // child.exec('pm2 start crawler', function (err, stdOut) {
  //   if (err) { logg.byWinston('error', __filename + ':37 ' + err); }

  //   res.redirect('/admin/settings/proc');
  // });

  res.redirect('/admin/settings/proc');

};


/**
 * Stop cron job process with pm2
 */
module.exports.stop = function (res) {

  // child.exec('pm2 stop crawler', function (err, stdOut) {
  //   if (err) { logg.byWinston('error', __filename + ':51 ' + err); }

  //   child.exec('killall -9v node', function (err, stdOut) {
  //     if (err) { logg.byWinston('error', __filename + ':51 ' + err); }

  //     res.redirect('/admin/settings/proc');
  //   });

  // });
  res.redirect('/admin/settings/proc');
};


/**
 * Restart cron job when updating or inserting task
 */
module.exports.restart = function (res, redirectURL) {

  // Connect or launch PM2
  pm2.connect(function (err) {
    if (err) { logg.byWinston('error', __filename + ':73 ' + err); }


    setTimeout(function () {
      // Start a script on the current folder
      pm2.restart('all', function (err, proc) {
        if (err) { logg.byWinston('error', __filename + ':77 ' + err); }

        // Disconnect to PM2
        // pm2.disconnect(function () { process.exit(0); });
      });

    }, 2500);

    res.redirect('/admin/settings/proc');

  });


};


/**
 * Delete cron job
 */
module.exports.del = function (res, redirectURL) {

  // child.exec('pm2 delete crawler', function (err, stdOut) {
  //   if (err) { logg.byWinston('error', __filename + ':70 ' + err); }

  //   res.redirect('/admin/settings/proc');
  // });
  res.redirect('/admin/settings/proc');
};