/**
 * General settings
 *
 * Logging:
 * 'dev' - development mode: loging to console and file
 * 'pro' - production mode: logging to file only
 */

module.exports = {

  nodeBinFile: '/usr/bin/node',
  username: 'admin',
  password: 'astra',
  logging: 'dev',
  cronInitFile: '1cron/cronInit.js',
  timeZone: 'Europe/Zagreb',
  mongo: {
    dbName: 'mongodb://localhost:27017/crawler',
    dbColl_category: 'category',
    dbColl_tasks1: 'taskLink_iterate',
    dbColl_tasksCnt: 'contentTasks'
  }

};