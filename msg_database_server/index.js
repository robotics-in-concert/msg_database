var _ = require('lodash'),
  MongoClient = require('mongodb').MongoClient,
  express = require('express'),
  exec = require('child_process').exec,
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
      console.log('sync!');
      // 1. rosdistro
      // 2. rosmsg list
      // 3. python script
      // 4. update db (+rev info)


      // example, run external command
      //
      // exec("ls -al", function(e, stdout, stderr){
        // console.log(stdout);
      // });


    },
    start: false
  });



});


