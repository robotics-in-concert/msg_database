var _ = require('lodash'),
  R = require('ramda'),
  MongoClient = require('mongodb').MongoClient,
  async = require('async'),
  path = require('path');



var fetch_type = function(type, db, fetch_type_callback){
  var coll = db.collection('message_details');

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

  })(type, fetch_type_callback);

};



module.exports = function(app, db){
  var coll = db.collection('message_details');
  app.get('/', function(req, res){
    res.render('messages');

  });

  app.get('/message_detail', function(req, res){
    var type = req.query.type;
    if(_.isEmpty(type)) return res.status(400).send('error');

    fetch_type(type, db, function(e, lst){
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

      res.render('message_type', {item: targetType, tt: tt});
    });

  });




  /*
   *
   * API
   *
   */
  app.get('/api/ping', function(req, res){
    res.send("pong");

  });

  app.get('/api/rocon_app', function(req, res){
    var coll = db.collection('rapp_packages');

    coll.find({}).toArray(function(e, rows){



      var x = R.map(function(row){

        var data = {}
        var rapps = row.rocon_apps;
        rapps = R.pickBy(R.has('public_interface'), rapps);
        console.log(rapps);

        data.name = row.name
        data.rocon_apps = rapps
        return data;

      })(rows);

      res.send(x);

    });

  });

  app.get('/api/hic_app', function(req, res){
    var coll = db.collection('interactions');
    coll.find({}).toArray(function(e, rows){
      var interactions = R.filter(R.prop('interface'))(rows);
      res.send(interactions);

    });


  });
  app.get('/api/all_message_details', function(req, res){
    var coll = db.collection('message_details');
    coll.find({}).toArray(function(e, rows){
      res.send(rows);
    });
  });
  app.get('/api/message_details', function(req, res){
    var type = req.query.type;
    if(_.isEmpty(type)) return res.status(400).send('error');


    fetch_type(type, db, function(e, lst){
      console.log("cnt", lst.length);
      res.json(lst);
    });
    

  });


};
