(function () {
    function notificationSettingsCtr(
        $scope,
        $state,
        $q
    ) {

        $scope.$emit('listenHeaderText', { headerText: "Notification" });
		
        var url = $state.current.url;        
		console.log(" Notification Controller : url -->> "+url);
		if(url.indexOf("syslog") > 0 ) {
            $state.go('home.notification.settings.syslog');    
        } else if(url.indexOf("email") > 0 ) {
            $state.go('home.notification.settings.email');    
        } else {
            $state.go('home.notification.settings.syslog');    
        }
		
        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            if (toState.data) {
                $scope.currentTab = toState.data.selectedTab;
            }

        });
        
        $scope.$on('$viewContentLoaded', function (event) {
            fixContainerHeight(1);
        });

    }
    angular.module('shieldxApp').controller('notificationSettingsCtr', notificationSettingsCtr);
})();