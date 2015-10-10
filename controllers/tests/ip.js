/*
test IP address
 */

var express = require('express');
var router = express.Router();
var nodedump = require('nodedump').dump;


/* Parameter */
module.exports = function (router) {

  //http://localhost:3000/proba
  router.get('/', function (req, res) {

    var ip = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    res.send(ip).end();

  });


};