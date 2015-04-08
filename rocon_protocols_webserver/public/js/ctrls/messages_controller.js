var _ = require('lodash');

/* @ngInject */
function messagesController($scope, $http){


  $scope.type = {}
  $scope.field = {}
  // $scope.typeSelected = function(item, model){
    // console.log(item);
    // console.log(model);
  // };

  $scope.addFieldValue = function(){
    if(!$scope.type.selected.field_values){
      $scope.type.selected.field_values = [];
    }
    $scope.type.selected.field_values.push(_.clone($scope.field));
    $scope.field = {}


  };

  $scope.refreshMessages = function(name){
    console.log('---', name);
    if(name.length > 0){
      $scope.messages =  _.filter($scope.allMessages, function(msg){
        return msg.type.toLowerCase().indexOf(name.toLowerCase()) >= 0;

      });
    }


  };

  $http.get('/api/all_message_details').then(function(res){
    $scope.allMessages = res.data;
    return;
  });


  $scope.saveFieldValues = function(type){
    var selected = $scope.type.selected;
    var type = selected.type;
    $http.put("/api/message_details/"+encodeURIComponent(type), {field_values: selected.field_values})
      .then(function(res){
        alert('updated');

      });


  };

};

module.exports = messagesController;
