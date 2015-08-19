/**
 * Testing regexp object
 */

var reg1 = new RegExp('\\w.js', 'i');
var reg2 = /benisasilly(.+)/;

console.log(JSON.stringify(reg2, null, 2)); //  {}
console.log(JSON.stringify(reg1.toString(), null, 2)); //  "/\\w.js/i"
console.log(reg2); //  /benisasilly(.+)/