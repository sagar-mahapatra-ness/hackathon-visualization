(function() {
    function maintenanceCtr(
        $scope,
        userSessionMenagment
    ) {

        $scope.$emit('listenHeaderText', { headerText: "Maintenance" });
        var update_id = authorities("maintenance_update");
        $scope.is_update_maintenance = userSessionMenagment.isUserAllowd(update_id);    

    }

    angular.module('shieldxApp').controller('maintenanceCtr', maintenanceCtr);
})();
