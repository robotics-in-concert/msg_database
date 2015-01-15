var _ = require('lodash'),
  R = require('ramda'),
  MongoClient = require('mongodb').MongoClient,
  async = require('async'),
  express = require('express'),
  path = require('path'),
  CronJob = require('cron').CronJob,
  fs = require('fs'),
  argv = require('minimist')(process.argv.slice(2));



var config;
if(argv.config){
  config = JSON.parse(fs.readFileSync(argv.config));
}else{
  config = require("./config");
}

MongoClient.connect(config.mongo_url, function(e, db){
  if(e) throw e;

  console.log('mongo connected');

  var app = express();
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  server = app.listen(config.port, function(){
    console.log('Listening on port %d', server.address().port);
  });


  require('./routes')(app, db);


  var job = new CronJob({
    cronTime: '0 0 * * * *', // every hour
    onTick: function(){
      require('./sync')(db);
      require('./rapp_sync')(db, config.rocon_apps_url);
      require('./hic_apps_sync')(db, config.hic_apps_url);
    },
    start: true
  });
  // require('./client_apps_sync')(db);
  // require('./rapp_sync')(db);
  // require('./hic_apps_sync')(db);









});


