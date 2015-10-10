require('rootpath')();
var express = require('express');
var router = express.Router();
// var nodedump = require('nodedump').dump;
var login = require('libraries/accountLoginLib.js');
var filedir = require('libraries/filedirLib.js');
var robot_content_model = require('models/robot_content_model');


/* view render, callback function */
var cb_render = function (req, res, contentcolls) {

  var vdata = {
    contentcolls: contentcolls,
    req: req
  };

  res.set('Content-Type', 'text/html');
  res.render('./admin/robot/exporter/mysql', vdata);
};




module.exports = function (router) {


  //open exporter HTML form
  router.get('/', function (req, res) {

    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {

      robot_content_model.getContentCollections(req, res, cb_render);

    } else {
      res.redirect('/admin');
    }

  });



  //start transfer from mongodb to mysql
  router.post('/transfer', function (req, res) {

    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {

      robot_content_model.exportMysqlSmartsearch(req, res, cb_render);

    } else {
      res.redirect('/admin');
    }

  });


};