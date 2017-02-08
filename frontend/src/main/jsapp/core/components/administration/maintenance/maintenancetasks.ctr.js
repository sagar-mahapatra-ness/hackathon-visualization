(function () {
    function maintenanceTasksCtr(
        $scope,
        $state,
        backupRestoreService,
        $q
    ) {

        $scope.$emit('listenHeaderText', { headerText: "Maintenance" });
        var url = $state.current.url;
        
        if (url.indexOf("backupnow") > 0) {
            $state.go('home.maintenance.maintenancetasks.backup');
        } else if (url.indexOf("schedule-backup") >0 ) {
            $state.go('home.maintenance.maintenancetasks.schedulebackup');
        } else if (url.indexOf("restore") >0 ) {
            $state.go('home.maintenance.maintenancetasks.restore');
        } else if (url.indexOf("schedule-pruning") >0 ) {
            $state.go('home.maintenance.maintenancetasks.schedulepruning');
        } else if (url.indexOf("autocontentdownload") >0 ) {
            $state.go('home.maintenance.maintenancetasks.autocontentdownload');
        }else {
            $state.go('home.maintenance.maintenancetasks.backup');    
        }
        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            if (toState.data) {
                $scope.currentTab = toState.data.selectedTab;
            }

        });

        $scope.active_help_id = "admin_system_maintenance_help";
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

    }
    angular.module('shieldxApp').controller('maintenanceTasksCtr', maintenanceTasksCtr);
})();