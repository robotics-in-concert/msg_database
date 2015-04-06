
/* @ngInject */
function messagesController($scope, $http){



  $http.get('/api/all_message_details').then(function(res){

    $scope.messages = res.data;
    return;
  });

};

module.exports = messagesController;
