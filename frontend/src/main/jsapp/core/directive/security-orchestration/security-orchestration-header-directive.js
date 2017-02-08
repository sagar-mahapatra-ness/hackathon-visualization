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
    function securityOrchestrationHeaderDirective() {
        var directive = {};
        directive.restrict = 'E';
        directive.replace = true;
        directive.templateUrl = 'core/directive/security-orchestration/security-orchestration-header-template.html';
        directive.scope = {
            networkInfo: '=netinfo',
            selectedNetworks: '=selectednetworks',
            networkFetched: '=networkfetched',
            masterList: '=masterlist',
            broadcastevent: '&',
            tenants:'=',
            configinfo : "=",
            activetenant:'=',
            networksavailable : '=',
            workloads : '=',
            attributesfound : '=',
            virtualchassisdata:"=",
            resouregroupassigned:"=",
            vchassisid:"=",
            groupobj : "="
        };
        directive.controller = ['$scope', '$rootScope', '$state','$mdDialog', function ($scope, $rootScope, $state,$mdDialog) {
                
                $scope.showRuleFilter = false;
                $scope.existingfilter = {"alphanumeric":[],"os":[],"appname":[]};
                $scope.buttonSelected = "network";
                $scope.methodBridge = new MethodBridge();
                $scope.maximize = false;
                $scope.filteredWorkloadsCount = 0;
                $scope.$on(SOEvents.networkChangedEvent, function (event, args) {
                    console.log("securityOrchestrationHeaderDirective SOEvents.networkChangedEvent");
                    console.dir(args);
                    $scope.methodBridge.call(args);
                });
                $scope.checkfilter = function(){
                    if($scope.existingfilter.alphanumeric.length || $scope.existingfilter.os.length || $scope.existingfilter.appname.length)
                        return false;
                    return true;
                };
                $scope.getAttributeName = function(typeOfattr,itemId){
                    var matchedData = _.find($scope.attributesfound,{'type' : typeOfattr,'id' : itemId});
                    return matchedData.name;
                };
                $scope.uncheckFilter = function(filterType,removedEntity){
                    var matchedIndex = null;
                    if(filterType === 'os'){
                        $scope.existingfilter.os.splice(removedEntity,1);
                    } else if(filterType === 'appname'){
                        $scope.existingfilter.appname.splice(removedEntity,1);
                    } else if(filterType === 'alphanumeric'){
                        $scope.existingfilter.alphanumeric.splice(removedEntity,1);
                    }
                    calculateFilter($scope.existingfilter,$scope.networksavailable);
                };
                function calculateFilter(filter,allNetworks){
                    $scope.networksavailableCopy = angular.copy(allNetworks);
                    $scope.filteredWorkloadsCount = 0;
                    var filteredWorkloads = [];
                    var value = filter;
                    for(var nwiterator = $scope.networksavailableCopy.length - 1; nwiterator >=0; nwiterator--){
                      var singleNetwork = $scope.networksavailableCopy[nwiterator];
                      for (var i = singleNetwork.workloads.length - 1;i >= 0 ;i--) {
                            var singleWorkload = singleNetwork.workloads[i];
                            var alphanumericPass = true;
                            var osPass = value.os.length ? false : true;
                            var appIdPass = value.appname.length ? false : true;
                            if(value.alphanumeric.length && value.alphanumeric.indexOf(singleWorkload.name.toLowerCase().charAt(0)) === -1 ) {
                                alphanumericPass = false;
                            }
                            for (var osIterator = 0; osIterator < value.os.length; osIterator++) {
                                var matchedIndexOS = _.findIndex(singleWorkload.ports[0].attributes,{'type' : 'os','id':value.os[osIterator]});
                                if(matchedIndexOS !== -1)
                                    osPass = true;
                            }
                            for (var appIterator = 0; appIterator < value.appname.length; appIterator++) {
                                var matchedIndexApp = _.findIndex(singleWorkload.ports[0].attributes,{'type' : 'application','id':value.appname[appIterator]});
                                if(matchedIndexApp !== -1)
                                    appIdPass = true;
                            }
                            if(!alphanumericPass || !osPass || !appIdPass){
                                singleNetwork.workloads.splice(i,1);
                            } else {
                                if(filteredWorkloads.indexOf(singleWorkload.id) === -1)
                                    filteredWorkloads.push(singleWorkload.id);
                            }
                        }
                        if(!singleNetwork.workloads.length && (value.os.length || value.appname.length || value.alphanumeric.length) ){
                            $scope.networksavailableCopy.splice(nwiterator,1);
                        }
                       
                    }
                    $scope.filteredWorkloadsCount = filteredWorkloads.length;
                    $scope.$emit('filteredNetworks',{networks:$scope.networksavailableCopy});
                    if(!value.os.length && !value.appname.length && !value.alphanumeric.length)
                        $scope.$emit('nofilterZoomout');
                    console.log("this is the filtered output after workloads process ",$scope.networksavailableCopy);
                    //checkEvent();
                }
                $scope.getFilterCount = function(){
                    return $scope.existingfilter.alphanumeric.length + $scope.existingfilter.os.length + $scope.existingfilter.appname.length;
                };
                $scope.clearFilters = function(){
                    $scope.$emit('filteredNetworks',{networks:$scope.networksavailable});
                    $scope.existingfilter = {"alphanumeric":[],"os":[],"appname":[]};
                };
                $scope.onSelectNetworkClicked = function () {
                    $scope.buttonSelected = "network";
                    $scope.broadcastevent({event: 'gotoNetworkTab', args: {} });
//                    $scope.$emit("gotoNetworkTab", {});
                };

                $scope.onSelectGroupClicked = function () {
                    $scope.buttonSelected = "group";
                    $scope.broadcastevent({event: 'gotoGroupTab', args: {} });
                };

                $scope.disableAllSelection = function (flag) {
                    _.each($scope.items, function (obj) {
                        obj.disabled = flag;
                    });
                };
                 $scope.chipCreated = false;
                $scope.$on('onChipItemCreated', function(event,data){
                    $scope.chipCreated = true;
                    console.log("dataa " + data);
                    $scope.Totalchips = data;
                    $scope.readonly = false;
                    $scope.removable = false;

                });
                $scope.showFilterPopup = function(event){
                    $mdDialog.show({
                        skipHide: true,
                        controller: morefilterCtr,
                        templateUrl: 'core/components/screenComponents/networkView/morefilterspopup.html',
                        parent: angular.element(document.body),
                        targetEvent: event,
                        fullscreen: true,
                        openFrom: {top: 1100, height: 0},
                        closeTo: {left: 1500},
                        locals:{existingfilter:$scope.existingfilter,workloads:$scope.workloads,attributesFound:$scope.attributesfound}
                    }).then(function (value) {
                        //$scope.networksavailableCopy = angular.copy($scope.networksavailable);
                        calculateFilter(value,$scope.networksavailable);
                        $scope.existingfilter = angular.copy(value);
                        console.log(value);
                        //console.log($scope.networksavailableCopy);
                    });
                };
                $scope.deletedChip = function(){
                    $scope.$broadcast("actionMadeOnChip",{"data":$scope.Totalchips});
                    //console.log($scope.Totalchips);
                    if($scope.Totalchips.length  === 0){
                        $scope.chipCreated = false;
                        $scope.$emit('nofilterZoomout');
                    }
                };
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
                $scope.$on(SOEvents.ruleCommitedEvent, function (event, args) {
                    $scope.chipCreated = false;
                    $scope.broadcastevent({event: 'showNetworks', args: "grouped" });
                });
                $scope.$on(SOEvents.ruleAllCommitedEvent, function (event, args) {
                    $scope.chipCreated = false;
                    $scope.broadcastevent({event: 'showNetworks', args: "grouped" });
                });
                $scope.data = null;
                $scope.$on('onNetworkSelectionChanged', function (event, data) {
                    $scope.data = data;
                    $scope.dataType = "NETWORK";
                    $scope.showRuleFilter = true;
                    if (data.op === "selected") {
                        $scope.broadcastevent({event: 'networkSelectionChanged', args: $scope.data});  
                    }
                });
                $scope.getWorkloadPercentage = function(workloadCount){
                    if(workloadCount){
                        var percentData = (workloadCount*100)/$scope.totalWorkLoads.length;
                        return percentData.toFixed(2)+"%";
                    }
                    return "0%";
                };
                $scope.$on('onEntitySelectionChanged', function (event, data) {
                    $scope.data = data;
                    $scope.showRuleFilter = true;
                    if (data.op === "selected") {
                        $scope.broadcastevent({event: 'entitySelectionChanged', args: $scope.data});  
                    }
                });
                
                $scope.$on('onWorkLoadSelectionChanged', function (event, data) {
                    $scope.data = data;
                    $scope.dataType = "WORKLOAD";
                    $scope.showRuleFilter = true;
                    if (data.op === "selected") {
                        $scope.broadcastevent({event: 'workloadSelectionChanged', args: $scope.data});  
                    }
                });
                
                $scope.createRuleFilter = function () {
                  $scope.$emit('sandboxModeToggleInit', true);
                  $scope.broadcastevent({event: 'entitySelectionChanged', args: $scope.data});  
                };
                $scope.$on("drawSecureBar",function(event,args){
                    $scope.initialRules = args;
                    $scope.getRsGroupsList = true;
                    $scope.totalsecuredAndUnsecredList();
                });
                $scope.$on('totalWorkLoads',function(event,args){
                    if(args.masterData){        
                        $scope.totalWorkLoads = args.masterData;        
                        $scope.networksWithWorkLoads = args.totalList;  
                        $scope.unsecuredWorkloads = $scope.totalWorkLoads.length;
                        $scope.unsecuredBarWidth = $scope.widthOfdBar($scope.unsecuredWorkloads);     
                        $scope.getWorkloadListCompleted = true;
                        $scope.totalsecuredAndUnsecredList();
                    }  
                });
                $scope.totalsecuredAndUnsecredList = function(){
                    $scope.tempListRules = [];
                    $scope.securedWorkLoads = 0;
                    $scope.unsecgroupvmcount = 0;
                    $scope.unsecuredWorkloads = $scope.totalWorkLoads.length;
                    if($scope.getWorkloadListCompleted && $scope.getRsGroupsList){
                        _.each($scope.initialRules,function(singleRule){
                            var dataObj = {};
                            dataObj.noneSPS = singleRule.noneSPS; 
                            dataObj.workloads = singleRule.workloadsSecured; 
                            dataObj.groupName = singleRule.groupInfo.name;
                            $scope.tempListRules.push(dataObj);
                            if(singleRule.noneSPS)
                                $scope.unsecgroupvmcount += dataObj.workloads;
                            else
                                $scope.securedWorkLoads += dataObj.workloads;
                        });            
                    }
                    $scope.unsecuredWorkloads = $scope.totalWorkLoads.length - ($scope.securedWorkLoads + $scope.unsecgroupvmcount) ;
                    $scope.unsecuredBarWidth = $scope.widthOfdBar($scope.unsecuredWorkloads);
                };
                $scope.getClassSPS = function(dataPassed){
                    return dataPassed.noneSPS ? "noneSPS" : "" ;
                };
                $scope.widthOfdBar = function(lengthOfNetWorks){
                    var renderWidth =  100/$scope.totalWorkLoads.length;
                    return (lengthOfNetWorks === 0)?0:(parseInt(renderWidth*lengthOfNetWorks) + "%"); 
                };
                /*$scope.$on('counterChanged',function(event,args){
                    $scope.securedWorkLoads = args.secgrouped;
                    $scope.unsecgroupvmcount = args.unsecgrouped;
                    if($scope.totalWorkLoads)
                    $scope.unsecuredWorkloads = $scope.totalWorkLoads.length - ($scope.securedWorkLoads + $scope.unsecgroupvmcount) ;
                });*/
                /*function calculateTopBarCounter(){
                    $scope.securedWorkLoads = $scope.groupobj.secgrouped;
                    $scope.unsecgroupvmcount = $scope.groupobj.unsecgrouped;
                        
                }*/
//                var searchData = null;
//                $scope.createRuleFromSearchData = function () {
//                    $rootScope.$broadcast('onNetworkSelectionChanged', searchData);
//                };

                $scope.$on('showNetworks', function (event, data) {
                    switch (data) {
                        case "all":
                            $scope.securedStatus = "0";
                            break;
                        case "grouped":
                            $scope.securedStatus = "1";
                            break;
                        case "upgrouped":
                            $scope.securedStatus = "-1";
                            break;
                        default:
                            $scope.securedStatus = "0";
                    }
                });

                $scope.$watch('securedStatus', function () {
                    checkEvent();
                });
                function checkEvent(){
                    switch ($scope.securedStatus) {
                        case "0":
                            $scope.broadcastevent({event: 'showNetworks', args: 'all'});
                            break;
                        case "1":
                            $scope.broadcastevent({event: 'showNetworks', args: 'grouped'});
                            break;
                        case "-1":
                            $scope.broadcastevent({event: 'showNetworks', args: 'upgrouped'});
                            break;
                        default:
                            $scope.broadcastevent({event: 'showNetworks', args: 'grouped'});
                    }
                }
                $scope.refreshNetworks = function() {
                    $state.reload();
                };
                
                $scope.fullscreen = function() {
                    $scope.maximize = !$scope.maximize;
                    $scope.$emit('fullscreenInit',null);
                };
                
                $scope.sandboxMode = false;
                $scope.$on('sandboxModeToggled', function (event, sandboxMode) {
                    $scope.sandboxMode = sandboxMode;
                });

                $scope.$on('groupCountsChanged', function (event, groupCounts) {
                    $scope.activeGroupCount = groupCounts.active;
                    $scope.sandboxGroupCount = groupCounts.sandbox;
                });
                
                $scope.oldTenant = null;
                $scope.cancelHit = false;
                $scope.$watch('selectedTenant', function(newvalue, oldvalue) {
                    
                    if(!oldvalue) {
                        $scope.oldTenant = $scope.selectedTenant;
                    }
                    if (oldvalue && !$scope.cancelHit) {

                        $mdDialog.show({
                            skipHide: true,
                            controller: switchTenantConfirmCtr,
                            templateUrl: 'core/components/screenComponents/networkView/switchTenantConfirmBox.html',
                            parent: angular.element(document.body),
                            targetEvent: event,
                            fullscreen: true,
                            openFrom: {top: 1100, height: 0},
                            closeTo: {left: 1500},
                            locals: {selectedTenant: newvalue, oldTenant: $scope.oldTenant}
                        }).then(function (value) {
                            $scope.oldTenant = newvalue;
                            $scope.$emit("reloadNetworksByTenantInit", {tenantId: $scope.selectedTenant});
                        }, function () {
                            $scope.cancelHit = true;
                            $scope.selectedTenant = $scope.oldTenant;
                        });
                    } else {
                        $scope.cancelHit = false;
                    }

                });
            }];
        return directive;
    }

    angular.module('shieldxApp').directive('securityorchestrationheader', securityOrchestrationHeaderDirective);
    
    function switchTenantConfirmCtr($scope, $mdDialog, selectedTenant) {
        
        $scope.selectedTenant = selectedTenant;
        $scope.cancelDialog = function () {
            $mdDialog.cancel();
        };
        $scope.applyDialog = function () {
            $mdDialog.hide();
        };

    }
    angular.module('shieldxApp').directive('switchTenantConfirmCtr', switchTenantConfirmCtr);
    
    function morefilterCtr($scope,$mdDialog,existingfilter,workloads,attributesFound){
        var str = "abcdefghijklmnopqrstuvwxyz";
        var numberstring = "0123456789";
        $scope.alphabet = str.toUpperCase().split("");
        $scope.numberList = numberstring.split("");
        $scope.existingfilter = angular.copy(existingfilter);
        $scope.existingfilterCopy = angular.copy(existingfilter);
        //$scope.attributesFound = attributesFound;
        $scope.availableOS = [];
        $scope.availableApp = [];
        _.each(attributesFound,function(typeOfattr){
            if(typeOfattr.type === "os"){
                $scope.availableOS.push(typeOfattr);
            } else if(typeOfattr.type === "application"){
                $scope.availableApp.push(typeOfattr);
            }
        });
        //$scope.alphabetChips = [];
        $scope.alphabetChips = {};
        console.log(workloads);
        _.each(workloads,function(singleWorkload){
            var l = singleWorkload.name.charAt(0).toLowerCase();
            $scope.alphabetChips[l] = (isNaN($scope.alphabetChips[l]) ? 1 : $scope.alphabetChips[l] + 1);
        });
        console.log("data that I get ",$scope.alphabetChips);
        $scope.workloadsavailableAlphanumeric = [];

        $scope.cancelDialog = function(){
            $scope.existingfilter = angular.copy($scope.existingfilterCopy);
            $mdDialog.hide($scope.existingfilter);
        };
        $scope.applyDialog = function(){
            $mdDialog.hide($scope.existingfilter);
        };
        $scope.toggle = function(itemIndex,type){
            var itemPresent = $scope.existingfilter[type].indexOf(itemIndex);
            if(itemPresent === -1){
                $scope.existingfilter[type].push(itemIndex);
            } else {
                $scope.existingfilter[type].splice(itemPresent,1);
            }
        };
        $scope.checkexists = function(itemIndex,type){
            return $scope.existingfilter[type].indexOf(itemIndex) !== -1 ? true : false;
        };
        $scope.getCounter = function(itemIndex){
            if(isNaN($scope.alphabetChips[itemIndex])){
                return 0;
            } else {
                return $scope.alphabetChips[itemIndex] > 9999 ? ( $scope.alphabetChips[itemIndex]/1000 + "k" ) : $scope.alphabetChips[itemIndex];
            }
            
        };
    }
    angular.module('shieldxApp').directive('morefilterCtr', morefilterCtr);

})();

