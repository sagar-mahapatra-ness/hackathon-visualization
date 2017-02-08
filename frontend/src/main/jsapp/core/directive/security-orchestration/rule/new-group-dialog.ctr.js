(function () {
    function createNewGroupDialogCtr($scope, $mdDialog, existingGroups) {
        
        $scope.groupName = "";
        $scope.errorMessage = {show:false ,text:"Group already exists"};
        
        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.closeDialog = function () {
            $mdDialog.cancel();
        };
        $scope.answer = function (answer) {
          var foundRG = _.find(existingGroups, function(eg){
            return eg.name === $scope.groupName;
          });
          if(foundRG){
               $scope.errorMessage.show = true;
          } else{
             $mdDialog.hide($scope.groupName);
          }
         
        };
    }
    angular.module('shieldxApp').controller('createNewGroupDialogCtr', createNewGroupDialogCtr);

})();