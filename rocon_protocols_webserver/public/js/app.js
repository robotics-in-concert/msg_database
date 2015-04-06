
console.log(angular);

angular.module('protocols-web', [
  'ui.bootstrap',
  'ui.router'
])
  .controller('messagesController', require('./ctrls/messages_controller'))


