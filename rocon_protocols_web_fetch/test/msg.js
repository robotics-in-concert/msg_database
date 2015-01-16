var proxyquire = require('proxyquire');
var expect = require('chai').expect;
var sinon = require('sinon');
var child_process = require('child_process');

// var Message = require('../index').Message;


describe('msg.js', function(){

  var sandbox;

  beforeEach(function(){
    sandbox = sinon.sandbox.create();
  });

  afterEach(function(){
    sandbox.restore();

  });
  it('should fetch rosmsg list', function(done){


    sandbox.stub(child_process, 'exec')
      .withArgs('rosmsg list').yields(null, "a\nb\nc", null)
      .withArgs('rosrun rocon_protocols_web_scripts convert_msg_spec_to_json.py a').yields(null, JSON.stringify({foo: 1}), null)
      .withArgs('rosrun rocon_protocols_web_scripts convert_msg_spec_to_json.py b').yields(null, JSON.stringify({foo: 2}), null)
      .withArgs('rosrun rocon_protocols_web_scripts convert_msg_spec_to_json.py c').yields(null, JSON.stringify({foo: 3}), null);
    var Message = proxyquire('../lib/msg', {child_process: child_process});

    Message(function(e, out){
      expect(e).to.be.null;
      expect(out[0]).to.deep.equal({foo: 1});
      expect(out.length).to.equal(3);
      done();

    });
  });
  it('should return error if ros command is not available', function(done){


    sandbox.stub(child_process, 'exec')
      .withArgs('rosmsg list').yields(new Error('command not found'), null, 'error')
      .withArgs('rosrun rocon_protocols_web_scripts convert_msg_spec_to_json.py a').yields(new Error('command not found'), null, 'error')
    var Message = proxyquire('../lib/msg', {child_process: child_process});

    Message(function(e, out){
      expect(e).not.to.be.null;
      done();
    });


  });



});
