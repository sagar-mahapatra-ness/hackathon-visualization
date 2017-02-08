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
    function monitorNetworksRightPanelCtr($scope,
            $state,
            $translate,
            $mdDialog,
            deploymentSpecificationService,
            $sessionStorage) {

        $scope.viewStates = {
            INITIAL_SCREEN_NO_RESOURCE_GROUP: 0,
            ADD_NEW_RESOURCE_GROUP: 1,
            LIST_ALL_RESOURCE_GROUP: 2,
            ADD_OPTION_EXISTING_RESOURCE_GROUP: 3
        };

        $scope.panelCurrentState = -1;
        $scope.selectedSecurityControl = "";
        $scope.editableMode = false;
        $scope.selectedNetworks = [];
        $scope.infrastructureTenants = {};

        $scope.editResourceGroup = function () {
            $scope.editableMode = true;
        };



        $scope.showAddNewGroupScreen = function () {
            $scope.setCurrentState($scope.viewStates.ADD_NEW_RESOURCE_GROUP);
        };

        $scope.showAllResourceGroups = function () {
            //console.log(" <<<<<  showAllResourceGroups >>>>> ");
            $scope.setCurrentState($scope.viewStates.LIST_ALL_RESOURCE_GROUP);
        };

        $scope.applyResourceGroupChanges = function () {
            $scope.editableMode = false;
            setTimeout(function () {
                $scope.showUnGrouped(); //setting view to ungrouped 
            }, 0);
        };

        $scope.setCurrentState = function (currentState) {
            var states = {
                oldState: $scope.panelCurrentState,
                newState: currentState
            };
            $scope.panelCurrentState = currentState;
            $scope.$emit('currentStateChanged', states);
            $scope.$broadcast('currentStateChanged', states);
        };

        $scope.isViewStateInitialScreenNoResourceGroup = function () {
            //console.log(" isActiveStateIsNOSecurityGroup called");
            return $scope.panelCurrentState == $scope.viewStates.INITIAL_SCREEN_NO_RESOURCE_GROUP;
        };

        $scope.isViewStateAddNewResourceGroup = function () {
            //console.log(" isActiveStateIsNewSecurityGroup called");
            return $scope.panelCurrentState == $scope.viewStates.ADD_NEW_RESOURCE_GROUP;
        };

        $scope.isViewStateListAllResourceGroup = function () {
            //console.log(" isActiveStateIAssignSecurityControl called");
            return $scope.panelCurrentState == $scope.viewStates.LIST_ALL_RESOURCE_GROUP;
        };

        $scope.isViewStateAddOptionExistingResourceGroup = function () {
            var ret = $scope.panelCurrentState == $scope.viewStates.ADD_OPTION_EXISTING_RESOURCE_GROUP;
            //console.log(" isViewStateAddOptionExistingResourceGroup  called >> "+ret);
            return ret;
        };

        $scope.addNetworksToGroup = function (event, group) {
            //console.log(" addNetworksToGroup >>> ");
            if (group && $scope.selectedNetworks.length > 0) {
                $scope.addNetworkToResourceGroup(group, $scope.selectedNetworks);
                $scope.selectedNetworks = [];
                $scope.$emit('existingGroupModified', {exRG: group});
                $scope.showAllResourceGroups();
            }
        };

        $scope.showResourceGroup = function (group) {
            $scope.$emit('resourceGroupSelected', {selRG: group});
        };

        $scope.isGroupExits = function(){
            return $scope.existingGroups && $scope.existingGroups.length > 0;
        };
         
        $scope.initializeRescourceGroupScreen = function () {
            if ($scope.existingGroups.length === 0) {
                $scope.setCurrentState($scope.viewStates.INITIAL_SCREEN_NO_RESOURCE_GROUP);
            } else {
                $scope.setCurrentState($scope.viewStates.LIST_ALL_RESOURCE_GROUP);
            }
        };

        $scope.cancleRescourceGroupScreen = function () {
            if ($scope.existingGroups.length === 0) {
                $scope.setCurrentState($scope.viewStates.INITIAL_SCREEN_NO_RESOURCE_GROUP);
            } else {
                $scope.setCurrentState($scope.viewStates.LIST_ALL_RESOURCE_GROUP);
            }
        };

        $scope.showUserEditOptions = function () {

            if ($scope.existingGroups.length === 0)
            {
                $scope.setCurrentState($scope.viewStates.ADD_NEW_RESOURCE_GROUP);
            } else {
                $scope.setCurrentState($scope.viewStates.ADD_OPTION_EXISTING_RESOURCE_GROUP);
            }
        };

        $scope.commitNewResourceGroup = function (newResourceGroup) {
            //console.log(" commitNewResourceGroup "+newResourceGroup);
            //console.dir(newResourceGroup);	
            _.each($scope.existingGroups, function (obj) {
                obj.new = false;
            });
            $scope.existingGroups.push(newResourceGroup);
            $scope.$emit('newGroupCreated', {newRG: newResourceGroup});
            $scope.selectedNetworks = [];
            $scope.showAllResourceGroups();
        };

        $scope.$on('tenantChanged', function (event, args) {
            console.log("tenantChanged  >>>> " + args.tenant);
            $scope.initializeRescourceGroupScreen();
        });

        $scope.$on('onNetworkSelectionChanged', function (event, args) {
            console.log("onNetworkSelectionChanged  >>>> " + args.selectedNetworks);
            console.dir(args.selectedNetworks);
            $scope.selectedNetworks = [];
            $scope.editableMode = false;
            for (var i = 0; i < args.selectedNetworks.length; i++) {
                console.dir(args.selectedNetworks[i]);
                var network = new Network();
                network.name = args.selectedNetworks[i].name;
                network.networkId = args.selectedNetworks[i].id;
                network.resourceGroupName = args.selectedNetworks[i].resourceGroupName;
                network.resourceGroupId = args.selectedNetworks[i].resourceGroupId;
                $scope.selectedNetworks.push(network);
            }

            if ($scope.selectedNetworks.length === 0) {
                $scope.cancleRescourceGroupScreen();
            } else {
                $scope.showUserEditOptions();
            }
            $scope.setFocusOnElem('#groupNameInput');

        });

        $scope.deleteResourcegroupOnConform = function(group){
               var index = -1;
                index =  _.findIndex($scope.existingGroups, function(rg){
                  return rg.name === group.name; 
                });
                       // console.log(" index "+index);  
                if(index !== -1){
                  var dgr = $scope.existingGroups.splice(index,1);
                   $scope.$emit('groupDeleted',{delRG:group});
                  if($scope.existingGroups.length === 0){
                              $scope.cancleRescourceGroupScreen();
                  }
                }
                setTimeout(function () {
                    $scope.showUnGrouped(); //setting view to ungrouped
                });
        };
         $scope.deleteResourceGroup = function(event,group){
            $scope.showConfromAlertOnDelete(group,event, $scope.deleteResourcegroupOnConform); 
             
         };

      $scope.showConfromAlertOnDelete = function(gp,event, callback){
            $mdDialog.show({
                        controller: 'deleteconfromalert', templateUrl: 'core/components/screenComponents/networkView/delete-conform-alert.html', parent: angular.element(document.body),  skipHide: true, targetEvent: event, clickOutsideToClose: true,
                        locals : {
                            groupName : gp.name,
                        }
                    }).then(function (answerVal) {
                        console.log("showConfromAlertOnDelete answare");
                         callback(gp);
                    }, function () {
                        $scope.status = 'You cancelled the dialog.';
                    });  
        };

        $scope.addNetworkToResourceGroup = function (group, networks) {
            console.log(" addNetworkToResourceGroup ");
            console.dir(networks);
            for (var i = 0; i < networks.length; i++) {
                var tempNet = networks[i];
                if (tempNet.resourceGroupName !== "") {
                    if (group.name !== tempNet.resourceGroupName) {
                        console.log(" resource group found  ");
                        /* jshint ignore:start */
                        var findRG = _.find($scope.existingGroups, function (groupIt) {
                            return groupIt.name == tempNet.resourceGroupName;
                        });
                        console.dir(findRG);
                        /* jshint ignore:end */
                        if (findRG && findRG.memberList) {
                            var findNtIndex = -1;
                            console.log(" resource group network to delete  tempNet.resourceGroupName " + tempNet.resourceGroupName);
                            console.log(" resource group network to delete  groupIt.name " + tempNet.name);
                            /* jshint ignore:start */
                            findNtIndex = _.findIndex(findRG.memberList, function (networkInd) {
                                return networkInd.networkId == tempNet.networkId;
                            });
                            console.log(" resource group network to delete  " + findNtIndex);
                            /* jshint ignore:end */
                            if (findNtIndex !== -1) {
                                console.log("  network  deleted " + findRG.memberList[findNtIndex].name + "resource group" + findRG.name);
                                findRG.memberList.splice(findNtIndex, 1);
                            }
                        }
                    } else {
                        networks.splice(i, 1);
                    }

                }
            }
            console.log(" addNetworkToResourceGroup result  begin");
            console.dir($scope.existingGroups);
            console.dir(networks);
            console.log(" addNetworkToResourceGroup result  end");
            group.addNetworks(networks);
        };
        $scope.initializeRescourceGroupScreen();

        var cloudId = (!$sessionStorage.cloudData.comingFrom) ? 
                $sessionStorage.cloudData.cloudId : 
                $sessionStorage.cloudData.infrastructure.id;
         var vChassisSelectedDeploymentSpec = ($sessionStorage.cloudData.vChassis.selectedDeploymentSpec) ? $sessionStorage.cloudData.vChassis.selectedDeploymentSpec : $state.go('home.quickSetup.virtual-chassis');
        $scope.inlineModeAvailable = false;
        $scope.inlineModeAvailable = deploymentSpecificationService.isinlineModeAvailable(
                cloudId,
                vChassisSelectedDeploymentSpec);
        // this.getCachedListOfTenants();
        //console.l
        //og(" state 1"+$scope.isActiveStateIsNOSecurityGroup());
        //console.log(" state 2"+$scope.isActiveStateIsNewSecurityGroup());
        //console.log(" state 3"+$scope.isActiveStateIAssignSecurityControl());
        //console.log(" state 4"+$scope.isActiveStateIsExistingSecurityGroup());
    }
    angular.module('shieldxApp').controller('monitorNetworksRightPanelCtr', monitorNetworksRightPanelCtr);

    function newResourcegroupCtr($scope) {
        $scope.newResourceGroups = new ResourceGroups();
        $scope.disableCreateGroup = true;
        $scope.newResourceGroups.tenant = $scope.activeTenant.id;
        $scope.createNewResourceGroup = function () {
            console.dir($scope.newResourceGroups);
            if ($scope.selectedNetworks.length > 0) {
                $scope.newResourceGroups.tenant = $scope.activeTenant.id;
                var crg = $scope.newResourceGroups.copy();
                crg.new = true;
                $scope.addNetworkToResourceGroup(crg, $scope.selectedNetworks);
                // console.log(" $scope.newResourceGroups  " +$scope.newResourceGroups.copy);
                $scope.commitNewResourceGroup(crg);
                $scope.newResourceGroups = new ResourceGroups();
                $scope.disableCreateGroup = true;
            }
        };


        $scope.$watch('newResourceGroups.name', function () {
            $scope.checkResourceGroup();
        });
        $scope.$watch('newResourceGroups.tenant', function () {
            $scope.checkResourceGroup();
        });
        $scope.$watch('newResourceGroups.controlPolicy', function () {
            $scope.checkResourceGroup();
        });

        $scope.checkResourceGroup = function () {
            console.log("$scope.newResourceGroups ");
            console.dir($scope.newResourceGroups);
            $scope.disableCreateGroup = !(($scope.newResourceGroups.name && $scope.newResourceGroups.name !== "") && ($scope.newResourceGroups.controlPolicy && $scope.newResourceGroups.controlPolicy !== null));
        };

        $scope.cancelNewResourceGroup = function () {

            $scope.cancleRescourceGroupScreen();
        };

        $scope.checkResourceGroup();

        console.log(" $scope.disableCreateGroup " + $scope.disableCreateGroup);
    }
    angular.module('shieldxApp').controller('newResourcegroupCtr', newResourcegroupCtr);

    function listResourceGroupCtr($scope) {
        console.log(" listResourceGroupCtr ");
        /* jshint ignore:start */



        $scope.$on('currentStateChanged', function (event, args) {
            var oldState = args.oldState;
            var newState = args.newState;
            $scope.setFocusOnElem('#groupNameInput');
            console.log("set focus");
            console.log(" current state listResourceGroupCtr " + newState);
            console.dir(newState);
            if (newState === $scope.viewStates.ADD_OPTION_EXISTING_RESOURCE_GROUP) {
                console.log(" disable resource groups depending upon collection   ");
                console.dir($scope.selectedNetworks);
                console.dir($scope.existingGroups);

                var rs = $scope.existingGroups;
                var sn = $scope.selectedNetworks;
                for (var j = 0; j < rs.length; j++) {
                    if (rs[j].tenant === $scope.activeTenant.id) {
                        rs[j].setViewData("disableAdd", false);
                    } else {
                        rs[j].setViewData("disableAdd", true);
                    }
                }

                for (var i = 0; i < sn.length; i++) {
                    var srg = _.find($scope.existingGroups, function (indexArg) {
                        return indexArg.name === sn[i].resourceGroupName;
                    });
                    if (srg) {
                        srg.setViewData("disableAdd", true);
                    }
                }


            } else if (newState === $scope.viewStates.LIST_ALL_RESOURCE_GROUP) {
                var rsEye = $scope.existingGroups;
                for (var k = 0; k < rsEye.length; k++) {
                    if (rsEye[k].tenant === $scope.activeTenant.id) {
                        rsEye[k].setViewData("disableEye", false);
                    } else {
                        rsEye[k].setViewData("disableEye", true);
                    }
                }
            }

        });



        /* jshint ignore:end */
    }


    angular.module('shieldxApp').controller('listResourceGroupCtr', listResourceGroupCtr);
})();