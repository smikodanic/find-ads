/**
 * Pagination library
 */

/**
 * Creating pagination object
 * @param Object req [NodeJS request object which carry POST variables from FORM]
 * @return pagination object
 */
module.exports.paginator = function (req, countNum) {

  /*pagination object*/
  var currentPage = parseInt(req.params.currentPage, 10);
  var perPage = 5;
  var pagesTotal = Math.floor(countNum / perPage); //npr. 20/2 = 10
  var spanNum = 2; //even number (paran broj)

  var istart;
  var iend;

  if (pagesTotal >= spanNum) {
    if (currentPage >= 1 && currentPage < spanNum) {
      istart = 1;
      iend = spanNum;
    } else if (currentPage >= spanNum && currentPage <= pagesTotal - spanNum / 2) {
      istart = currentPage - spanNum / 2;
      iend = currentPage + spanNum / 2;
    } else {
      istart = pagesTotal - spanNum + 1;
      iend = pagesTotal;
    }

  } else {
    istart = 1;
    iend = pagesTotal;
  }

  var i;
  var pages_arr = [];
  for (i = istart; i <= iend; i++) {
    pages_arr.push(i);
  }

  //final pagination array
  var pagination_obj = {
    pagesPreURI: '/admin/ads/' + req.params.category + '/',
    currentPage: currentPage,
    perPage: perPage,
    pagesTotal: pagesTotal,
    skipNum: (currentPage - 1) * perPage,
    pages_arr: pages_arr
  };
  // console.log(istart + ' - ' + iend);
  // console.log(pagination_obj);
  /*pagination object end*/

  return pagination_obj;

};


