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

    res.send(nodedump(req.connection.remoteAddress));

  });


};