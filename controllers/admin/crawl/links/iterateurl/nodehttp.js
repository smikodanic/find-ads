/*jslint unparam: true*/

require('rootpath')(); //enable requireing modules from application root folder
var express = require('express');
var router = express.Router();
var nodedump = require('nodedump').dump;
var login = require('libraries/account_login.js');
var logg = require('libraries/logging.js');
var crawl = require('0crawler/ignitURLiteration');

var cb_list_Render = function (res, moTasksDocs_arr, moCatsDocs_arr) {
  var vdata = {
    task: {},
    tasks: moTasksDocs_arr,
    cats: moCatsDocs_arr
  };
  res.render('./admin/tasks/links_iterateurl', vdata);
};

var cb_list2_Render = function (res, moTaskEdit_arr, moTasksDocs_arr, moCatsDocs_arr) {
  var vdata = {
    task: moTaskEdit_arr[0], //task to be edited (object is sent to .ejs file)
    tasks: moTasksDocs_arr, //list tasks
    cats: moCatsDocs_arr //list categories & subcategories in SELECT tags
  };
  res.render('./admin/tasks/links_iterateurl', vdata);
};



module.exports = function (router) {

  router.get('/', function (req, res) {

    //check username and password
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      res.redirect('/admin/tasks/links/iterateurl').end();
    } else {
      res.redirect('/admin');
    }

  });



  router.get('/:task_id', function (req, res) {

    //check username and password
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      crawl.start(req, res);
    } else {
      res.redirect('/admin');
    }

  });


};
