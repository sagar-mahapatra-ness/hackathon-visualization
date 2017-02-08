(function () {
    function deleteconfromalert($scope, $mdDialog, groupName ) {
        
       
        $scope.groupName = groupName;
        
        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.closeDialog = function () {
            $mdDialog.cancel();
        };
        $scope.answer = function (answer) {
           
            $mdDialog.hide(answer);
        };
    }
    angular.module('shieldxApp').controller('deleteconfromalert', deleteconfromalert);

})();