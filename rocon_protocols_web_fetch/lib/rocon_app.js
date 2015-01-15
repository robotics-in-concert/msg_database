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
    yaml = require('js-yaml'),
    Utils = require('./utils');

inspect = R.rPartial(util.inspect, false, 10, true);


extract_rapp_meta = function(url){

  var dest = Path.join(os.tmpdir(), "cento_authoring_rapp." + new Date().getTime());
  console.log(dest);


  var untarP = new Promise(function(resolve, reject){
    gzstrm = request.get(url).pipe(zlib.createGunzip());
    gzstrm.on('error', reject);
    tarstrm = gzstrm.pipe(tar.Extract({
      path: dest
    }));
    tarstrm.on('end', function(){
      resolve();
    });
  });

  return untarP.then(function(){
    // packages
    //
    //
    return glob(dest + "/**/package.xml")
      // parse package (xml2js)
      .map(function(package_file){
        console.log('parsing package file :', package_file);
        var package_base = Path.dirname(package_file);
        return xml2js(fs.readFileSync(package_file, 'utf8'), {async: true, mergeAttrs: true, explicitArray: false}).then(function(js){
          var package = js.package;
          return {base: package_base, package: package};
        });
      })
      // load rapp
      .map(function(package_info){


        var rocon_apps = [].concat(package_info.package.export.rocon_app);
        var rapps = R.map(function(rapp){
          var f = Path.join(package_info.base, rapp);
          if(fs.existsSync(f)){

            var rapp_meta_txt = fs.readFileSync(f, 'utf8');
            var key = Path.basename(f, ".rapp");
            var rapp_meta = Utils.parseKeyValue(rapp_meta_txt);
            rapp_meta.key = key;
            rapp_meta.path = f;
          }

          // var doc = yaml.safeLoad(fs.readFileSync(f, 'utf8'));
          return rapp_meta;
        })(rocon_apps);


        package_info.rocon_apps = R.pipe(
              R.reject(R.isEmpty),
              R.groupBy(R.prop('key')),
              R.mapObj(R.head)
          )(rapps);
        return package_info;


      })
      // fetch interface
      .map(function(package_info){

        var pack = package_info;
        R.forEach(function(key){
          var app = pack.rocon_apps[key];
          if(app.public_interface){
            var ifn = Path.join(Path.dirname(app.path), app.public_interface);
            console.log(ifn);

            if(fs.existsSync(ifn)){
              var doc = yaml.safeLoad(fs.readFileSync(ifn, 'utf8'));
              app.public_interface = doc;
            }
          };

        })(R.keys(pack.rocon_apps));
        return pack;
      })
      // fetch parameters
      .map(function(package_info){

        var pack = package_info;
        R.forEach(function(key){
          var app = pack.rocon_apps[key];
          if(app.public_parameters){
            var ifn = Path.join(Path.dirname(app.path), app.public_parameters);
            if(fs.existsSync(ifn)){
              var data = Utils.parseKeyValue(fs.readFileSync(ifn, 'utf8'));
              app.public_parameters = data;
            }
          };

        })(R.keys(pack.rocon_apps));
        return pack;
      })

      // cleanse
      .map(function(package_info){
        package_info.rocon_apps = R.mapObj.idx(function(v, k){
          v = R.omit(['key', 'path'])(v);
          return v;
        })(package_info.rocon_apps);

        


        return package_info;
      })
      // post process
      .map(function(package_info){
        var rocon_apps = package_info.rocon_apps;

        R.mapObj.idx(function(v, key, obj){
          console.log(key);

          if(v.parent_name && v.parent_name != ''){
            var pname = v.parent_name.split(/\//)[1];
            if(!rocon_apps[pname].children){
              rocon_apps[pname].children = [v];
            }else{
              rocon_apps[pname].children.push(v);
            };
            delete package_info.rocon_apps[key]
          }
        })(rocon_apps);


        return package_info;

      })
      .tap(function(x){
        console.log('----------------------------- FINAL --------------------------------');
        console.log(inspect(x));
        console.log('----------------------------- /FINAL --------------------------------');
      });
  });

}



exports = module.exports = function(repo_url, callback){
  if(!repo_url){
    return;
  }

  return Utils.load_yaml(repo_url)
    .get('rocon_apps')
    .map(extract_rapp_meta)
    .done(
      function(data){ callback(null, data); },
      function(e){ callback(e); }
    );

};




