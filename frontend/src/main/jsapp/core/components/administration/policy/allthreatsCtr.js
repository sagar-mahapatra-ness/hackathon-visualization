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
    function allthreatsCtrl(
        $scope,
        $state,
        $translate,
        $sessionStorage,
        policyService,
        $timeout,
        $q,
        $mdDialog,
        infrastructureConnectorService,
        deploymentSpecificationService,
        filterFilter,
        $filter,
        userSessionMenagment
    ) {
        var deferred = $q.defer();
        $scope.promise = deferred.promise;
        $scope.promiseCompleted = true;
        $scope.threatResponse = [];
        $scope.enabledThreats = 0;
        $scope.policyData = {};
        $scope.differCount = 0;
        $scope.responseSet = {
                            "enabled":false,
                            "enabledNot":false,
                            "logPacket":false,
                            "logPacketNot":false,
                            "alert":false,
                            "alertNot":false,
                            "block":false,
                            "blockNot":false,
                            "notifySMTP":false,
                            "notifySMTPNot":false,
                            "notifySysLog":false,
                            "notifySysLogNot":false
                        };
        /*$scope.disableSavePolicy = true;*/
        $scope.policyselected = [];
        $scope.selected = [];
        $scope.isSearchBarOpen = false;
        $scope.saveupdatepolicyAdd = true;
        $scope.addNewPolicyArray = [];
        $scope.policyname = "";
        $scope.selectAll = false;
        $scope.policyId = $state.params.policyId;
        $scope.query = {
            order: 'name',
            limit: 8,
            page: 1
        };

        var update_id = authorities("policy_update");
        $scope.is_update_policy = userSessionMenagment.isUserAllowd(update_id);
        
        $scope.resetData = function (){
            $scope.responseSet = {
                            "enabled":false,
                            "enabledNot":false,
                            "logPacket":false,
                            "logPacketNot":false,
                            "alert":false,
                            "alertNot":false,
                            "block":false,
                            "blockNot":false,
                            "notifySMTP":false,
                            "notifySMTPNot":false,
                            "notifySysLog":false,
                            "notifySysLogNot":false
                        };
            $scope.threatResponse = [];
            $scope.policyselected =[];
        };
        $scope.openThreatPopup = function(event,policyName,threatReferenceData){
            $mdDialog.show({
                skipHide: true,
                controller: threatRefenceController,
                templateUrl: 'core/components/administration/policy/threatReferenceList.html',
                parent: angular.element(document.body),
                event: event,
                scope: $scope,
                preserveScope: true,
                locals:{'policyName':policyName,'threatReferenceData':threatReferenceData}
            }).then(function() {

            });
        };
        function threatRefenceController($rootScope, $scope, $mdDialog,threatReferenceData,policyName) {
            (function() {
                $scope.items = threatReferenceData;
                $scope.threatName = policyName;
                $scope.cancelDialogue = function() {
                    $mdDialog.hide();
                };
            })();
        }
        $scope.onReorder = function(order){
            $scope.policythreatData =  $filter('orderBy')($scope.policythreatData,order);
        };
        $scope.filterset = {};
        
        policyService.getPolicyDetail("threatpreventionpolicy","policy","severity").then(function(severityData) {
            $scope.severitylevels = severityData;
        }, function(err) {
            console.log("new threat rule error");
        });
        $scope.malwarePolicy = true;
        $scope.malwareselected = [];
        $scope.updateResponse = function(event,responseType,value){
            _.each($scope.policyselected,function(singleThreat){
                singleThreat.threatResponseData.policyId = $scope.policyId;
                var alreadyPresent = _.find($scope.threatResponse,{"protocolId":singleThreat.protocolID,"threatId":singleThreat.threatID});
                if(typeof alreadyPresent !== 'undefined'){
                    alreadyPresent[responseType] = value;
                } else {
                    $scope.threatResponse.push(singleThreat.threatResponseData);
                    $scope.threatResponse[$scope.threatResponse.length - 1][responseType] = value;
                }
            });
            $scope.responseSet[responseType+"Not"] = !value; 
            $scope.responseSet[responseType] = value;
        };
        $scope.getSelectedText = function(receivedData,totalength){
            if(typeof receivedData === 'undefined' || receivedData.length >= totalength)
                return "ALL";
            return receivedData.length + " Selected";
        };
        $scope.clearEdits = function(){
            $scope.resetData();
            $scope.onReorder("name");
            $scope.filterset = {"_status":["Enabled","Disabled"],"severity":["Medium","High","Critical","Low","Fixme"],"protectionType":["SERVER","CLIENT"],"response":["Block-true","Alert-true","Log-true","Block-false","Alert-false","Log-false"],"action":["notifySMTP-true","notifySysLog-true","notifySMTP-false","notifySysLog-false"]};
            $scope.policythreatData = angular.copy($scope.policythreatDataCopy);
        };
        $scope.resetToGlobal = function(){
            var arrayTopass = [];
            $scope.enabledThreats = 0;
            _.each($scope.policythreatData,function(singleThreat){
                var globalResponsePresent = _.find($scope.globalresponseData,{"protocolId":singleThreat.protocolID,"threatId":singleThreat.threatID});
                if(typeof globalResponsePresent !== "undefined"){
                    singleThreat.threatResponseData.enabled = globalResponsePresent.enabled;
                    singleThreat.threatResponseData.alert = globalResponsePresent.alert;
                    singleThreat.threatResponseData.block = globalResponsePresent.block;
                    singleThreat.threatResponseData.logPacket = globalResponsePresent.logPacket;
                    singleThreat.threatResponseData.notifySMTP = globalResponsePresent.notifySMTP;
                    singleThreat.threatResponseData.notifySysLog = globalResponsePresent.notifySysLog;
                    singleThreat.threatResponseData.policyId = $scope.policyId;
                    //singleThreat.threatResponseData.inherited = true;
                    arrayTopass.push(singleThreat.threatResponseData);
                    singleThreat._alertdiff = false;
                    singleThreat._blockdiff = false;
                    singleThreat._logPacketdiff = false;
                    singleThreat._notifySMTPdiff = false;
                    singleThreat._notifySysLogdiff = false;
                    if(singleThreat.threatResponseData.enabled){
                        $scope.enabledThreats++;
                    }
                }
            });
            var dataTosend = {"id":$scope.policyId,"responses":arrayTopass};
            toastparam = {
                    'heading': 'Update of Threats in progress',
                    'subHeading': 'Update of Threats initiated.',
                    'type': 'progress',
                    'timeout': 5000
                };
            showToast(toastparam);
            policyService.updateExistingPolicyData("policy/threatresponses",dataTosend).then(function(responseData){
                $scope.policythreatDataCopy = angular.copy($scope.policythreatData);
                $scope.differCount = 0;
                toastparam = {
                    'heading': 'Update of Threats Completed',
                    'subHeading': 'Threats Updated.',
                    'type': 'success',
                    'timeout': 5000
                };
                showToast(toastparam);
                $scope.resetData();
            });

        };
        $scope.updateEdits = function(){
            var dataTosend = {"id":$scope.policyId,"responses":$scope.threatResponse};
            toastparam = {
                    'heading': 'Update of Threats in progress',
                    'subHeading': 'Update of Threats initiated.',
                    'type': 'progress',
                    'timeout': 5000
                };
            showToast(toastparam);
            policyService.updateExistingPolicyData("policy/threatresponses",dataTosend).then(function(responseData){
                $scope.policythreatDataCopy = angular.copy($scope.policythreatData);
                $scope.differCount = 0;
                $scope.enabledThreats  = 0;
                _.each($scope.policythreatData,function(singleThreat){
                    var globalUpdatedResponse = _.find($scope.globalresponseData,{"protocolId":singleThreat.protocolID,"threatId":singleThreat.threatID});
                    if(typeof globalUpdatedResponse !== "undefined"){
                        if(globalUpdatedResponse.alert === singleThreat.threatResponseData.alert){
                            singleThreat._alertdiff = false;
                        } else {
                            singleThreat._alertdiff = true;
                            $scope.differCount++;
                        }
                        if(globalUpdatedResponse.block === singleThreat.threatResponseData.block){
                            singleThreat._blockdiff = false;
                        } else {
                            singleThreat._blockdiff = true;
                            $scope.differCount++;
                        }
                        if(globalUpdatedResponse.logPacket === singleThreat.threatResponseData.logPacket){
                            singleThreat._logPacketdiff = false;
                        } else {
                            singleThreat._logPacketdiff = true;
                            $scope.differCount++;
                        }
                        if(globalUpdatedResponse.notifySMTP === singleThreat.threatResponseData.notifySMTP){
                            singleThreat._notifySMTPdiff = false;
                        } else {
                            singleThreat._notifySMTPdiff = true;
                            $scope.differCount++;
                        }
                        if(globalUpdatedResponse.notifySysLog === singleThreat.threatResponseData.notifySysLog){
                            singleThreat._notifySysLogdiff = false;
                        } else {
                            singleThreat._notifySysLogdiff = true;
                            $scope.differCount++;
                        }
                        if(singleThreat.threatResponseData.enabled){
                            $scope.enabledThreats++;
                        }
                    }
                });
                $scope.resetData();
                toastparam = {
                    'heading': 'Update of Threats Completed',
                    'subHeading': 'Threats Updated.',
                    'type': 'success',
                    'timeout': 5000
                };
                showToast(toastparam);
            },function(error){
                toastparam = {
                    'heading': 'Update of Threats Failed.',
                    'subHeading': 'Threats failed to update.',
                    'type': 'fail',
                    'timeout': 5000
                };
                showToast(toastparam);
                console.log(error);
            });
        };
        $scope.getCount = function(){
            if(typeof $scope.policythreatData !== "undefined")
                return filterFilter( $scope.policythreatData, $scope.filterset).length;
            else
                return 0;
        };
        policyService.getPolicyDetail("threatpreventionpolicy","policy",$scope.policyId).then(function(threatdata) {
            $scope.policyData = threatdata;
        });
        policyService.getPolicyDetail( $scope.policyId,"policy","threats").then(function(data) {
            $scope.promiseCompleted = false;
                policyService.getPolicyDetail($scope.policyId,"policy","threatresponses").then(function(responseData){
                    data.map(function(currentObj){
                        currentObj.threatResponseData =  _.find(responseData,{"protocolId":currentObj.protocolID,"threatId":currentObj.threatID});
                        currentObj._numthreatID = parseInt(currentObj.threatID);
                        currentObj._numprotocolID = parseInt(currentObj.protocolID);
                        if(typeof currentObj.threatResponseData !== 'undefined'){
                            if(currentObj.threatResponseData.enabled){
                                currentObj._status =  "Enabled";
                                $scope.enabledThreats++;
                            } else {
                                currentObj._status = "Disabled";
                            }
                        }
                        else
                           currentObj._status = "Disabled";
                        /*currentObj._response = parseInt(currentObj.protocolID);*/
                    });
                    policyService.getPolicyDetail("0","policy","threatresponses").then(function(globalresponseData){
                        $scope.globalresponseData = globalresponseData;
                        policyService.getDataBasedOnId("policy","protocol").then(function(protocolData) {
                            _.each(data,function(singleThreat){
                                var globalResponse = _.find(globalresponseData,{"protocolId":singleThreat.protocolID,"threatId":singleThreat.threatID});
                                var matchedProtocol = _.find(protocolData,{"protocolID" : singleThreat.protocolID});
                                
                                if(matchedProtocol)
                                    singleThreat.protocolName = matchedProtocol.protocolName;
                                else
                                    singleThreat.protocolName = "";

                                if(typeof globalResponse !== "undefined"){
                                    if(globalResponse.alert === singleThreat.threatResponseData.alert){
                                        singleThreat._alertdiff = false;
                                    } else {
                                        singleThreat._alertdiff = true;
                                        $scope.differCount++;
                                    }
                                    if(globalResponse.block === singleThreat.threatResponseData.block){
                                        singleThreat._blockdiff = false;
                                    } else {
                                        singleThreat._blockdiff = true;
                                        $scope.differCount++;
                                    }
                                    if(globalResponse.logPacket === singleThreat.threatResponseData.logPacket){
                                        singleThreat._logPacketdiff = false;
                                    } else {
                                        singleThreat._logPacketdiff = true;
                                        $scope.differCount++;
                                    }
                                    if(globalResponse.notifySMTP === singleThreat.threatResponseData.notifySMTP){
                                        singleThreat._notifySMTPdiff = false;
                                    } else {
                                        singleThreat._notifySMTPdiff = true;
                                        $scope.differCount++;
                                    }
                                    if(globalResponse.notifySysLog === singleThreat.threatResponseData.notifySysLog){
                                        singleThreat._notifySysLogdiff = false;
                                    } else {
                                        singleThreat._notifySysLogdiff = true;
                                        $scope.differCount++;
                                    }
                                }
                            });


                            $scope.policythreatData = data;
                            $scope.policythreatDataCopy = angular.copy(data);
                            console.log("threat data is this ",$scope.policythreatData);
                            
                            $scope.getCount();
                            deferred.resolve();
                        });
                    });
                    
            });
            
        }, function(err) {
            console.log("policy error data");
            deferred.reject();
            $scope.promiseCompleted = false;
        });
        


        $scope.toggleSearchBar = function(event) {
            $scope.isSearchBarOpen = $scope.isSearchBarOpen === false ? true : false;
            if ($scope.isSearchBarOpen)
                angular.element(event.currentTarget.firstElementChild).css('color', '#4a90e2');
            else
                angular.element(event.currentTarget.firstElementChild).css('color', '#6d6e71');
        };

        $scope.$on('$viewContentLoaded', function(event){ 
            console.log(event);
            fixContainerHeight(1);
        });

    }

    angular.module('shieldxApp').controller('allthreatsCtr', allthreatsCtrl);
})();
