require('rootpath')();
var url = require('url');
var http = require('http');
var cheerio = require('cheerio');
var logg = require('libraries/loggLib');
var tekstmod = require('libraries/tekstmodLib');
var urlmod = require('libraries/urlmod');
var timeLib = require('libraries/timeLib');
var links_model = require('models/linkQueue_model');


/**
 * HTTP client created by NodeJS module - http.request()
 * @param  {object} db            - database
 * @param  {string} collName      - collection name where is task: for example linkTasks_iterate
 * @param  {object} moTask        - document inside collName. Contains all taks variables
 * @param  {function} cb_outResults - callback function for displaying results in browser or console
 * @return {object}               null
 */
module.exports.runURL = function (db, collNameTask, moTask, cb_outResults) {

  //MongoDB collection name
  var collName = 'linkQueue_' + moTask.name;

  //vars
  var url_obj = url.parse(moTask.iteratingurl2);
  var pageURL = url_obj.protocol + '//' + url_obj.hostname + url_obj.path;

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
      if (res2.statusCode !== 200) { logg.craw(false, moTask.loggFileName, 'Page not found: ' + pageURL); }

      //get htmlDoc from chunks of data
      var htmlDoc = '';
      res2.on('data', function (chunk) {
        htmlDoc += chunk;
      });

      res2.on('end', function () {

        //doc to be inserted into mongoDB
        var insMoDoc = {
          "task_collection": collNameTask,
          "task_id": moTask.id,
          "pageURL": pageURL,
          "crawlTime": timeLib.nowLocale(),
          "links": []
        };

        //message 1
        var msg1 = 'Page: ' + pageURL + ' [' + timeLib.nowLocale() + '] ';
        logg.craw(false, moTask.loggFileName2, msg1); //log to file
        cb_outResults.send(msg1 + '\n');

        //get array of links using cherrio module
        $ = cheerio.load(htmlDoc);

        var n = 1, href, tekst;
        $(moTask.aselector).each(function () {
          // tekst = $(this).children().remove().end().text(); //get text from A tag without children tag texts
          tekst = $(this).text();
          href = $(this).attr('href');

          //prettify tekst
          tekst = tekstmod.strongtrim(tekst);

          //correct url (relative convert to absolute)
          href = urlmod.toAbsolute(moTask.iteratingurl2, href);

          // fill insMoDoc.link array
          insMoDoc.links.push({
            "tekst": tekst,
            "href": href
          });

          
          //message 2
          var msg2 = n + '. -----  ' + href + ' --- ' + tekst;
          logg.craw(false, moTask.loggFileName2, msg2); //log to file
          cb_outResults.send(msg2  + '\n');

          n++;
        });

        //message 3
        n = n - 1;
        var msg3 = 'Extracted links: ' + n;
        logg.craw(false, moTask.loggFileName, msg3); //log to file
        cb_outResults.send(msg3 + '\n\n'); //send to browser


        //insert into MongoDB linkQueue_* collection
        links_model.insertLinks(pageURL, db, collName, insMoDoc);

      });

    });

  req2.on('error', function (err) {
    logg.craw(false, moTask.loggFileName, 'http.request error: ' + err);
  });

  req2.end();
};