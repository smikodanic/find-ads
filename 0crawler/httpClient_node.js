require('rootpath')();
var url = require('url');
var http = require('http');
var cheerio = require('cheerio');
var logg = require('libraries/logging');
var tekstmod = require('libraries/tekstmod');
var urlmod = require('libraries/urlmod');
var timeLib = require('libraries/timeLib');


// HTTP client created by NodeJS module - http.request()
module.exports.node = function (db, moTask, cb_outResults) {

  //MongoDB collection name
  var collName = 'linkQueue_' + moTask.name;


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

  var pageURL = options.hostname + options.path;

  // HTTP request using NodeJS 'http' module (http.request)
  var req2 = http.request(options, function (res2) {
      if (res2.statusCode !== 200) { logg.me('error', __filename + ':36 Page not found: ' + pageURL, null); }

      //get htmlDoc from chunks of data
      var htmlDoc = '';
      res2.on('data', function (chunk) {
        htmlDoc += chunk;
      });

      res2.on('end', function () {

        //doc to be inserted into mongoDB
        var insMoDoc = {
          "task_id": moTask.id,
          "page": pageURL,
          "dateTime": timeLib.nowLocale(),
          "links": []
        };

        cb_outResults.send('Page: ' + pageURL + ' [' + timeLib.nowLocale() + '] ' + '\n');

        //get array of links using cherrio module
        $ = cheerio.load(htmlDoc);

        var href, tekst;
        $(moTask.aselector).each(function () {
          tekst = $(this).children().remove().end().text(); //get text from A tag without children tag texts
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

          cb_outResults.send('-----  ' + href + ' --- ' + tekst + '\n');
        });

        cb_outResults.send('\n\n');


        /* insert into MongoDB */
        db.collection(collName).createIndex({page: 1}, {unique: true, sparse: true}, function (err) { //create unique index to prevent duplicated documents
          if (err) { logg.me('error', __filename + ':86 ' + err); }

          db.collection(collName).find({"page": pageURL}).toArray(function (err, moTask2_arr) { //check if collection already exists
            if (err) { logg.me('error', __filename + ':89 ' + err); }

            //if collection already exists do UPDATE
            if (moTask2_arr.length !== 0) {

              db.collection(collName).update({"page": pageURL}, insMoDoc, function (err) {
                if (err) { logg.me('error', __filename + ':95 ' + err); }
              });

            } else { //if collection doesn't exist do INSERT

              db.collection(collName).insert(insMoDoc, function (err) {
                if (err) { logg.me('error', __filename + ':101 ' + err); }
              });

            }

          });

        });

      });

    });

  req2.on('error', function (err) {
    logg.me('error', __filename + ':115 ' + err);
  });

  req2.end();
};