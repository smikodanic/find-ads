/**
 * Account login
 */

/**
 * Check if username and password sent from form are coresponding to settings data
 * @param Object req [NodeJS request object which carry POST variables from FORM]
 * @return boolean
 */
module.exports.checkform_user_pass = function (req) {

  //get username and password sent from login FORM
  var u_post = req.body.username;
  var p_post = req.body.password;

  //get username and password from /settings/admin.js 
  var settings_admin = require('../settings/admin.js');
  var username = settings_admin.username;
  var password = settings_admin.password;

  if (u_post === username && p_post === password) {
    return true;
  }
  return false;

};


/**
 * Check if username and password are good in session storage (file, memcached, mongodb ...)
 * @param Object req [NodeJS request object which carry POST variables from FORM]
 * @return boolean
 */
module.exports.checksess_user_pass = function (req) {

  //get username and password sent from session file
  var u_sess = req.session.username;
  var p_sess = req.session.password;

  //get username and password from /settings/admin.js 
  var settings_admin = require('../settings/admin.js');
  var username = settings_admin.username;
  var password = settings_admin.password;

  if (u_sess === username && p_sess === password) {
    return true;
  }
  return false;

};


/**
 * Set session data. Usually stores it into file /tmp/sessions/asdafasfsadgfhgghfg.json
 * @param Object req [NodeJS request object which carry POST variables from FORM]
 */
module.exports.set_session_from_form = function (req) {

  //get username and password sent from login FORM
  var u_post = req.body.username;
  var p_post = req.body.password;

  //create session file and set 
  req.session.username = u_post;
  req.session.password = p_post;

  return null;
};


/**
 * Remove session data and delete session file /tmp/sessions/asdafasfsadgfhgghfg.json
 * @param Object req [NodeJS request object which carry POST variables from FORM]
 */
module.exports.destroy_session = function (req) {

  req.session.destroy(function (err) {

    if (err) {
      console.log('ERR destroy_session: ' + err);
    }

  });

};