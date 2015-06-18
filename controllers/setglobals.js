/* Set application global variables*/

require('rootpath')();
var setGlobal = require('libraries/setGlobalLib');


/**
 * Categories from MongoDB 'category' collection
 * @global GLOBfindads.categories
 */
setGlobal.categories();


/**
 * Latest ads from MongoDB 'content' collection
 * @global GLOBfindads.latestContent
 *
 */
setGlobal.latestContent('content', 5);