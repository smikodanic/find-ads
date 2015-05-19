require('rootpath')(); //enable requireing modules from application root folder
var express = require('express');
var router = express.Router();
var login = require('libraries/account_login.js');
var taskContent_model = require('models/taskContent_model');

var cb_list_Render = function (res, linkQueue_colls, moTasksDocs_arr) {
  var vdata = {
    task: {},
    linkQueue_colls: linkQueue_colls,
    tasks: moTasksDocs_arr
  };
  res.render('./admin/crawlcontent/tasksContent', vdata);
};



module.exports = function (router) {


  router.get('/', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      taskContent_model.listTasks(res, cb_list_Render);
    } else {
      res.redirect('/admin');
    }

  });


  //insert into MongoDB
  router.post('/insert', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      taskContent_model.insertTask(req, res);
    } else {
      res.redirect('/admin');
    }

  });


  //delete task from MongoDB
  router.get('/delete/:id', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      taskContent_model.deleteTask(req, res);
    } else {
      res.redirect('/admin');
    }

  });


};
