/**
 * Start crawling from command line: $node linkQueue_cli.js 2
 * where 2 is the task ID from 'contentTasks' collection
 * Usefull for CRON JOB.
 */


require('rootpath')();
var crawloop = require('0crawler/crawlcontent/pooling/linkQueue');

//id from from command line process.argv
if (process.argv.length < 3) {
  console.log("ERROR: Use 3 command line parameters like: $node linkQueue_cli.js 2 \n");
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
crawloop.start(task_id, cb_outResults);