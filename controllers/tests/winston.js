/*jslint unparam: true*/

var express = require('express');
var router = express.Router();
var nodedump = require('nodedump').dump;

//winston logger
var winston = require('winston');
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: 'mylog.log' })
  ]
});

//each log level in separate file
var logger2 = new (winston.Logger)({
  transports: [
    new (winston.transports.File)({
      name: 'info-file',
      filename: 'filelog-info.log',
      level: 'info'
    }),
    new (winston.transports.File)({
      name: 'error-file',
      filename: 'filelog-error.log',
      level: 'error',
      colorize: false,
      timestamp: true,
      json: true,
      handleExceptions: false
    })
  ]
});

//uncaught exception logging
winston.handleExceptions(new winston.transports.File({ filename: 'exceptions.log' }));


module.exports = function (router) {

  //http://localhost:3000/tests/winston
  router.get('/', function (req, res) {
    winston.log('error', 'This error message will appear in terminal !');

    res.send('Winston error initialized! Will be displayed in terminal.');
  });


  //http://localhost:3000/tests/winston/file
  router.get('/file', function (req, res) {

    // console.log(JSON.stringify(logger, null, 2));

    logger.remove(winston.transports.Console);
    logger.log('error', 'This error message will be added as line in file !');

    res.send('Winston error initialized! Will appear in file.');
  });


  //http://localhost:3000/tests/winston/difffile
  //logging different errors to diferent
  router.get('/difffile', function (req, res) {

    logger2.log('error', 'This error message will be appended in filelog-error.log!');
    logger2.log('info', 'This info message will be appended in filelog-info.log!');

    res.send('Winston logs initialized! Will appear in two different files.');
  });


  //http://localhost:3000/tests/winston/unexc
  //uncaught exception
  router.get('/unexc', function (req, res) {

    throw 'gresk';

    res.send('Winston logs initialized! Will appear in two different files.');
  });




};