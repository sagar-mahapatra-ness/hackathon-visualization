(function() {
    function notificationCtr(
        $scope
        
    ) {

        $scope.$emit('listenHeaderText', { headerText: "Notification" });    

    }

    angular.module('shieldxApp').controller('notificationCtr', notificationCtr);
})();
