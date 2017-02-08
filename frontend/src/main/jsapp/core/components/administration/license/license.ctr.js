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
    function licenseCtr($scope,
                        $state,
                        $sessionStorage,
                        $translate,
                        licenseService) {

        "ngInject";

        // calling license if exist any
        licenseService.callGetLicense($sessionStorage.licenseId).then(function (data) {
            $scope.license = angular.fromJson(data);
        }, function (error) {
            console.log(error);
        });

        $scope.$emit('listenHeaderText', {headerText: $translate.instant('admin.toolbar.heading')});

        var licenseActivationStarted = {
            'heading': 'Activating License',
            'subHeading': '&nbsp;',
            'type': 'progress',
            'timeout': $scope.toastTimeout
        };
        var licenseActivated = {
            'heading': 'License activated successfully',
            'subHeading': '&nbsp;',
            'type': 'success',
            'timeout': $scope.toastTimeout,
            'callback': function () {
                $state.reload();
            }
        };
        var licenseActivationFailed = {
            'heading': 'License activation Failed',
            'type': 'failure',
            'timeout': $scope.toastTimeout,
            'callback': function () {
                $state.reload();
            }
        };


        // calling activate license based on UUID provides
        $scope.callActivateLicense = function () {
            showToast(licenseActivationStarted);
            var uuid = $scope.uuid;
            licenseService.callActivateLicense(uuid).then(function (data) {
                $scope.license = angular.fromJson(data);
                //updating session storage to store new license id
                $sessionStorage.licenseId = uuid;
                showToast(licenseActivated);
            }, function (error) {
                console.log(error);
                licenseActivationFailed.subHeading = "Error: " + error.data.message;
                showToast(licenseActivationFailed);
            });
        };

        fixContainerHeight(1);
    }

    angular.module('shieldxApp').controller('licenseCtr', licenseCtr);
})();
