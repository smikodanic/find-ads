/*jslint unparam: true*/

/**
 * Start crawling from command line: $node tasksiteration_start_cli.js 3
 * Usefull for cron job.
 */
require('rootpath')(); //enable requireing modules from application root folder
var poll = require('0crawler/crawllinks/polling/tasksiteration_polling');
var logg = require('libraries/loggLib');


//id from from command line process.argv
if (process.argv.length < 3) {
  console.log("ERROR: Use 3 command line parameters like: $node tasksiteration_start_cli.js 3 \n");
  process.exit();
} else {
  var task_id = parseInt(process.argv[2], 10); //use parseint to convert string into number
}



//callback: output crawling results to console
var cb_outResults = {
  send: function (rezult) {
    console.log(rezult);
  },
  end: function () {
    process.exit();
  }
};

//callback: output crawling results to null (dont display output)
var cb_outResults_null = {
  send: function () {
    return null;
  },
  end: function () {
    process.exit();
  }
};



//start crawling from command line
poll.start(task_id, cb_outResults_null);

//logging
logg.craw(false, 'cronList', '+++ Content crawling: CLI SCRIPT tasksiteration_cli.js execute: $node tasksiteration_polling.js ' + task_id);