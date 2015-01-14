var R = require('ramda'),
    Promise = require('bluebird'),
    request = Promise.promisifyAll(require('request')),
    yaml = require('js-yaml'),
    URL = require('url');

module.exports = exports = {
  load_yaml: function(url){
    return request.getAsync(url).then(R.compose(yaml.safeLoad, R.nth(1)));
  },

  resolve_url: R.curry(URL.resolve)
}
