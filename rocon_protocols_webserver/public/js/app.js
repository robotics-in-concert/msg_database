
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


