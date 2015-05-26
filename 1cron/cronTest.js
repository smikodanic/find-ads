/*
 * Cron job test
 * Samples:
 */
//  '5 * * * * *'  - fifth second in every minute, every hour, every day    
//  '*/8 * * * * *' - every 8 seconds
//  '*/5 * * * * 1'  - every 5 seconds on Monday


var CronJob = require('cron').CronJob;

//timer
setInterval(function () {
  console.log(new Date().toLocaleString());
}, 1000);




//define cron job
var job = new CronJob('*/8 * * * * 1', function () {

  console.log('Execute job');

}, function () {

  console.log('Job is stopped!');

},
  false, /* if false job.start() must be used */
  'Europe/Zagreb'
  );


//start cron job
console.log('Start cron job');
job.start();

//activate second function
// job.stop();
