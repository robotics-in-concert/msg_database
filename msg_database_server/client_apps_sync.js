var Promise = require('bluebird'),
    R = require('ramda'),
    URL = require('url'),
    request = Promise.promisify(require('request')),
    utils = require('./utils'),
    yaml = require('js-yaml');


LIST_URL = "https://gist.githubusercontent.com/eskim/78e3822a1fc31ebe2fbe/raw"




var doSync = function(db){

  var _load_yaml = function(url){
    return request(url).then(R.compose(yaml.safeLoad, R.nth(1)));
  };

  return request(LIST_URL)
    .then(R.compose(R.split(/\n/), R.nth(1))
    .map(function(url){
      return _load_yaml(url)
        .then(function(client_apps_list_meta){
          var interactions = client_apps_list_meta.interactions;
          var x = R.map(utils.resolve_url(url))(interactions);
          console.log('X', x);

          return x;
        })

    })
    .then(R.flatten)
    .map(_load_yaml);
};



module.exports = exports = function sync(db){
  doSync(db).then(function(res){
    console.log('Done.');
    utils.inspect(res);
  })
  .catch(function(e){
    console.error(e);
    

  });

};
