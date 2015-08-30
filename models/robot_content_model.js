/**
 * robot_content model
 */

require('rootpath')();
var MongoClient = require('mongodb').MongoClient;
var logg = require('libraries/loggLib');
var pagination = require('libraries/pagination.js');
var mysql      = require('mysql');
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

  // console.log(JSON.stringify(selector, null, 2));

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':111 ' + err); }

    db.collection(coll).remove(selector, options, function (err) { //delete all docs from collection
      if (err) { logg.byWinston('error', __filename + ':114 ' + err); }

      db.collection(coll).drop(function (err) {
        if (err) { logg.byWinston('error', __filename + ':117 ' + err); }

        res.redirect('/admin/robot/content/?currentColl=' + coll);
        console.log(selector);

        // logg.byWinston('info', __filename + ':103 Deleted records:' + status, null);
        db.close();
      });

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
module.exports.exportMysqlSmartsearch = function (req, res) {

  //input
  var contentcol = req.body.contentcol;
  var docLimit = parseInt(req.body.docLimit, 10);
  var myhost = req.body.myhost;
  var myuser = req.body.myuser;
  var mypass = req.body.mypass;
  var mydb = req.body.mydb;
  var mytable = req.body.mytable;
  var deldoc = req.body.deldoc;
  var transInt = req.body.transInt;

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':179 ' + err); }

    db.collection(contentcol).find({}).sort({cid: 1}).limit(docLimit).toArray(function (err, colls_arr) { //all collections in mongodb 'robot_content' sort by 'cid' ascending
      if (err) { logg.byWinston('error', __filename + ':182 ' + err); }

      res.write('========= Export Started ===========');

      //connection to MySQL server
      var myDB = mysql.createConnection({
        host     : myhost,
        user     : myuser,
        password : mypass,
        database : mydb
      });

      myDB.connect(function (err) {
        if (err) {
          logg.byWinston('error', __filename + ':195 -MySQL Error: ' + err);
          myDB.end();
        }
      });

      //iteration with time delay
      var i = 0;
      var intExpID = setInterval(function () {

        if (i < colls_arr.length) {

          //MAPING DATA: MySQL filed = Mongo field
          var keywords = colls_arr[i].extract.body_text[2];
          keywords = keywords.replace(/\"/gi, ''); //removing " from string because " causes MySQL error on insertion
          keywords = keywords.replace(/\'/gi, '');  //removing ' from string
          var link = colls_arr[i].pageURL;
          var title = colls_arr[i].extract.title[2];
          title = title.replace(/\"/gi, '');
          title = title.replace(/\'/gi, '');
          var description = keywords.substring(0, 35) + '...';
          var image;
          if (colls_arr[i].extract.image[2] === '' || colls_arr[i].extract.image[2] === undefined || colls_arr[i].extract.image[2] === null) {
            image = '';
          } else {
            image = colls_arr[i].extract.image[2];
          }

          var myVal = '"", 1, 1, "' + keywords + '", "' + link + '", "' + image + '", "' + title + '", "' + description + '", "free", "", ""';
          var myQuery = 'INSERT INTO ' + mytable + ' VALUES (' + myVal + ')';

          myDB.query(myQuery, function (err) { //insertion into MySQL
            if (err) {
              logg.byWinston('info', __filename + ':217 -MySQL Error: ' + err + '\nNOTEXPORTED:' + link + ' - ' + title);
            } else {

              //message after successfull insertion into MySQL
              var expMsg = '\n' + i + '. EXPORTED:' + link + ' - ' + title;
              res.write(expMsg);
              logg.byWinston('info', expMsg);

              //delete doc from Mongo collection 'robot_content' after insertion
              if (deldoc === 'yes' && colls_arr[i] !== undefined) {
                var cid = colls_arr[i].cid;
                db.collection(contentcol).remove({cid: cid}, function (err, removed) { //remove doc from 'robot_content'
                  if (err) {
                    logg.byWinston('info', __filename + ':182 NOTREMOVED: ' + err);
                  } else {
                    logg.byWinston('info', __filename + ':182 REMOVED: ' + removed);
                  }
                });
              } //if end

            } //else end

          });

          i++;

        } else {
          clearInterval(intExpID); //stop iteration
          myDB.end(); //closing connection to MySQL server
          db.close(); //cloing connection to MongoDB database
          res.write('\n========= Export Finished !!! ===========');
          res.end(); //ending with response
        }

      }, transInt);

    });

  });

};