/*jslint unparam: true*/

var express = require('express');
var router = express.Router();
var nodedump = require('nodedump').dump;


/* Parameter */
module.exports = function (router) {

  //http://localhost:3000/proba
  router.get('/', function (req, res) {
    res.send('PROBA root'); // 
  });

  //http://localhost:3000/proba
  router.get('/primjer', function (req, res) {
    res.send('PROBA primjer'); // 
  });

  //http://localhost:3000/proba/primjer/par
  router.get('/primjer/:par', function (req, res) {
    var x = req.params.par;
    res.send(nodedump(x)); // String: par
  });

};