/**
 * Logging by Winston module
 */
require('rootpath')();
var winston = require('winston');
var fs = require('fs');
var tm = require('libraries/timeLib');

//settings
var sett = require('settings/admin');
var logMode = sett.logMode; //development or production mode: dev | pro
var logDir = sett.logDir;


//define Date for file prefix
var preFile = tm.yyyymmddNow(); //20151231



//winston settings
var wlogger = new (winston.Logger)({
  transports: [
    new (winston.transports.File)({
      name: 'info-file',
      filename: logDir + 'winston/' + preFile + 'info.log',
      level: 'info',
      colorize: false,
      timestamp: true,
      json: true,
      handleExceptions: false
    }),
    new (winston.transports.File)({
      name: 'error-file',
      filename: logDir + 'winston/' + preFile + 'error.log',
      level: 'error',
      colorize: false,
      timestamp: true,
      json: true,
      handleExceptions: false
    })
  ]
});


module.exports.byWinston = function (logLevel, message) {

  if (logMode === 'dev') { //development mode: logging to console

    winston.log(logLevel, message);
    wlogger.log(logLevel, message);

  } else { //production mode: logging only to file

    wlogger.log(logLevel, message);
  }

};





var cb_null = function () {
  return null;
};


/**
 * Logging when crawler is on action. Debug crawler.
 * 
 * @param  {string} fileName    - file name, usually defined by collection name and task name
 * @param  {string} message     - error or info message
 * @param  {string} erase       - to clear file: true | false
 * @return {null}
 */
module.exports.craw = function (erase, fileName, message) {

  var filePath = logDir + 'crawler/' + preFile + fileName + '.log';

  //truncate (erase) all file content (faster debugging)
  if (erase) { fs.truncate(filePath, 0, cb_null); }

  //message with current time
  message = '\n[' + tm.nowSQL() + '] ' + message + '\n';


  if (logMode === 'dev') { //development mode: logging to console and file

    console.log(message);
    fs.appendFile(filePath, message, cb_null);

  } else { //production mode: logging to file

    fs.appendFile(filePath, message, cb_null);
  }

};



//handle uncaught exceptions and put into /winston/ dir - long format
winston.handleExceptions(new winston.transports.File({ filename: logDir + 'winston/' + preFile + 'exceptions.log'}));


//handle uncaught exceptions - short format
process.on('uncaughtException', function (err) {

  var exceptFile = logDir + 'misc/uncaughtException.log';

  if (err) {

    var errMsg = '\n[' + tm.nowSQL() + ']\n' + err.stack + '\n\n';
    fs.appendFile(exceptFile, errMsg, cb_null);
  }

});


//log website visitors
module.exports.visitors = function (req, fileName) {

  //visitor's info
  var timeNow = tm.nowSQL();
  var userAgent = req.headers['user-agent'];
  var referer = req.headers.referer;
  var currentURI = req.originalUrl;
  var method = req.method;

  //IP
  var ip = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;


  var filePath;
  if (userAgent.indexOf('bot') !== -1 ||  userAgent.indexOf('crawl') !== -1 ||  userAgent.indexOf('spider') !== -1  || userAgent.indexOf('slurp') !== -1 ||  userAgent.indexOf('yahoo') !== -1) {
    filePath = logDir + 'visits/' + preFile + 'visitorsBot_' + fileName + '.log';
  } else {
    filePath = logDir + 'visits/' + preFile + 'visitors_' + fileName + '.log';
  }


  var line = timeNow + ' - ' + userAgent + ' - ' + ip + ' - ' + referer + ' - ' + currentURI + ' - ' + method + '\n';
  fs.appendFile(filePath, line, cb_null);
};