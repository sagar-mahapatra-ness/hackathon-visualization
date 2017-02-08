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
    function listVirtualChassisCtr($scope,
            $state,
            virtualChassisService,
            infrastructureConnectorService,
            deploymentSpecificationService,
            ipPoolServices,
            resourceGroupService,
            $translate,
            $mdDialog,
            $q,
            $sessionStorage,
            userSessionMenagment) {
        "ngInject";
//        var InfraListData = [];
//        var virtualChassisCtr = 0;
//        var totalvirtualChassis = 0;
        clearAllSession($sessionStorage);
        $scope.clouds = [];
        var deferred = $q.defer();
        $scope.promise = deferred.promise;

//        $scope.virtualChassisList = [];
        $scope.vChassisDataFetched = false;
        $scope.editMiscState = false;
        $scope.infraAvailable = false;

        console.log("listVirtualChassisCtr >> ");

        var vchassisDeploymentStarted = {
            'heading': 'Data Plane deployment started',
            'subHeading': 'Data Plane deployment has been started',
            'type': 'progress',
            'timeout': $scope.toastTimeout
        };
        var vchassisDeployed = {
            'heading': 'Data Plane deployed',
            'subHeading': 'Data Plane deployed successfully',
            'type': 'success',
            'timeout': $scope.toastTimeout
        };

        var vchassisReDeploymentStarted = {
            'heading': 'Data Plane Redeployment started',
            'subHeading': '&nbsp;',
            'type': 'progress',
            'timeout': $scope.toastTimeout
        };
        var vchassisReDeployed = {
            'heading': 'Data Plane Redeployed',
            'subHeading': 'Data Plane Redeployed successfully',
            'type': 'success',
            'timeout': $scope.toastTimeout
        };

        var vChassisUpdateStarted = {
            'heading': 'Data Plane Update Started',
            'type': 'progress',
            'timeout': $scope.toastTimeout
        };

        var vChassisUpdateSuccess = {
            'heading': 'Data Plane Updated successfully',
            'subHeading': 'Data Plane Updated successfully',
            'type': 'success',
            'timeout': $scope.toastTimeout,
            'callback': function () {
                $state.reload();
            }
        };

        var vChassisUpdateFailed = {
            'heading': 'Data Plane Update failed',
            'type': 'fail',
            'timeout': $scope.toastTimeout
        };

        //for tables [start]
        var create_id = authorities("virtualChassis_create");
        var delete_id = authorities("virtualChassis_delete");
        var update_id = authorities("virtualChassis_update");
        var check_id = authorities("virtualChassis_check");
        var deploy_id = authorities("virtualChassis_deploy");
        $scope.is_create_vchassis = userSessionMenagment.isUserAllowd(create_id);
        $scope.is_update_vchassis = userSessionMenagment.isUserAllowd(update_id);
        $scope.is_delete_vchassis = userSessionMenagment.isUserAllowd(delete_id);
        $scope.is_check_vchassis = userSessionMenagment.isUserAllowd(check_id);
        $scope.is_deploy_vchassis = userSessionMenagment.isUserAllowd(deploy_id);

        
        $scope.$emit('listenHeaderText', {headerText: $translate.instant('admin.toolbar.heading')});
        $scope.$emit('quickSetupEnded', {});

        /* **** for tables [start] **** */
        $scope.selected = [];
        $scope.query = {
            order: 'name',
            limit: 10,
            page: 1
        };
        $scope.isAdornmentPanelOpen = false;
        $scope.isSearchBarOpen = false;

        $scope.clearVChassisListFromSession = function () {
            clearMasterSession($sessionStorage, $state);
        };

        $scope.updateAdornmentPanel = function (event, rowData) {
            $scope.toggleAdornmentPanel();
            $scope.adornmentData = rowData;
            $scope.editMiscState = false;
            $scope.editNetworkData = false;
            $scope.deploymentSpecs = _.find($scope.vChassisObj, {"id": rowData.id}).deploySpec;
//            $scope.adornmentData.deploymentSpecId = $scope.deploymentSpecs.id;

            $scope.infraAccordionData = [{
                    id: 'infraName',
                    header: rowData.infra.name,
                    content: '',
                    isExpanded: false,
                    subData: [{
                            id: 'infraType',
                            header: rowData.infra.type,
                            content: '',
                            headerAddOn: 'Type'
                        }, {
                            id: 'infraAddr',
                            header: rowData.infra.ip,
                            content: '',
                            headerAddOn: 'Address'
                        }, {
                            id: 'infralogin',
                            header: rowData.infra.username,
                            content: '',
                            headerAddOn: 'Login'
                        }]
                }];
        };

        $scope.toggleAdornmentPanel = function () {
            $scope.isAdornmentPanelOpen = $scope.isAdornmentPanelOpen === false ? true : false;
        };
        $scope.toggleSearchBar = function (event) {
            $scope.isSearchBarOpen = $scope.isSearchBarOpen === false ? true : false;
            if ($scope.isSearchBarOpen)
                angular.element(event.currentTarget.firstElementChild).css('color', '#4a90e2');
            else
                angular.element(event.currentTarget.firstElementChild).css('color', '#6d6e71');
        };

        /* **** for tables [end] **** */

        $scope.showStatus = function (status, test) {
            return status === test;
        };
        //static data for table

        $scope.expandCallback = function (index, id) {
            var getDownChevron = document.querySelector('#' + id + ' md-icon.arrow-down');
            angular.element(getDownChevron).css("display", "none");
            var getUpChevron = document.querySelector('#' + id + ' md-icon.arrow-up');
            angular.element(getUpChevron).css("display", "block");
        };

        $scope.collapseCallback = function (index, id) {
            var getUpChevron = document.querySelector('#' + id + ' md-icon.arrow-up');
            angular.element(getUpChevron).css("display", "none");
            var getDownChevron = document.querySelector('#' + id + ' md-icon.arrow-down');
            angular.element(getDownChevron).css("display", "block");
        };



        $scope.infraObj = [];

       
        infrastructureConnectorService.getListOfInfrastructures().then(function (data) {
            $scope.infraAvailable = (data.length > 0) ? true : false;

            virtualChassisService.getListOfVirtualChassis().then(function (virtualChassisListData) {
                $scope.infraObj = angular.copy(data);
                  $scope.infraObj.chassis = virtualChassisListData;
                mapInfraVChassisData($scope.infraObj);
            });
        });


        mapInfraVChassisData = function (cloudObj) {
            $scope.vChassisObj = [];

            _.each(cloudObj, function (infraObj) {

                deploymentSpecificationService.getDeploymentSpecList(infraObj.id).then(function (deploymentSpecList) {
                   
                    if(!infraObj.chassis) {
                        infraObj.chassis = [];
                         _.each($scope.infraObj.chassis, function (chassis) {
                            var chassisSet = false;
                            _.each(deploymentSpecList, function (deploySpec) {
                                if (!chassisSet && deploySpec.id === chassis.datapathDeploySpecId) {
                                    infraObj.chassis.push(chassis);
                                    
                                    chassisSet = true;
                                }
                            });
                        });
                    }

                    resourceGroupService.getGroupList(infraObj.id).then(function (groupData) {

                        if (typeof infraObj.chassis !== "undefined") {

                            _.each(infraObj.chassis, function (vChassis) {

                                var tempChassisObj = {};
                                tempChassisObj = vChassis;
                                tempChassisObj.name = vChassis.name;
//                                tempChassisObj.infra = angular.copy(infraObj);
                                tempChassisObj.infra = {};
                                tempChassisObj.infra.id = angular.copy(infraObj.id);
                                tempChassisObj.infra.name = angular.copy(infraObj.name);
                                tempChassisObj.infra.type = angular.copy(infraObj.type);
                                tempChassisObj.infra.ip = angular.copy(infraObj.ip);
                                tempChassisObj.infra.username = angular.copy(infraObj.username);
                                var intId = parseInt(vChassis.datapathDeploySpecId);
                                tempChassisObj.deploySpec = _.find(deploymentSpecList, {"id": intId});
                                tempChassisObj.deploySpecList = deploymentSpecList;
                                tempChassisObj.resourceGroup = [];

                                _.each(vChassis.subscriptionList, function (subscription) {

                                    tempChassisObj.resourceGroup.push(
                                            _.find(groupData, {"id": subscription.resourceGroupId})
                                            );
                                });
                                $scope.vChassisObj.push(tempChassisObj);

                            });
                            console.log(" mapInfraVChassisData final data  ");
                            console.dir($scope.vChassisObj);
                            deferred.resolve();
                            $scope.vChassisDataFetched = true;
                        }
                    });
                });
            });
        };

        //var canDeleteVirtualChassis = false;
        $scope.deployVirtualChassis = function (vChassisObj) {
            var vChassisId = vChassisObj.id;
            showToast(vchassisDeploymentStarted);
            virtualChassisService.deployVirtualChassis(vChassisId).then(function (data) {
                if (data.status === false) {
                    console.log(data.errorMessage);
                } else {
                    showToast(vchassisDeployed);
                }
            }, function (error) {
                console.log(error);
                //showError
            });
        };

        $scope.reDeployVirtualChassis = function (vChassisObj) {
            var vChassisId = vChassisObj.id;
            showToast(vchassisReDeploymentStarted);
            virtualChassisService.reDeployVirtualChassis(vChassisId).then(function (data) {
                if (data.status === false) {
                    console.log(data.errorMessage);
                } else {
                    showToast(vchassisReDeployed);
                }
            }, function (error) {
                console.log(error);
                //showError
            });
        };
        
        deleteResourceGroup = function (rGroupId, infraId) {
            virtualChassisService.deleteResourceGroup(rGroupId, infraId).then(function (data) {
                if (data.status === false) {
                    console.log(data.errorMessage);
                }
            }, function (error) {
                console.log(error);
                //canDeleteVirtualChassis = false;
            });
        };

        $scope.deleteVirtualChassis = function (vChassisObj) {
            //canDeleteVirtualChassis = true;
            toastparam = {
                'heading': 'Data Plane deletion started',
                'subHeading': 'Data Plane deletion initiated',
                'type': 'progress',
                'timeout': $scope.toastTimeout
            };
            showToast(toastparam);
            var vChassisId = vChassisObj.id;
            var subscriptionList = vChassisObj.subscriptionList;
            var toastparam = {};
            virtualChassisService.deleteVirtualChassis(vChassisId, vChassisObj.infra.id).then(function (data) {
                if (data.status === true) {

                    for (var i = 0; i < $scope.vChassisObj.length; i++) {
                        if ($scope.vChassisObj[i].id === vChassisId) {
                            $scope.vChassisObj.splice(i, 1);
                        }
                    }
                    toastparam = {
                        'heading': 'Data Plane deleted successfully',
                        'subHeading': '',
                        'type': 'success',
                        'timeout': $scope.toastTimeout
                    };
                    showToast(toastparam);

                    for (var rgList = 0; rgList < subscriptionList.length; rgList++) {
                        var rGroupId = vChassisObj.subscriptionList[rgList].resourceGroupId;
                        deleteResourceGroup(rGroupId, vChassisObj.infra.id); //CALL TO DELETE RESOURCEGROUP
                    }
                } else {
                    console.log(data.errorMessage);
                    toastparam = {
                        'heading': 'Resourcegroup of Data Plane deletion failed',
                        'subHeading': data.errorMessage,
                        'type': 'fail',
                        'timeout': $scope.toastTimeout
                    };
                    showToast(toastparam);
                }
                $sessionStorage.vChassisList = $scope.virtualChassisList;
            }, function (error) {
                console.log(error);
                toastparam = {
                    'heading': 'Data Plane deletion failed',
                    'subHeading': "Error: " + error.data.message,
                    'type': 'fail',
                    'timeout': $scope.toastTimeout
                };
                showToast(toastparam);
                //showError
            });
        };

        $scope.callpopupToVirtualChassis = function (ev) {
            $mdDialog.show({
                controller: addVirtualChassisPopupCtr,
                templateUrl: 'core/components/administration/virtual-chassis/add-virtual-chassis.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                fullscreen: true,
                openFrom: {top: 1100, height: 0},
                closeTo: {left: 1500},
                locals: {
                    toastTimeout: $scope.toastTimeout
                }
            }).then(function () {

            });
        };


        $scope.callpopupToEditResourceGroup = function (ev, adornmentData) {
            $mdDialog.show({
                controller: editChassisResourceGroupCtr,
                templateUrl: 'core/components/administration/virtual-chassis/edit-virtual-chassis.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                fullscreen: true,
                openFrom: {top: 1100, height: 0},
                closeTo: {left: 1500},
                locals: {
                    toastTimeout: $scope.toastTimeout,
                    adornmentData: angular.copy($scope.adornmentData)
                }
            }).then(function () {

            });
        };


        $scope.editMiscInfraData = function () {
            $scope.editMiscState = true;
        };

        $scope.discardMiscChanges = function () {
            $scope.editMiscState = false;
        };


        $scope.editNetworks = function () {
            $scope.editNetworkData = true;
        };

        $scope.discardNetworkChanges = function () {
            $scope.editNetworkData = false;
        };

        $scope.submitMiscInfraData = function (vChassisObject) {

            $scope.editMiscState = false;

            $scope.toggleAdornmentPanel();

            showToast(vChassisUpdateStarted);

            var index = _.findIndex($scope.vChassisObj, {"id": vChassisObject.id});
            var deploymentSpecList = $scope.vChassisObj[index].deploySpecList;

            if (vChassisObject.deploySpec.id !== $scope.adornmentData.deploymentSpecId) {
                var paramObject = {
                    "cloudId": $scope.adornmentData.cloudId,
                    "datapathDeploySpecId": $scope.adornmentData.deploymentSpecId,
                    "descr": $scope.adornmentData.descr,
                    "id": $scope.adornmentData.id,
                    "name": $scope.adornmentData.name,
                    "subscriptionList": $scope.adornmentData.subscriptionList
                };

                virtualChassisService.updateVirtualChassis(paramObject, paramObject.cloudId).then(function (response) {

                    $scope.vChassisObj[index].deploymentSpec =
                            _.find(deploymentSpecList, {'id': parseInt($scope.adornmentData.deploymentSpecId)});

                    showToast(vChassisUpdateSuccess);

                }, function (error) {
                    console.log(error);
                    vChassisUpdateFailed.subHeading = "Error: " + error.data.message;
                    showToast(vChassisUpdateFailed);
                });
            }
        };

        $scope.$on('$viewContentLoaded', function (event) {
            console.log(event);
            fixContainerHeight(1);
        });

    }

    function editChassisResourceGroupCtr($scope,
            $sessionStorage,
            $state,
            $mdDialog,
            infrastructureConnectorService,
            deploymentSpecificationService,
            ipPoolServices,
            virtualChassisService,
            toastTimeout,
            adornmentData,
            coreservices) {
       //FUNCTIONALITY TO ADD DEPLOY SPEC
        $scope.virtualChassis = [];
        $scope.cloudid = (adornmentData.cloudId) ? parseInt(adornmentData.cloudId) : adornmentData.infra.id;
        $scope.virtualChassisData = adornmentData;
        $scope.virtualChassis.infrastructure = [];
        $scope.virtualChassis.deploymentSpec = "";
        $scope.virtualChassis.deploymentSpecObj = "";
        $scope.virtualChassis.networks = [];
        $scope.resourceGroupArray = [];
        $scope.deploymentSpecDataNotAvailable = true;
        $scope.items = [];
        $scope.noNetworkData = true;
        $scope.enableNextNetworkButton = false;
        $scope.showNetworks = false;
        $scope.disableDone = false;
        var selectedInfra = {};
        var allresourceGroupsForInfra = [];
        $scope.OSRuleConfig = null;
        $scope.chassisId = adornmentData.id;
        $scope.workloads = [];

//        if(adornmentData.resourceGroup){
//
//        }

        var vChassisCreated = {
            'heading': 'Data Plane created',
            'subHeading': 'Data Plane created successfully',
            'type': 'success',
            'timeout': toastTimeout
        };

        var vChassisCreationFailed = {
            'heading': 'Data Plane creation failed',
            'type': 'fail',
            'timeout': toastTimeout
        };

        var infraStructureRetrivalFailed = {
            'heading': 'infraStructure Retrival Failed',
            'type': 'fail',
            'timeout': toastTimeout
        };

        $scope.hideHelp = true;
        $scope.active_help_id = "virtual_chassis_title_help_wizard";

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

         console.log("editChassisResourceGroupCtr adornmentData "); 
         console.dir(adornmentData);
         console.log(JSON.stringify(adornmentData));
        $scope.vChassisObj = [];
        $scope.clouds = [];
        $scope.deploySpecList = []; 
        $scope.cloudData = {};
        $scope.cloudData.vChassis = {};
        $scope.deploymentSpecReady = false;
        $scope.enableNext = false;
        $scope.disableAdd = true;
        $scope.policySet = [];
        $scope.subscriptionList = [];

        coreservices.getSecurityPolicySet().then(function(data){
           $scope.policySet = data;
           setVchassisInitData();
        });

        $scope.formType = "Edit";
        $scope.cloudData.vChassis.id = adornmentData.id;
        $scope.cloudData.vChassis.name = adornmentData.name;

        $scope.cloudData.cloudId = (adornmentData.cloudId) ? parseInt(adornmentData.cloudId) : adornmentData.infra.id;

        $scope.cloudData.infrastructure = adornmentData.infra;
        $scope.deploySpecList = adornmentData.deploySpecList;
        $scope.subscriptionList = adornmentData.subscriptionList;

        console.log(" setVchassisInitData  >>>>>>>>>>>>>>>>>");
        console.dir($scope.subscriptionList);

        $scope.cloudData.ipPool = {};
        $scope.cloudData.ipPool.serverData = {};
        $scope.cloudData.comingFrom = 'ADMINEDIT';

        $scope.virtualChassis.deploymentSpec = parseInt(adornmentData.datapathDeploySpecId);

        $scope.selectedDeploymentSpec = adornmentData.deploySpec;
        


        setVchassisInitData = function () {

            $scope.cloudData.ipPool.serverData.backPlaneNetworkId = parseInt($scope.selectedDeploymentSpec.backPlaneNetworkId);
            $scope.cloudData.ipPool.serverData.mgmtNetworkId = parseInt($scope.selectedDeploymentSpec.mgmtNetworkId);

            var existingGroups = adornmentData.resourceGroup;
             
        
            var inlineMode =  deploymentSpecificationService.isinlineModeAvailable(
                $scope.cloudData.cloudId,
                $scope.virtualChassis.deploymentSpec);
              $scope.OSRuleConfig = new OSRuleConfig(inlineMode, true, OSRuleConfig.modes.EDIT_VC);
            console.log(" setVchassisInitData >>>>>>>>>>>> ");
            $scope.resourceGroupArray = [];
            _.each(existingGroups, function (resourceGroup, resourceGroupIndex) {
                var sr = new SORule();
                sr.mergeExistingGroup(resourceGroup);
                sr.resourceType = resourceGroup.resourceType;
                console.log("resourceGroup  ");
                console.dir(resourceGroup);
                sr.aspInfo = new ASPInfo();
                _.each(adornmentData.subscriptionList, function (subscription) {
                    console.log(" subscription >> ");
                    console.dir(subscription);
                    console.dir($scope.policySet);
                    if (resourceGroup.id === subscription.resourceGroupId) {
                        sr.aspInfo.id = subscription.spsId;
                        var policySetRef = _.find($scope.policySet, function(item){
                           return  item.id == subscription.spsId;
                        });
                        sr.aspInfo.name = policySetRef.name;
                        sr.inline = subscription.inline;
                        sr.trunkMode = subscription.trunk;
                    }
                });
                console.log("SORule  ");
                console.dir(sr);
                sr.precedence = (existingGroups.length+1) - sr.precedence;
                $scope.resourceGroupArray.push(sr);
            });



            $scope.existinggroups = existingGroups;

            $scope.cloudData.cloudId = $scope.cloudData.infrastructure.id;
            
           
//            console.log("$scope.networkChassisMapping");
//            console.log($scope.networkChassisMapping);
            /*virtualChassisService.getVchassisNetworkMappingData($scope.cloudData.cloudId).then(function (networkChassisMapping) {
                console.log("6");
                $scope.networkChassisMapping = networkChassisMapping;
                ipPoolServices.getNetworkListByCloudId($scope.cloudData.cloudId).then(function (networkList) {
                    var tempNetworkList = angular.copy(networkList);
                    _.each($scope.networkChassisMapping, function (networkChassisMappingObj) {
//                        var tempNetworkList = angular.copy(networkList);
                        _.each(networkChassisMappingObj.networks, function (mappingNetwork) {
//                            _.remove(tempNetworkList, function (network) {
                                if (networkChassisMappingObj.chassisId !== $scope.cloudData.vChassis.id) {
                                    var obj = _.find(networkList, {"id" : mappingNetwork});
                                    _.pull(tempNetworkList, obj);
                                }
//                            });
                        });
//                       finalTempList =  _.union(finalTempList, tempNetworkList);
                    });
                        $scope.cloudData.ipPool.networks = angular.copy(tempNetworkList);
                        $sessionStorage.cloudData = angular.copy($scope.cloudData);
                        $scope.networksavailable = angular.copy(tempNetworkList);
                        $scope.showNetworks = true;

                });
            });*/
                        $scope.showNetworks = true;
        };


        

        $scope.hide = function () {
            $mdDialog.hide();

            $state.go("home.virtualChassis", {}, { reload: true });
        };
        
        $scope.cancel = function () {
            $scope.$broadcast("unsavedExistInIt");
            $mdDialog.cancel();
            $state.go("home.virtualChassis");
        };

        $scope.$watch('showNetworks', function () {
            if ($scope.showNetworks) {
                $state.go("addvirtualChassis.newrc");
            }
        });

//        $scope.setDeploymentSpecData = function () {
//            $scope.deploymentSpecDataNotAvailable = true;
//            $scope.noNetworkData = true;
//            $scope.deploymentSpecs = [];
//            $scope.enableNextNetworkButton = false;
//            
//            selectedInfra = _.find($scope.cloudData, {"id" : parseInt($scope.virtualChassis.infrastructureId)});
//
//            if ( selectedInfra === {}) {
//
//                deploymentSpecificationService.getDeploymentSpecList($scope.virtualChassis.infrastructureId).then(function (deploymentSpecData) {
//                    $scope.deploymentSpecs = deploymentSpecData;
//                    $scope.deploymentSpecDataNotAvailable = false;
//                    virtualChassisService.getListOfResourceGroups($scope.virtualChassis.infrastructureId).then(function (resourceGroups) {
//                        allresourceGroupsForInfra = resourceGroups;
//                    });
//                });
//            } else {
//                $scope.deploymentSpecs = selectedInfra.deploymentSpecs;
//                $scope.deploymentSpecDataNotAvailable = (typeof selectedInfra.deploymentSpecs !== 'undefined' && selectedInfra.deploymentSpecs.length !== 0) ? false : true;
//                allresourceGroupsForInfra = selectedInfra.resourceGroups;
//            }
//        };

        $scope.showAll = function () {
            $scope.viewall = 'active-link';
            $scope.viewselected = false;
            $scope.items = $scope.networks;
        };
        $scope.showSelected = function () {
            $scope.viewall = false;
            $scope.viewselected = 'active-link';
            $scope.items = $scope.selected;
        };
        $scope.toggle = function (item, list) {
            var idx = list.indexOf(item);
            if (idx > -1) {
                list.splice(idx, 1);
            } else {
                list.push(item);
            }
            if (list.length > 0 && $scope.virtualChassis.name && $scope.virtualChassis.name !== '') {
                $scope.formInProgress = false;
            } else {
                $scope.formInProgress = true;
            }
        };
        $scope.exists = function (item, list) {
            return list.indexOf(item) > -1;
        };
        $scope.isIndeterminate = function () {
            return (typeof $scope.selected !== 'undefined' && $scope.selected.length !== 0 &&
                    $scope.selected.length !== $scope.items.length);
        };
        $scope.isChecked = function () {
            return (typeof $scope.selected !== 'undefined') ? $scope.selected.length === $scope.items.length : false;

        };
        $scope.toggleAll = function () {
            if ($scope.selected.length === $scope.items.length) { //uncheck all
                $scope.selected = [];
            } else if (typeof $scope.selected === 'undefined' || $scope.selected.length === 0 || $scope.selected.length > 0) {
                $scope.selected = $scope.items.slice(0); //check all
            }
            if ($scope.selected.length > 0 && $scope.virtualChassis.name && $scope.virtualChassis.name !== '') {
                $scope.formInProgress = false;
            } else {
                $scope.formInProgress = true;
            }
        };

        $scope.getNetworkData = function () {

            $scope.virtualChassis.deploymentSpecObj = _.find($scope.deploymentSpecs, {'id': parseInt($scope.virtualChassis.deploymentSpec)});

            $scope.noNetworkData = true;
//            getNetworks(true);
            if (selectedInfra === {}) {
                ipPoolServices.getNetworkListByCloudId($scope.virtualChassis.infrastructureId).then(function (networkData) {
                    if (networkData.length !== 0) {
                        $scope.noNetworkData = false;
                        $scope.networks = virtualChassisService.getAdditionalNetworkInfo(
                                angular.copy(networkData),
                                $scope.virtualChassis.deploymentSpecObj.backPlaneNetworkId,
                                $scope.virtualChassis.deploymentSpecObj.mgmtNetworkId
                                );

                        $scope.networks = virtualChassisService.getAdditionalNetworkResourceGroupInfo(
                                $scope.networks,
                                selectedInfra.resourceGroups,
                                true);

                        $scope.items = $scope.networks;
                        _.remove($scope.items, function (item) {
                            return item.hide === true;
                        });
//                        $scope.networks = networkData;
//                        $scope.items = networkData;

                        $scope.selected = [];
                        $scope.viewall = 'active-link';
                        $scope.viewselected = false;
                    } else {
                        $scope.noNetworkData = true;
                    }
                    $scope.networkFetched = true;
                }, function (error) {
                    console.log(error);
                });
            } else {
                var networkData = selectedInfra.networks;
                if (networkData.length !== 0) {
                    $scope.noNetworkData = false;
                    $scope.networks = virtualChassisService.getAdditionalNetworkInfo(
                            networkData,
                            $scope.virtualChassis.deploymentSpecObj.backPlaneNetworkId,
                            $scope.virtualChassis.deploymentSpecObj.mgmtNetworkId
                            );
                    $scope.networks = virtualChassisService.getAdditionalNetworkResourceGroupInfo(
                            $scope.networks,
                            selectedInfra.resourceGroups,
                            true);

                    $scope.items = $scope.networks;
//                        $scope.networkFetched = true;
                    _.remove($scope.items, function (item) {
                        return item.hide === true;
                    });

                    $scope.selected = [];
                    $scope.viewall = 'active-link';
                    $scope.viewselected = false;
                } else {
                    $scope.noNetworkData = true;
                }
            }
            if ($scope.virtualChassis.name && $scope.virtualChassis.name !== '') {
                $scope.enableNextNetworkButton = true;
            }

        };



        $scope.addVirtualChassis = function () {

            $scope.$broadcast('nextClicked', {});
            $mdDialog.hide();
        };

        getNetworks = function (omitNetworksUsed) {

            $scope.networks = virtualChassisService.getAdditionalNetworkResourceGroupInfo(
                    selectedInfra.networks,
                    selectedInfra.resourceGroups,
                    omitNetworksUsed);

            $scope.items = $scope.networks;
//            $scope.networkFetched = true;
            _.remove($scope.items, function (item) {
                return item.hide === true;
            });
        };
        $state.go("addvirtualChassis.newvc");
        $scope.toggleNetwork = function (networkval) {
            console.log(" toggleNetwork ");
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

        $scope.enableNextButton = function () {
            $scope.disableAdd = false;
        };

        $scope.disableNextButton = function () {
            $scope.disableAdd = true;
        };

        $scope.setFocusOnElem = function (elemId) {
            setTimeout(function () {
                document.querySelector(elemId).focus();
            }, 0);
        };

        $scope.hideRightPanel = false;

        $scope.toggleHelpPanel = function () {
            $scope.hideRightPanel = !($scope.hideRightPanel);
        };

         $scope.$on(SOEvents.ruleAllCommitedEvent, function (event, args) {
            console.log("resourceGroupCreated  >>>> 1 ",$scope.resourceGroupArray);
            $scope.enableNextButton();
//            console.log("resourceGroupCreated  >>>> 2 ");
        });
        
        $scope.$on("newrulecreated", function (event, args) {
            console.log("disableNextButton new rule added");
            $scope.disableNextButton();
        });
        
        $scope.$on("existingruleupdated", function (event, args) {
            console.log("disableNextButton rule updated");
            $scope.disableNextButton();
        });

        $scope.updateVirtualChassis = function(){
            console.log(" updateVirtualChassis ");
            console.dir($scope.resourceGroupArray);
            console.dir($scope.subscriptionList);

            toastparam = {
                'heading': 'Data Plane update in progress',
                'subHeading': "Data Plane update initiated. This should take only a few minutes max.",
                'type': 'progress',
                'timeout': 5000
            };
            showToast(toastparam);

            var  exitSubscriptionList = $scope.subscriptionList;
            var vChassisParamObject = SORuleUtil.getExistingVitrialChassisJSON($scope.cloudData.vChassis.id, $scope.cloudData.vChassis.name, $scope.virtualChassis.deploymentSpec, $scope.resourceGroupArray, exitSubscriptionList);
            vChassisParamObject.cloudId =  $scope.cloudData.cloudId;
           /*var vChassisParamObject = {
                "cloudId": cloudId,
                "datapathDeploySpecId": vChassisSelectedDeploymentSpec,
                "descr": vChassisDesc,
                "id": $scope.cloudData.vChassis.id,
                "name": vChassisName,
                "subscriptionList": virtualChassisService.createSubscriptionList($scope.existingGroups)
            };
            */
            //console.log(" createChassis "+$scope.resourceGroupIndex);
            console.dir(vChassisParamObject);
            //$scope.hide();
            virtualChassisService.updateVirtualChassis(vChassisParamObject).then(function (vchassisData) {
                ///created vchassis move user to another location
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
                $scope.hide();

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
                //saveCurrentState();
                $scope.hide();

            });
             
        };

    }

    function addVirtualChassisPopupCtr($scope,
            $sessionStorage,
            $state,
            $mdDialog,
            infrastructureConnectorService,
            deploymentSpecificationService,
            ipPoolServices,
            virtualChassisService,
            toastTimeout) {
        //FUNCTIONALITY TO ADD DEPLOY SPEC
        $scope.formInProgress = true;
        $scope.virtualChassis = [];
        $scope.virtualChassis.infrastructure = [];
        $scope.virtualChassis.deploymentSpec = "";
        $scope.virtualChassis.deploymentSpecObj = "";
        $scope.virtualChassis.networks = [];
        $scope.deploymentSpecDataNotAvailable = true;
        $scope.items = [];
        $scope.workloads = [];
        $scope.noNetworkData = true;
        $scope.enableNextNetworkButton = false;
        $scope.showNetworks = false;
        $scope.disableDone = false;
        var selectedInfra = {};
        var allresourceGroupsForInfra = [];
        $scope.hideHelp = false;
        $scope.active_help_id = "virtual_chassis_title_help_wizard";
        $scope.OSRuleConfig = null;

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

         $scope.resourceGroupArray = [];
          console.log(" addVirtualChassisPopupCtr  >> "+$scope.cloudId);

        var vChassisCreated = {
            'heading': 'Data Plane created',
            'subHeading': 'Data Plane created successfully',
            'type': 'success',
            'timeout': toastTimeout
        };

        var vChassisCreationFailed = {
            'heading': 'Data Plane creation failed',
            'type': 'fail',
            'timeout': toastTimeout
        };

        var infraStructureRetrivalFailed = {
            'heading': 'infraStructure Retrival Failed',
            'type': 'fail',
            'timeout': toastTimeout
        };

        $scope.vChassisObj = [];
        $scope.clouds = [];

        infrastructureConnectorService.getListOfInfrastructures().then(function (data) {

            $scope.infraAvailable = (data.length > 0) ? true : false;

            $scope.clouds = data;
            $scope.infraLoaded = true;

        });

        $scope.showDeploymentSpecOptions = function () {
            $scope.deploymentSpecDataNotAvailable = true;
            $scope.noNetworkData = true;
            $scope.enableNext = false;

            $scope.selectedInfra = angular.copy(_.find($scope.clouds, {
                "id": parseInt($scope.virtualChassis.infrastructureId)
            }));

            $scope.deploymentSpecs = $scope.selectedInfra.deployspec;

            $scope.deploymentSpecDataNotAvailable = (typeof $scope.deploymentSpecs !== 'undefined' &&
                    $scope.deploymentSpecs.length !== 0) ? false : true;
        };

        $scope.cloudData = {};
        $scope.cloudData.vChassis = {};
        $scope.deploymentSpecReady = false;
        $scope.enableNext = false;
        $scope.disableAdd = true;
        
        $scope.formType = "Add";
        $scope.cloudData.vChassis.name = $scope.virtualChassis.name;


        $scope.cloudData.ipPool = {};
        $scope.cloudData.ipPool.serverData = {};


        $scope.setVchassisInitData = function () {

            
            $scope.cloudData.cloudId = parseInt($scope.virtualChassis.infrastructureId);

            $scope.cloudData.infrastructure = $scope.selectedInfra;
            
            $scope.cloudData.vChassis.selectedDeploymentSpec = parseInt($scope.virtualChassis.deploymentSpec);

            $scope.selectedDeploymentSpec = _.find($scope.deploymentSpecs,
                    {"id": parseInt($scope.virtualChassis.deploymentSpec)});

            $scope.backplanenetworkid = parseInt($scope.selectedDeploymentSpec.backPlaneNetworkId);
            $scope.managmentnetworkid = parseInt($scope.selectedDeploymentSpec.mgmtNetworkId);
            $scope.tenantid = parseInt($scope.selectedDeploymentSpec.tenantId);
            
              var inlineMode =  deploymentSpecificationService.isinlineModeAvailable(
                $scope.cloudData.cloudId,
                parseInt($scope.virtualChassis.deploymentSpec));
              $scope.OSRuleConfig = new OSRuleConfig(inlineMode, true, OSRuleConfig.modes.ADD_VC);

            $scope.deploymentSpecReady = true;
            checkEnableNext();

        };

        $scope.$watch('virtualChassis.name', function () {
            checkEnableNext();
        });

        $scope.$watch('deploymentSpecReady', function () {
            checkEnableNext();
        });

        checkEnableNext = function () {
            if ($scope.virtualChassis.name && $scope.deploymentSpecReady) {
                $scope.enableNext = true;
            } else {
                $scope.enableNext = false;
            }
        };

        $scope.addSerurityGroups = function () {
            var inlineMode =  deploymentSpecificationService.isinlineModeAvailable(
            $scope.cloudData.cloudId,
            parseInt($scope.virtualChassis.deploymentSpec));
            $scope.OSRuleConfig = new OSRuleConfig(inlineMode, true, OSRuleConfig.modes.ADD_VC);
            $sessionStorage.cloudData = $scope.cloudData;
            $sessionStorage.cloudData.comingFrom = 'ADMINADD';
            $scope.showNetworks = true;
            $scope.hideHelp = true;
            console.log($scope.selectedDeploymentSpec);
            $state.go("addvirtualChassis.newrc");
            /*ipPoolServices.getNetworkListByCloudId($scope.cloudData.cloudId).then(function (networkList) {
                $scope.networksavailable = angular.copy(networkList);
            });*/
        };

        $scope.hide = function () {
            $mdDialog.hide();

            $state.go("home.virtualChassis");
        };
        $scope.cancel = function () {
            $scope.$broadcast("unsavedExistInIt");
            $mdDialog.cancel();
            $state.go("home.virtualChassis");
        };

        $scope.onNexClicked = function () {
            $state.go("addvirtualChassis.newrc");
        };

        $scope.showAll = function () {
            $scope.viewall = 'active-link';
            $scope.viewselected = false;
            $scope.items = $scope.networks;
        };
        $scope.showSelected = function () {
            $scope.viewall = false;
            $scope.viewselected = 'active-link';
            $scope.items = $scope.selected;
        };
        $scope.toggle = function (item, list) {
            var idx = list.indexOf(item);
            if (idx > -1) {
                list.splice(idx, 1);
            } else {
                list.push(item);
            }
            if (list.length > 0 && $scope.virtualChassis.name && $scope.virtualChassis.name !== '') {
                $scope.formInProgress = false;
            } else {
                $scope.formInProgress = true;
            }
        };
        $scope.exists = function (item, list) {
            return list.indexOf(item) > -1;
        };
        $scope.isIndeterminate = function () {
            return (typeof $scope.selected !== 'undefined' && $scope.selected.length !== 0 &&
                    $scope.selected.length !== $scope.items.length);
        };
        $scope.isChecked = function () {
            return (typeof $scope.selected !== 'undefined') ? $scope.selected.length === $scope.items.length : false;

        };
        $scope.toggleAll = function () {
            if ($scope.selected.length === $scope.items.length) { //uncheck all
                $scope.selected = [];
            } else if (typeof $scope.selected === 'undefined' || $scope.selected.length === 0 || $scope.selected.length > 0) {
                $scope.selected = $scope.items.slice(0); //check all
            }
            if ($scope.selected.length > 0 && $scope.virtualChassis.name && $scope.virtualChassis.name !== '') {
                $scope.formInProgress = false;
            } else {
                $scope.formInProgress = true;
            }
        };

        $scope.getNetworkData = function () {

            $scope.virtualChassis.deploymentSpecObj = _.find($scope.deploymentSpecs, {'id': parseInt($scope.virtualChassis.deploymentSpec)});

            $scope.noNetworkData = true;
//            getNetworks(true);
            if (selectedInfra === {}) {
                ipPoolServices.getNetworkListByCloudId($scope.virtualChassis.infrastructureId).then(function (networkData) {
                    if (networkData.length !== 0) {
                        $scope.noNetworkData = false;
                        $scope.networks = virtualChassisService.getAdditionalNetworkInfo(
                                angular.copy(networkData),
                                $scope.virtualChassis.deploymentSpecObj.backPlaneNetworkId,
                                $scope.virtualChassis.deploymentSpecObj.mgmtNetworkId
                                );

                        $scope.networks = virtualChassisService.getAdditionalNetworkResourceGroupInfo(
                                $scope.networks,
                                selectedInfra.resourceGroups,
                                true);

                        $scope.items = $scope.networks;
                        $scope.networkFetched = true;
                        _.remove($scope.items, function (item) {
                            return item.hide === true;
                        });
//                        $scope.networks = networkData;
//                        $scope.items = networkData;

                        $scope.selected = [];
                        $scope.viewall = 'active-link';
                        $scope.viewselected = false;
                    } else {
                        $scope.noNetworkData = true;
                    }
                }, function (error) {
                    console.log(error);
                });
            } else {
                var networkData = selectedInfra.networks;
                if (networkData.length !== 0) {
                    $scope.noNetworkData = false;
                    $scope.networks = virtualChassisService.getAdditionalNetworkInfo(
                            networkData,
                            $scope.virtualChassis.deploymentSpecObj.backPlaneNetworkId,
                            $scope.virtualChassis.deploymentSpecObj.mgmtNetworkId
                            );
                    $scope.networks = virtualChassisService.getAdditionalNetworkResourceGroupInfo(
                            $scope.networks,
                            selectedInfra.resourceGroups,
                            true);

                    $scope.items = $scope.networks;
//                        $scope.networkFetched = true;
                    _.remove($scope.items, function (item) {
                        return item.hide === true;
                    });

                    $scope.selected = [];
                    $scope.viewall = 'active-link';
                    $scope.viewselected = false;
                } else {
                    $scope.noNetworkData = true;
                }
            }
            if ($scope.virtualChassis.name && $scope.virtualChassis.name !== '') {
                $scope.enableNextNetworkButton = true;
            }

        };


        $scope.creationInProgress = false;

        $scope.addVirtualChassis = function () {
            var toastparam = {
                'heading': ' Data Plane  Creation Started...',
                'subHeading': "Calling Server API For Data Plane Creation",
                'type': 'progress',
                'timeout': 5000
            };
            showToast(toastparam);

            $scope.creationInProgress = true;
            $scope.disableAdd = true;
            $scope.createChassis();
        };
        $scope.gotoChassisListing = function(){
             $scope.hide() ;
             //$state.reload();
        };
 

         $scope.createChassis = function () {
//                toastparam = {
//                    'heading': 'Data Plane creation in progress',
//                    'subHeading': "Data Plane creation initiated. This should take only a few minutes max.",
//                    'type': 'progress',
//                    'timeout': 5000
//                };
//                showToast(toastparam);
            var vChassisParamObject = SORuleUtil.getNewVitrialChassisJSON($scope.virtualChassis.name , $scope.virtualChassis.deploymentSpec, $scope.resourceGroupArray);
            //console.log(" createChassis "+$scope.resourceGroupIndex);
//            console.dir(vChassisParamObject);
            vChassisParamObject.cloudId =  $scope.cloudData.cloudId;
            /*$scope.hide();*/
            virtualChassisService.createVirtualChassis(vChassisParamObject).then(function (vchassisData) {
                console.log("createVirtualChassis  virtual chasis created successfully");
                ///created vchassis move user to another location
                $scope.$emit('quickSetupEnded', {});
                var toastparam = {
                    'heading': 'Data Plane created successfully',
                    'subHeading': "",
                    'type': 'success',
                    'timeout': 5000,
                    'callback': $scope.gotoChassisListing()
                };
                showToast(toastparam);

            }, function (error) {
                //ERROR HANDLING WILL COME HERE
//                console.log(error);
                var toastparam = {
                    'heading': 'Data Plane creation failed',
                    'subHeading': "Error: " + error.data.message,
                    'type': 'fail',
                    'timeout': 5000,
                    'callback': $scope.gotoChassisListing()
                };
                showToast(toastparam);
                //saveCurrentState();
            });
        };

        getNetworks = function (omitNetworksUsed) {

            $scope.networks = virtualChassisService.getAdditionalNetworkResourceGroupInfo(
                    selectedInfra.networks,
                    selectedInfra.resourceGroups,
                    omitNetworksUsed);

            $scope.items = $scope.networks;
//            $scope.networkFetched = true;
            _.remove($scope.items, function (item) {
                return item.hide === true;
            });
        };
        $state.go("addvirtualChassis.newvc");
        $scope.toggleNetwork = function (networkval) {
            console.log(" toggleNetwork ");
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

       $scope.$on(SOEvents.ruleAllCommitedEvent, function (event, args) {
            console.log("resourceGroupCreated  >>>> 1 " , $scope.resourceGroupArray);
            $scope.enableAddButton();
            console.log("resourceGroupCreated  >>>> 2 ");
        });


        $scope.enableAddButton = function () {
            $scope.disableAdd = false;
        };

        $scope.disableNextButton = function () {
            $scope.disableAdd = true;
        };

        $scope.setFocusOnElem = function (elemId) {
            setTimeout(function () {
                document.querySelector(elemId).focus();
            }, 0);
        };

        $scope.hideRightPanel = false;

        $scope.toggleHelpPanel = function () {
            $scope.hideRightPanel = !($scope.hideRightPanel);
        };
    }

    angular.module('shieldxApp').controller('listVirtualChassisCtr', listVirtualChassisCtr);
})();