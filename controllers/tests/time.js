/*jslint unparam: true*/

var express = require('express');
var router = express.Router();


/* Parameter */
module.exports = function (router) {

  //http://localhost:3000/proba
  router.get('/', function (req, res) {
    
    var date = new date();
    var d = date.toISOString().slice(0, 19).replace('T', ' ');

    res.send(d).end();
  });


};