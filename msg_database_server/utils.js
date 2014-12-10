var util = require('util'),
    R = require('ramda'),
    URL = require('url');



module.exports = {
  inspect: function(x){
    console.log(util.inspect(x, false, 10, true));
  },

  resolve_url: R.curry(URL.resolve),

}
