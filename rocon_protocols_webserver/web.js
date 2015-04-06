var _ = require('lodash'),
  MongoClient = require('mongodb').MongoClient,
  express = require('express'),
  path = require('path'),
  fs = require('fs'),
  argv = require('minimist')(process.argv.slice(2));



var config;
if(argv.config){
  config = JSON.parse(fs.readFileSync(argv.config));
}else{
  config = require("./config");
}

MongoClient.connect(config.mongo_url, function(e, db){
  if(e) throw e;

  console.log('mongo connected');

  var app = express();
  app.use(express.static('public'));
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  server = app.listen(config.port, function(){
    console.log('Listening on port %d', server.address().port);
  });

  require('./routes')(app, db);

});


