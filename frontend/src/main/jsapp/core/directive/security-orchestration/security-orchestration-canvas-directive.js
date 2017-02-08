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
    function securityOrchestrationCanvasDirective(
            ipPoolServices,
            virtualChassisService,
            policyService,
            deploymentSpecificationService
            ) {
        var directive = {};
        directive.restrict = 'E';
        directive.replace = true;
        directive.templateUrl = 'core/directive/security-orchestration/security-orchestration-canvas-template.html';
        directive.scope = {
            networkInfo: '=netinfo',
            allNetworksFetched: '=allNetworksFetched',
            selectedNetworks: '=selectednetworks',
            selectedWorkloads: '=selectedworkloads',
            networkFetched: '=networkfetched',
            toggle: '&onToggle',
            secrules: '=',
            networkselectionchanged: '&',
            broadcastevent: '&',
            virtualchassisdata:'=',
            resouregroupassigned:'=',
            networksavailable:'=',
            workloads:'='
            
        };
        directive.controller = ['$scope', function ($scope) {

                $scope.canvasLevel = 0;
                $scope.canvasLevelGroup = 0;
                $scope.networkTab = true;
                $scope.visibleNetworks = [];
                $scope.$on('toggleAllNetworks',function(event,args){
                    $scope.toggleNetworkAll(args.typeOfSelection);
                });
                $scope.$on('selectAllWorkloadStart',function(event,args){
                    $scope.selectWorkloadAll(args.selectedworkloads);
                });
                $scope.$on('addWorkload',function(event,args){
                   _.each(args.networks,function(singleNetwork){
                        var mathchedNetwork = _.find($scope.networkInfo,{'id':singleNetwork.id});
                        $scope.toggleNetwork(mathchedNetwork,'NETWORK');
                   });
                });
                $scope.toggleNetworkAll = function(typeOfSelection){
                    if (!$scope.sandboxMode) {
                        $scope.$emit('sandboxModeToggleInit', true);
                    }
                    $scope.selectedEntities = [];
                    if(typeOfSelection === 1){
                        _.each($scope.networkInfo,function(availableNetwork){
                            if(!availableNetwork.faded && !availableNetwork.hideForZoom){
                                availableNetwork.type = SORule.ruleAttribute.NETWORK.link;
                                $scope.selectedEntities.push(availableNetwork);
                            }
                        });
                    }
                    $scope.broadcastevent({event: 'onEntitySelectionChanged', args: {op: "selected", selectedEntities: $scope.selectedEntities}});
                };
                $scope.selectWorkloadAll = function(workloadArray){
                    $scope.selectedEntities = [];
                    if (!$scope.sandboxMode) {
                        $scope.$emit('sandboxModeToggleInit', true);
                    }
                    _.each($scope.selectedNetworks, function(network) {
                        network.type = SORule.ruleAttribute.NETWORK.link;
                        $scope.selectedEntities.push(network);
                    });
                    _.each(workloadArray, function(workload) {
                        workload.type = SORule.ruleAttribute.WORKLOAD.link;
                        $scope.selectedEntities.push(workload);
                        var alreadyadded = _.findIndex($scope.selectedWorkloads,{'id':workload.id,'name':workload.name});
                        if(alreadyadded === -1){
                            $scope.selectedWorkloads.push(workload);
                        }
                    });
                    $scope.broadcastevent({event: 'onEntitySelectionChanged', args: {op: "selected", selectedEntities: $scope.selectedEntities}});
                };
                $scope.toggleNetwork = function (val, type) {
                    var networkval = val;
                    var entityType = type;
                    $scope.selectedEntities = [];
                    if (!$scope.sandboxMode) {
                        $scope.$emit('sandboxModeToggleInit', true);
                    }
                    var idx = null;
                    if (entityType === SORule.ruleAttribute.NETWORK.link) { 
                        console.log(" toggleNetwork ", val);
                        $scope.removeEntity = '';
                        if ($scope.selectedNetworks) {
                            idx = _.findIndex($scope.selectedNetworks,{'id':networkval.id});
                            if (idx > -1) {
//                            networkval.resourceGroupName = null;
                                $scope.selectedNetworks.splice(idx, 1);
                                $scope.removeEntity = networkval;
                            } else {
//                            networkval.resourceGroupName = "grouped";
                                $scope.selectedNetworks.push(networkval);
                            }
//                            $scope.broadcastevent({event: 'onNetworkSelectionChanged', args: {op: "selected", selectedNetworks: $scope.selectedNetworks, removeNetork: $scope.removeNetWork}});
                        }
                    } else if (entityType === SORule.ruleAttribute.WORKLOAD.link) {
                        console.log(" toggleNetwork ", val);
                        $scope.removeEntity = '';
                        if ($scope.selectedWorkloads) {
                            idx = _.findIndex($scope.selectedWorkloads,{'id':networkval.id});
                            if (idx > -1) {
//                            networkval.resourceGroupName = null;
                                $scope.selectedWorkloads.splice(idx, 1);
                                $scope.removeEntityType = networkval;
                                $scope.removeEntity = networkval;
                            } else {
//                            networkval.resourceGroupName = "grouped";
                                $scope.selectedWorkloads.push(networkval);
                            }
//                            $scope.broadcastevent({event: 'onWorkLoadSelectionChanged', args: {op: "selected", selectedWorkloads: $scope.selectedWorkloads, removeWorkload: $scope.removeWorkload}});
                        }
                    }
                    _.each($scope.selectedNetworks, function(network) {
                        network.type = SORule.ruleAttribute.NETWORK.link;
                        $scope.selectedEntities.push(network);
                    });
                    _.each($scope.selectedWorkloads, function(workload) {
                        workload.type = SORule.ruleAttribute.WORKLOAD.link;
                        $scope.selectedEntities.push(workload);
                    });
                    $scope.broadcastevent({event: 'onEntitySelectionChanged', args: {op: "selected", selectedEntities: $scope.selectedEntities, removeEntity: $scope.removeEntity}});
                };

                $scope.secuerMode = "grouped";

//newRuleCreationCanceledEvent
//this event should be called when rule creation process is cancled by user and in argument send instance of SORule type

                $scope.$on(SOEvents.newRuleCreationCanceledEvent, function (event, args) {
                    if (typeof args.rule !== "undefined" && typeof args.rule.ruleDesc !== "undefined" && args.rule.ruleDesc !== []) {
                        $scope.selectedEntities = [];//release all the selected entities
                        $scope.selectedWorkloads = [];//release all the selected entities
                        $scope.selectedNetworks = [];//release all the selected entities
                        //updateNetworks("cancel", args.rule.ruleDesc);
                        updateNetworks("cancel", args.rule);
                    }
                });
//ruleDeletedEvent
//this event should be called when rule description got deleted and in argument send instance of SORule type  
//
                $scope.$on(SOEvents.ruleDeletedEvent, function (event, args) {
                    if(args.ruleref.groupInfo.id === -1 && args.ruleref.deleted){
                      var ind = _.findIndex($scope.secrules, function(rule){
                        return  rule.name === args.ruleref.name;
                      });
                      var tempRule = $scope.secrules[ind];
                      $scope.secrules.splice(ind, 1);
                      /*_.each($scope.secrules,function(singleRule){
                        if(singleRule.precedence > tempRule.precedence){
                            singleRule.precedence--;
                            singleRule.dirty = true;
                        }
                      });*/
                     
                    }
                    if (typeof args.ruleref.ruleDesc !== "undefined" && args.ruleref.ruleDesc !== []) {
                        //updateNetworks("delete", args.ruleref.ruleDesc,args.rule.groupInfo.name,undefined,args.rule.aspInfo.name);
                        updateNetworks("delete", args.ruleref);
                    }

                });


//ruleDescDeletedEvent
//this event should be called when rule description got deleted and in argument send instance of SORule type  
//
                $scope.$on(SOEvents.ruleDescDeletedEvent, function (event, args) {
                    if (typeof args !== "undefined" && args.ruleDescRef !== []) {
                        //updateNetworks("delete", [args.ruleDescRef],null);
                        var ruleObj = new SORule();
                        ruleObj.addSORuleDesc(args.ruleDescRef);
                        updateNetworks("delete", ruleObj,null);
                    }

                });

//ruleEditCanceledEvent
//this event should be called when edit rule  process is cancled by user and in argument send instance of SORule type

                $scope.$on(SOEvents.ruleEditCanceledEvent, function (event, args) {
                    if (typeof args.rule.ruleDesc !== "undefined" && args.rule.ruleDesc !== []) {
                        //updateNetworks("cancel", args.rule.ruleDesc, args.rule.groupInfo.name);
                        updateNetworks("cancel", args.rule);
                    }
                });
                $scope.$on("onTotalDeleteStateChange",function(event,args){
                    if(args.rule.resourceType === "NETWORK"){
                        if (typeof args.rule.ruleDesc !== "undefined" && args.rule.ruleDesc !== []) {
                            //updateNetworks("delete", args.rule.ruleDesc, args.rule.groupInfo.name);
                            updateNetworks("delete", args.rule);
                        }
                    } else {
                        if (typeof args.rule.ruleDesc !== "undefined" && args.rule.ruleDesc !== []) {
                            //updateWorkloads("delete", args.rule.ruleDesc, args.rule.groupInfo.name);
                            updateWorkloads("delete", args.rule);
                        }
                    }
                });

//ruleCreatedEvent
//this event should be called when rule description got created and in argument send instance of SORule type

                $scope.$on(SOEvents.ruleCreatedEvent, function (event, args) {
                    if(args.type === "WORKLOAD"){
                       if (typeof args.rule.ruleDesc !== "undefined" && args.rule.ruleDesc !== []) {
                            //updateWorkloads("add", args.rule.ruleDesc, args.rule.groupInfo.name,undefined,args.rule.aspInfo.name);
                            updateWorkloads("add", args.rule);
                       }
                   } else {
                        if (typeof args.rule.ruleDesc !== "undefined" && args.rule.ruleDesc !== []) {
                            //updateNetworks("add", args.rule.ruleDesc, args.rule.groupInfo.name,undefined,args.rule.aspInfo.name);
                            updateNetworks("add", args.rule);
                       }
                   }
                   /*$scope.broadcastevent({event: 'refereshNetworks'});*/
                });

//ruleUpdatedEvent
//this event should be called when rule is updated by user and in argument send instance of SORule type

                $scope.$on(SOEvents.ruleUpdatedEvent, function (event, args) {
                    $scope.$emit('existingruleupdated',args);
                    console.log("<<< event update canvas on ruleCreatedEvent event >>> ");
                    if(args.type === "WORKLOAD"){                        
                        if (typeof args.rule.ruleDesc !== "undefined" && args.rule.ruleDesc !== []) {
                            //updateWorkloads("add", args.rule.ruleDesc, args.rule.groupInfo.name,undefined,args.rule.aspInfo.name);
                            updateWorkloads("add", args.rule);
                        }

                    } else {
                        if (typeof args.rule.ruleDesc !== "undefined" && args.rule.ruleDesc !== []) {
                            //updateNetworks("add", args.rule.ruleDesc, args.rule.groupInfo.name,undefined,args.rule.aspInfo.name);
                            updateNetworks("add", args.rule);
                        }
                    }
                });
                
                $scope.$on("deleteOldNetworks",function(event,args){
                    if(args.type === "WORKLOAD"){
                        if (typeof args.rule.ruleDesc !== "undefined" && args.rule.ruleDesc !== []) {
                            //updateWorkloads("delete", args.rule.ruleDesc,args.rule.groupInfo.name,undefined,args.rule.aspInfo.name);
                            updateWorkloads("delete", args.rule);
                        }
                    }
                    else{
                       if (typeof args.rule.ruleDesc !== "undefined" && args.rule.ruleDesc !== []) {
                            //updateNetworks("delete", args.rule.ruleDesc,args.rule.groupInfo.name,undefined,args.rule.aspInfo.name);
                            updateNetworks("delete", args.rule);
                        }
                    } 
                });  
                

//ruleCommitedEvent
//this event should be called when rule description got send to server and in argument send instance of SORule type

                $scope.$on(SOEvents.ruleCommitedEvent, function (event, args) {
                    console.log("<<< event update canvas on ruleCreatedEvent event >>> ");
                    if (typeof args.rule.ruleDesc !== "undefined" && args.rule.ruleDesc !== []) {
                        if(args.rule.resourceType === "NETWORK"){
                            //updateNetworks(args.op, args.rule.ruleDesc, args.rule.groupInfo.name);
                            updateNetworks(args.op, args.rule);
                        } else if(args.rule.resourceType === "VM"){
                            updateWorkloads(args.op, args.rule);
                        }
                    }
                    $scope.broadcastevent({event: 'refereshNetworks'});
                });

                $scope.$on("ClearSelections",function(event,args){
                    $scope.selectedEntities = [];//release all the selected entities
                    $scope.selectedWorkloads = [];//release all the selected entities
                    $scope.selectedNetworks = [];//release all the selected entities
                });
                updateNetworks = function (updateType, rule,propogateInfoChange) {
                    var networkToUpdate =  [];
                    var spsName = rule.aspInfo.name;
                    var noneSPS = (spsName === "None" ) ? true : false;
                    var ruleObj = rule.ruleDesc;
                    var groupName = rule.groupInfo.name;
                    var ruleId = rule.id;
                    _.each(ruleObj, function (rule) {
                        _.each(rule.networks, function (network) {

                            var selectedNetworkToUpdate = _.find($scope.selectedNetworks, {'id': network.id});
                            var networkInfoToUpdate = _.find($scope.networksavailable, {'id': network.id});
                            var selectedIdx = $scope.selectedNetworks.indexOf(selectedNetworkToUpdate);
//                            var networkInfoIdx = $scope.networkInfo.indexOf(networkToUpdate);

                            switch (updateType) {
                                case "add" :
                                    console.log("addruleObj");
                                    if(typeof networkInfoToUpdate !== "undefined") {
                                        networkInfoToUpdate.resourceGroupName = groupName;
                                        networkInfoToUpdate.resourceGroupId = ruleId;
                                    }
                                    if(typeof selectedNetworkToUpdate !== "undefined") {
                                        selectedNetworkToUpdate.resourceGroupName = groupName;
                                        selectedNetworkToUpdate.resourceGroupId = ruleId;
                                    }
                                     networkToUpdate.push({net:network,op:"add",grName:groupName,resourceGroupId:networkInfoToUpdate.resourceGroupId});
                                    break;
                                case "delete" :
                                    console.log("deleteruleObj");
                                    if(typeof networkInfoToUpdate !== "undefined") {
                                        networkInfoToUpdate.resourceGroupName = null;
                                        /*networkInfoToUpdate.resourceGroupId = null;
                                        networkInfoToUpdate.ruleId = null;*/
                                        
                                    }
                                   if((typeof $scope.selectedNetworks !== "undefined") &&  (typeof selectedNetworkToUpdate !== "undefined") ) {
                                        selectedNetworkToUpdate.resourceGroupName = null;
                                        $scope.selectedNetworks.splice(selectedIdx, 1);
                                    }
                                     networkToUpdate.push({net:network,op:"delete",grName:""});
                                    break;
                                case "deletePermanent" :
                                    console.log("deleteruleObj");
                                    if(typeof networkInfoToUpdate !== "undefined") {
                                        networkInfoToUpdate.resourceGroupName = null;
                                        networkInfoToUpdate.resourceGroupId = null;
                                        networkInfoToUpdate.ruleId = null;
                                        
                                    }
                                   if((typeof $scope.selectedNetworks !== "undefined") &&  (typeof selectedNetworkToUpdate !== "undefined") ) {
                                        selectedNetworkToUpdate.resourceGroupName = null;
                                        $scope.selectedNetworks.splice(selectedIdx, 1);
                                    }
                                     networkToUpdate.push({net:network,op:"delete",grName:""});
                                    break;
                                case "cancel" :
                                    $scope.selectedNetworks.splice(selectedIdx, 1);
                                    break;
                                default:

                            }
                        });
                    });
                    if(typeof propogateInfoChange === "undefined")
                        $scope.broadcastevent({event: 'networkInfoChanged', args:{networkInfo:$scope.networksavailable , networkToUpdateVal:networkToUpdate,noneSPS:noneSPS} });
                    console.log($scope.networksavailable);
                };

                updateWorkloads = function (updateType, rule,propogateInfoChange){
                    var ruleObj = rule.ruleDesc;
                    var groupName = rule.groupInfo.name;
                    var spsName = rule.aspInfo.name;
                    var ruleId = rule.id;
                    var workloadsToUpdate =  [];
                    var noneSPS = (spsName === "None" ) ? true : false;
                    _.each(ruleObj, function (rule) {
                        _.each(rule.networks, function (workload) {
                            //the object is of type network but is actually a workload,hence to avoid confusion named as workload
                            /*var selectedNetworkToUpdate = _.find($scope.selectedNetworks, {'id': network.id});*/
                            var workloadmatched = _.find($scope.workloads, {'id': workload.id});
                            var networkOfWorkload,workloadIndex,workloadInfoToUpdate;
                            if(workloadmatched){
                                networkOfWorkload = _.find($scope.networksavailable,{"id":workloadmatched.ports[0].networkId});
                                if(networkOfWorkload)
                                    workloadIndex = _.findIndex(networkOfWorkload.workloads,{"id":workload.id});
                                if(workloadIndex !== undefined)
                                    workloadInfoToUpdate = networkOfWorkload.workloads[workloadIndex];
                            }
                            /*var selectedIdx = $scope.selectedNetworks.indexOf(selectedNetworkToUpdate);*/
//                            var networkInfoIdx = $scope.networkInfo.indexOf(networkToUpdate);

                            switch (updateType) {
                                case "add" :
                                    console.log("addruleObj");
                                    if(typeof workloadInfoToUpdate !== "undefined") {
                                        workloadInfoToUpdate.resourceGroupName = groupName;
                                        workloadInfoToUpdate.resourceGroupId = ruleId;
                                    }
                                    /*if(typeof selectedNetworkToUpdate !== "undefined") {
                                        selectedNetworkToUpdate.resourceGroupName = groupName;
                                    }*/
                                     workloadsToUpdate.push({net:workload,op:"add",grName:groupName,resourceGroupId:workloadInfoToUpdate.resourceGroupId});
                                    break;
                                case "delete" :
                                    console.log("deleteruleObj");
                                    if(typeof workloadInfoToUpdate !== "undefined") {
                                        workloadInfoToUpdate.resourceGroupName = null;
                                        /*networkInfoToUpdate.resourceGroupId = null;
                                        networkInfoToUpdate.ruleId = null;*/
                                        
                                    }
                                   /*if((typeof $scope.selectedNetworks !== "undefined") &&  (typeof selectedNetworkToUpdate !== "undefined") ) {
                                        selectedNetworkToUpdate.resourceGroupName = null;
                                        $scope.selectedNetworks.splice(selectedIdx, 1);
                                    }*/
                                     workloadsToUpdate.push({net:workload,op:"delete",grName:""});
                                    break;
                                case "deletePermanent" :
                                    console.log("deleteruleObj");
                                    if(typeof workloadInfoToUpdate !== "undefined") {
                                        workloadInfoToUpdate.resourceGroupName = null;
                                        workloadInfoToUpdate.resourceGroupId = null;
                                        workloadInfoToUpdate.ruleId = null;
                                        
                                    }
                                   /*if((typeof $scope.selectedNetworks !== "undefined") &&  (typeof selectedNetworkToUpdate !== "undefined") ) {
                                        selectedNetworkToUpdate.resourceGroupName = null;
                                        $scope.selectedNetworks.splice(selectedIdx, 1);
                                    }*/
                                     workloadsToUpdate.push({net:workload,op:"delete",grName:"",resourceGroupId:workloadInfoToUpdate.resourceGroupId});
                                    break;
                                case "cancel" :
                                    //$scope.selectedNetworks.splice(selectedIdx, 1);
                                    break;
                                default:

                            }
                        });
                    });
                    if(typeof propogateInfoChange === "undefined")
                        $scope.broadcastevent({event: 'networkInfoChanged', args:{networkInfo:$scope.networksavailable , workloadsToUpdateVal:workloadsToUpdate,noneSPS:noneSPS} });
                    console.log($scope.networksavailable);
                };
                $scope.$on("showNetworks", function (event, args) {
                    $scope.secuerMode = args;
                     $scope.zoomOut();
                });
                $scope.$on(SOEvents.networkChangedEvent,function(event,args){
                    if($scope.canvasLevel === 1){
                        $scope.canvasLevel = 0;
                        $scope.zoomIn();
                    }
                });
                $scope.groupedNetworks = [];
                $scope.$on(SOEvents.showNetoworksBelongToRuleEvent, function (event, args) {
                    console.log("<<< event update canvas on showNetoworksBelongToRuleEvent event >>> ");
                    console.dir(args);
                    console.log("after firing event canvas update start");
                    console.log(args);
                    //$scope.networkInfo[0].faded = true;
                    console.log($scope.networkInfo);
                    if(args.action == "add"){
                        var itemToinsert = {};
                        var workloadCounter = 0;
                        itemToinsert.groupInfo = angular.copy(args.groups.groupInfo);
                        var networksData = [];
                        _.each(args.groups.ruleDesc,function(singleDesc){
                            if(singleDesc.ruleAttribute == "0"){
                                _.each(singleDesc.networks,function(singleNetwork){
                                    var alreadyPresent = _.findIndex(networksData,{'id':singleNetwork.id});
                                    if(alreadyPresent === -1){
                                        var mathchedNetwork = _.find($scope.networkInfo,{'id':singleNetwork.id});
                                        if(mathchedNetwork){
                                            workloadCounter += mathchedNetwork.workloads.length;
                                            networksData.push(angular.copy(mathchedNetwork));
                                        }
                                    }
                                });
                            }
                        });
                        itemToinsert.networks = networksData;
                        itemToinsert.totalWorkloads = workloadCounter;
                        $scope.groupedNetworks.push(itemToinsert);
                    } else {
                        var indexToremove = _.findIndex($scope.groupedNetworks,{'groupInfo':args.groups.groupInfo});
                        $scope.groupedNetworks.splice(indexToremove,1);
                    }
                    /*_.each(args.groups, function (singleGroup) {
                        _.each(singleGroup.networks, function (singleNetwork) {
                            if(args.action == "add")
                                $scope.visibleNetworks.push(singleNetwork.id);
                            else if(args.action == "remove")
                                $scope.visibleNetworks.splice($scope.visibleNetworks.indexOf(singleNetwork.id),1);
                        });
                    });
                    for (var i = 0; i < $scope.networkInfo.length; i++) {
                        if($scope.visibleNetworks.length){
                            if ($scope.visibleNetworks.indexOf($scope.networkInfo[i].id) !== -1)
                                $scope.networkInfo[i].faded = false;
                            else
                                $scope.networkInfo[i].faded = true;
                        } else {
                            $scope.networkInfo[i].faded = false;
                        }
                    }*/

                });

                $scope.sandboxMode = false;
                
                $scope.$on('sandboxModeToggled', function (event, sandboxMode) {
                    $scope.sandboxMode = sandboxMode;
                });
                
                $scope.zoomIn = function (event) {
                    if ($scope.canvasLevel < 1) {
                        $scope.$broadcast('zoomInCanvas', {});
                        return ++$scope.canvasLevel;
                    }
                };
                $scope.$on('nofilterZoomoutStart',function(event,args){
                    $scope.zoomOut();    
                    $scope.zoomOutGroup();    
                });
                $scope.zoomOut = function (event) {
                    if ($scope.canvasLevel > 0) {
                        $scope.$broadcast('zoomOutCanvas', {});
                        return --$scope.canvasLevel;
                    }
                };
                $scope.zoomInGroup = function (event) {
                    if ($scope.canvasLevelGroup < 1) {
                        $scope.$broadcast('zoomInCanvasGroup', {});
                        return ++$scope.canvasLevelGroup;
                    }
                };

                $scope.zoomOutGroup = function (event) {
                    if ($scope.canvasLevelGroup > 0) {
                        $scope.$broadcast('zoomOutCanvasGroup', {});
                        return --$scope.canvasLevelGroup;
                    }
                };

                $scope.gotoFirstPage = function(event) {
                    $scope.$broadcast('gotoFirstPage', {});
                };

                $scope.gotoLastPage = function(event) {
                    $scope.$broadcast('gotoLastPage', {});  
                };

                $scope.gotoNextPage = function (event) {
                    if($scope.pageModel.currentEndNetworkIndex < $scope.pageModel.totalNetworks) {
                        $scope.$broadcast('gotoNextPage', {});    
                    }
                };

                $scope.gotoPrevPage = function (event) {
                    if($scope.pageModel.currentStartNetworkIndex >= $scope.pageModel.pageLength) {
                        $scope.$broadcast('gotoPrevPage', {});    
                    }
                };
                
                $scope.gotoFirstPageGroup = function(event) {
                    $scope.$broadcast('gotoFirstPageGroup', {});
                };

                $scope.gotoLastPageGroup = function(event) {
                    $scope.$broadcast('gotoLastPageGroup', {});  
                };

                $scope.gotoNextPageGroup = function (event) {
                    if($scope.pageModelGroup.currentEndGroupIndex < $scope.pageModelGroup.totalGroups) {
                        $scope.$broadcast('gotoNextPageGroup', {});    
                    }
                };

                $scope.gotoPrevPageGroup = function (event) {
                    if($scope.pageModelGroup.currentStartGroupIndex >= $scope.pageModelGroup.pageLengthGroup) {
                        $scope.$broadcast('gotoPrevPageGroup', {});    
                    }
                };

                $scope.pageModel = {};
                $scope.pageModel.currentPage = 0;
                $scope.pageModel.endIndex = 0;
                $scope.pageModel.pageLength = 0;

                $scope.pageModelGroup = {};
                $scope.pageModel.currentPageGroup = 0;
                $scope.pageModel.endIndexGroup = 0;
                $scope.pageModel.pageLengthGroup = 0;
                
                $scope.$on("pageModelSet", function(event, args) {
                    $scope.pageModel = angular.copy(args.data);
                    $scope.pageModel.currentPageIndex = Math.ceil(($scope.pageModel.endIndex + 1)/$scope.pageModel.pageLength);
                    $scope.pageModel.currentStartNetworkIndex = $scope.pageModel.startIndex + 1;
                    $scope.pageModel.currentEndNetworkIndex = $scope.pageModel.endIndex + 1;
                    $scope.pageModel.totalNetworks = $scope.networkInfo.length;
                });

                $scope.$on("pageModelSetGroup", function(event, args) {
                    $scope.pageModelGroup = angular.copy(args.data);
                    $scope.pageModelGroup.currentPageIndexGroup = Math.floor(($scope.pageModelGroup.endIndexGroup + 1)/$scope.pageModelGroup.pageLengthGroup);
                    $scope.pageModelGroup.currentStartGroupIndex = $scope.pageModelGroup.startIndexGroup + 1;
                    $scope.pageModelGroup.currentEndGroupIndex = $scope.pageModelGroup.endIndexGroup + 1;
                    if($scope.sandboxMode)
                        $scope.pageModelGroup.totalGroups = $scope.sandboxgroups.length;
                    else
                        $scope.pageModelGroup.totalGroups = $scope.activegroups.length;

                    console.log("this is the final data ",$scope.pageModelGroup);
                });
                
                $scope.$on("toggleNetworkData", function(event, args) {
                    $scope.toggleNetwork(args.val, args.type);
                });
                
                $scope.$on("gotoNetworkTab", function (event, args) {
                    $scope.networkTab = true;
                });

                $scope.$on("gotoGroupTab", function (event, args) {
                    $scope.networkTab = false;
                });

            }];
        return directive;
    }

    angular.module('shieldxApp').directive('securityorchestrationcanvas', securityOrchestrationCanvasDirective);
})();
