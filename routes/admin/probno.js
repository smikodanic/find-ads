/*jslint unparam: true*/

var express = require('express');
var router = express.Router();
var nodedump = require('nodedump').dump;
var login = require('../../libraries/accountLoginLib.js');


/* Login FORM */
router.post('/probnopost', function (req, res) {

  // res.send('probno post').end();
  console.log(req.body.cat);
  res.send(nodedump(req.body.cat)).end();
});




module.exports = router;
