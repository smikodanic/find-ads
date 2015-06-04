/**
 * crawler.content model
 */

require('rootpath')();
var MongoClient = require('mongodb').MongoClient;
var logg = require('libraries/loggLib');
var pagination = require('libraries/pagination.js');
var urlmod = require('libraries/urlmod');
var timeLib = require('libraries/timeLib');
// var nodedump = require('nodedump').dump;

//mongo parameters
var sett = require('settings/admin.js');
var dbName = sett.mongo.dbName;
var dbColl_searchTerms = sett.mongo.dbColl_searchTerms;

/**
 * Insert content into 'content_*' collection during crawling
 * @param  {String} pageURL  - url of pagination link: http://www.adsuu.com/business-offer-9/
 * @param  {Object} db       - db mongo object
 * @param  {String} contentCollection - MongoDB collection name: content_business
 * @param  {Object} insMoDoc - MongoDB document to be inserted: {_id, task_is, page, dateTime, links[]}
 * @return {[type]}          [description]
 */
module.exports.insertContent = function (pageURL, db, contentCollection, insMoDoc) {

  db.collection(contentCollection).createIndex({pageURL: 1}, {unique: true, sparse: true}, function (err) { //create unique index to prevent duplicated documents
    if (err) { logg.byWinston('error', __filename + ':29 ' + err); }

    db.collection(contentCollection).find({"pageURL": pageURL}).toArray(function (err, moContent_arr) { //check if doc e.g. pageURL already exists
      if (err) { logg.byWinston('error', __filename + ':30 ' + err); }

      //if collection already exists do UPDATE
      if (moContent_arr.length !== 0) {

        //return the same 'cid'
        insMoDoc.cid = moContent_arr[0].cid;
        insMoDoc.crawlStatus = 'UPD'; //record is updated

        db.collection(contentCollection).update({"pageURL": pageURL}, insMoDoc, function (err) {
          if (err) {
            logg.craw(false, 'crawlingContent_dump', '--------  ERROR when updating MongoDB: ' + err);
          } else {
            logg.craw(false, 'crawlingContent_dump', '--------  UPDATED in MongoDB');
          }
        });

      } else { //if collection doesn't exist do INSERT

        db.collection(contentCollection).find().sort({cid: -1}).limit(1).toArray(function (err, moDocs_arr) { //find max 'cid'
          if (err) { logg.byWinston('error', __filename + ':48 ' + err); }


          //define new insDoc.id from max id value
          if (moDocs_arr[0] !== undefined) {
            insMoDoc.cid = moDocs_arr[0].cid + 1;
          } else {
            insMoDoc.cid = 0;
          }

          insMoDoc.crawlStatus = 'INS'; //new record inserted


          db.collection(contentCollection).insert(insMoDoc, function (err) {
            if (err) {
              logg.craw(false, 'crawlingContent_dump', '--------  ERROR when inserting in MongoDB: ' + err);
            } else {
              logg.craw(false, 'crawlingContent_dump', '--------  INSERTED in MongoDB');
            }
          });


        });

      }

    });

  });

};



module.exports.homeSearchOut = function (collName, q, req, res, cb_render) {

  if (req.method === 'GET') { //when request comes from pagination link, not form's POST
    q = urlmod.unencodeParameter(q); //convert 'some-query' into 'some query'
  }

  //define query
  var queryDB;
  if (q === 'all') {
    queryDB = {};
  } else {
    var reg = new RegExp(q, 'ig'); //creating regular expression
    queryDB = {
      "extract.description": {"$regex": reg}
    };
    // queryDB = {"links.tekst": reg};
  }



  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':107 ' + err); }

    db.collection(collName).count(queryDB, function (err, countNum) {
      if (err) { logg.byWinston('error', __filename + ':110 ' + err); }

      //convert 'some query' INTO 'some+query'
      var q2 = urlmod.encodeParameter(q);

      /* create pagination object which is sent to view file */
      var pagesPreURI = '/search/' + q2 + '/';
      var perPage = 25; //show results per page
      var spanNum = 10; //show pagination numbers. Must be even number (paran broj)
      var pagination_obj = pagination.paginator(req, countNum, pagesPreURI, perPage, spanNum);

      db.collection(collName).find(queryDB).sort({cid: -1}).skip(pagination_obj.skipNum).limit(pagination_obj.perPage).toArray(function (err, moContent_arr) {
        if (err) { logg.byWinston('error', __filename + ':122 ' + err); }

        /* insert search term into mongo collection */
        if (countNum !== 0 && pagination_obj.currentPage < 2 && q !== 'all' && req.method === 'POST') {

          var insMoDoc = {
            term: q,
            results: countNum,
            url: pagesPreURI,
            date: timeLib.nowSQL(),
            ip: req.connection.remoteAddress
          };

          db.collection(dbColl_searchTerms).insert(insMoDoc, function (err) { //insert search query
            if (err) { logg.byWinston('error', __filename + ':136 ' + err); }

            cb_render(q, res, moContent_arr, pagination_obj);
          });

        } else {

          cb_render(q, res, moContent_arr, pagination_obj);
        }


      });

    });

  }); //connect

};



/**
 * Get content data by 'cid'
 * @param {string} collName -MongoDB collection name
 * @param {number} cid -content ID
 */
module.exports.getDataByCid = function (collName, cid, res, cb_advert) {

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':168 ' + err); }


    //Mongo query
    cid = parseInt(cid, 10); //convert string to number
    var dbQuery = {cid: cid};
    // console.log(JSON.stringify(dbQuery, null, 2));

    db.collection(collName).find(dbQuery).toArray(function (err, moContent_arr) {
      if (err) { logg.byWinston('error', __filename + ':172 ' + err); }

      cb_advert(res, moContent_arr);
    });

  });

};