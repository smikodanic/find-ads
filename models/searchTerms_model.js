/**
 * searchTerms model
 */

require('rootpath')();
var MongoClient = require('mongodb').MongoClient;
var logg = require('libraries/loggLib');
var pagination = require('libraries/pagination.js');
// var nodedump = require('nodedump').dump;

//mongo parameters
var sett = require('settings/admin.js');
var dbName = sett.mongo.dbName;
var dbColl = sett.mongo.dbColl_searchTerms;


module.exports.listPart = function (lim, res, cb_index) {

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':20 ' + err); }

    db.collection(dbColl).find({}).sort({_id: -1}).limit(lim).toArray(function (err, mo_searchTerms) {
      if (err) { logg.byWinston('error', __filename + ':23 ' + err); }

      cb_index(res, mo_searchTerms);
    });


  });

};


module.exports.listAll = function (req, res, cb_terms) {

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':37 ' + err); }

    db.collection(dbColl).count({}, function (err, countNum) {
      if (err) { logg.byWinston('error', __filename + ':110 ' + err); }

      /* create pagination object which is sent to view file */
      var pagesPreURI = '/search/terms/list/';
      var perPage = 25; //show results per page
      var spanNum = 10; //show pagination numbers. Must be even number (paran broj)
      var pagination_obj = pagination.paginator(req, countNum, pagesPreURI, perPage, spanNum);

      db.collection(dbColl).find({}).sort({_id: -1}).skip(pagination_obj.skipNum).limit(pagination_obj.perPage).toArray(function (err, mo_searchTerms) {
        if (err) { logg.byWinston('error', __filename + ':49 ' + err); }

        cb_terms(res, mo_searchTerms, pagination_obj);
      });

    });


  });

};