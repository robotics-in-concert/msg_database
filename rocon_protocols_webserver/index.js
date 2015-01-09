var _ = require('lodash'),
  R = require('ramda'),
  MongoClient = require('mongodb').MongoClient,
  async = require('async'),
  express = require('express'),
  path = require('path'),
  CronJob = require('cron').CronJob;






MongoClient.connect(process.env.ROCON_PROTOCOLS_WEB_MONGO_URL, function(e, db){
  if(e) throw e;

  console.log('mongo connected');

  var app = express();
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  server = app.listen(process.env.ROCON_PROTOCOLS_WEB_PORT, function(){
    console.log('Listening on port %d (%s)', server.address().port, process.env.NODE_ENV);
  });


  require('./routes')(app, db);


  var job = new CronJob({
    cronTime: '0 0 * * * *', // every hour
    onTick: function(){
      require('./sync')(db);
      require('./rapp_sync')(db);
      require('./hic_apps_sync')(db);
    },
    start: true
  });
  // require('./client_apps_sync')(db);
  // require('./rapp_sync')(db);
  require('./hic_apps_sync')(db);









});


