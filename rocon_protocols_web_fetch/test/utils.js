
var expect = require('chai').expect;
var sinon = require('sinon');
var request = require('request');
var fs = require('fs');

describe('utils.js', function(){
  var Utils;

  beforeEach(function(done){
    sinon.stub(request, 'get')
      .yields(null, null, '- a : 10');

    Utils = require('../lib/utils');

    sinon.stub(fs, 'readFile')
      .yields(null, '- b : 20');
    done();

  });


  afterEach(function(done){
    request.get.restore();
    fs.readFile.restore();
    done();

  });

  it('parse key value file', function(){
    expect(Utils.parseKeyValue("a: 10\nb: 20")).to.deep.equal({a: "10", b: "20"});
    expect(Utils.parseKeyValue("a: qwer asdf")).to.deep.equal({a: "qwer asdf"});
    expect(Utils.parseKeyValue("#a: 10\nb: 20")).to.deep.equal({b: "20"});
    expect(Utils.parseKeyValue("\n\n   b: 20   ")).to.deep.equal({b: "20"});
    expect(Utils.parseKeyValue("a: 10\n\n   b: 20   ")).to.deep.equal({a: "10", b: "20"});

  });

  it('should fetch and parse yaml', function(done){
    Utils.load_yaml('url')
      .then(function(data){
        expect(data).not.to.be.null
        expect(data).to.deep.equal([{a: 10}])
        done();
      })
      .catch(function(e){
        done();
      });
  });
  it('should fetch url with file scheme', function(done){
    Utils.load_yaml('file:///url')
      .then(function(data){
        expect(data).not.to.be.null
        expect(data).to.deep.equal([{b: 20}])
        done();
      })
      .catch(function(e){
        expect(e).to.be.null
        done();
      });
  });


});
