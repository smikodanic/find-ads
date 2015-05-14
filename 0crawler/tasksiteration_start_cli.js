/*jslint unparam: true*/

/**
 * Start crawling from command line: $node tasksiteration_start_cli.js 3
 * Usefull for cron job.
 */
require('rootpath')(); //enable requireing modules from application root folder
var crawloop = require('0crawler/tasksiteration_loop');

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


crawloop.start(task_id, cb_outResults);