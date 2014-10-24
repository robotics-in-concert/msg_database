var _ = require('lodash'),
  MongoClient = require('mongodb').MongoClient,
  async = require('async'),
  express = require('express'),
  CronJob = require('cron').CronJob;






MongoClient.connect(process.env.MONGO_URL, function(e, db){
  if(e) throw e;
  var coll = db.collection('message_details');

  console.log('mongo connected');

  var app = express();

  server = app.listen(process.env.MSG_DATABASE_PORT, function(){
    console.log('Listening on port %d (%s)', server.address().port, process.env.NODE_ENV);
  });


  app.get('/api/ping', function(req, res){
    res.send("pong");

  });

  app.get('/api/message_details', function(req, res){
    var type = req.query.type;
    if(_.isEmpty(type)) return res.status(400).send('error');

    (function _fetch(type, done){
      console.log("fetching "+type);

      var results = []
      coll.findOne({type: type}, function(e, row){
        if(e) return done(e);
        var detail = row.detail;
        results.push(detail);
        var subTypes = _.select(row.detail.fieldtypes, function(t){
          return t.indexOf('/') >= 0;
        });

        if(!_.isEmpty(subTypes)){

          async.reduce(subTypes, results, function(memo, t, redcb){
            _fetch(t, function(e, res){
              redcb(null, memo.concat(res));
            });

          }, function(err, final){
            done(null, final);

          });

        }else{
          done(null, results);
        }

      });

    })(type, function(e, lst){
      console.log("cnt", lst.length);

      res.json(lst);
    });
    

  });


  var job = new CronJob({
    cronTime: '0 0 * * * *', // every hour
    onTick: function(){
      require('./sync')(db);
    },
    start: true
  });




});


