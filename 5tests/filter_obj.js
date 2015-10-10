/**
 * Remove elements from array with same property
 */

var obj_arr = [
  {x: 1, y: 2},
  {x: 1, y: 3},
  {x: 2, y: 2},
  {x: 1, y: 2},
  {x: 5, y: 5},
  {x: 3, y: 2},
  {x: 3, y: 2}
];


//map array to 'x' properties only: [1,1,2,5,3,3]
var map_arr = obj_arr.map(function (el) {
  return el.x;
});

//filtering - remove duplicated elemets from map_arr : [1,2,5,3]
var map_arr_filtered = map_arr.filter(function (elem, index, self) {
  return index === self.indexOf(elem);
});



console.log(JSON.stringify(map_arr_filtered, null, 2)); // [1, 2, 3, 5]