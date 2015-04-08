var _ = require('lodash');

/* @ngInject */
function messagesController($scope, $http){


  $scope.type = {}
  $scope.field = {}
  $scope.typeSelected = function(item, model){
    console.log(item);
    console.log(model);
  };
  $scope.saveFieldValue = function(){
    if(!$scope.type.selected.field_values){
      $scope.type.selected.field_values = [];
    }
    $scope.type.selected.field_values.push(_.clone($scope.field));
    $scope.field = {}


  };

  $http.get('/api/all_message_details').then(function(res){

    $scope.messages = res.data;


    return;
  });

};

module.exports = messagesController;
