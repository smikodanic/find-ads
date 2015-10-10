/**
 * Library which defines all global vars in app
 *
 * NOTICE: These global vars are updated on NodeJS restart. 
 * When needed to update dynamically include this into controller:
 *   var setGlobal = require('libraries/setGlobalLib');
 *   setGlobal.latestContent('content', 5);
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
    if (err) { logg.byWinston('error', __filename + ':28 ' + err); }

    //list results
    db.collection(collName).find({}).sort({"id": 1}).toArray(function (err, mo_category) {
      if (err) { logg.byWinston('error', __filename + ':32 ' + err); }

      global.GLOBfindads.categories = mo_category;
      db.close();
    });

  });

};


/**
 * Latest docs from
 * 
 * @param {String} content - MongoDB Collection
 * @param {String} lim - number of contents
 */
module.exports.latestContent = function (collName, lim) {

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':49 ' + err); }

    //list results
    db.collection(collName).find({}).sort({"cid": -1}).limit(lim).toArray(function (err, mo_docs) {
      if (err) { logg.byWinston('error', __filename + ':53 ' + err); }

      global.GLOBfindads.latestContent = mo_docs;
      db.close();
    });

  });

};

