var _ = require('lodash'),
  MongoClient = require('mongodb').MongoClient,
  express = require('express'),
  CronJob = require('cron').CronJob;






MongoClient.connect(process.env.MONGO_URL, function(e, db){
  if(e) throw e;
  console.log('mongo connected');

  var app = express();

  server = app.listen(process.env.PORT, function(){
    console.log('Listening on port %d (%s)', server.address().port, process.env.NODE_ENV);
  });


  app.get('/api/ping', function(req, res){
    res.send("pong");

  });

  var job = new CronJob({
    cronTime: '0 0 * * * *', // every hour
    onTick: function(){
      require('./sync')(db)();
    },
    start: true
  });



});


