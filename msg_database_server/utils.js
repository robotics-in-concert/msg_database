var util = require('util');


module.exports = {
  inspect: function(x){
    console.log(util.inspect(x, false, 10, true));
  },

}
