
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

inspect = R.rPartial(util.inspect, false, 10, true);




REPO_URL = "https://gist.githubusercontent.com/eskim/b1abe813fde6386172ee/raw"



extract_rapp_meta = function(url){

  var dest = Path.join(os.tmpdir(), "cento_authoring_rapp." + new Date().getTime());
  console.log(dest);


  var untarP = new Promise(function(resolve, reject){
    gzstrm = request(url).pipe(zlib.createGunzip());
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

            var rapp_meta = R.pipe(
              R.reject(R.match(/(\s*#.+$|^\s*$)/)),
              R.map(R.match(/([^:]+)\s*:\s*(.+)/)),
              R.map(R.tail),
              R.fromPairs, // to hash
              R.assoc('key', key),
              R.assoc('path', f)
            )(rapp_meta_txt.split(/\n/));

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
      // post-process
      .map(function(package_info){

        var pack = package_info;
        R.forEach(function(key){
          var app = pack.rocon_apps[key];
          if(app.public_interface){
            var ifn = Path.join(Path.dirname(app.path), app.public_interface);
            console.log(ifn);

            if(fs.existsSync(ifn)){
              var doc = yaml.safeLoad(fs.readFileSync(ifn, 'utf8'));
              app.interfaces = doc;
              console.log("*");
            }
          };

        })(R.keys(pack.rocon_apps));
        return pack;
      })
      .tap(function(x){
        console.log('----------------------------- FINAL --------------------------------');
        console.log(inspect(x));
        console.log('----------------------------- /FINAL --------------------------------');
      });
  });

}



exports = module.exports = function(db){

  requestP(REPO_URL)
    .spread(function(res, body){
      return body.split(/\n/);
    })
    .map(extract_rapp_meta)
    .each(R.forEach(function(package_info){
        var coll_packages = db.collection('rapp_packages');
        var nm = package_info.package.name;
        console.log(nm + " sync");

        coll_packages.update({name: nm}, {$set: package_info}, {w:1, upsert: true}, function(e, x){
          console.log(nm + " synced");

          
        });
    }));







};




