/**
 * Logging by Winston module
 */
require('rootpath')();
var winston = require('winston');
var fs = require('fs');
var tm = require('libraries/timeLib');

//settings
var sett = require('settings/admin');
var logMode = sett.logMode; //development or production mode
var logDir = sett.logDir;


//define Date for file prefix
var currentTime = new Date();
var year = currentTime.getFullYear();
var month = ("0" + (currentTime.getMonth() + 1)).slice(-2);
var day = ("0" + currentTime.getDate()).slice(-2);
var preFile = year + month + day; //20151231



//winston settings
var wlogger = new (winston.Logger)({
  transports: [
    new (winston.transports.File)({
      name: 'info-file',
      filename: logDir + 'winston/' + preFile + 'info.log',
      level: 'info'
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

  } else { //production mode: logging only to file

    wlogger.log(logLevel, message);
  }

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
  if (erase) { fs.truncate(filePath, 0, null); }

  //message with current time
  message = '[' + tm.nowSQL() + '] ' + message + '\n';


  if (logMode === 'dev') { //development mode: logging to console

    console.log(message);
    fs.appendFile(filePath, message, null);

  } else { //production mode: logging to file

    fs.appendFile(filePath, message, null);
  }

};

