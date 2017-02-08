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
    function networkViewCtr($scope,
            $state,
            $translate,
            $sessionStorage,
            ipPoolServices,
            virtualChassisService,
            policyService,
            deploymentSpecificationService,
            $mdDialog,
            $rootScope) {
        "ngInject";

        // console.log("monitorNetworksCtr initialised");
        $scope.comingFromAdmin = false;
        $scope.$emit('quickSetupBegun', {});
        $scope.$storage = $sessionStorage;
        $scope.init = false;
        $scope.isViewAll = false;
        $scope.isViewGrouped = false;
        $scope.isViewUnGrouped = true;
        $scope.networkFetched = false;
        $scope.name = "Active";
        $scope.activeTenant = {name: "A", id: 0};
        $scope.tenants = [{name: "A", id: 0}, {name: "B", id: 1}];
        $scope.monitor_network_heading = $translate.instant('wizardnetworkmap.header.select_network');
        $scope.wizardnetworkmap_rightpanel_header = $translate.instant("wizardnetworkmap.rightpanel.header");
        $scope.monitor_network_heading_infra_name = ($sessionStorage.cloudData.infrastructure.name) ? $sessionStorage.cloudData.infrastructure.name : 'no value set';
        $scope.monitor_network_heading_vc_name = $sessionStorage.cloudData.vChassis.name;

        $scope.active_help_id = "virtualchassis_vieweditaddisecgroup_wizard";
        
        //Write condition to check from where coming for $scope.headerValues.
        if (!$sessionStorage.cloudData.comingFrom) {
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
        } else {
            if ($sessionStorage.cloudData.comingFrom === 'ADMINADD' ||
                    $sessionStorage.cloudData.comingFrom === 'ADMINEDIT') {
                $scope.comingFromAdmin = true;
            }
        }
        $scope.securityPoliciyDescriptionMapping = {
            ACL: "Access Control",
            ThreatPrevention: "Threat Prevention",
            AppID: "Application Identification",
            ThreatPreventionAndAppID: "Threat Prevention Application Identification",
            ThreatPreventionAndACL: "Access Control Threat Prevention",
            ACLAndAppId: "Access Control Application Identification",
            ACLThreatPreventionAndAppID: "Access Control Threat Prevention Application Identification",
            AllInclusive:"All Inclusive",
            Tuned:"Tuned"

        };

        $scope.getSecurityPolicyDiscriptionFromName = function (name) {
            var str = $scope.securityPoliciyDescriptionMapping[name];
            if(str){
               return str; 
            } 
            return name;
        };
        $scope.getSecurityPolicyDescriptionFormID = function (id) {
            //console.log(" getSecurityPolicyDescriptionFormID 1 "+id);
            // console.dir($scope.securityPolicySet); 
            if ($scope.securityPolicySet) {
                //console.log(" getSecurityPolicyDescriptionFormID 2 ");
                var sp = _.find($scope.securityPolicySet, function (arg) {
                    return arg.id == id;
                });
                //console.log(" getSecurityPolicyDescriptionFormID 3 "+sp);
                if (sp) {
                    var val = $scope.getSecurityPolicyDiscriptionFromName(sp.name);
                    //console.log(" getSecurityPolicyDescriptionFormID "+val); 
                    return val;
                }
            }
        };

        $scope.getTenantNameFromID = function (id) {

            var retVal = _.find($scope.tenants, function (tenantInd) {
                return tenantInd.id === id;
            });

            return retVal;
        };
        $scope.showTentantPopup = function (ev) {
            console.dir($scope.tenants);
            $mdDialog.show({
                controller: 'tenantDialogBoxCtr', templateUrl: 'core/components/screenComponents/networkView/tenantDialogBox.html', parent: angular.element(document.body), skipHide: true, targetEvent: ev, clickOutsideToClose: true,
                locals: {
                    tenants: $scope.tenants,
                    selectedTenatnID: $scope.activeTenant.id,
                }
            }).then(function (answerVal) {
                $scope.networkFetched = false;
                var tenantSelected = $scope.getTenantNameFromID(parseInt(answerVal.selectedVal));
                $scope.activeTenant = tenantSelected;
                $scope.selected = [];
                $scope.$broadcast('tenantChanged', {tenant: $scope.activeTenant});
                $scope.masterList = angular.copy($scope.activeTenant.networks);
                $scope.updateMasterList();
                
                setTimeout(function () {
                    $scope.showUnGrouped(); //setting view to ungrouped 
                    $scope.networkFetched = true;
                }, 0);
                console.log(" tenant selected ");
                console.dir($scope.activeTenant);
                
            }, function () {
                $scope.status = 'You cancelled the dialog.';
            });
        };

        $scope.onNetworkSelected = function () {

            $scope.$broadcast('onNetworkSelectionChanged', {message: "newtwork selcetion changed"});
        };
        $scope.items = [];
        $scope.resourceGroupIndex = -1;
        if (!$sessionStorage.cloudData.vChassis.existingGroups) {
            $scope.existingGroups = [
            ];
            $sessionStorage.cloudData.vChassis.existingGroups = $scope.existingGroups;
        } else {
            //console.log(" group alrady exit ");
            console.dir($sessionStorage.cloudData.vChassis.existingGroups);
            var rt = $sessionStorage.cloudData.vChassis.existingGroups;
            $scope.existingGroups = [];
            for (var i = 0; i < rt.length; i++) {
                var tm = new ResourceGroups();
                tm.init(rt[i]);
                $scope.existingGroups.push(tm);
            }

            $sessionStorage.cloudData.vChassis.existingGroups = $scope.existingGroups;

        }
        //console.log($sessionStorage.cloudData);
        if (!$sessionStorage.cloudData) {
            $sessionStorage.cloudData = {};
            //console.log('cloudData not set');
            $state.go('home.quickSetup.quickSetup-begin');
        }
        //Write condition to check from where coming for $scope.headerValues.

        if (!$sessionStorage.cloudData.comingFrom) {
            if (!$sessionStorage.cloudData.cloudId) {
                //console.log('cloud Id not set');
                $state.go('home.quickSetup.infrastructure-connector');
                //$sessionStorage.cloudData.cloudId =  1; //THIS NEEDS TO BE REMOVED ONCE WE STORE IT FROM INFRASTRUCTURE
            }
            if (!$sessionStorage.cloudData.ipPool || !($sessionStorage.cloudData.ipPool.serverData)) {
                //console.log('data not set in ipPool');
                $state.go('home.quickSetup.ip-pools-management');
            }
            if (!$sessionStorage.cloudData.vChassis) {
                $state.go('home.quickSetup.virtual-chassis');
            }
        }
        //Write condition to check from where coming for $scope.headerValues.
        var cloudId = (!$sessionStorage.cloudData.comingFrom) ? 
                $sessionStorage.cloudData.cloudId : 
                $sessionStorage.cloudData.infrastructure.id;
        var vChassisName = ($sessionStorage.cloudData.vChassis.name) ? $sessionStorage.cloudData.vChassis.name : $state.go('home.quickSetup.virtual-chassis');
        var vChassisDesc = $sessionStorage.cloudData.vChassis.desc;
        var vChassisSelectedDeploymentSpec = ($sessionStorage.cloudData.vChassis.selectedDeploymentSpec) ? $sessionStorage.cloudData.vChassis.selectedDeploymentSpec : $state.go('home.quickSetup.virtual-chassis');
        $scope.inlineModeAvailable = deploymentSpecificationService.isinlineModeAvailable(
                cloudId,
                vChassisSelectedDeploymentSpec);

        deploymentSpecificationService.getTenants(cloudId).then(function (data) {
            $scope.tenants = data;
            if ($scope.tenants && $scope.tenants.length > 0) {
                $scope.activeTenant = $scope.tenants[0];
            }
            getNetworks(true);

        });


        getNetworks = function (omitNetworksUsed) {
            virtualChassisService.getAllNetworksMappedToResource({success: function (data) {
                    //console.log(" virtualChassisService.getAllNetworkInformations  success >> "+data);
                    //console.dir(data);
                    $scope.networks = virtualChassisService.getAdditionalNetworkInfo(
                            data,
                            $sessionStorage.cloudData.ipPool.serverData.backPlaneNetworkId,
                            $sessionStorage.cloudData.ipPool.serverData.mgmtNetworkId
                            );
                    $sessionStorage.cloudData.networks = $scope.networks;
                    $scope.items = $scope.networks;
                    _.remove($scope.items, function (item) {
                        return item.hide === true;
                    });
                    setTimeout(function () {
                        $scope.showUnGrouped(); //setting view to ungrouped 
                    }, 0);
                    //console.log(" $scope.items  >>> "+$scope.items.length);

                }, fail: function (error) {
                    console.log(" virtualChassisService.getAllNetworkInformations error " + error);
                }},
                    $sessionStorage.cloudData.cloudId,
                    angular.copy($sessionStorage.cloudData.ipPool.networks),
                    $sessionStorage.cloudData.vChassis.resourceGroup,
                    omitNetworksUsed,
                    angular.copy($sessionStorage.cloudData.vChassis.existingGroups));
        };


        $sessionStorage.cloudData.networks = [];
        $scope.securityPolicySet = [];
        $scope.selected = [];
        $scope.viewall = 'active-link';
        $scope.viewselected = false;

        $scope.showAll = function () {
            var tempList = angular.copy($scope.masterList);
            $scope.viewall = 'active-link';
            $scope.viewselected = false;
            $scope.selectAllDisabled = true;
            $scope.items = angular.copy(tempList);
            manageActiveViews('all');

        };

        $scope.showGrouped = function () {
            var tempList = angular.copy($scope.masterList);
            $scope.items = [];
            $scope.selectAllDisabled = false;
            _.forEach(tempList, function (obj) {
                if (obj.resourceGroupName || obj.resourceGroupId) {
                    $scope.items.push(obj);
                }
            });
            if ($scope.items.length === 0) {
                $scope.selectAllDisabled = true;
            }
            manageActiveViews('grouped');
        };
        $scope.showUnGrouped = function () {
            var tempList = angular.copy($scope.masterList);
            $scope.selected = [];
            $scope.items = [];
            $scope.selectAllDisabled = false;
            _.forEach(tempList, function (obj) {
                if (obj.resourceGroupName === null && obj.resourceGroupId === null) {
                    $scope.items.push(obj);
                }
            });
            if ($scope.items.length === 0) {
                $scope.selectAllDisabled = true;
            }
            $scope.networkFetched = true;

            manageActiveViews('un');
        };

        function manageActiveViews(type) {
            if (type.match(/all/ig)) {
                angular.element(document.querySelector('.view-grouped')).removeClass('active-link');
                angular.element(document.querySelector('.view-ungrouped')).removeClass('active-link');
                angular.element(document.querySelector('.view-all')).addClass('active-link');
                $scope.isViewAll = true;
                $scope.isViewGrouped = false;
                $scope.isViewUnGrouped = false;
                $scope.disableAllSelection(true);
            } else if (type.match(/grouped/ig)) {
                angular.element(document.querySelector('.view-all')).removeClass('active-link');
                angular.element(document.querySelector('.view-ungrouped')).removeClass('active-link');
                angular.element(document.querySelector('.view-grouped')).addClass('active-link');
                $scope.isViewAll = false;
                $scope.isViewGrouped = true;
                $scope.isViewUnGrouped = false;
                $scope.disableAllSelection(false);
            } else if (type.match(/un/ig)) {
                angular.element(document.querySelector('.view-all')).removeClass('active-link');
                angular.element(document.querySelector('.view-grouped')).removeClass('active-link');
                angular.element(document.querySelector('.view-ungrouped')).addClass('active-link');
                $scope.isViewAll = false;
                $scope.isViewGrouped = false;
                $scope.isViewUnGrouped = true;
                $scope.disableAllSelection(false);
            }
        }

        $scope.disableAllSelection = function (flag) {
            _.each($scope.items, function (obj) {
                obj.disabled = flag;
            });
        };

        $scope.$on('newGroupCreated', function (event, data) {
            //console.log(" newGrupCreated >>> "+data.newRG);
            //console.dir(data.newRG);
            if (typeof $sessionStorage.cloudData.vChassis.resourceGroup === "undefined") {
                $sessionStorage.cloudData.vChassis.resourceGroup = [];
            }
            $sessionStorage.cloudData.vChassis.resourceGroup.push(data.newRG);
            $scope.checkCommit();
            $scope.selected = [];
            reCalcNetworks();
            setTimeout(function () {
                $scope.showUnGrouped(); //setting view to ungrouped 
            }, 0);


        });

        $scope.$on('groupDeleted', function (event, data) {
            //console.log(" newGrupCreated >>> "+data.delRG);
            //console.dir(data.delRG);
            // $sessionStorage.cloudData.vChassis.resourceGroup.push(data.newRG);
            _.remove($sessionStorage.cloudData.vChassis.resourceGroup,
                    function (resourceGrp) {
                        return resourceGrp.name === data.delRG.name;
                    });
            $scope.checkCommit();
            reCalcNetworks();
        });

        $scope.$on('existingGroupModified', function (event, data) {
            //console.log(" existingGrupModified >>> "+data.exRG);
            //console.dir(data.exRG);
            var rtRG = _.find($sessionStorage.cloudData.vChassis.existingGroups,
                    function (resourceGrp) {
                        return resourceGrp.name === data.exRG.name;
                    });
            rtRG.memberList = data.exRG.memberList;
            $scope.selected = [];
            reCalcNetworks();
            setTimeout(function () {
                $scope.showGrouped(); //setting view to ungrouped 
            }, 0);
        });

        reCalcNetworks = function () {
            $scope.items = virtualChassisService.getAdditionalNetworkResourceGroupInfo(
                    $scope.networks,
                    $sessionStorage.cloudData.vChassis.existingGroups
                    );
            _.remove($scope.items, function (item) {
                return item.hide === true;
            });
            $scope.items = virtualChassisService.getAdditionalNetworkResourceGroupInfo(
                    $scope.activeTenant.networks,
                    $sessionStorage.cloudData.vChassis.existingGroups
                    );
            $scope.$emit('listChanged', {});
        };
        $scope.showSelected = function () {
            $scope.viewall = false;
            $scope.viewselected = 'active-link';
            $scope.items = $scope.selected;
        };
        $scope.toggleNetwork = function (networkval) {
            // console.log(" toggleNetwork ");
            if ($scope.selected) {
                var idx = $scope.selected.indexOf(networkval);
                if (idx > -1) {
                    $scope.selected.splice(idx, 1);
                } else {
                    $scope.selected.push(networkval);
                }


                $scope.$broadcast('onNetworkSelectionChanged', {selectedNetworks: $scope.selected});
            }
        };


        $scope.$on('resourceGroupSelected', function (event, data) {

            //console.dir(data.selRG);
            for (var i = 0; i < $scope.items.length; i++) {
                if ($scope.items[i].resourceGroupName === data.selRG.name)
                    $scope.items[i].faded = false;
                else
                    $scope.items[i].faded = true;
            }

        });


        $scope.isIndeterminate = function () {
            return ($scope.selected.length !== 0 &&
                    $scope.selected.length !== $scope.items.length);
        };
        $scope.isChecked = function () {
            return $scope.selected.length === $scope.items.length;
        };
        $scope.toggleAll = function () {
            if ($scope.selected.length === $scope.items.length) { //uncheck all
                $scope.selected = [];
            } else if ($scope.selected.length === 0 || $scope.selected.length > 0) {
                $scope.selected = $scope.items.slice(0); //check all
            }
            $scope.checkCommit();
            $scope.$broadcast('onNetworkSelectionChanged', {selectedNetworks: $scope.selected});
        };



        if (!($sessionStorage.cloudData.securityPolicySet)) {
            $sessionStorage.cloudData.securityPolicySet = [];
        }
        //CALL TO GET POLICY SET
        if ($sessionStorage.cloudData.securityPolicySet.length === 0) {
            //CALL TO GET SECURITY POLICY SET FROM SERVER
            policyService.getSecurityPolicySet().then(function (policyData) {
                //var data = _.sortBy(policyData, ["id"]);
                _.each(policyData, function (obj, key) {
                    obj.viewId = key;
                });
                $scope.securityPolicySet = policyData; //data;
                $sessionStorage.cloudData.securityPolicySet = policyData; //data;
            }, function (error) {
                console.log(error);
                $scope.securityPolicySet = [
                    {
                        "id": 4,
                        "name": "ACL"
                    },
                    {
                        "id": 2,
                        "name": "ThreatPrevention"
                    },
                    {
                        "id": 3,
                        "name": "AppID"
                    },
                    {
                        "id": 1,
                        "name": "ThreatPreventionAndAppID"
                    },
                    {
                        "id": 5,
                        "name": "ThreatPreventionAndACL"
                    },
                    {
                        "id": 6,
                        "name": "ACLAndAppId"
                    },
                    {
                        "id": 7,
                        "name": "ACLThreatPreventionAndAppID"
                    }
                ];
            });
        } else {
            $scope.securityPolicySet = $sessionStorage.cloudData.securityPolicySet;
        }

        $scope.checkCommit = function () {
            if ($scope.existingGroups.length > 0) {
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
            $scope.resourceGroupIndex = 0;
            $scope.createResourceGroup();
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
                    // console.log(" createResourceGroup "+$scope.resourceGroupIndex);
                    console.dir(createResouceParams);
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
                    var newnetworksPresent = _.find(rs.memberList, function (singleNetwork) {
                        return (singleNetwork.resourceGroupId === null);
                    });
                    if(newnetworksPresent){
                        var updateResourceGroupParam = {"id": rs.id,
                                                        "name": rs.name,
                                                        "cloudId": cloudId,
                                                        "tenantId": rs.tenant,
                                                        "memberList": rs.memberList
                                                        };
                        virtualChassisService.updateResourceGroup(updateResourceGroupParam).then(
                            function (resData) {
                                $scope.resourceGroupIndex++;
                                $scope.createResourceGroup();
                            },function (error){
                                console.log("Error in update");
                            });
                    }
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
//                toastparam = {
//                    'heading': 'Data Plane creation in progress',
//                    'subHeading': "Data Plane creation initiated. This should take only a few minutes max.",
//                    'type': 'progress',
//                    'timeout': 5000
//                };
//                showToast(toastparam);
            var vChassisParamObject = {
                "cloudId": cloudId,
                "datapathDeploySpecId": vChassisSelectedDeploymentSpec,
                "descr": vChassisDesc,
                "id": 0,
                "name": vChassisName,
                "subscriptionList": virtualChassisService.createSubscriptionList($scope.existingGroups)
            };
            //console.log(" createChassis "+$scope.resourceGroupIndex);
            console.dir(vChassisParamObject);
            virtualChassisService.createVirtualChassis(vChassisParamObject).then(function (vchassisData) {
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
                //ERROR HANDLING WILL COME HERE
                console.log(error);
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
                'heading': 'Data Plane update in progress',
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
            //console.log(" createChassis "+$scope.resourceGroupIndex);
            console.dir(vChassisParamObject);
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
                console.log(error);
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

        $scope.updateMasterList = function () {
            //console.log($scope.items, $scope.masterList);
            $scope.groupedElemsCount = 0;
            $scope.unGroupedElemsCount = 0;
            for (var i = 0; i < $scope.items.length; i++) {
                for (var j = 0; j < $scope.masterList.length; j++) {
                    if ($scope.masterList[j].id === $scope.items[i].id) {
                        $scope.masterList[j].resourceGroupId = angular.copy($scope.items[i].resourceGroupId);
                        $scope.masterList[j].resourceGroupName = angular.copy($scope.items[i].resourceGroupName);
                    }
                }
            }
            //update variables
            for (var k = 0; k < $scope.masterList.length; k++) {
                if ($scope.masterList[k].resourceGroupName)
                    ++$scope.groupedElemsCount;
                else
                    ++$scope.unGroupedElemsCount;
            }

        };
        $scope.$on('listChanged', function () { // updates masterList
            // console.log("Items list changes >>> "+$scope.items);
            $scope.updateMasterList();
        });
        $scope.$watch('items', function (newVal) {
            console.log("Initial Items list", newVal);
            if (!$scope.init && newVal.length > 0) {
                $scope.originalNetworkList = angular.copy(newVal);
                //$scope.masterList = angular.copy($scope.originalNetworkList); //creating deliberate redundancy
                //$scope.updateMasterList();

                for (i = 0; i < $scope.tenants.length; i++) {
                    /*if ($sessionStorage.cloudData.infrastructure.type === 'OPENSTACK') {
                        $scope.tenants[i].networks = getTenantNetworks($scope.tenants[i].name, $sessionStorage.cloudData.networks);
                    } else {  */
                        $scope.tenants[i].networks = $sessionStorage.cloudData.networks;
                   /* } */
                }

                $scope.masterList = angular.copy($scope.activeTenant.networks);
                $scope.updateMasterList();
                console.log("tenants after adding networks");
                console.log($scope.tenants);
                console.log($scope.activeTenant);
                //$scope.items = $scope.activeTenant.networks;


                $scope.init = true;
                for (var i = 0; i < $scope.items.length; i++) {
                    newVal[i].faded = false;
                }
            }
        });


        $scope.checkCommit();
        //$scope.showUnGrouped(); //setting view to ungrouped 
        //fixContainerHeight(4);$scope
        fixManageNetworkHeight();

        saveCurrentState();

    }



    angular.module('shieldxApp').controller('networkViewCtr', networkViewCtr);

})();
