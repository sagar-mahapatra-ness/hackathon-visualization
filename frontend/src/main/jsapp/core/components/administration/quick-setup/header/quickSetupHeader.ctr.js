/*
 ShieldX Networks Inc. CONFIDENTIAL
 ----------------------------------
 *
 Copyright (c) 2016 ShieldX Networks Inc.
 All Rights Reserved.
 *
 NOTICE: All information contained herein is, and remains
 the property of ShieldX Networks Incorporated and its suppliers,
 if any. The intellectual and technical concepts contained
 herein are proprietary to ShieldX Networks Incorporated
 and its suppliers and may be covered by U.S. and Foreign Patents,
 patents in process, and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from ShieldX Networks Incorporated.
 */

(function () {
    function QuickSetupHeaderController($scope, $location) {
        console.log("Controller initialized");
        this.templatName = 'Quick-Setup-Header';
        $scope.maximize = false;
        
        var locationUrl = $location.path();
        var showDividerConfig = [  {
                route: "/quickSetup/infrastructure-connector" ,
                dividerSetup: []
            }, {
                route: "/quickSetup/ip-pools-management" ,
                dividerSetup: []
            }, {
                route: "/quickSetup/ip-pools-backplane" ,
                dividerSetup: [null,true]
            }, {
                route: "/quickSetup/deployment-specifications" ,
                dividerSetup: [null,true,null,true]
            }, {
                route: "/quickSetup/virtual-chassis" ,
                dividerSetup: [null,true,null,true]
            }, {
                route: "/quickSetup/monitor-networks" ,
                dividerSetup: [null,true,null,true,null,true]
            }
        ]; 
        
        $scope.dividerCntObj = _.find(showDividerConfig, {route : locationUrl});
        
        $scope.$on('fullscreen', function (event, data) {
            $scope.maximize = !$scope.maximize;
        });
        
    }
    angular.module('shieldxApp').component("quicksetupheader", {
        templateUrl: '/core/components/administration/quick-setup/header/quick-setup-header.html', controller: QuickSetupHeaderController, bindings: {
            values: '<'
        }
    });
})();