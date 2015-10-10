/*jslint unparam: true*/

var express = require('express');
var router = express.Router();


/* Parameter */
module.exports = function (router) {

  //http://localhost:3000/proba
  router.get('/', function (req, res) {

    var date = new Date();
    var d2 = date.toLocaleString();

    res.send(d2).end();
  });


};