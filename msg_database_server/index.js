var _ = require('lodash'),
  R = require('ramda'),
  MongoClient = require('mongodb').MongoClient,
  async = require('async'),
  express = require('express'),
  path = require('path'),
  CronJob = require('cron').CronJob;






MongoClient.connect(process.env.MONGO_URL, function(e, db){
  if(e) throw e;
  var coll = db.collection('message_details');

  console.log('mongo connected');

  var app = express();
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  server = app.listen(process.env.MSG_DATABASE_PORT, function(){
    console.log('Listening on port %d (%s)', server.address().port, process.env.NODE_ENV);
  });


  app.get('/message_detail', function(req, res){
    var type = req.query.type;
    if(_.isEmpty(type)) return res.status(400).send('error');

    (function _fetch(type, done){
      console.log("fetching "+type);

      var results = []
      coll.findOne({type: type}, function(e, row){
        if(e) return done(e);
        if(row){
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

        }else{
          done(null, results);
        }

      });

    })(type, function(e, lst){
      console.log("cnt", lst.length);
      console.log(lst);

      var targetType = _.find(lst, {type: type});
      var tt = targetType.text;


      tt = tt.replace(/(?:^|\n)\s*#[^\n]+/g, "")
      // tt = tt.split(/\n/).map(function(l){
        // return l.replace(/^#.+$/g, "");

      // }).join("\n");
      tt = tt.replace(/\b(\w|\/)+\b/g, function(m){ 
        var x = _.find(lst, function(item){
          var _t = item.type.split(/\//)[1];
          if(m == item.type || m == _t){
            return true;
          }
          return false;
        });
        if(x){
          return "<a href='/message_detail?type="+x.type+"'>"+m+"</a>";
        }else{
          return m;
        }

      });

      // var tokens = tt.split(" ")
      // console.log('(((((((((((((', tokens);

      // tt = _.map(tokens, function(token){
        // _.find(lst, function(item){
          // var _t = item.type.split(/\//)[1];
          // if(token.toLowerCase() == _t.toLowerCase()){
            // return "<a href='/message_detail?type="+token+"'>"+token+"</a>";
          // }
          // return token;

        // });

      // }).join(" ");
      // console.log(tt);

      



      res.render('message_type', {item: targetType, tt: tt});
    });

  });

  app.get('/api/ping', function(req, res){
    res.send("pong");

  });

  app.get('/api/interfaces', function(req, res){
    var coll = db.collection('rapp_packages');

    coll.find({}).toArray(function(e, rows){



      var x = R.map(function(row){

        var data = {}
        var rapps = row.rocon_apps;
        rapps = R.pickBy(R.has('interfaces'), rapps);
        console.log(rapps);


        data.name = row.name
        data.rapps = rapps
        return data;

        


      })(rows);
      // ifs = R.pipe(
        // R.map(R.props(['name', 'rocon_apps'])),
        // R.map(R.flatten),
        // R.fromPairs
      // )(rows);
      // var interfaces = _.compact(_.flatten(_.map(rows, 'interfaces')));

      res.send(x);

    });

  });
  app.get('/api/message_details', function(req, res){
    var type = req.query.type;
    if(_.isEmpty(type)) return res.status(400).send('error');

    (function _fetch(type, done){
      console.log("fetching "+type);

      var results = []
      coll.findOne({type: type}, function(e, row){

        if(e) return done(e);
        if(row){
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
      require('./rapp_sync')(db);
    },
    start: true
  });
      require('./rapp_sync')(db);






});


