/**
 * General settings
 *
 * logMode:
 * 'dev' - development mode: loging to console
 * 'pro' - production mode: logging to file
 */
var path = require('path');


// node application root directory path: /homenode/find-ads
var appDir = path.resolve(__dirname, '../');


module.exports = {

  // nodeBinFile: '/usr/bin/node', //Ubuntu
  nodeBinFile: '/usr/local/bin/node', //CentOS
  appDir: appDir,
  username: 'admin',
  password: 'astra',
  logMode: 'dev', //dev | pro
  logDir: appDir + '/tmp/logs/',
  cronInitFile: appDir + '/1cron/cronInitCrawlers.js',
  timeZone: 'Europe/Zagreb',
  // casperBinFile: '/usr/lib/node_modules/casperjs/bin/casperjs', //Ubuntu
  casperBinFile: '/usr/local/bin/casperjs', //CentOS
  mongo: {
    // dbName: 'mongodb://crawler_user:astra1971@localhost:27017/crawler', //Ubuntu
    dbName: 'mongodb://crawler_user:gmhmln123@192.99.21.142:27017/crawler', //CentOS
    dbColl_category: 'category',
    dbColl_tasksLnk_iterate: 'linkTasks_iterate',
    dbColl_tasksCnt: 'contentTasks',
    dbColl_searchTerms: 'searchTerms',
    dbColl_content: 'content',
    dbColl_robotTasks: 'robot_tasks'
  }

};
