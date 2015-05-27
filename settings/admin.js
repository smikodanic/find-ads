/**
 * General settings
 *
 * logMode:
 * 'dev' - development mode: loging to console
 * 'pro' - production mode: logging to file
 */

module.exports = {

  nodeBinFile: '/usr/bin/node',
  username: 'admin',
  password: 'astra',
  logMode: 'dev', //dev | pro
  logDir: 'tmp/logs/',
  cronInitFile: '1cron/cronInit.js',
  timeZone: 'Europe/Zagreb',
  mongo: {
    dbName: 'mongodb://localhost:27017/crawler',
    dbColl_category: 'category',
    dbColl_tasksLnk_iterate: 'linkTasks_iterate',
    dbColl_tasksCnt: 'contentTasks'
  }

};