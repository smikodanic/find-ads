/*jslint unparam: true*/

var childProcess = require('child_process');
var MongoClient = require('mongodb').MongoClient;

childProcess.exec('pwd', function (err, stdout, stderr) {
  console.log(stdout);
});