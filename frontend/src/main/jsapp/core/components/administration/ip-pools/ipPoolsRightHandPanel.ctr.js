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
    function ipPoolsRightHandPanelCtr($scope, ipPoolServices, $mdDialog) {
        "ngInject";
        // console.log(" ipPoolsRightHandPanelCtr initialize ");      
        $scope.editMiscMode = false;
        $scope.editIPRangeMode = false;
        $scope.editIPPoolData = {};
        $scope.editMiscellaneousData = function () {
            $scope.editMiscMode = true;

        };

        $scope.applyMiscellaneousDataChanges = function () {
            $scope.editMiscMode = false;
            //cloudId, discription, gateway, name, prefix, ranges
            $scope.updateIPPool();
        };

        $scope.discardMiscellaneousDataChanges = function () {
            $scope.adornmentData.editIPoolData = $scope.adornmentData.ipoolData.clone();
            $scope.editMiscMode = false;
        };
        $scope.updateRightPanelData = function () {
            // commit changes 

            $scope.updateIPPoolRow();
        };
        $scope.editIPRange = function () {
            $scope.editIPRangeMode = true;
            //console.log("$scope.adornmentData.editIPoolData");
            //console.dir($scope.adornmentData.editIPoolData);  
            $mdDialog.show({
                controller: 'editIPPoolRangeDialogboxCtr', templateUrl: 'core/components/administration/ip-pools/edit-ip-pool-range-dialogbox.html', parent: angular.element(document.body), targetEvent: event, clickOutsideToClose: true, locals: {editIPoolData: $scope.adornmentData.editIPoolData, ipdata: $scope.adornmentData.ipdata}
            }).then(function (answer) {
                $scope.editIPRangeMode = false;
                console.log("updateIPPool success >> ");
                console.dir(answer);
                $scope.updateIPPool();


            }, function () {
                $scope.editIPRangeMode = false;
            });
        };

        $scope.updateIPPool = function () {
            var cloudId = $scope.adornmentData.ipdata.ipPoolData.cloudid;
            var discription = "discription";
            var gateway = $scope.adornmentData.editIPoolData.gateway;
            var name = $scope.adornmentData.editIPoolData.name;
            var prefix = $scope.adornmentData.editIPoolData.mask;
            var ranges = $scope.adornmentData.editIPoolData.convertIPRangeToString();
            var id = $scope.adornmentData.editIPoolData.id;
            //console.log(" ranges "+ranges); 
            //console.dir($scope.adornmentData.editIPoolData);
            toastparam = {
                'heading': 'IP Pool Update in progress',
                'subHeading': 'IP Pool Update initiated.',
                'type': 'progress',
                'timeout': 15000
            };
            showToast(toastparam);
            ipPoolServices.updateIPPool(cloudId, id, discription, gateway, name, prefix, ranges).then(function (data) {
                // console.log("updateIPPool success >> ");
                toastparam = {
                    'heading': 'IP Pool Update completed successfully',
                    'subHeading': '',
                    'type': 'success',
                    'timeout': 5000
                };
                showToast(toastparam);
                $scope.updateRightPanelData();
            },
                    function (error) {
                        //console.log("updateIPPool failed "); 
                        //console.dir(error);
                        toastparam = {
                            'heading': 'IP Pool update failed',
                            'subHeading': "Error: " + error.data.message,
                            'type': 'fail',
                            'timeout': 5000
                        };
                        showToast(toastparam);
                    });

        };
        $scope.applyIPRange = function () {
            $scope.editIPRangeMode = false;
        };

        $scope.discardIPRange = function () {
            $scope.editIPRangeMode = false;
        };

        $scope.addNewIPRange = function () {

        };

    }

    angular.module('shieldxApp').controller('ipPoolsRightHandPanelCtr', ipPoolsRightHandPanelCtr);



})();