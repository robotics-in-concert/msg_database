
var async = require('async'),
  exec = require('child_process').exec;


LIMIT_CONCURRENCY = 5;




module.exports = exports = function(db){
  console.log('sync!');
  var coll = db.collection('message_details');
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
      console.log(msgs);

      async.eachLimit(msgs, LIMIT_CONCURRENCY, 
        function(type, cb2){
          console.log("sync : "+type);

          exec("convert_msg_spec_to_json.py "+type, function(e, stdout, stderr){
            if(e){
              cb2(e);
            }else{
              var detail = JSON.parse(stdout);
              coll.update({type: type}, {$set: {detail: detail}}, {w:1, upsert: true}, cb2);
            }
          });
        }, 
        function(e){
          cb(e)
      });

    },
    // 4. update db (+rev info)

  ], function(e, result){
    if(e){
      console.error("sync failed. error : ", e);
    }else{
      console.log('sync finished.');

    }
  });

};
