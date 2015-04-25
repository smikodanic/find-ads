/*jslint unparam: true*/

var express = require('express');
var router = express.Router();
var nodedump = require('nodedump').dump; //debugger: res.send(nodedump(req)).end();

//MongoDB
var MongoClient = require('mongodb').MongoClient;


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});


/* MongoDB find() test */
router.get('/mdbfind', function (req, res) {

  MongoClient.connect("mongodb://localhost:27017/my_db", function (err, db) {
    if (err) {
      res.send('MongoDB Error:<br>' + err).end();
    } else {

      db.collection('user').find().toArray(function (err, items) {
        //res.json(items);
        //res.send(nodedump(items)).end();
        //console.log(JSON.stringify(items, null, 4));

        var vdata = {
            "title": 'List of users',
            "items": items
          };

        res.render('mdbfind', vdata);

      });

    }

  });

});



router.get('/mdbinsert', function (req, res) {

  res.render('mdbinsert');  //input form
});




router.post('/mdbinsert', function (req, res) {

  //get POST form variables
  var user = req.body.user;
  var pass = req.body.pass;

  var ins;
  if (user !== '' && pass !== '') {
    ins = {"user" : user, "pass" : pass};
  } else {
    ins = null;
  }


  //insert into MongoDB
  MongoClient.connect("mongodb://localhost:27017/my_db", function (err, db) {
    if (err) {
      res.send('MongoDB Error:<br>' + err).end();
    } else {
      if (ins !== null) {
        db.collection('user').insert(ins);
      }
    }
  });

  res.render('mdbinsert');  //input form

});


module.exports = router;
