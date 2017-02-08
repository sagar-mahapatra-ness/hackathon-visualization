(function() {
    function setupCtr(
        $scope
        
    ) {

        $scope.$emit('listenHeaderText', { headerText: "Setup" });    

    }

    angular.module('shieldxApp').controller('setupCtr', setupCtr);
})();
