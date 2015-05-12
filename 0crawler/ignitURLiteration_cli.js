/*jslint unparam: true*/

/**
 * Start crawling from command line: $node ignitURLiteration_cli.js 3
 * Usefull for cron job.
 */
require('rootpath')(); //enable requireing modules from application root folder
var crawl = require('0crawler/ignitURLiteration');

//id from req e.g. from command line process.argv
var task_id = parseInt(process.argv[2], 10); //use parseint to convert string into number

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


crawl.start(task_id, cb_outResults_null);