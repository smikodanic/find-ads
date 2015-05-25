require('rootpath')(); //enable requireing modules from application root folder
var express = require('express');
var router = express.Router();
var login = require('libraries/accountLoginLib.js');
var links_model = require('models/links_model');

var cb_list_Render = function (res, moTasksDocs_arr, moQueueDocs_arr, pagination_obj) {
  var vdata = {
    tasks: moTasksDocs_arr,
    queue: moQueueDocs_arr,
    pagination: pagination_obj
  };
  // console.log(JSON.stringify(vdata, null, 2));
  res.render('./admin/crawllinks/resultsiteration', vdata);
  // res.send(nodedump(moTasksDocs_arr));
};

module.exports = function (router) {


  router.get('/*', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      links_model.listLinks(req, res, cb_list_Render);
    } else {
      res.redirect('/admin');
    }

  });


  router.post('/', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      links_model.listLinks(req, res, cb_list_Render);
    } else {
      res.redirect('/admin');
    }

  });

};
