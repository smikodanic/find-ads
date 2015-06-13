/* Set application global variables*/

require('rootpath')();
var setGlobal = require('libraries/setGlobalLib');


/**
 * Categories from MongoDB 'category' collection
 * @global findadsGLOB.categories
 */
setGlobal.categories();