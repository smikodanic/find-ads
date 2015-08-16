/**
 * robot_content model
 */

require('rootpath')();
var MongoClient = require('mongodb').MongoClient;
var logg = require('libraries/loggLib');
var pagination = require('libraries/pagination.js');
// var nodedump = require('nodedump').dump;

//mongo parameters
var settings = require('settings/admin.js');
var dbName = settings.mongo.dbName;
var collName_tasks = settings.mongo.dbColl_robotTasks;



module.exports.listContent = function (req, res, cb_list) {

  //input variables
  var q, currentColl;
  if (req.method === 'GET') {
    q = (req.query.q === undefined) ? '' : req.query.q;
    currentColl = (req.query.currentColl === undefined) ? '' : req.query.currentColl;
  } else {
    q = (req.body.q === undefined) ? '' : req.body.q;
    currentColl = (req.body.currentColl === undefined) ? '' : req.body.currentColl;
  }

  if (currentColl === undefined || currentColl === '') {
    currentColl = 'robot_content';
  }


  //define db query
  var queryDB;
  if (q === '') {
    queryDB = {};
  } else {
    var reg = new RegExp(q, 'ig'); //creating regular expression
    queryDB = {
      $or: [
        {"pageURL": {$regex: reg}},
        {"extract.title": {$elemMatch: {$regex: reg}}},
        {"extract.body_text": {$elemMatch: {$regex: reg}}}
      ]
    };
    // queryDB = {$or: [{ "extract.title[2]": {"$regex": reg} }, { "extract.body_text[2]": {"$regex": reg} }]};
  }


  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':47 ' + err); }

    db.listCollections().toArray(function (err, collections_arr) { //all collections in db
      if (err) { logg.byWinston('error', __filename + ':50 ' + err); }


      var contentColls = collections_arr.filter(function (elem) {
        return elem.name.indexOf('robot_content') !== -1;
      });


      db.collection(currentColl).count(queryDB, function (err, countNum) { // gets data from 'robot_content'
        if (err) { logg.byWinston('error', __filename + ':58 ' + err); }

        /* create pagination object which is sent to view file */
        var pagesPreURI = '/admin/robot/content/?q=' + q + '&currentColl=' + currentColl + '&currentPage=';
        var perPage = 5; //show results per page
        var spanNum = 8; //show pagination numbers. Must be even number (paran broj)
        var pagination_obj = pagination.paginator(req, countNum, pagesPreURI, perPage, spanNum);

        db.collection(currentColl).find(queryDB).sort({cid: 1}).skip(pagination_obj.skipNum).limit(pagination_obj.perPage).toArray(function (err, moContentDocs_arr) {
          if (err) { logg.byWinston('error', __filename + ':67 ' + err); }

          cb_list(res, currentColl, contentColls, moContentDocs_arr, pagination_obj);
        });

      });

    });

  }); //connect

};





module.exports.deleteContent = function (req, res) {

  //input
  var coll = req.params.coll;

  //define selector and deleting options
  var selector, options;
  if (req.params.cid === 'all') {
    selector = {}; //delete all content, empty collection
    options = {};
  } else {
    var cid = parseInt(req.params.cid, 10);
    selector = {"cid": cid};
    options = {};
  }

  console.log(JSON.stringify(selector, null, 2));

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':96 ' + err); }

    db.collection(coll).remove(selector, options, function (err) {
      if (err) { logg.byWinston('error', __filename + ':99 ' + err); }

      res.redirect('/admin/robot/content/?currentColl=' + coll);
      console.log(selector);

      // logg.byWinston('info', __filename + ':103 Deleted records:' + status, null);
      db.close();
    });

  }); //connect

};



/**
 * Used in /admin/robot/exporter/mysql.js to list all 'content_*' colletions in collect tag.
 * @param  {Object} req     - request
 * @param  {Object} res     - response
 * @param  {Function} cb_render - callback view function
 * @return null
 */
module.exports.getContentCollections = function (req, res, cb_render) {

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':138 ' + err); }

    db.listCollections().toArray(function (err, collections_arr) { //all collections in db
      if (err) { logg.byWinston('error', __filename + ':141 ' + err); }

      //filter only 'content' and 'content_*' MongoDB collections
      var contentcolls = collections_arr.filter(function (elem) {
        var reg = new RegExp('^robot_content.*');
        return reg.test(elem.name); //returns true or false
      });

      cb_render(req, res, contentcolls);
    });

  });

};


/**
 * ========== https://www.smartsearch.tv , https://www.smartsearch.tv/admin/users , http://192.99.18.15/phpmyadmin/
 * Exporter to MySQL databse: 'smartsearch.links' ; crawler_user; mycr321;
 * @param  {Object} req     - request
 * @param  {Object} res     - response
 * @param  {Function} cb_render - callback view function
 * @return null
 */
module.exports.exportMysqlSmartsearch = function (req, res, cb_render) {

  //input
  var contentcol = req.body.contentcol;
  var myhost = req.body.myhost;
  var myuser = req.body.myuser;
  var mypass = req.body.mypass;
  var delcoll = req.body.delcoll;

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':175 ' + err); }

    db.collection(contentcol).find({}).sort({cid: 1}).toArray(function (err, colls_arr) { //all collections in mongodb 'robot_content' sort by 'cid' ascending
      if (err) { logg.byWinston('error', __filename + ':178 ' + err); }

      //iteration with time delay
      var i = 0;
      var intExpID = setInterval(function () {

        if (i < colls_arr.length) {

          console.log(JSON.stringify(colls_arr[i].extract.title[2], null, 2));
          res.write('\n' + colls_arr[i].extract.title[2]);
          i++;
        } else {
          clearInterval(intExpID);
          db.close();
          res.end();
        }

      }, 1000);

    });

  });

};