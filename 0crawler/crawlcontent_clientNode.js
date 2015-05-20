require('rootpath')();
var url = require('url');
var http = require('http');
var cheerio = require('cheerio');
var logg = require('libraries/logging');
var tekstmod = require('libraries/tekstmod');
var urlmod = require('libraries/urlmod');
var timeLib = require('libraries/timeLib');
var content_model = require('models/content_model');

var settings = require('settings/admin.js');
var dbName = settings.mongo.dbName;
var collName_cnt = settings.mongo.dbColl_cnt; //'content' collection


// HTTP client created by NodeJS module - http.request()
module.exports.node = function (db, moTask, link, cb_outResults) {

  //vars
  var url_obj = url.parse(link.href);
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
      if (res2.statusCode !== 200) {
        logg.me('error', __filename + ':40 Page doesnt exist: ' + pageURL, null);
      } else { //prevent to crawl non-existing pages

        //get htmlDoc from chunks of data
        var htmlDoc = '';
        res2.on('data', function (chunk) {
          htmlDoc += chunk;
        });


        res2.on('end', function () {


          /* doc skeleton to be inserted into mongoDB */
          var insMoDoc = {
            "cid": undefined,
            "pageURL": pageURL,
            "crawlDateTime": timeLib.nowLocale(),
            "category": parseInt(moTask.category, 10),
            "subcategory": parseInt(moTask.subcategory, 10),
            "content": {}
          };


          cb_outResults.send('<p style="font:14px Verdana;color:#f0f0f0;">Page: ' + pageURL + ' [' + timeLib.nowLocale() + '] ' + '</p>\n');

          /* extract data by selectors defined in 'contentTasks' e.g. inside moTask object */
          $ = cheerio.load(htmlDoc); //load cheerio


          var content = {};
          moTask.selectors.forEach(function (elem) { //iterate through CSS selectors

            var prop;
            for (prop in elem) {
              if (elem.hasOwnProperty(prop)) {

                //extract data from pageURL using CSS selectors
                content[prop] = $(elem[prop]).text();

                //prettify tekst
                content[prop] = tekstmod.strongtrim(content[prop]);

                cb_outResults.send('<p style="font:12px Verdana;color:#f0f0f0;">-----  ' + prop + ': ' + content[prop] + '</p>\n');
              }
            }//for

          });

          insMoDoc.content = content; //fill extracted data into 'content' property

          cb_outResults.send('\n\n<br><br>');

          /**
           * ------- MODEL: insert into MongoDB --------
           * Checks if pageURL already wxists in DB - prevent duplication
           */
          content_model.insertContent(pageURL, db, collName_cnt, insMoDoc);

        });

      } //else end

    });




  req2.on('error', function (err) {
    logg.me('error', __filename + ':95 ' + err);
  });

  req2.end();

};