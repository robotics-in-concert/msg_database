
var Promise = require('bluebird'),
  exec = Promise.promisify(require('child_process').exec);


module.exports = exports = function(callback){
  return exec('rosmsg list')
    .spread(function(out, err){
      return out.trim().split(/\n/);
    })
    .map(function(type){
      return exec("rosrun msg_database_scripts convert_msg_spec_to_json.py "+type).spread(function(out){
        return JSON.parse(out);
      });
    })
    .done(
      function(data){ callback(null, data); },
      function(e){ callback(e); }
    );

};
