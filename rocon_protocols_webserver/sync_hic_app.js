var HicApp = require('rocon_protocols_web_fetch').HicApp;

module.exports = exports = function sync(db, list_url){
  var coll = db.collection('interactions');

  HicApp(list_url, function(e, hic_apps){
    if(e){
      console.error('failed to sync hic apps');
    }else{
      hic_apps.forEach(function(hic_app){
        coll.update({name: hic_app.name}, {$set: hic_app}, {w:1, upsert: true}, function(e2, x){
          console.log('updated hic app : ', hic_app.name);
        });

      });
    }

  });
  

};
