require('rootpath')();
var url = require('url');
var folred = require('follow-redirects');
var cheerio = require('cheerio');
var logg = require('libraries/loggLib');
var tekstmod = require('libraries/tekstmodLib');
var urlmod = require('libraries/urlmod');
var timeLib = require('libraries/timeLib');
var lc_model = require('models/robotLinksContent_model'); //link-content model

/**
 * HTTP client created by NodeJS module - http.request()
 * @param  {object} db            - database
 * @param  {object} moTask        - document inside 'robot_tasks'. Contains all task variables.
 * @param  {object} moLink        - document inside 'robot_linkqueue_*'. Contains link URL to be crwaled.
 * @param  {function} cb_outResults - callback function for displaying results in browser or console
 * @return {object}               null
 */
module.exports.runURL = function (moTask, moLink, cb_outResults) {

  //vars
  var url_obj = url.parse(moLink.link.href);
  var pageURL = url_obj.protocol + '//' + url_obj.hostname + url_obj.path;

  //select http or https module
  var http_s, portNum;
  if (url_obj.protocol === 'http:') {
    http_s = folred.http;
    portNum = 80;
  } else {
    http_s = folred.https;
    portNum = 443;
  }

  //HTTP client options
  var options = {
    hostname: url_obj.host,
    port: portNum,
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
  var req2 = http_s.request(options, function (res2) {

      var crawlStatus;

      if (res2.statusCode !== 200) {
        crawlStatus = 'error: Response is ' + res2.statusCode;
        logg.craw(false, moTask.loggFileName, 'ERROR: Response not 200: ' + pageURL + '; Response is:' + res2.statusCode, null);
      } else {
        crawlStatus = 'crawled';
        logg.craw(false, moTask.loggFileName, 'RESPONSE: ' + pageURL + '; Response is:' + res2.statusCode, null);
      }

      //get htmlDoc from chunks of data
      var htmlDoc = '';
      res2.on('data', function (chunk) {
        htmlDoc += chunk;
      });

      res2.on('end', function () {

        //messaging page URL
        var msg_rez = '+ URL in httpClient: ' + pageURL;
        cb_outResults.send(msg_rez + '\n');
        logg.craw(false, moTask.loggFileName, msg_rez);

        //***** update crawlStatus from 'pending' to 'crawled' or 'error'
        lc_model.updateCrawlStatus(moTask.linkqueueCollection, moLink.link.href, crawlStatus);

        //get array of links using cherrio module
        $ = cheerio.load(htmlDoc);


        /************* EXTRACT LINKS **************/
        /**
         * Extract links from pageURL and insert into robot_linkqueu_*
         */
        var n = 1, href, tekst;
        $('a').each(function () {
          // tekst = $(this).children().remove().end().text(); //get text from A tag without children tag texts
          tekst = $(this).text();
          href = $(this).attr('href');

          //prettify tekst
          tekst = tekstmod.strongtrim(tekst);

          //correct url (relative convert to absolute)
          href = urlmod.toAbsolute(pageURL, href);

          //doc to be inserted into robot_linkqueue_*
          var insLinkqueueDoc = {
            "lid": 0,
            "task_collection": "robot_tasks",
            "task_id": moTask.id,
            "referer": pageURL,
            "crawlTime": timeLib.nowLocale(),
            "link": {
              "tekst": tekst,
              "href": href
            },
            "crawlStatus" : "pending",
            "crawlDepth" : moLink.crawlDepth + 1
          };

          //***** insert into 'robot_linkqueue_*'
          lc_model.insertNewLink(moTask.linkqueueCollection, insLinkqueueDoc);


          //message hrefs
          var msg_href = '----- ' + n + '. ' + href + ' --- ' + tekst;
          // logg.craw(false, moTask.loggFileName, msg_href); //log to file
          cb_outResults.send(msg_href  + '\n');

          n++;
        });

        //message number of extracted links
        n = n - 1;
        var msg_num = '-------- Extracted links: ' + n;
        cb_outResults.send(msg_num + '\n\n'); //send to browser
        // logg.craw(false, moTask.loggFileName, msg_num); //log to file

      });

    });

  req2.on('error', function (err) {
    logg.craw(false, moTask.loggFileName, 'http.request error: ' + err);
  });

  req2.end();
};