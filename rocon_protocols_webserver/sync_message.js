var Message = require('rocon_protocols_web_fetch').Message;

module.exports = exports = function(db){
  var coll = db.collection('message_details');

  Message(function(e, message_types){
    if(e){
      console.error('failed to sync message', e);
      return;
    }
    if(!message_types){ return; }
    message_types.forEach(function(detail){
      var type = detail.type;
      coll.update({type: type}, {$set: {detail: detail}}, {w:1, upsert: true}, function(e2, result){
        if(e2){
          console.error(e2);
        }else{
          console.log(type + ' sync finished');
        }

                 
      });
    });

  });
};
