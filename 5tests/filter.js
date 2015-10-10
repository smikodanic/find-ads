/**
 * Remove same elements from array
 */

var arr = [1, 2, 1, 5, 2, 3, 5, 1];


/**
 * Ova funkcija uzima po redu jedan po jedan element i uklanja sve naredne elemente ako su isti kao taj element.
 */
arr = arr.filter(function (elem, index, self) {
  console.log(JSON.stringify(self.indexOf(elem), null, 2));
  return index === self.indexOf(elem);
});

console.log(JSON.stringify(arr, null, 2)); // [1, 2, 5, 3]