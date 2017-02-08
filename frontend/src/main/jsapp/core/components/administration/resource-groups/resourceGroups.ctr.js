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
    function resourceGroupsCtr(
            $stateParams,
            $scope,
            $state,
            infrastructureConnectorService,
            ipPoolServices,
            resourceGroupService,
            deploymentSpecificationService,
            $translate,
            $q,
            $sessionStorage,
            $mdDialog,
            userSessionMenagment) {

        "ngInject";

        clearAllSession($sessionStorage);
        var deferred = $q.defer();
        $scope.promise = deferred.promise;
        $scope.promiseCompleted = true;
        var promiseCtr = 0;
        var totalClouds = 0;
        var groupData = [];
        var viewData = [];
        var rgIdSet = ($stateParams && $stateParams.rgId) ? parseInt($stateParams.rgId) : null;
        /* **** for tables [start] **** */
        $scope.$emit('listenHeaderText', {headerText: $translate.instant('admin.toolbar.heading')});
        $scope.$emit('quickSetupEnded', {});

        $scope.selected = [];
        $scope.query = {
            order: 'name',
            limit: 10,
            page: 1
        };
        $scope.isAdornmentPanelOpen = false;
        $scope.isSearchBarOpen = false;

        $scope.updateAdornmentPanel = function (event, rowData) {
            $scope.toggleAdornmentPanel();
            $scope.adornmentData = angular.copy(rowData);
        };

        $scope.toggleAdornmentPanel = function () {
            $scope.isAdornmentPanelOpen = $scope.isAdornmentPanelOpen === false ? true : false;
            //toggleGridCols($scope.isAdornmentPanelOpen);
            //$scope.editDetails = false;
            $scope.editGroup = false;
        };
        $scope.toggleSearchBar = function (event) {
            $scope.isSearchBarOpen = $scope.isSearchBarOpen === false ? true : false;
            if ($scope.isSearchBarOpen)
                angular.element(event.currentTarget.firstElementChild).css('color', '#4a90e2');
            else
                angular.element(event.currentTarget.firstElementChild).css('color', '#6d6e71');
        };

         
        var create_id = authorities("resourceGroups_create");
        var delete_id = authorities("resourceGroups_delete");
        var update_id = authorities("resourceGroups_update");
        $scope.is_create_rsgroup = userSessionMenagment.isUserAllowd(create_id);
        $scope.is_update_rsgroup = userSessionMenagment.isUserAllowd(update_id);
        $scope.is_delete_rsgroup = userSessionMenagment.isUserAllowd(delete_id);

        /* **** for tables [end] **** */

        //if(!$sessionStorage.groupViewData) {
        $sessionStorage.groupAllData = [];
        //GET LIST OF ALL INFRASTRUCTURE
        infrastructureConnectorService.getListOfInfrastructures().then(function (data) {
            totalClouds = data.length;
            if (totalClouds === 0) {
                $scope.errorMessage = "No Infrastructures!!!";
                //NO DATA FOR VIEW
                deferred.resolve();
                $scope.promiseCompleted = false;
            } else {
                for (i = 0; i < data.length; i++) {
                    groupData[i] = {};
                    groupData[i].cloud_data = {};
                    groupData[i].group_data = [];
                    groupData[i].tenants = [];
                    groupData[i].network_data = [];
                    groupData[i].unused_networks = [];
                    groupData[i].tenantsNetwork = [];

                    //ADDING CLOUD DATA IN DEPLOYMENT SPEC
                    groupData[i].cloud_data = data[i];
                    groupData[i].cloudId = data[i].id;
                    //GET network, Groups
                    getNetworksAndResourceGroups(data[i], groupData[i]);

                    $sessionStorage.groupAllData.push(groupData[i]);

                }
            }
        });
        /*} else {
         //console.log($sessionStorage.viewData);
         viewData = $sessionStorage.groupViewData;
         //$scope.groupData = viewData;
         $scope.groupData = moveRecordToStart(viewData, "id", rgIdSet);
         deferred.resolve();
         $scope.promiseCompleted = false;
         }*/


        getNetworksAndResourceGroups = function (cloudData, obj) {
            //CALL ITS AVAILABLE NETWORKS
            ipPoolServices.getNetworkListByCloudId(cloudData.id).then(function (networkData) {
                obj.network_data = angular.copy(networkData);
                obj.unused_networks = angular.copy(networkData);
                //console.log("Available Networks for " + cloudData.id);
                //console.log(networkData);
                //CALL ITS AVAILABLE TENANTS
                deploymentSpecificationService.getTenants(cloudData.id).then(function (data) {
                    obj.tenants = data;
                    if (cloudData.type === 'OPENSTACK') {
                        for (k = 0; k < obj.tenants.length; k++) {
                           // obj.tenantsNetwork[obj.tenants[k].id] = getTenantNetworks(obj.tenants[k].name, obj.network_data);
                            //console.log(obj.tenantsNetwork[obj.tenants[k].id]);
                            obj.tenantsNetwork[obj.tenants[k].id] = obj.network_data;
                        }
                    }
                    //CALL ITS AVAILABLE RESOURCE GROUP
                    resourceGroupService.getGroupList(cloudData.id).then(function (groupData) {

                        for (c = 0; c < groupData.length; c++) { //c for counter

                            groupData[c].cloudName = obj.cloud_data.name;
                            groupData[c].cloudType = obj.cloud_data.type;

                            if (obj.cloud_data.type === 'OPENSTACK') {
                                groupData[c].networks = obj.tenantsNetwork[groupData[c].tenantId];
                                groupData[c].unused_networks = getOpenStacksUnusedNetwork(obj, groupData[c].memberList, groupData[c].tenantId);
                                groupData[c].availableNetworks = groupData[c].unused_networks;
                            }

                            //Assign names to ids of tenants and networks
                            groupData[c].networksWithName =
                                    getnetworkDataWithName(groupData[c].memberList,
                                            obj.network_data);

                            //Call function to update unused Networks.
                            obj.unused_networks = updateUnusedNetworks(obj, groupData[c].memberList);
                            //groupData[c].availableNetworks = groupData[c].networksWithName.concat(obj.unused_networks);
                            //getAvailableNetworksForGroupObject(obj.unused_networks, groupData[c].networksWithName);
                            if (obj.cloud_data.type !== 'OPENSTACK') {
                                groupData[c].availableNetworks = obj.unused_networks;
                            }
                            //console.log("Unused Networks === for " +  cloudData.id);
                            //console.log(obj.unused_networks);
                            groupData[c].tenantName =
                                    getNameOfGivenParam(groupData[c].tenantId,
                                            angular.copy(obj.tenants));

                            groupData[c].availableTenants = angular.copy(obj.tenants);
                            //Total number of networks in this group assigned
                            
                            var uniqueNetwork = [];
                            for(var i = 0; i < groupData[c].memberList.length; i++) {
                                if(!_.find(uniqueNetwork, {"networkId" : groupData[c].memberList[i].networkId})) {
                                    uniqueNetwork.push(groupData[c].memberList[i]);
                                }
                            }
                            groupData[c].countMembers = uniqueNetwork.length;

                            viewData.push(groupData[c]);

                        }
                        obj.group_data = groupData;

                        promiseCtr += 1;
                        //console.log("PROMISE COUNTER==="+promiseCtr);
                        if (promiseCtr >= totalClouds) {
                            $sessionStorage.groupViewData = viewData;
                            deferred.resolve();
                            console.log(viewData);
                            $scope.promiseCompleted = false;
                            //$scope.groupData = viewData;
                            $scope.groupData = moveRecordToStart(viewData, "id", rgIdSet);
                            console.log("$sessionStorage.groupAllData");
                            console.log($sessionStorage.groupAllData);
                            console.log("$sessionStorage.groupViewData");
                            console.log($sessionStorage.groupViewData);

                        }

                    }, function (error) {
                        console.log(error);
                        obj.group_data = [];
                        promiseCtr += 1;
                        if (promiseCtr === totalClouds) {

                            $sessionStorage.groupViewData = viewData;
                            deferred.resolve();
                            $scope.promiseCompleted = false;
                            console.log($scope.groupData);
                            console.log($sessionStorage.groupViewData);
                        }
                    });
                }, function (error) {
                    console.log(error);
                    obj.tenants = [];
                });
            }, function (error) {
                console.log(error);
                obj.network_data = [];
            });
        };

        getnetworkDataWithName = function (srcArray, FromArray) {

            var result = [];
            var i = 0;
            for (var ntw = 0; ntw < srcArray.length; ) {
                if (!_.find(result, {"id" : parseInt(srcArray[ntw].networkId)})) {
                    result[i++] = _.find(FromArray, {'id': parseInt(srcArray[ntw].networkId)});
                }
                ntw++;
            }
            return result;
        };

        //Helper function to get name of given Id from given list
        getNameOfGivenParam = function (id, list) {
            if (list.length > 0 || typeof id !== 'undefined') {
                var result = {};
                result = _.find(list, {'id': id});
                if (typeof result !== 'undefined') {
                    return result;
                } else {
                    return {};
                }
            } else {
                return {};
            }
        };


        //DELETE GROUP
        $scope.deleteGroup = function (objectData) {
            console.log(objectData);
            $scope.isAdornmentPanelOpen = false;

            var toastparam = {};
            toastparam = {
                'heading': 'Group deletion in progress',
                'subHeading': 'Group deletion initiated.',
                'type': 'progress',
                'timeout': 10000
            };
            showToast(toastparam);
            $scope.promiseCompleted = true;
            var list = $scope.groupData;

            //DELETE /shieldxapi/infras/resourcegroup/{rgId} 
            resourceGroupService.deleteGroupList(objectData.id, objectData.cloudId).then(function (data) {
                if (data.status) {
                    //update rows
                    for (i = 0; i < list.length; i++) {
                        if (list[i].id === objectData.id) {
                            list.splice(i, 1);
                        }
                    }

                    toastparam = {
                        'heading': 'Group deleted successfully',
                        'subHeading': '&nbsp;',
                        'type': 'success',
                        'timeout': 5000
                    };
                    showToast(toastparam);
                    $scope.promiseCompleted = false;
                } else {
                    console.log("Unable to delete Group (%s) due to %s", objectData.name, data.errorMessage);
                    //TODO to show message/something else;
                    toastparam = {
                        'heading': 'Group deletion failed',
                        'subHeading': "Error: " + data.errorMessage,
                        'type': 'fail',
                        'timeout': 5000
                    };
                    showToast(toastparam);
                    $scope.promiseCompleted = false;
                }
            }, function (error) {
                console.log("Unable to delete group - %s due to %s", objectData.name, error.message);
                //TODO to show message/something else;
                toastparam = {
                    'heading': 'Group deletion failed',
                    'subHeading': "Something went wrong",
                    'type': 'fail',
                    'timeout': 5000
                };
                showToast(toastparam);
                $scope.promiseCompleted = false;
            });
        }; //DELETE GROUP ENDS.

        //UPDATE GROUP
        var oldData;
        $scope.discardChanges = function () {
            $scope.editGroup = false;
            console.log(oldData);
            $scope.adornmentData = oldData; //ASSIGN OLD DATA TO OBJECT.
        };

        $scope.callupdateGroupPopup = function (ev, adornmentData) {
            $mdDialog.show({
                controller: editResourceGroupCtr,
                templateUrl: 'core/components/administration/resource-groups/edit-rule.html',
                parent: angular.element(document.body),
               targetEvent: ev,
                fullscreen: true,
                openFrom: {top: 1100, height: 0},
                closeTo: {left: 1500},
                locals: {
                    toastTimeout: $scope.toastTimeout,
                    adornmentData: angular.copy($scope.adornmentData)
                }
            }).then(function (value) {
                if(value === 'resource_Group'){
                    $state.reload();
                }
            });
        };
        $scope.updateGroup = function (dataObject) {
            //THIS FUNCTION WILL CALL WHEN USER COMING IN EDIT MODE.
            oldData = angular.copy(dataObject); //MAKE COPY OF OLD DATA.
            console.log(oldData);
            $scope.editGroup = true;
        };
        $scope.editGroupData = function (dataObject) {
            $scope.editGroup = false;
            $scope.isAdornmentPanelOpen = false;
            toastparam = {
                'heading': 'Group update in progress',
                'subHeading': 'Group update initiated.',
                'type': 'progress',
                'timeout': 10000
            };
            showToast(toastparam);
            $scope.promiseCompleted = true;
            console.log("dataObject to update data");
            console.log(dataObject);

            var paramObject = {"id": dataObject.id,
                "name": dataObject.name,
                "cloudId": dataObject.cloudId,
                "tenantId": dataObject.tenantId,
                "memberList": dataObject.memberList,
                "dynamic":dataObject.dynamic,
                "regex": dataObject.regex,
                "resourceType":dataObject.resourceType,
                "precedence":dataObject.precedence
            };
            console.log(paramObject);
            var listGroupData = $scope.groupData;
            var listAllGroupsData = $sessionStorage.groupAllData;
            console.log(listGroupData);
            resourceGroupService.updateResourceGroup(paramObject).then(function () {
                console.log('SUCCESS');
                for (i = 0; i < listGroupData.length; i++) {
                    //UPDATE its PARENT ON LEFT SIDE GRID
                    if (listGroupData[i].id === paramObject.id) {
                        listGroupData[i] = dataObject;
                    }

                    //UPDATE all PARENTs (available Network) ON LEFT SIDE GRID belonging to Same CLOUD/INFRA
                    if (listGroupData[i].cloudId === paramObject.cloudId) {
                        if (dataObject.cloudType !== 'OPENSTACK') {
                            listGroupData[i].availableNetworks = dataObject.availableNetworks;
                        } else {
                            //IF OPENSTACK THEN CHECK FOR TENANT ID FOR UPDATE
                            if (listGroupData[i].tenantId === dataObject.tenantId) {
                                listGroupData[i].availableNetworks = dataObject.availableNetworks;
                            }
                        }
                    }
                }

                //UPDATE SessionData (available Network of group_data and unused_networks) belonging to Same CLOUD/INFRA
                for (i = 0; i < listAllGroupsData.length; i++) {
                    if (listAllGroupsData[i].cloudId === paramObject.cloudId) {
                        listAllGroupsData[i].unused_networks = dataObject.availableNetworks;
                        for (j = 0; j < listAllGroupsData[i].group_data.length; j++) {
                            if (dataObject.cloudType !== 'OPENSTACK') {
                                listAllGroupsData[i].group_data[j].availableNetworks = dataObject.availableNetworks;
                            } else {
                                if (listAllGroupsData[i].group_data[j].tenantId === dataObject.tenantId) {
                                    listAllGroupsData[i].group_data[j].availableNetworks = dataObject.availableNetworks;
                                }
                            }
                        }
                    }
                }
                //console.log($sessionStorage.groupAllData);
                //console.log($scope.groupData);
                toastparam = {
                    'heading': 'Group (' + dataObject.name + ') updated successfully',
                    'subHeading': '&nbsp;',
                    'type': 'success',
                    'timeout': 5000
                };
                showToast(toastparam);
                $scope.promiseCompleted = false;
            }, function (error) {
                console.log(error);
                toastparam = {
                    'heading': 'Group update failed',
                    'subHeading': "ERROR: " + error.message,
                    'type': 'fail',
                    'timeout': 5000
                };
                showToast(toastparam);
                $scope.promiseCompleted = false;
            });
        };
        $scope.callpopuptenants = function (dataObject) {
            console.log(dataObject);
        };
       
        function editResourceGroupCtr($scope,
            $sessionStorage,
            $state,
            $mdDialog,
            toastTimeout,
            adornmentData,
            ipPoolServices) {
            console.log("This is adornmentData data");
            $scope.cloudId = adornmentData.cloudId;
          
            /////////////////////////
            
                $scope.cloudData = {};
                $scope.cloudData.vChassis = {};   
                $scope.cloudData.vChassis.id = "";
                $scope.cloudData.vChassis.name = "";

                $scope.cloudData.cloudId = $scope.cloudId;

              

                $scope.cloudData.ipPool = {};
                $scope.cloudData.ipPool.serverData = {};
                $scope.cloudData.ipPool.serverData.backPlaneNetworkId = -1;
                $scope.cloudData.ipPool.serverData.mgmtNetworkId = -1;

                var existingGroups =[];
               
                $scope.cloudData.vChassis.existingGroups = existingGroups;
                
                ipPoolServices.getNetworkListByCloudId($scope.cloudData.cloudId).then(function (networkList) {
                    $scope.cloudData.ipPool.networks = angular.copy(networkList);
                    $sessionStorage.cloudData = angular.copy($scope.cloudData);
                    $scope.showNetworks = true;
                });    
           
            

            /////////////////////////////////

            
            $scope.resourceGroupArray = [];
            console.log($scope.cloudId);
            console.log(adornmentData);
            var resourceGroup = adornmentData;
            $scope.OSRuleConfig = new OSRuleConfig(false, false, OSRuleConfig.modes.EDIT_RC);
            $scope.cancel = function () {
                $mdDialog.cancel();
                $state.reload();
            };

            $scope.$on(SOEvents.ruleAllCommitedEvent, function (event, args) {
               $scope.cancel();
            });

                var sr = new SORule();
                sr.mergeExistingGroup(resourceGroup);
                console.log("resourceGroup  ");
                console.dir(resourceGroup);
                sr.aspInfo = new ASPInfo();
                console.log("SORule  ");
                console.dir(sr);
                $scope.resourceGroupArray.push(sr);
          
        }
        $scope.callpopupToAddNewGroup = function (dataObject, ev) {
            $mdDialog.show({
                controller: addNewResourceGroupPopupCtr,
                templateUrl: 'core/components/administration/resource-groups/newresource-group.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                fullscreen: true,
                openFrom: {top: 1100, height: 0},
                closeTo: {left: 1500},
                locals: {'dataObject': dataObject}
            }).then(function (value) {
                console.log(value);
            });
        };

       


      function addNewResourceGroupPopupCtr($scope, $mdDialog,dataObject,$sessionStorage, $state, ipPoolServices){
             
             $scope.OSRuleConfig = new OSRuleConfig(false, false, OSRuleConfig.modes.ADD_RC);

            $scope.cancel = function () {
                 $mdDialog.cancel();
                 $state.go("home.resourceGroups");
            };



           // $scope.cloudId = $sessionStorage.groupAllData[0].cloudId;
            $scope.resourceGroupArray =[];
            $scope.infrastructureId = -1;
            $scope.showHelp = true;
            $state.go("addrulecontainer.infra");
           $scope.onGoToNewRulePageClicked = function($event, infrastructureId){
                $scope.infrastructureId = infrastructureId;
                $scope.showHelp = false;
                $scope.cloudData = {};
                $scope.cloudData.vChassis = {};   
                $scope.cloudData.vChassis.id = "";
                $scope.cloudData.vChassis.name = "";

                $scope.cloudData.cloudId = infrastructureId;

              

                $scope.cloudData.ipPool = {};
                $scope.cloudData.ipPool.serverData = {};
                $scope.cloudData.ipPool.serverData.backPlaneNetworkId = -1;
                $scope.cloudData.ipPool.serverData.mgmtNetworkId = -1;

                var existingGroups =[];
               
                $scope.cloudData.vChassis.existingGroups = existingGroups;



                ipPoolServices.getNetworkListByCloudId($scope.cloudData.cloudId).then(function (networkList) {
                    $scope.cloudData.ipPool.networks = angular.copy(networkList);
                    $sessionStorage.cloudData = angular.copy($scope.cloudData);
                    $scope.showNetworks = true;
                    $state.go("addrulecontainer.rule");
                });    

                console.log(" onGoToNewRulePageClicked  >>>>>>>>>>>>  "+infrastructureId);
                 
          };

          
            
        }
        $scope.callpopupNetworks = function (dataObject, ev) {
            console.log(dataObject);
            $mdDialog.show({
                controller: groupNetworkPopupController,
                skipHide: true,
                templateUrl: 'core/components/administration/resource-groups/networks.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                locals: {'dataObject': dataObject}
            });
        };

        
        function groupNetworkPopupController($scope, $mdDialog, dataObject) {

            (function () {
                var networks = angular.copy(dataObject.networksWithName.concat(dataObject.availableNetworks));
                console.log(networks);
                //var selectedHostsList = [];
                $scope.items = networks;
                $scope.no_of_hosts = networks.length;

                var selectedNetworks = dataObject.networksWithName;
                $scope.selected = (selectedNetworks) ? angular.copy(selectedNetworks) : [];
                if ($scope.selected) {
                    $scope.no_of_selected_networks = $scope.selected.length;
                } else {
                    $scope.no_of_selected_networks = 0;
                }
                console.log($scope.selected);
                $scope.cancelDialogue = function () {
                    $mdDialog.cancel();
                };
                $scope.done = function () {
                    console.log($scope.selected);
                    dataObject.networksWithName = $scope.selected;
                    var result = [];
                    var memberList = [];
                    var ctr = 0;
                    dataObject.availableNetworks = networks;
                    for (ntw = 0; ntw < $scope.selected.length; ntw++) {
                        var objMember = {'id': 0, 'networkId': $scope.selected[ntw].id};
                        memberList.push(objMember);
                        var res = _.find(dataObject.availableNetworks, {'id': parseInt($scope.selected[ntw].id)});
                        if (res) {
                            result[ctr] = res;
                            ctr++;
                        }
                    }
                    for (ntwk = 0; ntwk < result.length; ntwk++) {
                        if (result[ntwk]) {
                            _.remove(dataObject.availableNetworks, result[ntwk]);
                        }
                    }
                    dataObject.memberList = memberList;
                    dataObject.countMembers = dataObject.memberList.length;
                    $mdDialog.hide();
                };
                $scope.toggle = function (item, list) {
                    var isDeleted = false;
                    for (i = 0; i < list.length; i++) {
                        if (list[i].id === item.id) {
                            list.splice(i, 1);
                            isDeleted = true;
                        }
                    }
                    if (!isDeleted) {
                        list.push(item);
                    }
                    console.log($scope.selected);
                    $scope.no_of_selected_networks = $scope.selected.length;
                };
                $scope.exists = function (item, list) {
                    for (i = 0; i < list.length; i++) {
                        if (list[i].id === item.id) {
                            return true;
                        }
                    }
                    return false;
                };
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
                    console.log($scope.selected);
                    $scope.no_of_selected_networks = $scope.selected.length;
                };
                //}
            })();
        }
        //Cleare session stored data.
        $scope.callCacheBurst = function () {
            console.log('Bursting cache data and reloading from server');
            clearMasterSession($sessionStorage, $state);
            /*$sessionStorage.groupViewData = false;
             $state.reload();*/
        };

        $scope.$on('$viewContentLoaded', function (event) {
            console.log(event);
            fixContainerHeight(1);
        });

    }

    angular.module('shieldxApp').controller('resourceGroupsCtr', resourceGroupsCtr);

    function NewRuleInfraCtr(
            infrastructureConnectorService,
            $scope,
            $state,
            $mdDialog) {

        console.log(" NewRuleInfraCtr ");
        $scope.goToRulePageDisabled = true;
       
       
        $scope.clouds = [];
        $scope.active_help_id = "infra_type_help_wizard";
        $scope.helpButtonClicked = function(id){
                $scope.active_help_id = id;
                console.log("  helpButtonClicked ");
                $scope.bordcastEventHelpButtonClicked($scope.active_help_id);
        }; 
        infrastructureConnectorService.getListOfInfrastructures().then(function (data) {

            $scope.infraAvailable = (data.length > 0) ? true : false;

            $scope.clouds = data;

        });

        $scope.showInfraOptionSelected = function(){
             $scope.goToRulePageDisabled = false;

          };
         
    }
    angular.module('shieldxApp').controller('NewRuleInfraCtr', NewRuleInfraCtr);

    function NewRuleCtr(
            infrastructureConnectorService,
            $scope,
            $state,
            $mdDialog) {

        $scope.cancel = function () {
            $mdDialog.cancel();
            $state.go("home.resourceGroups");
        };

        $scope.$on(SOEvents.ruleAllCommitedEvent, function (event, args) {
            $scope.cancel();
        });

    }
    angular.module('shieldxApp').controller('NewRuleCtr', NewRuleCtr);
    
})();