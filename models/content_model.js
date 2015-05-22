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

/**
 * Insert content into 'content_*' collection when crawling
 * @param  {String} pageURL  - url of pagination link: http://www.adsuu.com/business-offer-9/
 * @param  {Object} db       - db mongo object
 * @param  {String} contentCollection - MongoDB collection name: content_business
 * @param  {Object} insMoDoc - MongoDB document to be inserted: {_id, task_is, page, dateTime, links[]}
 * @return {[type]}          [description]
 */
module.exports.insertContent = function (pageURL, db, contentCollection, insMoDoc) {

  db.collection(contentCollection).createIndex({page: 1}, {unique: true, sparse: true}, function (err) { //create unique index to prevent duplicated documents
    if (err) { logg.me('error', __filename + ':26 ' + err); }

    db.collection(contentCollection).find({"pageURL": pageURL}).toArray(function (err, moContent_arr) { //check if doc e.g. pageURL already exists
      if (err) { logg.me('error', __filename + ':29 ' + err); }

      //if collection already exists do UPDATE
      if (moContent_arr.length !== 0) {

        db.collection(contentCollection).update({"page": pageURL}, insMoDoc, function (err) {
          if (err) { logg.me('error', __filename + ':35 ' + err); }
        });

      } else { //if collection doesn't exist do INSERT

        db.collection(contentCollection).find().sort({cid: -1}).limit(1).toArray(function (err, moDocs_arr) { //find max ID
          if (err) { logg.me('error', __filename + ':41 ' + err); }

          //define new insDoc.id from max id value
          if (moDocs_arr[0] !== undefined) {
            insMoDoc.cid = moDocs_arr[0].cid + 1;
          } else {
            insMoDoc.cid = 0;
          }

          db.collection(contentCollection).insert(insMoDoc, function (err) {
            if (err) { logg.me('error', __filename + ':44 ' + err); }
          });
        });

      }

    });

  });

};