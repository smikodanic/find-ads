require('rootpath')();
var url = require('url');
// var http = require('http'); //not recommended because this module not follow redirects 301, 302
var http = require('follow-redirects').http;
var https = require('follow-redirects').https;
var cheerio = require('cheerio');
var logg = require('libraries/loggLib');
var tekstmod = require('libraries/tekstmodLib');
var urlmod = require('libraries/urlmod');
var timeLib = require('libraries/timeLib');
var content_model = require('models/content_model');

var settings = require('settings/admin.js');
var dbName = settings.mongo.dbName;


// HTTP client created by NPM - follow-redirects
module.exports.runURL = function (db, moTask, link, i, cb_outResults) {

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
    maxRedirects: 8,
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:36.0) Gecko/20100101 Firefox/36.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      // 'Accept-Encoding': 'gzip, deflate'
    }
  };


  // HTTP request using NodeJS 'http' module (http.request)
  var req2 = http.request(options, function (res2) {

      // console.log(res2.statusCode + ' pageURL: ' + pageURL);
      // console.log(JSON.stringify(res2.headers, null, 2) + "\n-----------------------------------\n");

      if (res2.statusCode !== 200) {//prevent to crawl non-existing pages

        logg.craw(false, moTask.loggFileName, 'ERROR: Response not 200: ' + pageURL + '; Response is:' + res2.statusCode, null);

      } else {


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
            "extract": {} //will be an object
          };



          //messaging page URL
          var msg_rez = i + '. URL in httpClient: ' + pageURL;
          cb_outResults.send(msg_rez + '\n');
          logg.craw(false, moTask.loggFileName, msg_rez);




          /***** extract data by selectors defined in 'contentTasks' e.g. inside moTask object *****/
          $ = cheerio.load(htmlDoc); //load cheerio

          var extractedData;
          moTask.selectors.forEach(function (cssSel) { //iterate through CSS selectors

            // extract data from pageURL using CSS selectors: text, html, image or URL
            // cssSel.value is CSS selector from MongoDB 'contentTask' collection
            if (cssSel.type === 'text') {
              extractedData = $(cssSel.value + ' *:not(textarea, input:text, script, option)').text();
            } else if (cssSel.type === 'html') {
              extractedData = $(cssSel.value).html();
            } else if (cssSel.type === 'href') {
              extractedData = $(cssSel.value).attr('href');
            } else if (cssSel.type === 'src') {
              extractedData = $(cssSel.value).attr('src');
            } else { //cssSel.type === 'attr'
              extractedData = $(cssSel.value[0]).attr(cssSel.value[1]);
            }

            //prettify tekst
            extractedData = tekstmod.strongtrim(extractedData);

            //fill extracted data into 'extract' property: extract.title[1] gives advert title
            insMoDoc.extract[cssSel.name] = [cssSel.type, cssSel.value, extractedData];

            //messaging extracted data
            var msg_extracted = '-----  ' + cssSel.name + ': ' + extractedData;
            cb_outResults.send(msg_extracted + '\n');
            logg.craw(false, moTask.loggFileName, msg_extracted);

          }); //forEach end




          //messaging end
          var msg_end = '[' + timeLib.nowLocale() + ']\n\n';
          cb_outResults.send(msg_end);


          /**
           * ------- MODEL: insert into MongoDB --------
           * Checks if pageURL already exists in DB - prevent duplication
           */
          content_model.insertContent(pageURL, db, moTask.contentCollection, insMoDoc);

        });

      } //else end

    });




  req2.on('error', function (err) {
    logg.byWinston('error', __filename + ':152 ' + err);
  });

  req2.end();

};