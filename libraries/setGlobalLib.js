/**
 * Library which defines all global vars in app
 */

require('rootpath')();
var MongoClient = require('mongodb').MongoClient;
var logg = require('libraries/loggLib');

//mongo parameters
var settings = require('settings/admin.js');
var dbName = settings.mongo.dbName;
var collName = settings.mongo.dbColl_category;



//global container
global.GLOBfindads = {};

// logg.byWinston('info', JSON.stringify(global.findadsGLOB, null, 2));


/**
 * Categories from MongoDB 'crawler.category' collection
 */
module.exports.categories = function () {

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':109 ' + err); }

    //list results
    db.collection(collName).find({}).sort({id: 1}).toArray(function (err, mo_category) {
      if (err) { logg.byWinston('error', __filename + ':113 ' + err); }

      global.GLOBfindads.categories = mo_category;
      db.close();
    });

  }); //connect

};

