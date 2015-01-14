
var expect = require('chai').expect;
var sinon = require('sinon');
var request = require('request');

// var Utils = require('../lib/utils');


describe('utils.js', function(){



  var server = null;
  var Utils = null;

  beforeEach(function(done){
    sinon.stub(request, 'get')
      .yields(null, null, '- a : 10');

    Utils = require('../lib/utils');
    done();

  });


  afterEach(function(done){
    request.get.restore();
    done();

  });


  it('should fetch and parse yaml', function(done){
    Utils.load_yaml('url')
      .then(function(data){
        expect(data).not.to.be.null
        expect(data).to.equal({a: 10})
        done();
      })
      .catch(function(e){
        done();
      });



  });


});
