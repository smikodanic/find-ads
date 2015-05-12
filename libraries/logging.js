/**
 * Logging with Winston module
 */
var winston = require('winston');
var dev_pro = require('../settings/admin').logging; //development or production mode

//filenames by Date
var currentTime = new Date();
var year = currentTime.getFullYear();
var month = ("0" + (currentTime.getMonth() + 1)).slice(-2);
var day = ("0" + currentTime.getDate()).slice(-2);
var preFile = year + month + day; //20151231

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.File)({
      name: 'info-file',
      filename: 'tmp/logs/' + preFile + 'info.log',
      level: 'info'
    }),
    new (winston.transports.File)({
      name: 'error-file',
      filename: 'tmp/logs/' + preFile + 'error.log',
      level: 'error',
      colorize: false,
      timestamp: true,
      json: true,
      handleExceptions: false
    })
  ]
});

module.exports.me = function (logLevel, message) {

  if (dev_pro === 'dev') { //development mode: logging to file and console

    logger.add(winston.transports.Console);
    logger.log(logLevel, message);

  } else { //production mode: logging only to file

    logger.log(logLevel, message);
  }

};


