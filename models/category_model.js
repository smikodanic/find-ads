/**
 * crawler.category model
 */

var MongoClient = require('mongodb').MongoClient;

/* Send error to browser */
var errSend_browser = function (err, res) {
  res.send('category_model.js -:' + err);
};


module.exports.insertCategory = function (req, res) {

  //POST variables
  var cat = req.body.cat;
  var subcats = req.body.subcats; //string
  var subcats_arr = subcats.split(',');

  //define document to be inserted
  var insDoc;
  if (cat !== '' && subcats !== '') {
    insDoc = {
      "id": 0,
      "category": cat,
      "subcats": subcats_arr
    };
  } else {
    insDoc = null;
  }


  MongoClient.connect("mongodb://localhost:27017/crawler", function (err, db) {

    if (err) {
      errSend_browser(err, res);
    } else {

      if (insDoc !== null) {
        db.collection('category').find().sort({id: -1}).limit(1).toArray(function (err, moDocs_arr) { //find max ID


          //define new insDoc.id from max id value
          if (moDocs_arr[0] !== undefined) {
            insDoc.id = moDocs_arr[0].id + 1;
          } else {
            insDoc.id = 0;
          }

          db.collection('category').insert(insDoc, function (err) {
            if (err) {
              //show error if exists
              errSend_browser(err, res);
            } else {
              //on successful insertion do redirection
              res.redirect('/admin/categories/');
            }

            db.close();
          });

        });

      } else {
        res.send('Cannot insert empty doc!');
      }

    } //else end

  }); //connect

};


module.exports.listCategories = function (res, cb_list) {

  MongoClient.connect("mongodb://localhost:27017/crawler", function (err, db) {

    if (err) {
      errSend_browser(err, res);
    } else {

      //list results
      db.collection('category').find({}).sort({id: -1}).toArray(function (err, moDocs_arr) {
        if (err) {
          errSend_browser(err, res);
        } else {
          cb_list(res, moDocs_arr);
          db.close();
        }
      });

    } //else

  }); //connect

};



module.exports.deleteCategory = function (req, res) {

  //id from req e.g. from URI
  var id_req = parseInt(req.params.id, 10); //use parseint to convert string into number

  //define selector and deleting options
  var selector, options;
  if (req.params.id === 'all') {
    selector = {};
    options = {};
  } else {
    // selector = {id: id_req};
    selector = {"id": id_req};
    options = {};
  }

  MongoClient.connect("mongodb://localhost:27017/crawler", function (err, db) {

    if (err) {
      errSend_browser(err, res);
    } else {

      // db.collection('category', function (err, collect) {
      //   if (err) { errSend_browser(err, res); }
      //   collect.remove(selector, options, function (err, result) {
      //     if (err) { errSend_browser(err, res); }
      //     res.redirect('/admin/categories/');
      //     console.log('\nDeleted records: ' + result);
      //   });
      // });

      db.collection('category').remove(selector, options, function (err, status) {
        if (err) {
          errSend_browser(err, res);
        } else {
          res.redirect('/admin/categories/');
          console.log('\nDeleted records: ' + status);
        }

        db.close();
      });
      //count results end


    } //else

  }); //connect

};
