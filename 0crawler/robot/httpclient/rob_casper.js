require('rootpath')();
var url = require('url');
var folred = require('follow-redirects');
var cheerio = require('cheerio');
var logg = require('libraries/loggLib');

var rob = require('0crawler/robot/extractors/rob_extractors');
var lc_model = require('models/robotLinksContent_model'); //link-content model

var childProcess = require('child_process');

// application dir: /homenode/find-ads/
var sett = require('settings/admin');
var appDir = sett.appDir;

/**
 * HTTP client created by CasperJS
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

  //casper exe file
  var casperBinFile = sett.casperBinFile;

  var casperCommandlineArgs = [
    appDir + '/0crawler/robot/casperjs/rob_casper_cli.js',
    pageURL
  ];

  //child process
  childProcess.execFile(casperBinFile, casperCommandlineArgs, function (err, stdout) {

    if (err.code === 'ENOENT') {
      logg.byWinston('error', __filename + ':42 ' + err);
    } else {


      //statusCode regExp
      var statusCodeReg = new RegExp('--statusCode:(\\d+)--');

      //get statusCode
      var statusCodeArr = stdout.match(statusCodeReg);
      var statusCode;
      if (statusCodeArr) {
        statusCode = parseInt(statusCodeArr[1], 10);
      } else {
        statusCode = 'notDefinedStatus';
      }

      var htmlDoc = stdout.replace(statusCodeReg, ''); //delete statusCode info from stdout
      console.log(htmlDoc);

      var crawlStatus;
      if (htmlDoc === '' && htmlDoc === undefined) {
        crawlStatus = 'error: empty htmlDoc returned from CasperJS';
      } else {
        crawlStatus = 'crawled';
      }

      //messaging page URL
      var msg_rez = '\n' + '+ URL in httpClient: ' + pageURL + ' lid:' + moLink.lid + ' _id' + moLink._id + ' - resp:' + statusCode + '\n';
      cb_outResults.send(msg_rez);
      logg.craw(false, moTask.loggFileName, msg_rez);

      //***** update crawlStatus from 'pending' to 'crawled' or 'error'
      lc_model.updateCrawlStatus(moTask.linkqueueCollection, moLink._id, crawlStatus);

      //load pageURL HTML into cheerio object
      $ = cheerio.load(htmlDoc);

      //extract content and insert into 'robot_content'
      rob.extractContent($, pageURL, statusCode, moTask, cb_outResults);

      // extract links and insert into 'robot_linkqueue_*'
      rob.extractLinks($, pageURL, moTask, moLink, cb_outResults);

    }

  });

};