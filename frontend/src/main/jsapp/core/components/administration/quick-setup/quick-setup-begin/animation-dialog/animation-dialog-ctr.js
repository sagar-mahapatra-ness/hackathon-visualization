(function () {
 
    function AnimationDialogCtr($scope, $mdDialog) {
        console.log(" AnimationDialogCtr ");
        
        $scope.closButtonClicked = function () {
            console.log(" closButtonClicked ");
            $mdDialog.hide();
        };
        
    }
    angular.module('shieldxApp').controller('AnimationDialogCtr', AnimationDialogCtr);
})();