require('rootpath')(); //enable requiring modules from application's root folder
var logg = require('libraries/logging.js');
var MongoClient = require('mongodb').MongoClient;
var httpClient = require('0crawler/httpClient_node');



module.exports.start = function (task_id, cb_outResults) {

  var selector = {"id": task_id};

  MongoClient.connect("mongodb://localhost:27017/crawler", function (err, db) {
    if (err) { logg.me('error', __filename + ':116 ' + err); }

    db.collection('tasks_LinkIterate').find(selector).toArray(function (err, moTask_arr) { //get task data using 'task_id'
      if (err) { logg.me('error', __filename + ':119 ' + err); }

      //MongoDB doc object
      var moTask = moTask_arr[0];

      //crawl first pagination page - defined by 'firstURL' variable
      moTask.iteratingurl2 = moTask.firsturl;
      httpClient.node(db, moTask, cb_outResults);

      //iterating through pagination URLs changing variable $1 - defined by 'iteratingURL' variable
      var i = moTask.from$1;
      var intID = setInterval(function () {

        if (i <= moTask.to$1) {

          //http://www.adsuu.com/business-offer-$1/ -> http://www.adsuu.com/business-offer-1/
          moTask.iteratingurl2 = moTask.iteratingurl.replace('$1', i);

          httpClient.node(db, moTask, cb_outResults);

        } else {

          clearInterval(intID); //stop crawling

          db.close();

          var timeElapsed = (i * moTask.crawlInterval) / 1000;
          console.log('Crawl task finished: ' + moTask.name + ' (Time elapsed:' + timeElapsed + 'sec)\n');
          cb_outResults.end();
        }

        i++;


      }, moTask.crawlInterval);

    });

  });
};

