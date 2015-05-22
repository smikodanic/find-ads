require('rootpath')();
var url = require('url');
// var http = require('http'); //not recommended because this module not follow redirects 301, 302
var http = require('follow-redirects').http;
var https = require('follow-redirects').https;
var cheerio = require('cheerio');
var logg = require('libraries/logging');
var tekstmod = require('libraries/tekstmodLib');
var urlmod = require('libraries/urlmod');
var timeLib = require('libraries/timeLib');
var content_model = require('models/content_model');

var settings = require('settings/admin.js');
var dbName = settings.mongo.dbName;


// HTTP client created by NodeJS module - http.request()
module.exports.node = function (db, moTask, link, i, cb_outResults) {

  //vars
  var url_obj = url.parse(link.href);
  var pageURL = url_obj.protocol + '//' + url_obj.hostname + url_obj.path;
  // console.log('title: ' + link.tekst);
  // console.log('pageURL: ' + pageURL);

  //HTTP client options
  var options = {
    hostname: url_obj.host,
    port: 80,
    path: url_obj.path,
    method: 'GET',
    maxRedirects: 3,
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:36.0) Gecko/20100101 Firefox/36.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      // 'Accept-Encoding': 'gzip, deflate'
    }
  };


  // HTTP request using NodeJS 'http' module (http.request)
  var req2 = http.request(options, function (res2) {
      console.log(res2.statusCode + ' pageURL: ' + pageURL);
      // console.log(JSON.stringify(res2.headers, null, 2) + "\n-----------------------------------\n");

      if (res2.statusCode !== 200) {
        logg.me('error', __filename + ':49 Page doesnt exist: ' + pageURL, null);
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
            "content": [] //array of objects
          };

          var showRez = i + '. Page: ' + pageURL + '\n';
          cb_outResults.send(showRez);
          // console.log(showRez);

          /* extract data by selectors defined in 'contentTasks' e.g. inside moTask object */
          $ = cheerio.load(htmlDoc); //load cheerio


          var content_arr = [], cont_obj, extractedData;
          moTask.selectors.forEach(function (elem) { //iterate through CSS selectors

            /*
             * extract data from pageURL using CSS selectors: text, html, image or URL
             * elem.value is CSS selector from MongoDB 'contentTask' collection
             */
            if (elem.type === 'text') {
              extractedData = $(elem.value).text();
            } else if (elem.type === 'html') {
              extractedData = $(elem.value).html();
            } else if (elem.type === 'href') {
              extractedData = $(elem.value).attr('href');
            } else if (elem.type === 'src') {
              extractedData = $(elem.value).attr('src');
            } else { //elem.tyle === 'attr'
              extractedData = $(elem.value[0]).attr(elem.value[1]);
            }

            //prettify tekst
            extractedData = tekstmod.strongtrim(extractedData);

            //create content object
            cont_obj = {
              type: elem.type,
              name: elem.name,
              extracteddata: extractedData
            };

            //push content object into array
            content_arr.push(cont_obj);

            cb_outResults.send('-----  ' + elem.name + ': ' + extractedData + '\n');

          });

          insMoDoc.content = content_arr; //fill extracted data into 'content' property

          cb_outResults.send('[' + timeLib.nowLocale() + ']\n\n');

          /**
           * ------- MODEL: insert into MongoDB --------
           * Checks if pageURL already wxists in DB - prevent duplication
           */
          content_model.insertContent(pageURL, db, moTask.contentCollection, insMoDoc);

        });

      } //else end

    });




  req2.on('error', function (err) {
    logg.me('error', __filename + ':95 ' + err);
  });

  req2.end();

};