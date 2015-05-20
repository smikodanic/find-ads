/**
 * crawler.content model
 */

require('rootpath')();
var MongoClient = require('mongodb').MongoClient;
var logg = require('libraries/logging.js');
var pagination = require('libraries/pagination.js');
// var nodedump = require('nodedump').dump;

//mongo parameters
var settings = require('settings/admin.js');
var dbName = settings.mongo.dbName;
var collName_cnt = settings.mongo.dbColl_cnt;

/**
 * Insert content into 'content' collection when crawling
 * @param  {String} pageURL  - url of pagination link: http://www.adsuu.com/business-offer-9/
 * @param  {Object} db       - db mongo object
 * @param  {String} collName - MongoDB collection name: linkQueue_adsuu_com_business
 * @param  {Object} insMoDoc - MongoDB document to be inserted: {_id, task_is, page, dateTime, links[]}
 * @return {[type]}          [description]
 */
module.exports.insertContent = function (pageURL, db, collName, insMoDoc) {

  db.collection(collName_cnt).createIndex({page: 1}, {unique: true, sparse: true}, function (err) { //create unique index to prevent duplicated documents
    if (err) { logg.me('error', __filename + ':27 ' + err); }

    db.collection(collName).find({"pageURL": pageURL}).toArray(function (err, moTask2_arr) { //check if collection e.g. pageURL already exists
      if (err) { logg.me('error', __filename + ':30 ' + err); }

      //if collection already exists do UPDATE
      if (moTask2_arr.length !== 0) {

        db.collection(collName).update({"page": pageURL}, insMoDoc, function (err) {
          if (err) { logg.me('error', __filename + ':36 ' + err); }
        });

      } else { //if collection doesn't exist do INSERT

        db.collection(collName).insert(insMoDoc, function (err) {
          if (err) { logg.me('error', __filename + ':42 ' + err); }
        });

      }

    });

  });

};