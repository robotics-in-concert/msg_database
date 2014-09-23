var _ = require('lodash'),
  MongoClient = require('mongodb').MongoClient,
  express = require('express'),
  async = require('async'),
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
      async.waterfall([

        // 1. rosdistro
        //
        // 2. rosmsg list
        function(cb){
          exec("rosmsg list", function(e, out, err){
            var msgs = out.trim().split(/\n/);
            cb(e, msgs);
          });

        },

        // 3. python script
        function(msgs, cb){

        },
        // 4. update db (+rev info)

      ], function(e, result){
        
      });


      // example, run external command
      //
      // exec("ls -al", function(e, stdout, stderr){
        // console.log(stdout);
      // });


    },
    start: true
  });



});


