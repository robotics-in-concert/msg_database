var Promise = require('bluebird'),
    R = require('ramda'),
    URL = require('url'),
    request = Promise.promisify(require('request')),
    utils = require('./utils'),
    yaml = require('js-yaml');


var list_url = process.env.ROCON_PROTOCOLS_WEB_HIC_APPS_URL;

var doSync = function(db){


  return utils.load_yaml(list_url)
    .get('hic_apps')
    .map(utils.load_yaml)
    .then(R.unnest);
};



module.exports = exports = function sync(db){
  if(!list_url){
    console.log('failed to sync hic apps - no environment variable specified');
    return;
  }
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
