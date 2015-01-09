var util = require('util'),
    R = require('ramda'),
    Promise = require('bluebird'),
    request = Promise.promisify(require('request')),
    yaml = require('js-yaml'),
    URL = require('url');



module.exports = {
  load_yaml: function(url){
    return request(url).then(R.compose(yaml.safeLoad, R.nth(1)));
  },

  inspect: function(x){
    console.log(util.inspect(x, false, 10, true));
  },

  resolve_url: R.curry(URL.resolve),

}
