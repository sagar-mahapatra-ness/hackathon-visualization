(function () {
    function settingsCtr(
        $scope,
        $state,
        backupRestoreService,
        $q
    ) {

        $scope.$emit('listenHeaderText', { headerText: "Setup" });
        var url = $state.current.url;
        console.log(" Settings Controller : url -->> "+url);
        if(url.indexOf("smbserver") >0 ) {
            $state.go('home.setup.settings.smbserver');
        } else if(url.indexOf("syslog") >0 ) {
            $state.go('home.setup.settings.syslog');    
        } else if(url.indexOf("emailserver") >0 ) {
            $state.go('home.setup.settings.emailserver');    
        } else if(url.indexOf("ldapserver") >0 ) {
            $state.go('home.setup.settings.ldapserver');    
        } else {
            $state.go('home.setup.settings.smbserver');    
        }
        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            if (toState.data) {
                $scope.currentTab = toState.data.selectedTab;
            }

        });
        $scope.active_help_id = "admin_system_setup_configs_help";
        $scope.helpButtonClicked = function(id){
            $scope.active_help_id = id;
            console.log("  helpButtonClicked ");
            $scope.bordcastEventHelpButtonClicked($scope.active_help_id);
        }; 
        $scope.bordcastEventHelpButtonClicked = function(helpId){
            $scope.$broadcast('onHelpButtonClicked', {
               helpIDString: helpId 
            });
        };
        $scope.$on('$viewContentLoaded', function (event) {
            fixContainerHeight(1);
        });
        $scope.$on('$viewContentLoaded', function (event) {
            fixContainerHeight(1);
        });

    }
    angular.module('shieldxApp').controller('settingsCtr', settingsCtr);
})();