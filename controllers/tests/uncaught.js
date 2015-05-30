/**
 * Test uncaught exception
 */
require('rootpath')();
var logg = require('libraries/loggLib');

var errorGen = require('controllers/tests/uncaughtLib');

module.exports = function (router) {

  //http://localhost:3333/tests/uncaught
  router.get('/', function (req, res) {

    logg.byWinston('error', 'Neka greška za winston!');
    res.send('Uncaught exception initialized;');
    errorGen.something();
  });


};