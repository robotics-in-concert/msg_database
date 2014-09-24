var async = require('async'),
  exec = require('child_process').exec;

module.exports = exports = function(db){
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

};
