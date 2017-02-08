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
    function globalThreatCtrl(
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
        $scope.globalResponse = [];
        $scope.enabledThreats = 0;
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
        $scope.query = {
            order: 'name',
            limit: 8,
            page: 1
        };

        var update_id = authorities("policy_update");
        $scope.is_update_policy = userSessionMenagment.isUserAllowd(update_id);
        
        policyService.getPolicyDetail("threatpreventionpolicy","policy","severity").then(function(severityData) {
            $scope.severitylevels = severityData;
        }, function(err) {
            console.log("new threat rule error");
        });
        function resetData(){
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
            $scope.globalResponse = [];
            $scope.policyselected =[];
        }
        $scope.openThreatPopup = function(event,policyName,threatReferenceData){
            $mdDialog.show({
                skipHide: true,
                controller: threatRefenceController,
                templateUrl: 'core/components/administration/policy/global/threatReferenceList.html',
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
            $scope.globalthreatData =  $filter('orderBy')($scope.globalthreatData,order);
            $scope.policyselected =[];
            $timeout(function(){
                angular.element(document.querySelectorAll(".md-sort.md-active md-icon")).removeClass("ng-hide");
            }, 0);
            
        };
        $scope.filterset = {};
        $scope.threatname = "";
        $scope.multipleFilters = function(threatData,index){
            if($scope.filterset)
                console.log($scope.filterset);
            return true;
        };
        $scope.malwarePolicy = true;
        $scope.malwareselected = [];
        var newPolicyId = parseInt($state.params.newPolicy);
        $scope.updateResponse = function(event,responseType,value){
            _.each($scope.policyselected,function(singleThreat){
                var alreadyPresent = _.find($scope.globalResponse,{"protocolId":singleThreat.protocolID,"threatId":singleThreat.threatID});
                if(typeof alreadyPresent !== 'undefined'){
                    alreadyPresent[responseType] = value;
                } else {
                    $scope.globalResponse.push(singleThreat.threatResponseData);
                    $scope.globalResponse[$scope.globalResponse.length - 1][responseType] = value;
                }
            });
            $scope.responseSet[responseType+"Not"] = !value; 
            $scope.responseSet[responseType] = value;
        };
        $scope.clearEdits = function(){
            resetData();
            $scope.filterset = {"_status":["Enabled","Disabled"],"severity":["Medium","High","Critical","Low","Fixme"],"protectionType":["SERVER","CLIENT"],"response":["Block-true","Alert-true","Log-true","Block-false","Alert-false","Log-false"],"action":["notifySMTP-true","notifySysLog-true","notifySMTP-false","notifySysLog-false"]};
            $scope.globalthreatData = angular.copy($scope.globalthreatDataCopy);
            $scope.onReorder("name");
            //angular.element(document.querySelectorAll(".md-sort.md-active md-icon")).addClass("ng-hide");
            //$scope.globalthreatData =  $filter('orderBy')($scope.globalthreatData,"name");
            $timeout(function(){
                angular.element(document.querySelectorAll(".md-sort.md-active md-icon")).addClass("ng-hide");
            }, 0);
        };
        $scope.updateEdits = function(){
            var dataTosend = {"id":0,"responses":$scope.globalResponse};
            toastparam = {
                    'heading': 'Update of Global Threats in progress',
                    'subHeading': 'Update of Global Threats initiated.',
                    'type': 'progress',
                    'timeout': 5000
                };
            showToast(toastparam);
            policyService.updateExistingPolicyData("policy/threatresponses",dataTosend).then(function(responseData){
                resetData();
                $scope.globalthreatDataCopy = angular.copy($scope.globalthreatData);
                toastparam = {
                    'heading': 'Update of Global Threats Completed',
                    'subHeading': 'Global Threats Updated.',
                    'type': 'success',
                    'timeout': 5000
                };
                showToast(toastparam);
            },function(error){
                toastparam = {
                    'heading': 'Update of Global Threats Failed.',
                    'subHeading': 'Global Threats failed to update.',
                    'type': 'fail',
                    'timeout': 5000
                };
                showToast(toastparam);
                console.log(error);
            });
        };
        $scope.getCount = function(){
            if(typeof $scope.globalthreatData !== "undefined")
                return filterFilter( $scope.globalthreatData, $scope.filterset).length;
            else
                return 0;
        };
        $scope.getSelectedText = function(receivedData,totalength){
            if(typeof receivedData === 'undefined' || receivedData.length >= totalength)
                return "ALL";
            return receivedData.length + " Selected";
        };
        policyService.getPolicyDetail(0 ,"policy","threats").then(function(data) {
            $scope.promiseCompleted = false;
           /* Uncomment when using dummy data
           var dummyArray = [{"alert": true,"block": true,"enabled": true,"id": 14006,"inherited": true,"logPacket": true,"notifySMTP": true,"notifySysLog": true,"policyId": 0,"protocolId": "4","threatId": "9"},{"alert": true,"block": false,"enabled": true,"id": 14007,"inherited": true,"logPacket": true,"notifySMTP": true,"notifySysLog": true,"policyId": 0,"protocolId": "4","threatId": "30"},{"alert": false,"block": true,"enabled": true,"id": 14008,"inherited": false,"logPacket": true,"notifySMTP": false,"notifySysLog": true,"policyId": 0,"protocolId": "2","threatId": "20001"}];*/
            
            //policyService.getDummyData(dummyArray,"policy","threatResponse").then(function(responseData){
                policyService.getPolicyDetail("0","policy","threatresponses").then(function(responseData){
                data.map(function(currentObj){
                    currentObj.threatResponseData =  _.find(responseData,{"protocolId":currentObj.protocolID,"threatId":currentObj.threatID});
                    currentObj._numthreatID = parseInt(currentObj.threatID);
                    currentObj._numprotocolID = parseInt(currentObj.protocolID);
                    if(typeof currentObj.threatResponseData !== 'undefined')
                        if(currentObj.threatResponseData.enabled){
                            currentObj._status =  "Enabled";
                            $scope.enabledThreats++;
                        } else {
                            currentObj._status = "Disabled";
                        }
                    else
                        currentObj._status = "Disabled";
                    /*currentObj._response = parseInt(currentObj.protocolID);*/
                });
                $scope.globalthreatData = data;
                $scope.globalthreatDataCopy = angular.copy(data);
                $scope.onReorder("name");
                $scope.getCount();
                deferred.resolve();
            });
            
        }, function(err) {
            console.log("global policy error data");
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



    }

    angular.module('shieldxApp').controller('globalThreatCtr', globalThreatCtrl);
})();
