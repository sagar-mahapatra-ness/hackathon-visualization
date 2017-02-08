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

(function() {
    function newthreatRuleCtrl(
        $scope,
        $rootScope,
        $state,
        $translate,
        $sessionStorage,
        policyService,
        $timeout,
        $q,
        $mdDialog,
        deploymentSpecificationService,
        infrastructureConnectorService,
        commonDataManagement
    ) {
        var deferred = $q.defer();
        $scope.promise = deferred.promise;
        $scope.promiseCompleted = true;
        $scope.disableSavePolicy = true;
        $scope.selectedType = "type2";
        $scope.blockType = "app";
        var initializing = true;
        $scope.policyselected = [];
        $scope.malwareAddForm = [];
        $scope.isSearchBarOpen = false;
        $scope.selected = [];
        $scope.policyDetails = {};
        $scope.saveupdatepolicyAdd = true;
        $scope.addNewPolicyArray = [];
        $scope.policyname = "";
        $scope.allRuleThreats = [];
        $scope.newRule = {};
        $scope.targets = ["CLIENT","SERVER"];
        $scope.severities = [];
        $scope.selectedOS = [];
        $scope.selectedApp = [];
        $scope.selectedProtocols = [];
        $scope.rulepageTitle = "Add Rule";
        $scope.showMoreAppIds= false;
        $scope.showMoreProtocol = false;
        $scope.showMoreOS = false;
        $scope.showMoreThreatsList = false;
        $scope.allthreatdata = [];
        $scope.transitState = 0;
        var policyobject = $state.params.policyobject;
        var ruleData = $state.params.ruleobject;
        var existingRules = $state.params.existingrules;
        var indexToupdate = -1;
        console.log("state params",$state);
        $scope.promiseCompleted = false;
        policyService.getPolicyDetail("threatpreventionpolicy","policy","severity").then(function(severityData) {
            $scope.severities = severityData;
        }, function(err) {
            console.log("new threat rule error");
        });
        policyService.getListOfPoliciesDetails("threats",0).then(function(allthreatdata) {
            console.log("This is all threat data here");
            console.log(allthreatdata);
            //allthreatdata.length = 1000;
            $scope.allthreatdata = angular.copy(allthreatdata);
            $scope.globalThreatList = angular.copy(allthreatdata);
            $scope.selectedThreats = [];
            if(ruleData.action === "edit"){
                _.each(ruleData.specificThreats,function(singleSpecific){
                    var matchedValue = _.find($scope.globalThreatList,{"protocolID":singleSpecific.protocolID.toString(),"threatID":singleSpecific.threatID.toString()});
                    $scope.selectedThreats.push(matchedValue);
                });
            }
            $scope.promiseCompleted = true;
        }, function(err) {
            console.log("threat prevention policy error data");
        });
        console.log(ruleData);
        console.log("This is the value that we get");
        console.log(ruleData);
        $scope.newRule = ruleData;
        if(ruleData.action === "edit"){
            $scope.rulepageTitle = "Edit Rule";
            if(ruleData.osNames || ruleData.osNames || ruleData.protocolNames){
                $scope.selectedType = "type2";    
            }else{
                $scope.selectedType = "type1";    
            }
            
            $scope.selectedOS = (ruleData.osNames) ? ruleData.osNames : [];
            $scope.selectedApp = (ruleData.appNames) ? ruleData.appNames : [];
            $scope.selectedProtocols = (ruleData.protocolNames) ? ruleData.protocolNames : [];
            $scope.blockType = ($scope.selectedProtocols.length > 0)?"protocol":"app";
            indexToupdate = _.findIndex(existingRules,ruleData);
        } 
        $scope.checkOther = function(changeType){
            if(changeType === 'app' && $scope.selectedApp.length){
                /*$scope.clearmsg = "To detect/block Protocols you must first clear Applications ";*/
                $scope.transitState = 1;
            } else if(changeType === 'protocol' && $scope.selectedProtocols.length) {
                /*$scope.clearmsg = "To detect/block Applications you must first clear Protocols";*/
                $scope.transitState = 2;
            } else {
                /*$scope.transit = false;*/
                $scope.transitState = 0;
            }
        };
        $scope.clearState = function(dataToclear){
            dataToclear.length = 0;
            $scope.transitState = 0;
        };
        $scope.showPopupList = function(eve,titletext,typeOfData,receivedData) {
            $mdDialog.show({
                skipHide: true,
                controller: rulePopupController,
                templateUrl: 'core/components/administration/policy/commonpopup.html',
                parent: angular.element(document.body),
                targetEvent: eve,
                fullscreen: true,
                scope: $scope,
                preserveScope: true,
                locals:{'titletext':titletext,'typeOfData':typeOfData,'receivedData' : receivedData}
            }).then(function(selectStatus) {
                if(selectStatus){
                    console.log("selected is this ",$scope.selected);
                    switch (typeOfData) {
                    case "protocol":
                        $scope.selectedProtocols = $scope.selected;
                        break;
                    case "os":
                        $scope.selectedOS = $scope.selected;
                        break;
                    case "appid":
                        $scope.selectedApp = $scope.selected;
                        break;
                    }
                }
            });
        };
        $scope.showSSList = function(event,receivedData){
            $mdDialog.show({
                skipHide: true,
                controller: specificThreatPopupController,
                templateUrl: 'core/components/administration/policy/specific-threats.html',
                parent: angular.element(document.body),
                targetEvent: event,
                fullscreen: true,
                onComplete: function(scope, element, options){
                    //console.log("calling on onComplete",scope, element, options);
                    scope.items = scope.globalThreatList;
                    $scope.no_of_hosts = $scope.items.length;
                    $scope.host_activated = true;
                },
                scope: $scope,
                preserveScope: true,
                locals:{'receivedData' : receivedData, globalThreatList:$scope.globalThreatList}
            }).then(function() {
                $scope.selectedThreats = angular.copy($scope.selected);

            });
        };
        $scope.deleteSelected = function () {
            $scope.globalThreatList = angular.copy($scope.allthreatdata);
            $scope.items = angular.copy($scope.allthreatdata);
            $scope.selected=[];
            $scope.selectedThreats=[];
            $scope.selected.length = 0;
            $scope.selectedThreats.length = 0;
        };
        function specificThreatPopupController($scope, $mdDialog,policyService,Webworker,receivedData){
            $scope.host_activated = false;
            var temp = angular.copy(receivedData);
            //$scope.no_of_hosts = $scope.items.length;
            if(temp)
            {
               $scope.selected =  temp;  
            } else {
                $scope.selected =  [];
            }
            
            $scope.closeDialog = function() {
                    $mdDialog.hide();
            };
            
            /*$scope.no_of_hosts = $scope.items.length;*/
            
            if ($scope.selected) {
                $scope.no_of_selected_hosts = $scope.selected.length;
            } else {
                $scope.no_of_selected_hosts = 0;
            }
            $scope.doneHosts = function() {
                //$rootScope.$broadcast('listenSelectedHosts', $scope.selected);
                $scope.selected = [];
                for(var i=0; i < $scope.items.length; i++){
                   if($scope.items[i].check){
                    $scope.selected.push($scope.items[i]);
                   } 
                }
                console.log("Selected SS ",$scope.selected);
                $mdDialog.hide();
            };
            $scope.toggle = function (item, list) {
                var isDeleted = false;
                /* for (i = 0; i < list.length; i++) {
                        if (list[i].protocolID === item.protocolID && list[i].threatID === item.threatID) {
                            list.splice(i, 1);
                            isDeleted = true;
                        }
                    }                        
                if (!isDeleted) {
                    list.push(item);
                }
                */
                $scope.selected.push(item);
                $scope.no_of_selected_hosts = $scope.selected.length;
            };
            $scope.exists = function (item, list) {
                   /*if($scope.toggleAllClicked){
                     return true;
                   }*/
                   /* for (i = 0; i < list.length; i++) {
                        if (list[i].protocolID === item.protocolID && list[i].threatID === item.threatID) {
                            return true;
                        }
                    }
                    return false;*/
                
                };
                $scope.isIndeterminate = function () {
                    return $scope.toggleAllClicked === false;
                };
                $scope.isChecked = function () {
                    return $scope.toggleAllClicked;
                };
                $scope.toggleAllClicked = false;
                $scope.checkUncheck = function(item, checkvalue){
                     function selectDeselectAll(array, value) {
                        console.log('selectDeselectAll  start');

                         for(var i=0; i < array.length; i++){
                           array[i].check = value;
                        }
                        console.log('selectDeselectAll  ends');
                        console.dir(array);
                        complete(array);
                     }
                    var myWorker = Webworker.create(selectDeselectAll, {async: true });
                    myWorker.run(item, checkvalue).then(function(result) {
                        // promise is resolved.
                       console.log("web worker finish");
                       console.dir(result);
                       $scope.globalThreatList = result;
                       $scope.items = result;
                    }, function(error){
                        console.log(progress);
                    }, function(progress) {
                         console.log(progress);
                    });
                };
                $scope.toggleAll = function () {
                    $scope.toggleAllClicked = ! $scope.toggleAllClicked;
                    $scope.checkUncheck($scope.items, $scope.toggleAllClicked);
                    if($scope.toggleAllClicked){
                       $scope.no_of_selected_hosts = $scope.items.length; 
                   } else {
                      $scope.no_of_selected_hosts = 0;
                   } 
                    
                };
        }

        $scope.addNewRule = function(){
            //add target here later {"protocolID": 0,"threatID": 0}
            var mainRuleObject = {};
            if($scope.selectedType === "type1"){
                mainRuleObject = {"id" : $scope.newRule.id ,"name" : $scope.newRule.name , "appNames": null,"enabled": true,"orderNum": 0,"osNames": null,"protocolNames": null,"protectionType" : null,"severities": [],"specificThreats": $scope.selectedThreats};
            } else {
                var appNames = ($scope.selectedApp.length) ? $scope.selectedApp : null;
                var protocolNames = ($scope.selectedProtocols.length) ? $scope.selectedProtocols : null;
                var osNames = ($scope.selectedOS.length) ? $scope.selectedOS : null;
                mainRuleObject = {"id" : $scope.newRule.id ,"name" : $scope.newRule.name , "appNames": appNames,"enabled": true,"orderNum": 0,"osNames": osNames,"protocolNames": protocolNames,"protectionType" : $scope.newRule.protectionType,"severities": [$scope.newRule.severity],"specificThreats": []};
                
            }
            mainRuleObject.isdirty = true;
            console.log("values set");
            console.log(mainRuleObject);
            if(indexToupdate === -1){
                existingRules.push(mainRuleObject);
            } else {
                existingRules[indexToupdate] = mainRuleObject;
            }
            if(typeof policyobject.policyId !== 'undefined')
                $state.go($rootScope.previousState,{policyId: policyobject.policyId,'policyobject' : policyobject,'existingrules' : existingRules});
            else
                $state.go($rootScope.previousState,{'policyobject' : policyobject,'existingrules' : existingRules});
            
        };
        
        $scope.cancelNewRule = function(){
            if(typeof $rootScope.previousState !== 'undefined'){
                if($scope.newRule.id === 0){
                    if(typeof policyobject.policyId !== 'undefined'){
                        $state.go($rootScope.previousState,{policyId: policyobject.policyId,'policyobject' : policyobject,'existingrules' : existingRules});
                    } else{
                        $state.go($rootScope.previousState,{'policyobject' : policyobject,'existingrules' : existingRules});
                    }
                } 
                else {
                        $state.go($rootScope.previousState,{policyId: policyobject.policyId,'policyobject' : policyobject,'existingrules' : existingRules});
                    }
            }
            else
                $state.go('home.policy.policylist.threatdetection');

        };
        
        function rulePopupController($scope, $mdDialog,policyService,titletext,typeOfData,receivedData) {
            $scope.typeOfData = typeOfData;
            $scope.titletext = titletext;
            $scope.selected = angular.copy(receivedData);
            $scope.items = [];
            $scope.host_activated = false;
            console.log("Selected OS ",$scope.selectedOS);
            if(typeOfData === 'protocol'){
                policyService.getDataBasedOnId("policy","protocol").then(function(protocolData) {
                    $scope.items = protocolData.map(function(obj){return obj.protocolName;});
                    $scope.host_activated = true;
                }, function(err) {
                    $scope.host_activated = true;
                    console.log("new threat rule error");
                });
            } else {
                policyService.getPolicyDetail("threatpreventionpolicy","policy",typeOfData).then(function(responseData) {
                    $scope.items = responseData.map(function(obj){return obj.name;});
                    $scope.host_activated = true;
                }, function(err) {
                    $scope.host_activated = true;
                    console.log("new threat rule error");
                });
            }
            $scope.closeDialog = function() {
                    $mdDialog.hide(false);
            };
            (function(){  
                $scope.no_of_hosts = $scope.items.length;
                
                if ($scope.selected) {
                    $scope.no_of_selected_hosts = $scope.selected.length;
                } else {
                    $scope.no_of_selected_hosts = 0;
                }
                $scope.doneHosts = function() {
                    //$rootScope.$broadcast('listenSelectedHosts', $scope.selected);
                    console.log("Selected OS ",$scope.selectedOS);
                    $mdDialog.hide(true);
                };
                $scope.toggle = function (item, list) {
                    var isDeleted = false;
                    for (i = 0; i < list.length; i++) {
                            if (list[i] === item) {
                                list.splice(i, 1);
                                isDeleted = true;
                            }
                        }                        
                    if (!isDeleted) {
                        list.push(item);
                    }
                    $scope.no_of_selected_hosts = $scope.selected.length;
                };
                    $scope.exists = function (item, list) {
                        for (i = 0; i < list.length; i++) {
                            if (list[i] === item) {
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
                        $scope.no_of_selected_hosts = $scope.selected.length;
                    };
                //}
            })();
        }

        $scope.$on('$viewContentLoaded', function(event){ 
            console.log(event);
            fixContainerHeight(1);
        });
        $scope.showMoreItemPopUp = function(event,data,name){
            if(name === 'Threats'){
                data = data.map(function(singleObject){
                    return singleObject.name;
                });
            }
                $scope.showmorePopUpData = data;
                $scope.showMoreDataName = name;
                $mdDialog.show({
                    skipHide: true,
                    preserveScope: true,
                    controller: showMoreDataCtrl,
                    bindToController: true,
                    templateUrl: 'core/components/administration/policy/more-data.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    fullscreen: false,
                    scope: $scope,
                    openFrom: { top: 1100, height: 0 },
                    closeTo: { left: 1500 }
                }).then(function() {

                });
            };
            function showMoreDataCtrl($mdDialog,$scope){
                $scope.cancelShowMoreDataPopup = function(){
                    $mdDialog.cancel();
                };
            }
    }

    angular.module('shieldxApp').controller('newthreatRuleCtr', newthreatRuleCtrl);
})();
