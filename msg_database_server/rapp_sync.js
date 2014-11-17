
var async = require('async'),
    request = require('request'),
    fs = require('fs'),
    os = require('os'),
    glob = require('glob'),
    zlib = require('zlib'),
    rimraf = require('rimraf'),
    Path = require('path'),
    tar = require('tar'),
    _ = require('lodash')
    xml2js = require('xml2js'),
    yaml = require('js-yaml');

REPO_URL = "https://gist.githubusercontent.com/eskim/b1abe813fde6386172ee/raw/fa27ef14b4761dcb6f614e4ba85c786cdf8ad670/gistfile1.txt"



extract_rapp_meta = function(url, callback){

  var dest = Path.join(os.tmpdir(), "cento_authoring_rapp." + new Date().getTime());
  console.log(dest);
  gzstrm = request(url).pipe(zlib.createGunzip());
  gzstrm.on('error', callback);
  tarstrm = gzstrm.pipe(tar.Extract({
    path: dest
  }));
  tarstrm.on('end', function(){
    glob(dest + "/**/package.xml", function(e, files){
      console.log(files);

      var data = async.map(files, function(f, cb0){
        xml2js.parseString(fs.readFileSync(f, 'utf8'), {async: true, mergeAttrs: true}, function(e2, js){
          cb0(e2, js.package);
        });

      }, function(e, lst){
        console.log("------------------------");
        console.log(lst);

        console.log("------------------------");

        callback(null, lst);
        rimraf.sync(dest);
        
      });
      // clean



    });
  });




};

exports = module.exports = function(db){

  request(REPO_URL, function(e, res, body){
    rapp_urls = body.split(/\n/);

    console.log(rapp_urls);

    _.each(rapp_urls, function(url){
      extract_rapp_meta(url, function(e, data){
        console.log(data);


        var coll_packages = db.collection('rapp_packages');

        _.each(data, function(package_info){
          coll_packages.insert(package_info);
        });

        // types_to_load = _.map(data, function(interface){
          // return _.map(interface, function(v, k){
            // return _.pluck(v, 'type');

          // });

        // });
        // console.log(types_to_load);

        // types_to_load = _.compact(_.flatten(types_to_load));

        // async.map(types_to_load, _.bind($engine.getMessageDetails, $engine), function(e, types){
          // var z = _.zipObject(types_to_load, types)
          // var types = _.mapValues(z, function(mv, k){
            // return _.mapValues(_.groupBy(mv, 'type'), function(x){ return x[0]; });
          // });
          // res.send({interfaces: data, types: types});
        // });
      });

    });

    // var url = req.body.url;
    // Utils.extract_rapp_meta(url, function(e, data){
      // types_to_load = _.map(data, function(interface){
        // return _.map(interface, function(v, k){
          // return _.pluck(v, 'type');

        // });

      // });
      // console.log(types_to_load);

      // types_to_load = _.compact(_.flatten(types_to_load));
      // async.map(types_to_load, _.bind($engine.getMessageDetails, $engine), function(e, types){
        // var z = _.zipObject(types_to_load, types)
        // var types = _.mapValues(z, function(mv, k){
          // return _.mapValues(_.groupBy(mv, 'type'), function(x){ return x[0]; });
        // });
        // res.send({interfaces: data, types: types});
      // });


      
      
      // // res.send({interfaces: data, types: _.flatten(types_to_load)});
    });




};




