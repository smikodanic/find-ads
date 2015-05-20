/**
 * General settings
 *
 * Logging:
 * 'dev' - development mode: loging to console and file
 * 'pro' - production mode: logging to file only
 */

module.exports = {

  username: 'admin',
  password: 'astra',
  logging: 'pro',
  mongo: {
    dbName: 'mongodb://localhost:27017/crawler',
    dbColl_category: 'category',
    dbColl_tasks1: 'taskLink_iterate',
    dbColl_tasksCnt: 'contentTasks',
    dbColl_cnt: 'content'
  }

};