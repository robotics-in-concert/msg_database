var expect = require('chai').expect;
var sinon = require('sinon');
var request = require('request');
var yaml = require('js-yaml');
var fs = require('fs');

// var Utils = require('../lib/utils');


describe('rocon_app.js', function(){

  var App = null;

  beforeEach(function(done){
    sinon.stub(request, 'get')
      .withArgs('list.yaml').yields(null, null, yaml.dump({rocon_apps: ['item1.tgz']}))
      .withArgs('item1.tgz').returns({
        pipe: function(to){
          return fs.createReadStream(__dirname + "/samples/rocon_hue.tar.gz").pipe(to);
        }
      })

    App = require('../lib/rocon_app');
    done();

  });

  afterEach(function(done){
    request.get.restore();
    done();

  });


  it('should fetch rocon_app', function(done){
    App('list.yaml', function(e, data){
      expect(e).to.be.null;
      expect(data.length).to.equal(1);

      var hue = data[0];
      var first = hue[0];

      expect(first.rocon_apps).to.be.an('object')

      var hue_bridge = first.rocon_apps.hue_bridge;
      expect(hue_bridge.public_interface).to.include.keys(['subscribers', 'publishers']);


      // TODO 
      // 1. test parent child relation


      done();
    });
  });


});
