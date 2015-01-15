
var Promise = require('bluebird'),
    R = require('ramda'),
    URL = require('url'),
    utils = require('./utils'),
    yaml = require('js-yaml');



module.exports = exports = function fetch(list_url, callback){
  utils.load_yaml(list_url)
    .get('hic_apps')
    .map(utils.load_yaml)
    .then(R.unnest)
    .done(
      function(data){ callback(null, data); },
      function(e){ callback(e); }
    );

};
