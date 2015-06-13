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

  nodeBinFile: '/usr/bin/node',
  appDir: appDir,
  username: 'admin',
  password: 'astra',
  logMode: 'dev', //dev | pro
  logDir: appDir + '/tmp/logs/',
  cronInitFile: appDir + '/1cron/cronInitCrawlers.js',
  timeZone: 'Europe/Zagreb',
  mongo: {
    dbName: 'mongodb://crawler_user:astra1971@vps.mikosoft.info:27017/crawler',
    dbColl_category: 'category',
    dbColl_tasksLnk_iterate: 'linkTasks_iterate',
    dbColl_tasksCnt: 'contentTasks',
    dbColl_searchTerms: 'searchTerms'
  }

};