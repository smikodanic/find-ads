/**
 * crawler.ads model
 */

var MongoClient = require('mongodb').MongoClient;
var pagination = require('../libraries/pagination.js');

module.exports.list_ads = function (req, res, cb_list) {

  //category from req
  var category = req.params.category;

  //define query
  var query;
  if (category === 'all') {
    query = {};
  } else {
    query = {category: category};
  }

  MongoClient.connect("mongodb://localhost:27017/crawler", function (err, db) {

    if (err) {
      console.log('MongoDB Err1:' + err);
    } else {

      //count results
      db.collection('ads').count(query, function (err, countNum) {
        if (err) {
          console.log('MongoDB ErrCount: ' + err);
        } else {

          /* create pagination object which is sent to view file */
          var pagesPreURI = '/admin/ads/' + req.params.category + '/'; // /admin/ads/12/2 --- pagination page = 2
          var perPage = 4; //show results per page
          var spanNum = 4; //show pagination numbers. Must be even number (paran broj)
          var pagination_obj = pagination.paginator(req, countNum, pagesPreURI, perPage, spanNum);

          //list results
          db.collection('ads').find(query).skip(pagination_obj.skipNum).limit(pagination_obj.perPage).toArray(function (err, moDocs_arr) {
            if (err) {
              console.log('MongoDB Err2:' + err);
            } else {
              cb_list(category, res, moDocs_arr, pagination_obj);
              db.close();
            }
          });
          //list results

        }
      });
      //count results end


    } //else

  }); //connect

};