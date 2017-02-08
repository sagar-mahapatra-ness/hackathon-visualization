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
    function managementPlaneCtr(
            $scope,
            $state,
            $translate,
            managementService,
            infrastructureConnectorService,
            deploymentSpecificationService,
            userSessionMenagment) {

        $scope.$emit('listenHeaderText', {headerText: $translate.instant('admin.toolbar.heading')});


        var updateControlPlaneSettingStarted = {
            'heading': 'Update Control Plane Setting Initiating',
            'subHeading': '&nbsp;',
            'type': 'progress',
            'timeout': $scope.toastTimeout
        };
        var updateControlPlaneSet = {
            'heading': 'Update Control Plane Set',
            'subHeading': '&nbsp;',
            'type': 'success',
            'timeout': $scope.toastTimeout,
            'callback': function () {
                $state.reload();
            }
        };

        var updateControlPlaneSettingFailed = {
            'heading': 'Update Control Plane Setting Failed',
            'subHeading': '&nbsp;',
            'type': 'failure',
            'timeout': $scope.toastTimeout
        };
        $scope.active_help_id = "admin_deploy_components_add_mgmt_plane_help";
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
        var controlplane_read = authorities("shieldxUpdates_controlplane_read");
        var controlplane_update = authorities("shieldxUpdates_controlplane_update");
        $scope.is_controlplane_read = userSessionMenagment.isUserAllowd(controlplane_read);
        $scope.is_controlplane_update = userSessionMenagment.isUserAllowd(controlplane_update);

        fixContainerHeight(1);

        // control Plane Setting controller

        $scope.clouds = [];

        infrastructureConnectorService.getListOfInfrastructures().then(function (data) {

            $scope.infraAvailable = (data.length > 0) ? true : false;

            $scope.clouds = data;

        });

        $scope.deploymentSpecDataNotAvailable = true;

        $scope.showDeploymentSpecOptions = function (infraId) {
            $scope.enableNext = false;
            $scope.deploymentSpecList = [];
            $scope.selectedDspec= parseInt(infraId);
            deploymentSpecificationService.getDeploymentSpecList(parseInt(infraId)).then(
                    function (delpoymentSpecList) {
                        $scope.deploymentSpecList = delpoymentSpecList;
                        if (delpoymentSpecList.length !== 0) {
                            $scope.deploymentSpecDataNotAvailable = false;
                        }
                    }
            );
        };

        $scope.updateControlPlaneSetting = function(infraId,dspecId) {
            console.log(infraId);
            console.log(dspecId);
            var controlPlaneSetting = {};
            showToast(updateControlPlaneSettingStarted);

            controlPlaneSetting.datapathDeploySpecId =  parseInt(dspecId);/*$scope.deploymentSpecId;*/
            controlPlaneSetting.cloudId =  parseInt(infraId);/*$scope.infrastructureId;*/
            managementService.updateControlPlaneSetting(controlPlaneSetting).then(function() {
            showToast(updateControlPlaneSet);
            }, function (error) {
                console.log(error);
                updateControlPlaneSettingFailed.subHeading = "Error: " + error.data.message;
                showToast(contentUpgradeFailed);
            });
        };


        $scope.$on('$viewContentLoaded', function (event) {
            console.log(event);
            fixContainerHeight(1);
        });

    }

    angular.module('shieldxApp').controller('managementPlaneCtr', managementPlaneCtr);
})();
