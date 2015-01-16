var R = require('ramda'),
    Promise = require('bluebird'),
    request = Promise.promisifyAll(require('request')),
    yaml = require('js-yaml'),
    URL = require('url');

module.exports = exports = {
  load_yaml: function(url){
    return request.getAsync(url).then(R.compose(yaml.safeLoad, R.nth(1)));
  },

  resolve_url: R.curry(URL.resolve),


  parseKeyValue: function(body){
    var data = R.pipe(
      R.reject(R.match(/(\s*#.+$|^\s*$)/)),
      R.map(R.match(/\s*([^:]+)\s*:\s*(.+)/)),
      R.map(R.tail),
      R.fromPairs // to hash
    )(body.trim().split(/\n/));
    return data;

  }
}
