/**
 * Start crawling from command line: $node robot_cli.js 3
 * Usefull for cron job.
 */
require('rootpath')();
var poll = require('0crawler/robot/polling/rob_linkQueue');
var logg = require('libraries/loggLib');


//id from from command line process.argv
if (process.argv.length < 3) {
  console.log("ERROR: Use 3 command line parameters like: $node robot_cli.js 3 \n");
  process.exit();
} else {
  var task_id = parseInt(process.argv[2], 10); //use parseint to convert string into number
}



//callback: output crawling results to console
//Usable when test this script with: $node robot_cli.js 3
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
logg.craw(false, 'cronList', '+++ Robot crawling: CLI SCRIPT robot_cli.js execute task id: ' + task_id);