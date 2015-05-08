/**
 * Crawler which uses NodeJS module 'http' -> method http.request(options[, callback])
 * Pages are changed by iterating pagination URLs.
 * For example: http://old.adsuu.com/business-offer-$1/
 */
require('rootpath')(); //enable requiring modules from application's root folder
var category_model = require('models/category_model');
var task_model = require('models/task_model');

var http = require('http');
var MongoClient = require('mongodb').MongoClient;
var nodedump = require('nodedump').dump;
var url = require('url');
var cheerio = require('cheerio');


//settings
var taskCollection = 'tasks_LinkIterate';

/* Send error to browser or console */
var errSend_browser = function (err, res) {
  // console.log('nodehttp_crawler.js:' + err);
  res.send('nodehttp_crawler.js:' + err).end();
};


// HTTP client created by NodeJS module - http.request()
var httpClient = function (res, moTask, db) {

  var url_obj = url.parse(moTask.iteratingurl2);

  //HTTP client options
  var options = {
    hostname: url_obj.host,
    port: 80,
    path: url_obj.path,
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:36.0) Gecko/20100101 Firefox/36.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate'
    }
  };

  // HTTP request using NodeJS 'http' module
  var req2 = http.request(options, function (res2) {
      if (res2.statusCode !== 200) { errSend_browser('Page not found: ' + options.hostname + options.path, res); }

      //get htmlDoc from chunks of data
      var htmlDoc = '';
      res2.on('data', function (chunk) {
        htmlDoc += chunk;
      });

      res2.on('end', function () {

        //doc to be inserted into mongoDB
        var insMoDoc = {
          "task_collection": taskCollection,
          "task_id": moTask.id,
          "page": options.hostname + options.path,
          "links": []
        };

        //get array of links using cherrio module
        $ = cheerio.load(htmlDoc);

        var href, tekst;
        $(moTask.aselector).each(function () {
          tekst = $(this).text();
          href = $(this).attr('href');

          // fill insMoDoc.link array
          insMoDoc.links.push({
            "tekst": tekst,
            "href": href
          });

          //debug
          // console.log(JSON.stringify(insMoDoc, null, 2));
          // console.log("\n");
        });

        //insert into mongoDb
        db.collection('linkQueue_LinkIterate').insert(insMoDoc, function (err) {
          if (err) { errSend_browser(err, res); }
          // db.close();
        });

      });

    });

  req2.on('error', function (err) {
    errSend_browser(err, res);
  });

  req2.end();
};









module.exports.crawl = function (req, res) {

  //id from req e.g. from URI
  var task_id = parseInt(req.params.task_id, 10); //use parseint to convert string into number

  var selector = {"id": task_id};

  MongoClient.connect("mongodb://localhost:27017/crawler", function (err, db) {
    if (err) { errSend_browser(err, res); }

    db.collection(taskCollection).find(selector).toArray(function (err, moTask_arr) { //get task data from 'task_id'
      if (err) { errSend_browser(err, res); }

      //MongoDB doc object
      var moTask = moTask_arr[0];

      //iterating through task URLs
      var i = moTask.from$1;
      var intID = setInterval(function () {

        if (i <= moTask.to$1) {

          //http://www.adsuu.com/business-offer-$1/ -> http://www.adsuu.com/business-offer-1/
          moTask.iteratingurl2 = moTask.iteratingurl.replace('$1', i);

          httpClient(res, moTask, db);

        } else {
          clearInterval(intID); //stop crawling

          setTimeout(function () {
            console.log('CRAWLING FINISHED: ' + moTask.name);
            res.send('CRAWLING FINISHED: ' + moTask.name).end();
          }, 3000);

        }

        i++;


      }, 1800);

    });

  });

};