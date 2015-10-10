/*jslint unparam: true*/

var childProcess = require('child_process');

childProcess.exec('pwd', function (err, stdout, stderr) {
  console.log(stdout);
});