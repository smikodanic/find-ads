var spawn = require('child_process').spawn;


//command and args and options
var cmd = 'ls';
var args = ['-al', '/homenode/find-ads/'];
var opt = null;


var ls = spawn(cmd, args, opt);

ls.stdout.on('data', function (data) {
  console.log('stdout: ' + data);
});

ls.stderr.on('data', function (data) {
  console.log('stderr: ' + data);
});

ls.on('close', function (code) {
  console.log('child process exited with code ' + code);
});