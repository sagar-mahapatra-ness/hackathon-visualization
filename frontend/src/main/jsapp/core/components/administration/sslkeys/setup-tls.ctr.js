(function() {
    function setupTlsCtr(
        $scope
        
    ) {

        $scope.$emit('listenHeaderText', { headerText: "TLS Inspection" });    

    }

    angular.module('shieldxApp').controller('setupTlsCtr', setupTlsCtr);
})();
