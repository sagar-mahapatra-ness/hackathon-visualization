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
    function securityOrchestrationDirective() {
        var directive = {};
        directive.restrict = 'E';
        directive.replace = true;
        directive.templateUrl = 'core/directive/security-orchestration/security-orchestration-template.html';
        directive.scope = {
            rules: '=',
            cloudid: "=",
            configinfo : "=",
            vchassisid : "=",
            networksavailable : "=",
            resourcegroups : "=",
            backplanenetworkid : "=",
            managmentnetworkid : "=",
            existinggroups : "=",
            virtualchassisdata: "=",
            vcname : "=",
            dsobj : "="
        };

        directive.link = function(scope, element, attrs) {
            scope.$watch('cloudid', function(newValue, oldValue) {
                if (newValue){
                   scope.initOSDirective();
                }
            }, true);
        };

        directive.controller = ['$scope', 'coreservices',
            'virtualChassisService',
            '$mdDialog',
            'deploymentSpecificationService', 'ipPoolServices',
            function ($scope, coreservices,
                    virtualChassisService,
                    $mdDialog,
                    deploymentSpecificationService, ipPoolServices) {
                $scope.$broadcast('cloudChanged', {cloudid: $scope.cloudid});
                $scope.tenantid = -1;
                $scope.maximize = false;
                $scope.workloads = [];
                $scope.attributesFound = [];
//                 console.log($scope.vchassisid);
                $scope.resouregroupassigned = (typeof $scope.virtualchassisdata !== "undefined" && typeof $scope.virtualchassisdata.resourceGroup !== "undefined") ? $scope.virtualchassisdata.resourceGroup : [];

    
                $scope.tenantIdChanged = function (tenantRef) {
                    $scope.activeTenant = tenantRef;
                    $scope.tenantid = tenantRef.id;
                    $scope.$broadcast('tenatChanged', {tenant: tenantRef});
                };
                $scope.$on('nofilterZoomout',function(event,args){
                    $scope.$broadcast('nofilterZoomoutStart');
                });
                $scope.broadcastSOREvents = function (nameOfEvent, arg) {
                    console.log(" event to process "+nameOfEvent);
                    if(nameOfEvent === SOEvents.ruleAllCommitedEvent){
                         $scope.$emit(nameOfEvent, arg);
                    }
                    $scope.$broadcast(nameOfEvent, arg);
                };
                $scope.$on('addWorkloadsofNetworks',function(event,args){
                    $scope.$broadcast('addWorkload',args);
                   
               });

               $scope.initOSDirective= function(){
                console.log("initOSDirective called");
                $scope.networkInfo = [];
                deploymentSpecificationService.getTenants($scope.cloudid).then(function (data) {
                    $scope.tenants = data;
                    console.log($scope.dsobj);
                    if ($scope.tenants && $scope.tenants.length > 0) {
                        if(typeof $scope.dsobj === "undefined") {
                            $scope.dstenant = $scope.tenants[0];
                        } else {
                            $scope.dstenant = _.find($scope.tenants, {'id': $scope.dsobj.tenantId});
                            if (typeof $scope.dstenant === "undefined") {
                                $scope.dstenant = $scope.tenants[0];
                            }
                        }
                       $scope.tenantIdChanged($scope.dstenant);
                       
                    }
                    getNetworks(true, $scope.dstenant.id);
                    console.log("initOSDirective called end");
                });   
               }; 
               
               $scope.$on("reloadNetworksByTenant", function (event, args) {
                   // get all SO rules  which are not committed
                   // delete resourcegroups associated with SO rules
                   //getNetworks(true, args.tenantId);
               });

               $scope.deleteRulesNotUnderTenantId = function (tenantId) {
                   
               };
               
               /*if($scope.cloudid){
                   $scope.initOSDirective();
               }*/
               
                /*getWorkloadByNetwork = function (workloadData, networkId) {
                    return _.filter(workloadData.workloads, function (workload) {
                        if (workload.ports.length) {
                            return (workload.ports[0].networkId == networkId);
                        }
                    });
                };*/

                getNetworks = function (omitNetworksUsed, tenantId) {
                    //
                    ipPoolServices.getWorkloadsByCloudId($scope.cloudid).then(function (workloadData) {   
                        console.log("recevied workloads");                
                        virtualChassisService.getAllNetworksMappedToResource({success: function (data) {
                            console.log("recevied mapping success ");
                                $scope.networks = virtualChassisService.getAdditionalNetworkInfo(
                                        data,
                                        $scope.backplanenetworkid,
                                        $scope.managmentnetworkid
                                        );
                                /*if (typeof $scope.networks !== "undefined") {
                                        for (var i = 0; i < $scope.networks.length; i++) {
                                            $scope.networks[i].workloads = [];
                                            $scope.networks[i].workloads = getWorkloadByNetwork(workloadData, $scope.networks[i].id);
                                        }
                                    }*/
                                    $scope.networkInfo = $scope.networks;
                                    $scope.allNetworksFetched = true;
                                    if ($scope.networkInfo.length === 0){
                                        $scope.allNetworksFetched = false;
                                    }
                                    $scope.workloads = workloadData.workloads;
                                    $scope.attributesFound = workloadData.attributesFound;
                                    $scope.networksCopy = angular.copy($scope.networks);
                                    console.log("these are the rules that are already present here ",$scope.rules);
                                    $scope.$broadcast("totalWorkLoads", {"masterData":$scope.workloads,"totalList":$scope.networkInfo});
                                    setTimeout(function () {
                                        $scope.showUnGrouped("upgrouped"); //setting view to ungrouped 
                                    }, 0);
                                /*ipPoolServices.getWorkloadsByCloudId($scope.cloudid).then(function (workloadData) {

                                    if (typeof $scope.networks !== "undefined") {
                                        for (var i = 0; i < $scope.networks.length; i++) {
                                            $scope.networks[i].workloads = [];
                                            $scope.networks[i].workloads = getWorkloadByNetwork(workloadData, $scope.networks[i].id);
                                        }
                                    }
                                    $scope.networkInfo = $scope.networks;
                                    $scope.workloads = workloadData.workloads;
                                    $scope.attributesFound = workloadData.attributesFound;
                                    $scope.networksCopy = angular.copy($scope.networks);
                                    console.log("these are the rules that are already present here ",$scope.rules);
                                    $scope.$broadcast("totalWorkLoads", {"masterData":$scope.workloads,"totalList":$scope.networkInfo});
                                    setTimeout(function () {
                                        $scope.showUnGrouped("upgrouped"); //setting view to ungrouped 
                                    }, 0);
                                });*/

                               
              
                            }, fail: function (error) {
                                console.log(" virtualChassisService.getAllNetworkInformations error " + error);
                            }},
                                $scope.cloudid,
                                angular.copy($scope.networksavailable),
                                $scope.resourcegroups,
                                omitNetworksUsed,
                                angular.copy($scope.existinggroups), 
                                $scope.vchassisid,
                                tenantId,
                                workloadData);
                    });
                };


                $scope.showAll = function (data) {
                    var tempList = angular.copy($scope.masterList);
                    $scope.viewall = 'active-link';
                    $scope.viewselected = false;
                    $scope.selectAllDisabled = true;
                    $scope.networkInfo = angular.copy(tempList);
                    $scope.recalcNetworkInfo(data);

                };

                $scope.showGrouped = function (data) {
                    var tempList = angular.copy($scope.masterList);
                    $scope.networkInfo = [];
                    $scope.selectAllDisabled = false;
                    _.forEach(tempList, function (obj) {
                           $scope.networkInfo.push(obj);
                    });
                    if ($scope.networkInfo.length === 0) {
                        $scope.selectAllDisabled = true;
                    }
                    $scope.recalcNetworkInfo(data);
                };
                $scope.showUnGrouped = function (data) {
                    //console.log($scope.masterList);
                    var tempList = angular.copy($scope.masterList);
                    $scope.selectedNetworks = [];
                    $scope.networkInfo = [];
                    $scope.selectAllDisabled = false;
                    _.forEach(tempList, function (obj) {
                        /*if (obj.resourceGroupName === null || obj.resourceGroupName === "") {
                            $scope.networkInfo.push(obj);
                        }*/
                        if (obj.resourceGroupId === null || obj.resourceGroupId === "") {
                            $scope.networkInfo.push(obj);
                        }                        
                    });
                    if ($scope.networkInfo.length === 0) {
                        $scope.selectAllDisabled = true;
                    }
                    $scope.networkFetched = true;
                    $scope.recalcNetworkInfo(data);

               };


                $scope.disableAllSelection = function (flag) {
                    _.each($scope.networkInfo, function (obj) {
                        obj.disabled = flag;
                    });
                };

                reCalcNetworks = function () {
                    $scope.networkInfo = virtualChassisService.getAdditionalNetworkResourceGroupInfo(
                            $scope.networks,
                            $scope.resourcegroups
                            );
                    _.remove($scope.networkInfo, function (item) {
                        return item.hide === true;
                    });
                    $scope.networkInfo = virtualChassisService.getAdditionalNetworkResourceGroupInfo(
                            $scope.activeTenant.networks,
                            $scope.resourcegroups
                            );
                    $scope.$emit('listChanged', {});
                };
                $scope.showSelected = function () {
                    $scope.viewall = false;
                    $scope.viewselected = 'active-link';
                    $scope.networkInfo = $scope.selectedNetworks;
                };

                $scope.$on('resourceGroupSelected', function (event, data) {
                for (var i = 0; i < $scope.networkInfo.length; i++) {
                        if ($scope.networkInfo[i].resourceGroupName === data.selRG.name)
                            $scope.networkInfo[i].faded = false;
                        else
                            $scope.networkInfo[i].faded = true;
                    }
                });

                $scope.$on('filteredNetworks',function(event,args){
                    /*$scope.networks = args.networks;
                    $scope.networkInfo = args.networks;*/
                    console.log("last copy of networks ",$scope.networksCopy);
                    /*for (var i = 0; i < $scope.networkInfo.length; i++) {
                        $scope.networkInfo[i].faded = true;
                        var matchedIndex =  _.findIndex(args.networks,{"id":$scope.networkInfo[i].id}) ;
                        if(matchedIndex !== -1){
                            $scope.networkInfo[i].faded = false;
                        }
                        for (var j = 0; j < $scope.networkInfo[i].workloads.length; j++) {
                            $scope.networkInfo[i].workloads[j].faded = true;
                            if(matchedIndex !== -1 && _.find(args.networks[matchedIndex].workloads,{"id":$scope.networkInfo[i].workloads[j].id}) ){
                                $scope.networkInfo[i].workloads[j].faded = false;
                            }
                        }
                    }*/
                    $scope.networkInfo = [];
                    for (var i = 0; i < $scope.networksCopy.length; i++) {
                        var matchedIndex =  _.findIndex(args.networks,{"id":$scope.networksCopy[i].id}) ;
                        if(matchedIndex !== -1){
                            $scope.networkInfo.push(angular.copy($scope.networksCopy[i]));
                            $scope.networkInfo[$scope.networkInfo.length - 1].workloads = [];
                        }
                        for (var j = 0; j < $scope.networksCopy[i].workloads.length; j++) {
                            if(matchedIndex !== -1 && _.find(args.networks[matchedIndex].workloads,{"id":$scope.networksCopy[i].workloads[j].id}) ){
                                $scope.networkInfo[$scope.networkInfo.length - 1].workloads.push($scope.networksCopy[i].workloads[j]);
                            }
                        }
                    }
                });
                $scope.isIndeterminate = function () {
                    return ($scope.selectedNetworks.length !== 0 &&
                            $scope.selectedNetworks.length !== $scope.networkInfo.length);
                };
                $scope.isChecked = function () {
                    return $scope.selectedNetworks.length === $scope.networkInfo.length;
                };
                $scope.toggleAll = function () {
                    if ($scope.selectedNetworks.length === $scope.networkInfo.length) { //uncheck all
                        $scope.selectedNetworks = [];
                    } else if ($scope.selectedNetworks.length === 0 || $scope.selectedNetworks.length > 0) {
                        $scope.selectedNetworks = $scope.networkInfo.slice(0); //check all
                    }
                    $scope.checkCommit();
                    $scope.$broadcast('onNetworkSelectionChanged', {selectedNetworks: $scope.selectedNetworks});
                };

                $scope.$on('newruleaddedworkload',function(event,args){
                    console.log(args);
                    $scope.calculateRuleForWorkload(args.rule);
                });
                $scope.calculateRuleForWorkload = function(rule){
                    // if(typeof $scope.networkInfo === "undefined")
                    //     $scope.networkInfo = angular.copy($scope.activeTenant.networks);
                    _.each(rule.ruleDesc, function (singleRuleDesc) {
                        _.each(singleRuleDesc.networks, function (network) {
                            _.each($scope.networkInfo,function(singleNetwork){
                                var matchedWorkload = _.find(singleNetwork.workloads,{"id":network.id});
                                if(typeof matchedWorkload !== "undefined"){
                                    matchedWorkload.ruleId = rule.id;
                                    matchedWorkload.resourceGroupName = rule.groupInfo.name;
                                    console.log($scope.masterList);
                                }
                            });
                        });
                    });
                };
                $scope.calculateRuleForNetwork = function () {
                    /* jshint ignore:start */
                    for (var j = 0; j < $scope.masterList.length; j++) {
                        _.each($scope.rules, function (rule) {
                            _.each(rule.ruleDesc, function (singleRuleDesc) {
                                _.each(singleRuleDesc.networks, function (network) {
                                    if ($scope.masterList[j].id === network.id) {
                                        $scope.masterList[j].ruleId = angular.copy(rule.id);
                                    }
                                });
                            });
                        });
                    }
                    /* jshint ignore:end */
                };

                $scope.updateMasterList = function () {
                    $scope.groupedElemsCount = 0;
                    $scope.unGroupedElemsCount = 0;
                    for (var i = 0; i < $scope.networkInfo.length; i++) {
                        for (var j = 0; j < $scope.masterList.length; j++) {
                            if ($scope.masterList[j].id === $scope.networkInfo[i].id) {
                                $scope.masterList[j].resourceGroupId = angular.copy($scope.networkInfo[i].resourceGroupId);
                                $scope.masterList[j].resourceGroupName = angular.copy($scope.networkInfo[i].resourceGroupName);
                            }
                        }
                    }
                    $scope.calculateRuleForNetwork();
                    //update variables
                    for (var k = 0; k < $scope.masterList.length; k++) {
                        if ($scope.masterList[k].resourceGroupName)
                            ++$scope.groupedElemsCount;
                        else
                            ++$scope.unGroupedElemsCount;
                    }
                };
                $scope.$on('listChanged', function () { 
                    $scope.updateMasterList();
                });


                

                $scope.$watch('networkInfo', function (newVal) {
                  if (!$scope.init && typeof newVal !== "undefined" && newVal.length > 0) {
                        $scope.originalNetworkList = angular.copy(newVal);
                        for (i = 0; i < $scope.tenants.length; i++) {
                            $scope.tenants[i].networks = $scope.networks;
                        }

                        $scope.masterList = angular.copy($scope.activeTenant.networks);
                        $scope.updateMasterList();
                        $scope.init = true;
                        for (var i = 0; i < $scope.networkInfo.length; i++) {
                            newVal[i].faded = false;
                        }
                    }
                });

                $scope.showTentantPopup = function (ev) {
//            console.dir($scope.tenants);
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
                        $scope.selectedNetworks = [];
                        $scope.$broadcast('tenantChanged', {tenant: $scope.activeTenant});
                        $scope.masterList = angular.copy($scope.activeTenant.networks);
                        $scope.updateMasterList();

                        setTimeout(function () {
                            $scope.showUnGrouped("upgrouped"); //setting view to ungrouped 
                            $scope.networkFetched = true;
                        }, 0);

                    }, function () {
                        $scope.status = 'You cancelled the dialog.';
                    });
                };

                $scope.networkFetched = false;

                $scope.selectedNetworks = [];
                $scope.selectedWorkloads = [];

                $scope.$on('newGroupCreated', function (event, data) {
                    if (typeof $scope.resourcegroups === "undefined") {
                        $scope.resourcegroups = [];
                    }
                    $scope.resourcegroups.push(data.newRG);
                    $scope.checkCommit();
                    $scope.selectedNetworks = [];
                    reCalcNetworks();
                    setTimeout(function () {
                        $scope.showUnGrouped("upgrouped"); //setting view to ungrouped 
                    }, 0);
                });

                $scope.$on('existingGroupModified', function (event, data) {
                    var rtRG = _.find($scope.resourcegroups,
                            function (resourceGrp) {
                                return resourceGrp.name === data.exRG.name;
                            });
                    rtRG.memberList = data.exRG.memberList;
                    $scope.selectedNetworks = [];
                    reCalcNetworks();
                    setTimeout(function () {
                        $scope.showGrouped(); //setting view to ungrouped 
                    }, 0);
                });


                $scope.$on('groupDeleted', function (event, data) {
                    _.remove($scope.resourcegroups,
                            function (resourceGrp) {
                                return resourceGrp.name === data.delRG.name;
                            });
                    $scope.checkCommit();
                    reCalcNetworks();
                });

                
                $scope.$on('networkInfoChanged', function (event, data) {
                    $scope.networkInfo = data.networkInfo;
                    $scope.updateMasterList();
/* jshint ignore:start *///logic to check for workload or network based data
                    if(data.networkToUpdateVal){
                        if(data.networkToUpdateVal.length > 0){
                            for(var i =0; i < data.networkToUpdateVal.length; i++){
                                var mn = _.find($scope.masterList, function(net){
                                    return data.networkToUpdateVal[i].net.id === net.id;
                                });

                                if(mn){
                                  mn.resourceGroupId = data.networkToUpdateVal[i].resourceGroupId;
                                  mn.resourceGroupName = data.networkToUpdateVal[i].grName;
                                  mn.noneSPS = data.noneSPS;
                                }
                            }
                        }
                    }

                    if(data.workloadsToUpdateVal){
                        if(data.workloadsToUpdateVal.length > 0){
                            for(var i =0; i < data.workloadsToUpdateVal.length; i++){
                                var workloadmatched = _.find($scope.workloads, {'id': data.workloadsToUpdateVal[i].net.id});
                                var networkOfWorkload,workloadIndex,mn;
                                if(workloadmatched){
                                    networkOfWorkload = _.find($scope.masterList,{"id":workloadmatched.ports[0].networkId});
                                    if(networkOfWorkload)
                                        workloadIndex = _.findIndex(networkOfWorkload.workloads,{"id":workloadmatched.id});
                                    if(workloadIndex !== undefined)
                                        mn = networkOfWorkload.workloads[workloadIndex];
                                }
                                
                                if(mn){
                                  mn.resourceGroupId = data.workloadsToUpdateVal[i].resourceGroupId;
                                  mn.resourceGroupName = data.workloadsToUpdateVal[i].grName;
                                  mn.noneSPS = data.noneSPS;
                                }
                            }
                        }
                    }

                   $scope.referesh($scope.secuerMode);
                    /* jshint ignore:end */
                });

                $scope.$on('refereshNetworks', function (event, data) {
                   $scope.referesh($scope.secuerMode);
                });
                $scope.referesh = function(data) {
                     switch (data) {
                        case "all":
                            $scope.secuerMode = data;
                            $scope.showAll(data);
                            break;
                        case "grouped":
                            $scope.showGrouped(data);
                            $scope.secuerMode = data;
                            break;
                        case "upgrouped":
                            $scope.showUnGrouped(data);
                             $scope.secuerMode = data;
                            break;
                        default:
                            $scope.showAll(data);
                    }
                };

                $scope.$on('showNetworks', function (event, data) {
                    $scope.referesh(data);
                });
                $scope.$on(SOEvents.noneSpsPolicy,function(event,args){
                    console.log("SPS none loaded and catched",args);
                    $scope.spsNoneId = args.asp.id;
                });
                $scope.unsecGrouped = 0;
                $scope.secGrouped = 0;
                $scope.groupObj = {'secgrouped':$scope.secGrouped,'unsecgrouped':$scope.unsecGrouped};
                $scope.recalcNetworkInfo = function (data) {
                    console.log("reCalcNetworks start");
                    $scope.unsecGrouped = 0;
                    $scope.secGrouped = 0;
                    var sandboxedNetworks = [];
                    var sandboxedWorkloads = [];
                    _.each($scope.rules, function (rule) {
                        if(rule.id){
                            var groupName = rule.groupInfo;
                            rule.workloadsSecured = 0;
                            _.each(rule.ruleDesc, function (ruleDesc) {
                                _.each(ruleDesc.networks, function (network) {
                                    if($scope.spsNoneId === rule.aspInfo.id){
                                        network.noneSPS = true;
                                        rule.noneSPS = true;
                                    } else {
                                        network.noneSPS = false;
                                        rule.noneSPS = false;
                                    }
                                    if(rule.resourceType == "NETWORK"){
                                        if (!_.find(sandboxedNetworks, {"id": network.id})) {
                                            network.ruleId = rule.id;
                                            network.groupName = groupName.name;
                                            sandboxedNetworks.push(network);
                                            var matchedNet = _.find($scope.networks, {"id": network.id });
                                            rule.workloadsSecured += matchedNet.workloads.length;
                                        }
                                    } else if(rule.resourceType == "VM") {
                                        if(network.id && !_.find(sandboxedWorkloads, {"id": network.id}) ){
                                            network.ruleId = rule.id;
                                            network.groupName = groupName.name;
                                            sandboxedWorkloads.push(network);
                                            rule.workloadsSecured++;
                                        }
                                    }
                                });
                            });
                        }
                    });
                    var templist = angular.copy($scope.networkInfo);
                    /*var templist = [];
                    if(data === "grouped")
                        templist = angular.copy($scope.networkInfo);
                    else
                        templist = angular.copy($scope.networks);*/
                    var ungroupedList = [];
                    var groupedList = [];

//                    _.each(templist, function (value, key) {
                    for (var i = 0; i < templist.length; i++) {
                        if (typeof templist[i] !== "undefined") {
                            var sanboxObj = _.find(sandboxedNetworks, {"id": templist[i].id});
                            /*if ($scope.sandboxMode) {*/ //Enable this check if we want secured - unsecured to be integrated with sandboxMode
                                for (var j = 0; j < templist[i].workloads.length; j++) {
                                    var sanboxWorkloadObj = _.find(sandboxedWorkloads, {"id": templist[i].workloads[j].id});
                                    if (sanboxWorkloadObj) {
                                        templist[i].workloads[j].ruleId = sanboxWorkloadObj.ruleId;
                                        templist[i].workloads[j].resourceGroupName = sanboxWorkloadObj.groupName;
                                        templist[i].workloads[j].noneSPS = sanboxWorkloadObj.noneSPS;
                                        if(templist[i].workloads[j].noneSPS)
                                            $scope.unsecGrouped++;
                                        else
                                            $scope.secGrouped++;
                                    }
                                    
                                }
                                if (data === "grouped") {
                                    if (sanboxObj) {
                                        templist[i].ruleId = sanboxObj.ruleId;
                                        templist[i].resourceGroupName = sanboxObj.groupName;
                                        templist[i].noneSPS = sanboxObj.noneSPS;
                                        if(templist[i].noneSPS)
                                            $scope.unsecGrouped += templist[i].workloads.length;
                                        else
                                            $scope.secGrouped += templist[i].workloads.length;
                                        groupedList.push(angular.copy(templist[i]));
                                    } else if (templist[i].resourceGroupId) {
                                        groupedList.push(angular.copy(templist[i]));
                                    }
                                } else if (data === "upgrouped") {
                                    if (sanboxObj) {
                                        templist[i].ruleId = sanboxObj.ruleId;
                                        templist[i].resourceGroupName = sanboxObj.groupName;
                                        templist[i].noneSPS = sanboxObj.noneSPS;
                                        if(templist[i].noneSPS)
                                            $scope.unsecGrouped += templist[i].workloads.length;
                                        else
                                            $scope.secGrouped += templist[i].workloads.length;
                                        ungroupedList.push(angular.copy(templist[i]));
                                    } else {
                                        ungroupedList.push(angular.copy(templist[i]));
                                    }
                                } else {
                                    if (sanboxObj) {
                                        templist[i].ruleId = sanboxObj.ruleId;
                                        templist[i].resourceGroupName = sanboxObj.groupName;
                                        templist[i].noneSPS = sanboxObj.noneSPS;
                                        if(templist[i].noneSPS)
                                            $scope.unsecGrouped += templist[i].workloads.length;
                                        else
                                            $scope.secGrouped += templist[i].workloads.length;
                                    }
                                }
                                
                            /*} else {
                                if (data === "grouped") {
                                    if (sanboxObj && sanboxObj.ruleId) {
                                        templist[i].ruleId = sanboxObj.ruleId;
                                        templist[i].resourceGroupName = sanboxObj.groupName;
                                        groupedList.push(angular.copy(templist[i]));
                                    } else if (templist[i].ruleId) {
                                        groupedList.push(angular.copy(templist[i]));
                                    } else {
                                        ungroupedList.push(angular.copy(templist[i]));
                                    }
                                } else if (data === "upgrouped") {
                                    if (sanboxObj && sanboxObj.ruleId) {
                                        templist[i].ruleId = sanboxObj.ruleId;
                                        templist[i].resourceGroupName = sanboxObj.groupName;
                                    } else {
                                        ungroupedList.push(angular.copy(templist[i]));
                                    }
                                } else {
                                    if (sanboxObj) {
                                        templist[i].ruleId = sanboxObj.ruleId;
                                        templist[i].resourceGroupName = sanboxObj.groupName;
                                    }
                                }
                            }*/
                        }
                    }
//                    });
                    if (data === "upgrouped") {
                        $scope.networkInfo = ungroupedList;
                    } else if (data === "grouped") {
                        $scope.networkInfo = groupedList;
                    } else {
                        $scope.networkInfo = templist;
                    }
                   $scope.networksCopy = angular.copy($scope.networkInfo);
                   $scope.broadcastSOREvents(SOEvents.networkChangedEvent, $scope.networkInfo);
                   $scope.broadcastSOREvents('counterChanged', {'secgrouped':$scope.secGrouped,'unsecgrouped':$scope.unsecGrouped});
                   console.log("reCalcNetworks End");
                };
                
                $scope.$on('fullscreen', function (event, data) {
                    if(!$scope.maximize) {
                        fixContainerHeight(2);
                    } else {
                        fixContainerHeight(4);
                    }
                
                    $scope.maximize = !$scope.maximize;
                });
                
                $scope.$on('sandboxModeToggleInit', function (event, sandboxMode) {
                    $scope.sandboxMode = sandboxMode;
                    $scope.$broadcast('sandboxModeToggled', $scope.sandboxMode);
                });
             
                $scope.$on('showObjectDetailClicked', function (event, data) {
                    $scope.$broadcast('showObjectDetail', data);
                });

                $scope.$on('toggleNetworkDataInit', function (event, data) {
                    $scope.$broadcast('toggleNetworkData', data);
                });
                
                $scope.$on("restorePreAttributeSession", function (event, args) {
                    $scope.$broadcast('onRestorePreAttributeSession', {});
                });

                $scope.$on("rulesArrayChangedInit", function (event, args) {
                    $scope.$broadcast('rulesArrayChanged', args);
                });

                $scope.$on("groupCountsChangedInit", function (event, args) {
                    $scope.$broadcast('groupCountsChanged', args);
                });

                $scope.$on("reloadNetworksByTenantInit", function (event, args) {
                    $scope.tenantid = args.tenantId;
                    $scope.$broadcast('reloadNetworksByTenant', args);
                });

            }];

        return directive;
    }

    angular.module('shieldxApp').directive('securityorchestration', securityOrchestrationDirective);
})();
