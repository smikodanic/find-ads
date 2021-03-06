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

};



module.exports.homeSearchOut = function (collName, req, res, cb_render) {

  /**
   * INPUT VARS
   * String q ('all' for empty query)
   * Number category (-1 for all categories)
   * Number country (-1 for all countries)
   */
  var q, category, country;

  if (req.method === 'POST') {

    q = (req.body.q === '') ? 'all' : req.body.q;
    category = parseInt(req.body.category, 10);
    country = parseInt(req.body.country, 10);

  } else { //GET method (request comes from pagination link)

    q = (req.params.q === '') ? 'all' : req.params.q;
    category = parseInt(req.params.category, 10);
    country = parseInt(req.params.country, 10);
  }


  /* define mongo query */
  var queryDB;
  if (q === 'all' && category === -1 && country === -1) {
    queryDB = {};
  } else if (q !== 'all' && category === -1 && country === -1) {
    queryDB = { $text: { $search: q } };
  } else if (q !== 'all' && category !== -1 && country === -1) {
    queryDB = { $text: { $search: q }, category: category };
  } else if (q !== 'all' && category !== -1 && country !== -1) {
    queryDB = { $text: { $search: q }, category: category, country: country };
  } else if (q !== 'all' && category === -1 && country !== -1) {
    queryDB = { $text: { $search: q }, country: country };
  } else if (q === 'all' && category !== -1 && country === -1) {
    queryDB = { category: category };
  } else {
    queryDB = {cid: -1};
  }

  // console.log(JSON.stringify(queryDB, null, 2));

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':126 ' + err); }

    db.collection(collName).count(queryDB, function (err, countNum) {
      if (err) { logg.byWinston('error', __filename + ':129 ' + err); }

      //convert 'some query' INTO 'some+query'
      var q2 = urlmod.encodeParameter(q);

      /* create pagination object which is sent to view file */
      var pagesPreURI = '/search/' + q2 + '/' + category + '/' + country + '/';
      var perPage = 10; //show results per page
      var spanNum = 6; //show pagination numbers. Must be even number (paran broj)
      var pagination_obj = pagination.paginator(req, countNum, pagesPreURI, perPage, spanNum);

      db.collection(collName).find(queryDB).skip(pagination_obj.skipNum).limit(pagination_obj.perPage).toArray(function (err, moContent_arr) {
        if (err) { logg.byWinston('error', __filename + ':141 ' + err); }

        /* insert search term into mongo collection */
        if (countNum !== 0 && q !== 'all' && req.method === 'POST') {

          //IP
          var ip = urlmod.getIP(req);

          var insMoDoc = {
            term: q,
            results: countNum,
            url: pagesPreURI,
            date: timeLib.nowSQL(),
            ip: ip
          };

          db.collection(dbColl_searchTerms).insert(insMoDoc, function (err) { //insert search query
            if (err) { logg.byWinston('error', __filename + ':158 ' + err); }

            cb_render(q, category, country, res, moContent_arr, pagination_obj);
          });

        } else {

          cb_render(q, category, country, res, moContent_arr, pagination_obj);
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
    var dbQuery = {"cid": cid};
    // console.log(JSON.stringify(dbQuery, null, 2));

    db.collection(collName).find(dbQuery).toArray(function (err, moContent_arr) {
      if (err) { logg.byWinston('error', __filename + ':172 ' + err); }

      cb_advert(res, moContent_arr);
    });

  });

};



/**
 * Browse ads by category and subcategory
 * @param  {String} collName - mongoDB collection name: 'content'
 * @param  {Object} req      - request object
 * @param  {Object} res      - respond object
 * @param  {Function} cb_list  - callback function to display results
 */
module.exports.browse = function (collName, inputParams, req, res, cb_list) {

  /* input vars*/
  var cat = inputParams.cat;
  var catId = inputParams.catId;
  var subcat = inputParams.subcat;
  var subcatKey = inputParams.subcatKey;


  /* define dbQuery */
  var dbQuery;
  if (isNaN(subcatKey)) { //only category is defined
    dbQuery = {category: catId};
  } else { //when subcategory is also defined
    dbQuery = {category: catId, subcategory: subcatKey};
  }


  /* Mongo query */
  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':234 ' + err); }

    db.collection(collName).count(dbQuery, function (err, countNum) {
      if (err) { logg.byWinston('error', __filename + ':237 ' + err); }

      /* create pagination object which is sent to view file */
      var pagesPreURI;
      if (subcat === undefined) { //only category is defined
        pagesPreURI = '/browse/' + cat + '-id' + catId + '/';
      } else { //category and subcategory are defined
        pagesPreURI = '/browse/' + cat + '-id' + catId + '/' + subcat + '-key' + subcatKey + '/';
      }
      var perPage = 10; //show results per page
      var spanNum = 6; //show pagination numbers. Must be even number (paran broj)
      var pagination_obj = pagination.paginator(req, countNum, pagesPreURI, perPage, spanNum);

      db.collection(collName).find(dbQuery).sort({cid: -1}).skip(pagination_obj.skipNum).limit(pagination_obj.perPage).toArray(function (err, mo_content) {
        if (err) { logg.byWinston('error', __filename + ':251 ' + err); }

        cb_list(res, mo_content, pagination_obj);
        db.close();
      });

    });

  });

};