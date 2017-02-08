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
    function monitorNetworksCtr($sessionStorage, $scope, $state,
            virtualChassisService,
            $translate,
            deploymentSpecificationService,
            ipPoolServices
            ) {
        "ngInject";
        $scope.comingFromAdmin = false;
        $scope.$emit('quickSetupBegun', {});
        $scope.$storage = $sessionStorage;
        $scope.init = false;
        $scope.isViewAll = false;
        $scope.isViewGrouped = false;
        $scope.isViewUnGrouped = true;
        $scope.name = "Active";
        $scope.monitor_network_heading = $translate.instant('wizardnetworkmap.header.select_network');
        $scope.wizardnetworkmap_rightpanel_header = $translate.instant("wizardnetworkmap.rightpanel.header");
        $scope.monitor_network_heading_infra_name = ($sessionStorage.cloudData.infrastructure.name) ? $sessionStorage.cloudData.infrastructure.name : 'no value set';
        $scope.monitor_network_heading_vc_name = $sessionStorage.cloudData.vChassis.name;

        $scope.active_help_id = "virtualchassis_vieweditaddisecgroup_wizard";
       
        if (!$sessionStorage.cloudData) {
            $sessionStorage.cloudData = {};
//            console.log('cloudData not set');
            $state.go('home.quickSetup.quickSetup-begin');
        }else{
            if (!$sessionStorage.cloudData.cloudId) {
//            console.log('cloud Id not set');
            $state.go('home.quickSetup.infrastructure-connector');
            //$sessionStorage.cloudData.cloudId =  1; //THIS NEEDS TO BE REMOVED ONCE WE STORE IT FROM INFRASTRUCTURE
            }

            if (!$sessionStorage.cloudData.infrastructure) {
    //            console.log('cloud Id not set');
                $state.go('home.quickSetup.infrastructure-connector');
            }

            if (!$sessionStorage.cloudData.infrastructure.id) {
    //            console.log('cloud Id not set');
                $state.go('home.quickSetup.infrastructure-connector');
            }
            if (!$sessionStorage.cloudData.ipPool || !($sessionStorage.cloudData.ipPool.serverData)) {
    //            console.log('data not set in ipPool');
                $state.go('home.quickSetup.ip-pools-management');
            }
            if (!($sessionStorage.cloudData.ipPool.serverData.managmentNetworkHeaderValue) || !($sessionStorage.cloudData.ipPool.serverData.managmentIPPoolHeaderValue)) {
    //            console.log('data not set in ipPool');
                $state.go('home.quickSetup.ip-pools-management');
            }
            if (!($sessionStorage.cloudData.ipPool.serverData.backpaneIPPoolHeaderValue) || !($sessionStorage.cloudData.ipPool.serverData.backpaneNetworkHeaderValue)) {
    //            console.log('data not set in ipPool');
                $state.go('home.quickSetup.ip-pools-backplane');
            }

            if (!$sessionStorage.cloudData.deploySpec) {
    //            console.log('data not set in deployment spec');
                $state.go('home.quickSetup.deployment-specifications');
            }
            if (!$sessionStorage.cloudData.deploySpec.serverData) {
    //            console.log('data not set in deployment spec');
                $state.go('home.quickSetup.deployment-specifications');
            }
            if (!$sessionStorage.cloudData.deploySpec.serverData.deploymentSpecId) {
    //            console.log('data not set in deployment spec');
                $state.go('home.quickSetup.deployment-specifications');
            }
            if (!$sessionStorage.cloudData.vChassis.name || !($sessionStorage.cloudData.vChassis.selectedDeploymentSpec)) {
    //            console.log('data not set in Virtual Chassis screen');
                $state.go('home.quickSetup.virtual-chassis');
            }
        }
        

        //Write condition to check from where coming for $scope.headerValues.
        $scope.setLastQuickSetupPage();
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
            }, {
                label: 'Deployment Specification', value: $sessionStorage.cloudData.deploySpec.serverData.name
            }];
        //Write condition to check from where coming for $scope.headerValues. ENDS

        $scope.getTenantNameFromID = function (id) {

            var retVal = _.find($scope.tenants, function (tenantInd) {
                return tenantInd.id === id;
            });

            return retVal;
        };

        $scope.onNetworkSelected = function () {

            $scope.$broadcast('onNetworkSelectionChanged', {message: "newtwork selcetion changed"});
        };
        $scope.resourceGroupIndex = -1;
        if (!$sessionStorage.cloudData.vChassis.existingGroups) {
            $scope.existingGroups = [
            ];
            $sessionStorage.cloudData.vChassis.existingGroups = $scope.existingGroups;
        } else {

            var rt = $sessionStorage.cloudData.vChassis.existingGroups;
            $scope.existingGroups = [];
            for (var i = 0; i < rt.length; i++) {
                var tm = new ResourceGroups();
                tm.init(rt[i]);
                $scope.existingGroups.push(tm);
            }

            $sessionStorage.cloudData.vChassis.existingGroups = $scope.existingGroups;

        }

        console.log("monitorNetworksCtr initialize rule data >>>");
        console.dir($sessionStorage.cloudData.vChassis.resourceGroupArray);

         if(!$sessionStorage.cloudData.vChassis.resourceGroupArray){
            $scope.resourceGroupArray = []; 
            $sessionStorage.cloudData.vChassis.resourceGroupArray = $scope.resourceGroupArray;
        } else {

            var rga = $sessionStorage.cloudData.vChassis.resourceGroupArray;
            $scope.resourceGroupArray = [];
            for (var j = 0; j < rga.length; j++) {
                var rule = new SORule();
                rule.init(rga[j]);
                $scope.resourceGroupArray.push(rule);
            }

            console.log("monitorNetworksCtr initialize from session >>>");
             console.dir($scope.resourceGroupArray);
            $sessionStorage.cloudData.vChassis.resourceGroupArray = $scope.resourceGroupArray;

        }

        $scope.$on("newrulecreated", function (event, args) {
            console.log("disableNextButton new rule added");
            $scope.disableNextButton();
        });
        $scope.$on("existingruleupdated", function (event, args) {
            console.log("disableNextButton rule updated");
            $scope.disableNextButton();
        });
        $scope.$on("newRuleCreated", function(arg){
         console.log("monitorNetworksCtr newRuleCreated >>>>>>>>>>>>> "+$scope.resourceGroupArray);
         console.log($scope.resourceGroupArray);
        });
       


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
            }, {
                label: 'Deployment Specification', value: $sessionStorage.cloudData.deploySpec.serverData.name
            }];

        //Write condition to check from where coming for $scope.headerValues.
        var cloudId = $sessionStorage.cloudData.cloudId;
        $scope.cloudId = cloudId;
        var vChassisName = ($sessionStorage.cloudData.vChassis.name) ? $sessionStorage.cloudData.vChassis.name : $state.go('home.quickSetup.virtual-chassis');
        var vChassisDesc = $sessionStorage.cloudData.vChassis.desc;
        var vChassisSelectedDeploymentSpec = ($sessionStorage.cloudData.vChassis.selectedDeploymentSpec) ? $sessionStorage.cloudData.vChassis.selectedDeploymentSpec : $state.go('home.quickSetup.virtual-chassis');
        $scope.inlineModeAvailable = deploymentSpecificationService.isinlineModeAvailable(
                cloudId,
                vChassisSelectedDeploymentSpec);

         $scope.OSRuleConfig = new OSRuleConfig($scope.inlineModeAvailable, true, OSRuleConfig.modes.WIZARD_MODE);

        $scope.$on(SOEvents.ruleAllCommitedEvent, function (event, args) {
//            console.log("resourceGroupCreated  >>>> 1 " + $scope.resourceGroupArray);
            $scope.checkCommit();
//            console.log("resourceGroupCreated  >>>> 2 ");
        });

        $sessionStorage.cloudData.networks = [];
        $scope.securityPolicySet = [];
        $scope.viewall = 'active-link';
        $scope.viewselected = false;

        
        $scope.checkCommit = function () {
//            console.log(" checkCommit " + $scope.resourceGroupArray.length);
            if ($scope.resourceGroupArray.length > 0) {
                $scope.enableNextButton();
            } else {
                $scope.disableNextButton();
            }
        };

        $scope.$on('nextClicked', function (event, data) {
            // console.log('cmg here');
            data.stopNextClick = true;
            $scope.startCreatingChassis();
        });
        $scope.startCreatingChassis = function () {
            $scope.createChassis();
        };

        $scope.createResourceGroup = function () {
            if ($scope.resourceGroupIndex < $scope.existingGroups.length) {
                var rs = $scope.existingGroups[$scope.resourceGroupIndex];
                if (!rs.id) {
                    var createResouceParams = {
                        "cloudId": cloudId,
                        "id": 0,
                        "memberList": rs.getNetworkServerFormat(),
                        "name": rs.name,
                        "tenantId": rs.tenant
                    };
                    virtualChassisService.createResourceGroup(createResouceParams).then(
                            function (resData) {
                                rs.id = resData;
                                if ($scope.resourceGroupIndex < $scope.existingGroups.length) {
                                    $scope.resourceGroupIndex++;
                                    $scope.createResourceGroup();
                                } else
                                {
                                    // $scope.createChassis(); 
                                }

                            }, function (error) {

                    });
                } else {
                    $scope.resourceGroupIndex++;
                    $scope.createResourceGroup();
                }
            } else {
                if (!$sessionStorage.cloudData.vChassis.id) {
                    $scope.createChassis();
                } else {
                    $scope.updateChassis();
                }
            }
        };

        $scope.createChassis = function () {
            var vChassisParamObject = SORuleUtil.getNewVitrialChassisJSON(vChassisName, vChassisSelectedDeploymentSpec, $scope.resourceGroupArray);
            virtualChassisService.createVirtualChassis(vChassisParamObject).then(function (vchassisData) {
//                console.log("createVirtualChassis  virtual chasis created successfully");
                ///created vchassis move user to another location
                delete $scope.$storage.cloudData;
                $scope.$emit('quickSetupEnded', {});
                var toastparam = {
                    'heading': 'Data Plane created successfully',
                    'subHeading': "",
                    'type': 'success',
                    'timeout': 5000,
                    'callback': gotoChassisListing()
                };
                showToast(toastparam);

            }, function (error) {
                var toastparam = {
                    'heading': 'Data Plane creation failed',
                    'subHeading': "Error: " + error.data.message,
                    'type': 'fail',
                    'timeout': 5000,
                    'callback': gotoChassisListing()
                };
                showToast(toastparam);
                saveCurrentState();
            });
        };

        saveCurrentState = function () {
            if (!$sessionStorage.cloudData.comingFrom) {
                $sessionStorage.cloudData.savedState = $state.current.name;
            }
        };

        gotoChassisListing = function () {
            if ($scope.comingFromAdmin) {
                $scope.hide();
            }
            $state.go('home.virtualChassis');
        };

        $scope.updateChassis = function () {
            toastparam = {
                'heading': 'Date Plane update in progress',
                'subHeading': "Data Plane update initiated. This should take only a few minutes max.",
                'type': 'progress',
                'timeout': 5000
            };
            showToast(toastparam);
            var vChassisParamObject = {
                "cloudId": cloudId,
                "datapathDeploySpecId": vChassisSelectedDeploymentSpec,
                "descr": vChassisDesc,
                "id": $scope.cloudData.vChassis.id,
                "name": vChassisName,
                "subscriptionList": virtualChassisService.createSubscriptionList($scope.existingGroups)
            };

            virtualChassisService.updateVirtualChassis(vChassisParamObject).then(function (vchassisData) {
                ///created vchassis move user to another location
                delete $scope.$storage.cloudData;
                $scope.$emit('quickSetupEnded', {});
                toastparam = {
                    'heading': 'Data Plane updated successfully',
                    'subHeading': "",
                    'type': 'success',
                    'timeout': 2000,
                    'callback': function () {
                        $state.go('home.virtualChassis');
                    }
                };
                showToast(toastparam);
                $mdDialog.hide();
                $state.go("home.virtualChassis");

            }, function (error) {
                //ERROR HANDLING WILL COME HERE
//                console.log(error);
                toastparam = {
                    'heading': 'Data Plane update failed',
                    'subHeading': "Error: " + error.data.message,
                    'type': 'fail',
                    'timeout': 5000,
                    'callback': function () {
                        $state.go('home.virtualChassis');
                    }
                };
                showToast(toastparam);
                saveCurrentState();
                $state.go("home.virtualChassis");

            });
        };

        $scope.checkCommit();
        fixManageNetworkHeight();
        saveCurrentState();
        
        $scope.networksavailable = $sessionStorage.cloudData.ipPool.networks;
        $scope.resourcegroups = $sessionStorage.cloudData.vChassis.resourceGroup;
        $scope.backplanenetworkid = $sessionStorage.cloudData.ipPool.serverData.backPlaneNetworkId;
        $scope.managmentnetworkid = $sessionStorage.cloudData.ipPool.serverData.mgmtNetworkId;
        $scope.existinggroups = $sessionStorage.cloudData.vChassis.existingGroups;
    }

    angular.module('shieldxApp').controller('monitorNetworksCtr', monitorNetworksCtr);

})();
