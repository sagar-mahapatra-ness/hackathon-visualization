(function () {
    function tlsDecryptionCtr(
        $scope,
        $state,
        $translate,
        backupRestoreService,
        $q
    ) {

        //$scope.$emit('listenHeaderText', { headerText: "SSL Decryption" });
        
        $scope.$emit('listenHeaderText', {headerText: $translate.instant('admin.ssldecryption.heading')});

        var url = $state.current.url;
        console.log("tlsDecryptionCtr : URL -->> "+url);
        if(url.indexOf("inboundkeys") > 0 ) {
            $state.go('home.setuptls.tlsdecryption.inboundkeys');
        } else if(url.indexOf("outboundkeys") > 0 ) {
            $state.go('home.setuptls.tlsdecryption.outboundkeys');    
        } else if(url.indexOf("rootcas") > 0 ) {
            $state.go('home.setuptls.tlsdecryption.rootcas');    
        } else {
            $state.go('home.setuptls.tlsdecryption.inboundkeys');    
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
    angular.module('shieldxApp').controller('tlsDecryptionCtr', tlsDecryptionCtr);
})();