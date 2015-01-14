var _ = require('lodash'),
  R = require('ramda'),
  MongoClient = require('mongodb').MongoClient,
  async = require('async'),
  express = require('express'),
  path = require('path'),
  CronJob = require('cron').CronJob,
  Config = require('./config');






MongoClient.connect(Config.mongo_url, function(e, db){
  if(e) throw e;

  console.log('mongo connected');

  var app = express();
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  server = app.listen(Config.port, function(){
    console.log('Listening on port %d', server.address().port);
  });


  require('./routes')(app, db);


  var job = new CronJob({
    cronTime: '0 0 * * * *', // every hour
    onTick: function(){
      require('./sync')(db);
      require('./rapp_sync')(db, Config.rocon_apps_url);
      require('./hic_apps_sync')(db, Config.hic_apps_url);
    },
    start: true
  });
  // require('./client_apps_sync')(db);
  // require('./rapp_sync')(db);
  // require('./hic_apps_sync')(db);









});


