
var Promise = require('bluebird'),
  exec = Promise.promisify(require('child_process').exec);


module.exports = exports = function(callback, concurrency){
  if(!concurrency){
    concurrency = 4;
  }
  return exec('rosmsg list')
    .spread(function(out, err){
      return out.trim().split(/\n/);
    })
    .map(function(type){
      return exec("rosrun rocon_protocols_web_scripts convert_msg_spec_to_json.py "+type).spread(function(out){
        // callback(null, [JSON.parse(out)]);
        return JSON.parse(out);
      });
    }, {concurrency: concurrency})
    .done(
      function(data){ callback(null, data); },
      function(e){ callback(e); }
    );

};
