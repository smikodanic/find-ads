/**
 * Crawler which uses NodeJS module 'http' -> method http.request(options[, callback])
 * Pages are changed by iterating pagination URLs.
 * For example: http://old.adsuu.com/business-offer-$1/
 */
require('rootpath')(); //enable requiring modules from application's root folder
var taskLink_model = require('models/taskLink_model');

var http = require('http');
var MongoClient = require('mongodb').MongoClient;
var nodedump = require('nodedump').dump;
var url = require('url');
var cheerio = require('cheerio');
var logg = require('libraries/loggLib');

var igniter = require('0crawler/igniter');


//settings
var taskCollection = 'tasks_LinkIterate';
var crawlInterval = 3000;


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
      // 'Accept-Encoding': 'gzip, deflate'
    }
  };

  // HTTP request using NodeJS 'http' module (http.request)
  var req2 = http.request(options, function (res2) {
      if (res2.statusCode !== 200) { logg.byWinston('error', __filename + ':43 Page not found: ' + options.hostname + options.path, null); }

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

        res.write("------------ Page: " + options.hostname + options.path + "-------------- \n");

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

          res.write("----- " + href + " --- " + tekst + "\n");

          //debug
          // console.log(JSON.stringify(insMoDoc, null, 2));
          // console.log("\n");
        });

        res.write("\n\n");


        //insert into mongoDb
        db.collection('linkQueue_LinkIterate').insert(insMoDoc, function (err) {
          if (err) { logg.byWinston('error', __filename + ':85 ' + err, res); }
          // db.close();
        });

      });

    });

  req2.on('error', function (err) {
    logg.byWinston('error', __filename + ':94 ' + err, res);
  });

  req2.end();
};