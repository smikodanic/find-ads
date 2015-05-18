/**
 * crawler.category model
 */

require('rootpath')();
var MongoClient = require('mongodb').MongoClient;
var logg = require('libraries/logging.js');

//mongo parameters
var settings = require('settings/admin.js');
var dbName = settings.mongo.dbName;
var collName_tasksCnt = settings.mongo.dbColl_tasksCnt;
var collName_cat = settings.mongo.dbColl_category;

module.exports.listTasks = function (res, cb_list) {

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.me('error', __filename + ':18 ' + err); }

    db.collections(function (err, colls) { //get all collections from database
      if (err) { logg.me('error', __filename + ':21 ' + err); }

      //filtering only linkQueue_* collections from array
      var linkQueue_colls = colls.filter(function (elem) {
        var reg = new RegExp('^linkQueue.*');
        return reg.test(elem.collectionName); //returns true or false
      });

      db.collection(collName_tasksCnt).find({}).sort({id: 1}).toArray(function (err, moTasksDocs_arr) {
        if (err) { logg.me('error', __filename + ':30 ' + err); }

        cb_list(res, linkQueue_colls, moTasksDocs_arr);
        db.close();
      });

    });

  }); //connect

};


/**
 * Insert new content task into MongoDB collection defined with 'collName_tasksCnt'
 * NOTICE: In order to work correctly set to 'true' app.use(bodyParser.urlencoded({ extended: true })); in /app.js file,
 * otherwise req.body.selectorName and req.body.selectorValue will not work 
 * 
 */
module.exports.insertTask = function (req, res) {

  /*create selectors array*/
  var selectors = [], selector_str, selector_obj;
  req.body.selectorName.forEach(function (elem, key) {

    if (elem !== '') {
      selector_str = '{"' + elem + '": "' + req.body.selectorValue[key] + '"}';
      selector_obj = JSON.parse(selector_str);

      selectors.push(selector_obj);
    }

  });
  // console.log(JSON.stringify(selectors));


  /*define document to be inserted*/
  var insDoc;
  if (req.body.name !== '') {
    //removing selectorName and selectorValue arrays and replacing it with selectors array
    insDoc = req.body;
    delete insDoc.selectorName;
    delete insDoc.selectorValue;
    insDoc.selectors = selectors;

  } else {
    insDoc = null;
  }
  console.log(JSON.stringify(insDoc, null, 2));


  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.me('error', __filename + ':77 ' + err); }

    if (insDoc !== null) {

      db.collection(collName_tasksCnt).find().sort({id: -1}).limit(1).toArray(function (err, moDocs_arr) { //find max ID
        if (err) { logg.me('error', __filename + ':82 ' + err); }

        //define new insDoc.id from max id value
        if (moDocs_arr[0] !== undefined) {
          insDoc.id = moDocs_arr[0].id + 1;
        } else {
          insDoc.id = 0;
        }

        db.collection(collName_tasksCnt).insert(insDoc, function (err) {
          if (err) { logg.me('error', __filename + ':92 ' + err); }

          db.close();

          //on successful insertion do redirection
          res.redirect('/admin/crawlcontent/tasks');
        });

      });
    } else {
      res.send('Cannot insert empty doc!').end();
    }

  }); //connect

};



