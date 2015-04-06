
/* @ngInject */
function messagesController($scope, $http){


  $scope.type = {

  }
  $scope.typeSelected = function(item, model){
    console.log(item);
    console.log(model);


  };

  $http.get('/api/all_message_details').then(function(res){

    $scope.messages = res.data;


    return;
  });

};

module.exports = messagesController;
