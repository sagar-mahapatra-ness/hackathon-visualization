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

    function editIPPoolRangeDialogboxCtr($scope, ipPoolServices, $mdDialog, editIPoolData, ipdata) {

        $scope.editIPoolData = editIPoolData;
        $scope.ipdata = ipdata;
        console.log(" editIPPoolRangeDialogboxCtr " + editIPoolData);
        console.dir($scope.editIPoolData);
        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.updateIPPoolRange = function () {

            console.log("updateIPPoolRange clicked  ipdata ");
            console.dir(ipdata);
            $mdDialog.hide(true);
        };

        $scope.datValueChanged = function (data) {

        };
    }

    angular.module('shieldxApp').controller('editIPPoolRangeDialogboxCtr', editIPPoolRangeDialogboxCtr);

    function editIPRangeCtr($scope) {

        var newIPData = $scope.editIPoolData;
        // console.log(" editIPRangeCtr newIPData "+newIPData);  
        $scope.ipRangeRows = newIPData.getIPRangeRows();

        // console.log(" editIPRangeCtr ");
        //console.dir($scope.ipRangeRows);    

        $scope.addNewIPRangeRow = function (event) {
            //console.log(" addNewIPRangeRow clicked");
            newIPData.addNewIPRangeRow();

        };

        $scope.createRangeStartMessage = function (projectForm, index) {
            return   projectForm["rangeStart" + index].$error;
        };

        $scope.createRangeEndtMessage = function (projectForm, index) {
            return   projectForm["rangeEnd" + index].$error;
        };

        $scope.createCIDRMessage = function (projectForm, index) {
            return   projectForm["cidr" + index].$error;
        };

        $scope.startIpRangeKeyDown = function ($event, ipRangeRowData) {
            //console.log(" startIpRangeKeyDown ");
            //console.dir(ipRangeRowData);

            if (ipRangeRowData.rangeStartValue || ipRangeRowData.rangeEndtValue) {
                ipRangeRowData.cidrValue = "";
                ipRangeRowData.rangeCIDREnableState = false;
            } else
            {
                ipRangeRowData.rangeCIDREnableState = true;
            }


            $scope.datValueChanged($scope.editIPoolData.ranges);
        };

        $scope.endIPRangeKeyDown = function ($event, ipRangeRowData) {
            //console.log(" endIPRangeKeyDown "); 
            // console.dir(ipRangeRowData);

            if (ipRangeRowData.rangeStartValue || ipRangeRowData.rangeEndtValue) {
                ipRangeRowData.cidrValue = "";
                ipRangeRowData.rangeCIDREnableState = false;
            } else
            {
                ipRangeRowData.rangeCIDREnableState = true;
            }


            $scope.datValueChanged($scope.editIPoolData.ranges);
        };

        $scope.cidrIPRangeKeyDown = function ($event, ipRangeRowData) {
            //console.log(" cidrIPRangeKeyDown ");
            //console.dir(ipRangeRowData);

            if (ipRangeRowData.cidrValue) {
                ipRangeRowData.rangeStartValue = "";
                ipRangeRowData.rangeEndtValue = "";
                ipRangeRowData.rangeStartEnableState = false;
                ipRangeRowData.rangeEndEnableState = false;
            } else {
                ipRangeRowData.rangeStartEnableState = true;
                ipRangeRowData.rangeEndEnableState = true;
            }

            $scope.datValueChanged($scope.editIPoolData.ranges);
        };

        $scope.deleteIPPool = function (event, ipRangeRowData, key) {
            newIPData.deleteIPRangeRow(key);
        };
    }
    angular.module('shieldxApp').controller('editIPRangeCtr', editIPRangeCtr);

})();