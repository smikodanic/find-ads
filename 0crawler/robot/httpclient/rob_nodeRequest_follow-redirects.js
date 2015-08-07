require('rootpath')();
var url = require('url');
var folred = require('follow-redirects');
var cheerio = require('cheerio');
var logg = require('libraries/loggLib');

var rob = require('0crawler/robot/extractors/rob_extractors');
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
  //Notice: Problem can occur if moLink.link.href is not equal to pageURL
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

  /**** HTTP request using NodeJS 'http' module (http.request) ****/
  var req2 = http_s.request(options, function (res2) {

      var crawlStatus;

      if (res2.statusCode !== 200) {
        crawlStatus = 'error response: ' + res2.statusCode;
      } else {
        crawlStatus = 'crawled';
      }

      //get htmlDoc from chunks of data
      var htmlDoc = '';
      res2.on('data', function (chunk) {
        htmlDoc += chunk;
      });

      res2.on('end', function () {

        //messaging page URL
        var msg_rez = '+ URL in httpClient: ' + pageURL + ' - response:' + res2.statusCode;
        cb_outResults.send(msg_rez + '\n');
        logg.craw(false, moTask.loggFileName, msg_rez);

        //***** update crawlStatus from 'pending' to 'crawled' or 'error'
        lc_model.updateCrawlStatus(moTask.linkqueueCollection, moLink.lid, crawlStatus);

        

        //load pageURL HTML into cheerio object
        $ = cheerio.load(htmlDoc);

        //extract content and insert into 'robot_content'
        rob.extractContent($, pageURL, moTask, cb_outResults);

        // extract links and insert into 'robot_linkqueue_*'
        rob.extractLinks($, pageURL, moTask, moLink, cb_outResults);

      });

    });

  req2.on('error', function (err) {
    logg.craw(false, moTask.loggFileName, 'http.request error: ' + err);
  });

  req2.end();
};