
var Promise = require('bluebird'),
    request = require('request'),
    requestP = Promise.promisify(request),
    fs = require('fs'),
    os = require('os'),
    glob = Promise.promisify(require('glob')),
    zlib = require('zlib'),
    rimraf = require('rimraf'),
    Path = require('path'),
    tar = require('tar'),
    R = require('ramda'),
    util = require('util'),
    xml2js = Promise.promisify(require('xml2js').parseString),
    yaml = require('js-yaml');


var RoconApp = require('rocon_protocols_web_fetch').RoconApp;

exports = module.exports = function(db, list_url){
  var coll = db.collection('rapp_packages');

  RoconApp(list_url, function(e, rapps){
    if(e){
      console.error('failed to sync rocon apps');
    }else{
      rapps.forEach(function(rapp){
        var nm = rapp.package.name;
        coll.update({name: nm}, {$set: rapp}, {w:1, upsert: true}, function(e2, x){
          console.log(nm + " synced");
        });

      });
    }

  });
  


};




