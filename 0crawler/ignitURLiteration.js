require('rootpath')(); //enable requiring modules from application's root folder
var logg = require('libraries/logging.js');
var MongoClient = require('mongodb').MongoClient;
var httpClient = require('0crawler/httpClient_node');

//settings
var taskCollection = 'tasks_LinkIterate';


module.exports.start = function (req, res) {

  //id from req e.g. from URI
  var task_id = parseInt(req.params.task_id, 10); //use parseint to convert string into number

  var selector = {"id": task_id};

  MongoClient.connect("mongodb://localhost:27017/crawler", function (err, db) {
    if (err) { logg.me('error', __filename + ':116 ' + err, res); }

    db.collection(taskCollection).find(selector).toArray(function (err, moTask_arr) { //get task data using 'task_id'
      if (err) { logg.me('error', __filename + ':119 ' + err, res); }

      //MongoDB doc object
      var moTask = moTask_arr[0];

      //crawl first pagination page - defined by 'firstURL' variable
      moTask.iteratingurl2 = moTask.firsturl;
      httpClient.node(res, moTask, db);

      //iterating through pagination URLs changing variable $1 - defined by 'iteratingURL' variable
      var i = moTask.from$1;
      var intID = setInterval(function () {

        if (i <= moTask.to$1) {

          //http://www.adsuu.com/business-offer-$1/ -> http://www.adsuu.com/business-offer-1/
          moTask.iteratingurl2 = moTask.iteratingurl.replace('$1', i);

          httpClient.node(res, moTask, db);

        } else {

          clearInterval(intID); //stop crawling

          // logg.me('info', __filename + ':141 FINISHED with crawl task: ' + moTask.name, res);
          console.log('Crawl task finished: ' + moTask.name);
          res.end();
        }

        i++;


      }, moTask.crawlInterval);

    });

  });
};

