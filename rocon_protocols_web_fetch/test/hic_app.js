var expect = require('chai').expect;
var sinon = require('sinon');
var request = require('request');
var yaml = require('js-yaml');

// var Utils = require('../lib/utils');


describe('hic_app.js', function(){

  var HicApp = null;

  beforeEach(function(done){
    sinon.stub(request, 'get')
      .withArgs('list.yaml').yields(null, null, yaml.dump({hic_apps: ['item1.yaml', 'item2.yaml']}))
      .withArgs('item1.yaml').yields(null, null, yaml.dump({foo: 1}))
      .withArgs('item2.yaml').yields(null, null, yaml.dump({foo: 2}))
      .throws()

    HicApp = require('../lib/hic_app');
    done();

  });


  afterEach(function(done){
    request.get.restore();
    done();

  });


  it('should fetch hic_apps', function(done){
    HicApp('list.yaml', function(e, data){
      expect(e).to.be.null;
      expect(data.length).to.equal(2)
      expect(data[0]).to.deep.equal({foo: 1})
      expect(data[1]).to.deep.equal({foo: 2})

      done();
    });
  });


});
