require('rootpath')(); //enable requireing modules from application root folder
var express = require('express');
var router = express.Router();
var login = require('libraries/accountLoginLib.js');
var filedir = require('libraries/filedirLib.js');
var robotTasks_model = require('models/robotTasks_model');

var cb_list_Render = function (res, moTasksDocs_arr, moCatsDocs_arr) {
  var vdata = {
    task: {},
    tasks: moTasksDocs_arr,
    cats: moCatsDocs_arr,
    pollingFiles: filedir.listJSFiles('0crawler/robot/polling/'),
    httpclientFiles: filedir.listJSFiles('0crawler/robot/httpclient/')
  };
  res.render('./admin/robot/tasks', vdata);
};

var cb_list2_Render = function (res, moTasksDocs_arr, moCatsDocs_arr, moTaskEdit_arr) {
  var vdata = {
    task: moTaskEdit_arr[0],
    tasks: moTasksDocs_arr,
    cats: moCatsDocs_arr,
    pollingFiles: filedir.listJSFiles('0crawler/robot/polling/'),
    httpclientFiles: filedir.listJSFiles('0crawler/robot/httpclient/')
  };
  res.render('./admin/robot/tasks', vdata);
};




module.exports = function (router) {


  router.get('/', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      robotTasks_model.listTasks(res, cb_list_Render);
    } else {
      res.redirect('/admin');
    }

  });


  //insert into MongoDB
  router.post('/insert', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      console.log('works !!!');
      robotTasks_model.insertTask(req, res);
    } else {
      res.redirect('/admin');
    }

  });


  //delete task from MongoDB
  router.get('/delete/:id', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      robotTasks_model.deleteTask(req, res);
    } else {
      res.redirect('/admin');
    }

  });


  //edit task
  router.get('/edit/:id', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      robotTasks_model.editTask(req, res, cb_list2_Render);
    } else {
      res.redirect('/admin');
    }

  });


  //update task
  router.post('/update/:id', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      robotTasks_model.updateTask(req, res);
    } else {
      res.redirect('/admin');
    }

  });



}; //module end
