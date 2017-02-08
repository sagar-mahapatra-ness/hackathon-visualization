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
    function virtualChassisCtr($scope,
            $state,
            $translate,
            deploymentSpecificationService,
            virtualChassisService,
            $sessionStorage
            ) {
        "ngInject";

        console.log("virtualChasisCtr initialised");

        $scope.$emit('quickSetupBegun', {});

        $scope.virtual_chassis_heading = $translate.instant('wizardinfrastucture.virtual_chassis.heading');
        $scope.virtual_chassis_subheading = $translate.instant('wizardinfrastucture.virtual_chassis.subheading.message');
        $scope.virtual_chassis_name = $translate.instant("wizardinfrastucture.virtual_chassis.placeholder.name");
        $scope.virtual_chassis_description = $translate.instant("wizardinfrastucture.virtual_chassis.placeholder.description");

        $scope.active_help_id = "virtual_chassis_title_help_wizard";
        
        console.log($sessionStorage.cloudData);
        if (!$sessionStorage.cloudData) {
            $sessionStorage.cloudData = {};
            console.log('cloudData not set');
            $state.go('landingpage');
        }else{
            if (!$sessionStorage.cloudData.cloudId) {
            console.log('cloud Id not set');
            $state.go('home.quickSetup.quickSetup-begin');
            //$sessionStorage.cloudData.cloudId =  1; //THIS NEEDS TO BE REMOVED ONCE WE STORE IT FROM INFRASTRUCTURE
            }

            if (!$sessionStorage.cloudData.infrastructure) {
                console.log('cloud Id not set');
                $state.go('home.quickSetup.quickSetup-begin');
            }
            if (!$sessionStorage.cloudData.infrastructure.id) {
                console.log('cloud Id not set');
                $state.go('home.quickSetup.quickSetup-begin');
            }
            if (!$sessionStorage.cloudData.ipPool || !($sessionStorage.cloudData.ipPool.serverData)) {
                console.log('data not set in ipPool');
                $state.go('home.quickSetup.ip-pools-management');
            }
            if (!($sessionStorage.cloudData.ipPool.serverData.managmentNetworkHeaderValue) || !($sessionStorage.cloudData.ipPool.serverData.managmentIPPoolHeaderValue)) {
                console.log('data not set in ipPool');
                $state.go('home.quickSetup.ip-pools-management');
            }
            if (!($sessionStorage.cloudData.ipPool.serverData.backpaneIPPoolHeaderValue) || !($sessionStorage.cloudData.ipPool.serverData.backpaneNetworkHeaderValue)) {
                console.log('data not set in ipPool');
                $state.go('home.quickSetup.ip-pools-backplane');
            }

            if (!$sessionStorage.cloudData.deploySpec) {
                console.log('data not set in deployment spec');
                $state.go('home.quickSetup.deployment-specifications');
            }
            if (!$sessionStorage.cloudData.deploySpec.serverData) {
                console.log('data not set in deployment spec');
                $state.go('home.quickSetup.deployment-specifications');
            }
            if (!$sessionStorage.cloudData.deploySpec.serverData.deploymentSpecId) {
                console.log('data not set in deployment spec');
                $state.go('home.quickSetup.deployment-specifications');
            }    
        }
        
        if (!$sessionStorage.cloudData.vChassis) {
            $sessionStorage.cloudData.vChassis = {};
        }

        $scope.headerValues = [{
                label: 'Connector', value: $sessionStorage.cloudData.infrastructure.name
            }, {
                label: 'Infrastructure', value: $sessionStorage.cloudData.infrastructure.ip
            }, {
                label: 'Management Network', value: $sessionStorage.cloudData.ipPool.serverData.managmentNetworkHeaderValue
            }, {
                label: 'Management IP Pool', value: $sessionStorage.cloudData.ipPool.serverData.managmentIPPoolHeaderValue
            }, {
                label: 'Backplane Network', value: $sessionStorage.cloudData.ipPool.serverData.backpaneNetworkHeaderValue
            }, {
                label: 'Backplane IP Pool', value: $sessionStorage.cloudData.ipPool.serverData.backpaneIPPoolHeaderValue
            }
        ];


        deploymentSpecificationService.getDeploymentSpecList($sessionStorage.cloudData.cloudId).then(function (data) {
            $scope.virtualChassisList = data;

            if ($sessionStorage.cloudData.deploySpec.serverData.deploymentSpecId) {
                $scope.vChassis.virtualChassisSelected = $sessionStorage.cloudData.deploySpec.serverData.deploymentSpecId;
                //$scope.vChassis.virtualChassisSelected = $sessionStorage.cloudData.vChassis.selectedDeploymentSpec;
            } else {
                //$scope.vChassis.virtualChassisSelected = $scope.virtualChassisList[0].id;
                $state.go('home.quickSetup.deployment-specifications');
            }
        }, function (error) {
            console.log(error);
            $scope.virtualChassisList = [];
            if ($sessionStorage.cloudData.deploySpec.serverData.deploymentSpecId) {
                $scope.vChassis.virtualChassisSelected = $sessionStorage.cloudData.deploySpec.serverData.deploymentSpecId;
                //$scope.vChassis.virtualChassisSelected = $sessionStorage.cloudData.vChassis.selectedDeploymentSpec;
            } else {
                //$scope.vChassis.virtualChassisSelected = 100;
                $state.go('home.quickSetup.deployment-specifications');
            }
        });

        $scope.vChassis = {};
        if ($sessionStorage.cloudData.vChassis.name) {
            $scope.vChassis.name = $sessionStorage.cloudData.vChassis.name;
        } else {
            $scope.vChassis.name = '';
        }
        if ($sessionStorage.cloudData.vChassis.desc) {
            $scope.vChassis.desc = $sessionStorage.cloudData.vChassis.desc;
        } else {
            $scope.vChassis.desc = '';
        }

        $scope.$watch('vChassis.name', function () {
            $scope.checkNext();
        });

        $scope.$watch('vChassis.virtualChassisSelected', function () {
            $scope.checkNext();
        });

        $scope.checkNext = function () {
            if ($scope.vChassis.name && $scope.vChassis.virtualChassisSelected) {
                if (($scope.vChassis.name.length > 0) && ($scope.vChassis.virtualChassisSelected > 0))
                {
                    //console.log("enable next ");
                    $scope.enableNextButton();
                }
            } else {
                $scope.disableNextButton();
            }
        };

        $scope.$on('nextClicked', function (event, data) {
            data.stopNextClick = true;
            //$scope.createdeploymentspecification();
            $sessionStorage.cloudData.vChassis.name = $scope.vChassis.name;
            $sessionStorage.cloudData.vChassis.desc = $scope.vChassis.desc;
            $sessionStorage.cloudData.vChassis.selectedDeploymentSpec = $scope.vChassis.virtualChassisSelected;
            $sessionStorage.cloudData.savedState = $state.current.name;
            console.log($sessionStorage.cloudData);
            $state.go('home.quickSetup.monitor-networks');
        });
        fixContainerHeight(4);
        $scope.setFocusOnElem('#virtualChassisNameID');
    }
    angular.module('shieldxApp').controller('virtualChassisCtr', virtualChassisCtr);

})();