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
    function editthreatRuleCtrl(
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
        $scope.targets = ["Any","Client","Server"];
        $scope.severities = [];
        $scope.selectedOS = [];
        $scope.selectedApp = [];
        $scope.selectedProtocols = [];

        policyService.getPolicyDetail("threatpreventionpolicy","policy","severity").then(function(severityData) {
            $scope.severities = severityData;
        }, function(err) {
            console.log("new threat rule error");
        });
        var ruleData = commonDataManagement.getObj();
        console.log(ruleData);
        if(! angular.equals(ruleData, {})){
            $scope.newRule = ruleData;
            $scope.selectedOS = ruleData.osNames;
            $scope.selectedApp = ruleData.appNames;
            $scope.selectedProtocols = ruleData.protocolNames;

        } else {
            $state.go('home.policy.policylist.threatdetection');
        }
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
            }).then(function() {

            });
        };
        $scope.addNewRule = function(){
            //add target here later {"protocolID": 0,"threatID": 0}
            var dataSet = {
                            'appNames':$scope.selectedApp.map(function(obj){return obj.name;}),
                            'osNames':$scope.selectedOS.map(function(obj){return obj.name;}),
                            'protocolNames':$scope.selectedProtocols.map(function(obj){return obj.protocolName;})
                            };
            var mainRuleObject = {"name" : $scope.newRule.name , "appNames": dataSet.appNames,"enabled": true,"orderNum": 0,"osNames": dataSet.osNames,"protocolNames": dataSet.protocolNames,"target" : $scope.newRule.target,"severities": [$scope.newRule.severity],"specificThreats": []};
            //set data to pass to parent
            commonDataManagement.setData(mainRuleObject);
            $state.go($rootScope.previousState,{policyId: ruleData.policyId});

        };
        $scope.cancelNewRule = function(){
            if(typeof $rootScope.previousState !== 'undefined')
                $state.go($rootScope.previousState,{policyId: ruleData.policyId});
            else
                $state.go('home.policy.policylist.threatdetection');

        };
        $rootScope.$on('$stateChangeStart',
            function(event, toState, toParams, fromState, fromParams){
                $rootScope.previousState = fromState;
        });
        function rulePopupController($scope, $mdDialog,policyService,titletext,typeOfData,receivedData) {
            $scope.typeOfData = typeOfData;
            $scope.titletext = titletext;
            $scope.selected = receivedData;
            $scope.items = [];
            $scope.host_activated = false;
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
                    $mdDialog.hide();
            };
            (function(){  
                $scope.no_of_hosts = $scope.items.length;
                
                if ($scope.selected) {
                    $scope.no_of_selected_hosts = $scope.selected.length;
                } else {
                    $scope.no_of_selected_hosts = 0;
                }
                console.log($scope.selected);
                $scope.doneHosts = function() {
                    //$rootScope.$broadcast('listenSelectedHosts', $scope.selected);
                    $mdDialog.hide();
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

    }

    angular.module('shieldxApp').controller('editthreatRuleCtr', editthreatRuleCtrl);
})();
