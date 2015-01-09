var Promise = require('bluebird'),
    R = require('ramda'),
    URL = require('url'),
    request = Promise.promisify(require('request')),
    utils = require('./utils'),
    yaml = require('js-yaml');


LIST_URL = "https://gist.githubusercontent.com/eskim/78e3822a1fc31ebe2fbe/raw"

var doSync = function(db){


  return request(LIST_URL)
    .then(R.compose(R.split(/\n/), R.nth(1)))
    .map(function(url){
      return utils.load_yaml(url)
        .then( R.compose( R.map(utils.resolve_url(url)), R.prop('hic_apps')) )
    })
    .then(R.unnest)
    .map(utils.load_yaml)
    .then(R.unnest);
};



module.exports = exports = function sync(db){
  var coll = db.collection('interactions');
  doSync(db).map(function(interaction){
    utils.inspect(interaction);
    console.log('updating interaction : ', interaction.name);


    coll.update({name: interaction.name}, {$set: interaction}, {w:1, upsert: true}, function(e, x){
      console.log('updated interaction : ', interaction.name);
    });



  })
  .catch(function(e){
    console.error(e);
    

  });

};
