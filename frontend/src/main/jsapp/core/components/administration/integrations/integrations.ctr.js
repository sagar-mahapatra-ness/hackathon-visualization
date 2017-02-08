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
    function integrationsCtr(
            $scope,
            $state,
            $translate,
            managementService,
            userSessionMenagment) {


        $scope.selected = null;
        $scope.fireEyeDetails = null;
        $scope.newfireEyeDetails = null;
        $scope.editFireEyeData = false;
        $scope.isAdornmentPanelOpen = false;
        $scope.fireEyeDetailsHttps = true;

        $scope.pwdType = 'password';

        var fireEyeIntegrationConfigStarted = {
            'heading': 'FireEye Integration configuration update initiating',
            'subHeading': '&nbsp;',
            'type': 'progress',
            'timeout': $scope.toastTimeout
        };

        var fireEyeIntegrationConfigured = {
            'heading': 'FireEye Integration configuration updated',
            'subHeading': '&nbsp;',
            'type': 'success',
            'timeout': $scope.toastTimeout,
            'callback': function () {
                $state.reload();
            }
        };

        var fireEyeIntegrationConfigFailed = {
            'heading': 'FireEye Integration configuration update failed',
            'subHeading': '&nbsp;',
            'type': 'failure',
            'timeout': $scope.toastTimeout,
            'callback': function () {
                $state.reload();
            }

        };
        $scope.active_help_id = "admin_system_integrations_help";
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
        $scope.$emit('listenHeaderText', {headerText: $translate.instant('admin.toolbar.heading')});
       
        var red_id = authorities("integrations_read");
        var update_id = authorities("integrations_update");
        $scope.is_integrations_read = userSessionMenagment.isUserAllowd(red_id);
        $scope.is_integrations_update = userSessionMenagment.isUserAllowd(update_id);

        $scope.togglePasswordType = function () {
            $scope.pwdType = $scope.pwdType === 'password' ? 'text' : 'password';
        };

        $scope.updateAdornmentPanel = function () {
            console.log("updateAdornmentPanel called");
            $scope.toggleAdornmentPanel();
        };

        $scope.toggleAdornmentPanel = function () {
            $scope.isAdornmentPanelOpen = $scope.isAdornmentPanelOpen === false ? true : false;
        };

        $scope.fireEyeIntegration = function () {
            managementService.getFireEyeIntegrationDetails().then(function (fireEyeDetails) {
                $scope.fireEyeDetails = fireEyeDetails;
                $scope.newfireEyeDetails = angular.copy($scope.fireEyeDetails);
            }, function (error) {
                console.log(error);
            });
        };


        $scope.fireEyeIntegration();

        $scope.updateFireEye = function (fireEyeDetailsObj, updateAdornmentPanel) {

            showToast(fireEyeIntegrationConfigStarted);

            var formattedfireEyeDetails = {
                'id': fireEyeDetailsObj.id,
                'enabled': fireEyeDetailsObj.enabled,
                'ip': fireEyeDetailsObj.ip,
                'username': fireEyeDetailsObj.username,
                'password': fireEyeDetailsObj.password,
                'https': $scope.fireEyeDetailsHttps
            };


            managementService.updateFireEyeIntegrationDetails(formattedfireEyeDetails).then(function () {
                $scope.fireEyeDetails = formattedfireEyeDetails;
                if ($scope.editFireEyeData === true) {
                    $scope.newfireEyeDetails.enabled = $scope.fireEyeDetails.enabled;
                }
                if (updateAdornmentPanel) {
                    $scope.editFireEyeData = false;
                }
                showToast(fireEyeIntegrationConfigured);
//                $state.reload();
            }, function (error) {
                fireEyeIntegrationConfigFailed.subHeading = "Error: " + error.data.message;
                showToast(fireEyeIntegrationConfigFailed);
                console.log(error);
            });
        };

        $scope.discardMiscChanges = function () {
            $scope.newfireEyeDetails = angular.copy($scope.fireEyeDetails);
            $scope.editFireEyeData = false;
            $scope.pwdType = 'text';
        };


        $scope.enableEditFireData = function () {
            $scope.editFireEyeData = true;
        };

        $scope.$on('$viewContentLoaded', function (event) {
            console.log(event);
            fixContainerHeight(1);
        });
    }

    angular.module('shieldxApp').controller('integrationsCtr', integrationsCtr);
})();