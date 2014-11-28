
var async = require('async'),
    request = require('request'),
    fs = require('fs'),
    os = require('os'),
    glob = require('glob'),
    zlib = require('zlib'),
    rimraf = require('rimraf'),
    Path = require('path'),
    tar = require('tar'),
    _ = require('lodash'),
    R = require('ramda'),
    util = require('util'),
    xml2js = require('xml2js'),
    yaml = require('js-yaml');

inspect = R.rPartial(util.inspect, false, 10, true);

REPO_URL = "https://gist.githubusercontent.com/eskim/b1abe813fde6386172ee/raw"



extract_rapp_meta = function(url, callback){

  var dest = Path.join(os.tmpdir(), "cento_authoring_rapp." + new Date().getTime());
  console.log(dest);
  gzstrm = request(url).pipe(zlib.createGunzip());
  gzstrm.on('error', callback);
  tarstrm = gzstrm.pipe(tar.Extract({
    path: dest
  }));
  tarstrm.on('end', function(){
    // packages
    //
    //
    async.waterfall([
      // detect package.xml
      function(cb){ glob(dest + "/**/package.xml", cb); },

      // parse package.xml
      function(package_files, cb){ 

        async.map(package_files, function(f, cb2){
          var package_base = Path.dirname(f);
          console.log(package_base);
          xml2js.parseString(fs.readFileSync(f, 'utf8'), {async: true, mergeAttrs: true, explicitArray: false}, function(e2, js){
            var package = js.package;
            cb2(null, {base: package_base, package: package});
          });

        }, function(e, package_lst){
          cb(null, package_lst); 
        });
      },


      // load rapp
      //
      function(package_list, cb){
        async.map(package_list, function(package_info, cb2){
          // rapp
          console.log(inspect(package_info));


          var rocon_apps = [].concat(package_info.package.export.rocon_app);
          var rapps = _.map(rocon_apps, function(rapp){
            var f = Path.join(package_info.base, rapp);
            if(fs.existsSync(f)){

              var rapp_meta_txt = fs.readFileSync(f, 'utf8');

              var rapp_meta = R.pipe(
                R.reject(R.match(/(\s*#.+$|^\s*$)/)),
                R.map(R.trim),
                R.map(R.split(/\s*:\s*/)),
                R.fromPairs
              )(rapp_meta_txt.split(/\n/));
            }



            // var doc = yaml.safeLoad(fs.readFileSync(f, 'utf8'));
            return rapp_meta;
          });

          package_info.rocon_apps = rapps;
          cb2(null, package_info);



        }, function(e, results){
          console.log('xxxxxxxxxxxxxx', results);

          cb(null, results);
          
        });
      }, 
        
      function(package_list, cb){
        async.map(package_list, function(package_info, cb2){
          var rocon_apps = [].concat(package_info.package.export.rocon_app);
          var interfaces = _.map(rocon_apps, function(rapp){
            var f = Path.join(package_info.base, rapp).replace(/rapp$/, "interface");
            if(fs.existsSync(f)){
              var doc = yaml.safeLoad(fs.readFileSync(f, 'utf8'));
            }
            return doc;
          });
          package_info.interfaces = _.compact(interfaces);
          cb2(null, package_info);

        }, function(e, lst){
          cb(null, lst);
        });

      }
        
        



    ], function(e, results){
      console.log('------------------------------');
      // console.log(_.omit(results, 'base'));
      // console.log('------------------------------');
      results = _.map(results, function(e){return _.omit(e, 'base');});
      callback(null, results);
      rimraf.sync(dest);


    });
  });
    // glob(dest + "/**/package.xml", function(e, files){
      // console.log(files);

      // var data = async.map(files, function(f, cb0){
        // var package_base = Path.dirname(f);
        // console.log(package_base);

        // xml2js.parseString(fs.readFileSync(f, 'utf8'), {async: true, mergeAttrs: true}, function(e2, js){
          // var package_meta = js.package;


          // console.log(package_meta.export);



          // var rapps = package_meta.export[0].rocon_app;
          // console.log(rapps);


          // _.each(rapps, function(rapp_path){
            // Path.join(package_base, rapp_path)

            // // interfaces
            // glob(dest + "/**/*interface", function(e, files){
              // var data = _.map(files, function(f){
                // var doc = yaml.safeLoad(fs.readFileSync(f, 'utf8'));
                // return doc;
              // });
              // // clean
              // rimraf.sync(dest);
              // callback(null, data);



            // });

          // });



          // cb0(e2, js.package);
        // });

      // }, function(e, lst){
        // callback(null, lst);
        // rimraf.sync(dest);
        
      // });
      // // clean



    // });
  // });




};

exports = module.exports = function(db){

  request(REPO_URL, function(e, res, body){
    rapp_urls = body.split(/\n/);

    console.log(rapp_urls);

    _.each(rapp_urls, function(url){
      extract_rapp_meta(url, function(e, data){
        console.log(inspect(data));


        var coll_packages = db.collection('rapp_packages');
        console.log("packages : "+data.length);


        async.each(data, function(package_info, cb){
          var nm = package_info.package.name;
          console.log(nm + " sync");

          coll_packages.update({name: nm}, {$set: package_info}, {w:1, upsert: true}, cb);
        }, function(e, x){
          console.log('rapp package - sync done ', url);
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




