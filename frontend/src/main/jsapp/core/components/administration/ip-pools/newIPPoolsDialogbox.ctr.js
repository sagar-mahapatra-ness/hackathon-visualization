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
    function newIPPoolsDialogboxCtr($scope,
            $state,
            infrastructureConnectorService,
            ipPoolServices,
            $translate, $mdDialog) {
        "ngInject";
        console.log("initialize ");
        $scope.availableInfrastructures = [{id: 1, Name: "infra1"}, {id: 2, Name: "infra2"}];
        $scope.enableDoneButton = false;
        $scope.infrastructureSelected = "";
        $scope.newIPDate = new NewIPDate();
        $scope.datValueChanged = function (data) {

            if ($scope.newIPDate.isPopulated() && $scope.infrastructureSelected !== "") {
                $scope.enableDoneButton = true;
            }

        };
        $scope.addNewIPPool = function () {
            var infraRef = JSON.parse($scope.infrastructureSelected);
            var ipPoolData = {
                infrastructureInfo: infraRef,
                newIPDate: $scope.newIPDate,
            };
            $mdDialog.hide(ipPoolData);

        };
        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        var getAllInfraData = function (data) {
            console.info("newIPPoolsDialogboxCtr  getAllInfraData ");
            console.dir(data);
            //Only Non Open Stack Infra type for creation
            data = _.filter(data, function (o) {
                return o.type !== 'OPENSTACK';
            });
            console.dir(data);
            $scope.availableInfrastructures = data;
        };


        $scope.$watch('infrastructureSelected', function () {
            $scope.datValueChanged();
        });

        $scope.$watch('newIPDate.name', function () {

            $scope.datValueChanged();
        });


        $scope.$watch('newIPDate.gateway', function () {

            $scope.datValueChanged();
        });

        $scope.$watch('newIPDate.mask', function () {

            $scope.datValueChanged();
        });


        infrastructureConnectorService.getListOfInfrastructures().then(getAllInfraData);

    }
    angular.module('shieldxApp').controller('newIPPoolsDialogboxCtr', newIPPoolsDialogboxCtr);

    function newIPRangeCtr($scope, ipPoolServices) {

        $scope.ipRangeRows = $scope.newIPDate.getIPRangeRows();

        console.log(" managmentIPRangeCtr ");
        console.dir($scope.ipRangeRows);
        $scope.createRangeStartMessage = function (projectForm, index) {
            return   projectForm["rangeStart" + index].$error;
        };

        $scope.createRangeEndtMessage = function (projectForm, index) {
            return   projectForm["rangeEnd" + index].$error;
        };

        $scope.createCIDRMessage = function (projectForm, index) {
            return   projectForm["cidr" + index].$error;
        };

        $scope.addNewIPRangeRow = function (event) {
            console.log(" addNewIPRangeRow clicked");
            $scope.newIPDate.addNewIPRangeRow();

        };

        $scope.startIpRangeKeyDown = function ($event, ipRangeRowData) {
            console.log(" startIpRangeKeyDown ");
            console.dir(ipRangeRowData);
            if (ipRangeRowData.rangeStartValue || ipRangeRowData.rangeEndtValue) {
                ipRangeRowData.cidrValue = "";
                ipRangeRowData.rangeCIDREnableState = false;
            } else
            {
                ipRangeRowData.rangeCIDREnableState = true;
            }
            $scope.datValueChanged($scope.newIPDate.ranges);
        };

        $scope.endIPRangeKeyDown = function ($event, ipRangeRowData) {
            console.log(" endIPRangeKeyDown ");
            console.dir(ipRangeRowData);
            if (ipRangeRowData.rangeStartValue || ipRangeRowData.rangeEndtValue) {
                ipRangeRowData.cidrValue = "";
                ipRangeRowData.rangeCIDREnableState = false;
            } else
            {
                ipRangeRowData.rangeCIDREnableState = true;
            }
            $scope.datValueChanged($scope.newIPDate.ranges);
        };

        $scope.cidrIPRangeKeyDown = function ($event, ipRangeRowData) {
            console.log(" cidrIPRangeKeyDown ");
            console.dir(ipRangeRowData);
            if (ipRangeRowData.cidrValue) {
                ipRangeRowData.rangeStartValue = "";
                ipRangeRowData.rangeEndtValue = "";
                ipRangeRowData.rangeStartEnableState = false;
                ipRangeRowData.rangeEndEnableState = false;
            } else {
                ipRangeRowData.rangeStartEnableState = true;
                ipRangeRowData.rangeEndEnableState = true;
            }
            $scope.datValueChanged($scope.newIPDate.ranges);
        };

        $scope.deleteIPPool = function (event, ipRangeRowData, key) {
            $scope.newIPDate.deleteIPRangeRow(key);
        };
    }
    angular.module('shieldxApp').controller('newIPRangeCtr', newIPRangeCtr);

})();