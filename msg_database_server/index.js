var _ = require('lodash'),
  MongoClient = require('mongodb').MongoClient,
  express = require('express'),
  CronJob = require('cron').CronJob;






MongoClient.connect(process.env.MONGO_URL, function(e, db){
  if(e) throw e;
  var coll = db.collection('message_details');

  console.log('mongo connected');

  var app = express();

  server = app.listen(process.env.PORT, function(){
    console.log('Listening on port %d (%s)', server.address().port, process.env.NODE_ENV);
  });


  app.get('/api/ping', function(req, res){
    res.send("pong");

  });

  app.get('/api/message_details', function(req, res){
    var type = req.param.type;
    
    // TODO : fetch related types recursively
    coll.findOne({type: type}, function(e, row){
      res.send(row);
    });

  });


  var job = new CronJob({
    cronTime: '0 0 * * * *', // every hour
    onTick: function(){
      require('./sync')(db)();
    },
    start: true
  });



});


