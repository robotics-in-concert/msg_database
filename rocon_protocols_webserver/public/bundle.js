(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/eskim/current/rocon_protocols_web/rocon_protocols_webserver/public/js/app.js":[function(require,module,exports){

console.log(angular);

angular.module('protocols-web', [
  'ui.bootstrap',
  'ui.router',
  'ui.select',
  'ngSanitize'
])
  .config(function(uiSelectConfig){
    // uiSelectConfig.theme = 'select2';
    // uiSelectConfig.resetSearchInput = true;

  })
  .controller('messagesController', require('./ctrls/messages_controller'))



},{"./ctrls/messages_controller":"/Users/eskim/current/rocon_protocols_web/rocon_protocols_webserver/public/js/ctrls/messages_controller.js"}],"/Users/eskim/current/rocon_protocols_web/rocon_protocols_webserver/public/js/ctrls/messages_controller.js":[function(require,module,exports){

/* @ngInject */
function messagesController($scope, $http){



  $http.get('/api/all_message_details').then(function(res){

    $scope.messages = res.data;
    return;
  });

};

module.exports = messagesController;

},{}]},{},["/Users/eskim/current/rocon_protocols_web/rocon_protocols_webserver/public/js/app.js"]);
