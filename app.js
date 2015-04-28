/*jslint unparam: true*/

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var enrouten = require('express-enrouten'); //routing

//session
var session = require('express-session');
var FileStore = require('session-file-store')(session);

var routes = require('./routes/index');
// var admin_index = require('./routes/admin/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public'))); //__dirname = "/homenode/find-ads"

//session
var fileStore_options = {
  path: "./tmp/sessions/",
  useAsync: true,
  reapInterval: 5000,
  maxAge: 10000
};
app.use(session({
  store: new FileStore(fileStore_options),
  secret: '2015tajnikljuc',
  resave: true,
  saveUninitialized: false, //if 'false' then session cookie is not created unless req.session.username = 'value' is set
  unset: 'destroy',
  ephemeral: true //deletes the cookie when the browser is closed. Ephemeral cookies are particularly important if you your app lends itself to use on public computers.
}));

//routing into /controllers/ dir
app.use(enrouten({
  index: 'controllers/index.js',
  directory: 'controllers',
  routes: [
    // { path: '/proba', method: 'GET', handler: require('./controllers/proba.js') },
    // { path: '/admin', method: 'GET', handler: require('./routes/admin'), middleware: [isAuthenticated] }
  ],
  // middleware: [middleware1, middleware2, ...etc]
}));




app.use('/', routes);
// app.use('/admin', admin_index);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
