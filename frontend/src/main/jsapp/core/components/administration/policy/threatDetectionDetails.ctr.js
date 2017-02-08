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
    function threatDetectionDetailCtrl(
        $scope,
        $state,
        $translate,
        $sessionStorage,
        policyService,
        $timeout,
        $q,
        $mdDialog,
        deploymentSpecificationService,
        infrastructureConnectorService,
        commonDataManagement,
        userSessionMenagment
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
        $scope.editpolicyname = false;
        $scope.edittenant = false;
        $scope.allRuleThreats = [];
        $scope.tenantSelected = false;
        var policyObject = $state.params.policyobject;
        var existingrules = $state.params.existingrules;
        $scope.policyId = $state.params.policyId;
        if(typeof $scope.policyId === 'undefined')
            $state.go('home.policy.policylist.threatdetection');

        var policyId = $state.params.policyId ? parseInt($state.params.policyId) : parseInt($state.params.policyobject.policyId);

        $scope.selectedTenantObj = $state.params.tenantData;
        var policyUpdateFailed = {
            'heading': 'Policy Updation Failed',
            'subHeading': '&nbsp;',
            'type': 'fail',
            'timeout': 5000,
            'callback': function () {
                $state.reload();
            }
        };
        var policyUpdateSuccess = {
            'heading': 'Policy Updated Successfully',
            'subHeading': '&nbsp;',
            'type': 'success',
            'timeout': 5000,
            'callback': function () {
                $state.go('home.policy.policylist.threatdetection');
            }
        };
        var policyUpdateProgress = {
            'heading': 'Policy Updation Progress',
            'subHeading': '&nbsp;',
            'type': 'success',
            'timeout': 5000,
            'callback': function () {
                $state.reload();
            }
        };
        
        $scope.editRule = function(singleRule){
            singleRule.action = "edit";
            $state.go('home.policy.addthreatdetectionrule',{'policyobject':{'threatName':$scope.policyDetails.name,'tenantdetails':$scope.selectedTenantObj,'policyId' : policyId,'allthreatCounter':$scope.policyDetails.allthreatCounter,'lastModified':$scope.policyDetails.lastModified},'ruleobject':singleRule,'existingrules':$scope.policyDetails.rules});
        };
        $scope.addthreatRule = function(){
            var  singleRule = {action:"add",id:0};
            $state.go('home.policy.addthreatdetectionrule',{'policyobject':{'threatName':$scope.policyDetails.name,'tenantdetails':$scope.selectedTenantObj ,'policyId' : policyId,'allthreatCounter':$scope.policyDetails.allthreatCounter,'lastModified':$scope.policyDetails.lastModified},'ruleobject':singleRule,'existingrules':$scope.policyDetails.rules});
        };
       /* $scope.getTenantDataForCloud = function(cloudObj) {
            $scope.tenantsList = [];
            deploymentSpecificationService.getTenants(cloudObj.id).then(function(tenants) {
                _.each(tenants, function(tenant) {
                    tenant.cloudName = cloudObj.name;
                    $scope.tenantsList.push(tenant);
                });
            });
        };
        $scope.getTenants = function() {
            infrastructureConnectorService.getListOfInfrastructures().then(function(clouds) {
                _.each(clouds, function(cloud) {
                    $scope.getTenantDataForCloud(cloud);
                });
            });
        };

        $scope.getTenants();*/
        policyService.getTotalTenats().then(function(data){
            $scope.tenantsList = data;
            $scope.tenantsListCompleted = true;
            renderData();
        },function(err){
            console.log("unable to fetch tenants");
            $scope.tenantsListCompleted = true;
            renderData();
        });
        $scope.showAllThreats = function(){
            $state.go('home.policy.viewallthreat',{'policyId':policyId});
        };
        
         $scope.$on('$viewContentLoaded', function(event){ 
                console.log(event);
                fixContainerHeight(1);
        });
    
        var update_id = authorities("policy_update");
        $scope.is_update_policy = userSessionMenagment.isUserAllowd(update_id);
         
        $scope.getStringData = function(appArray,protocolArray){
            var returnString = "";
            if(appArray && appArray.length)
                returnString = appArray.join();
            if(returnString && protocolArray && protocolArray.length)
                returnString += ","+protocolArray.join();
            else if(protocolArray && protocolArray.length)
                returnString = protocolArray.join();
            return returnString;
        };
        $scope.showMoreItemPopUp = function(event,data,name){
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
        if(policyObject && existingrules){
                $scope.policyDetails.name = policyObject.threatName;
                $scope.selectedTenantObj = policyObject.tenantdetails;
                $scope.policyDetails.id = policyId;
                $scope.policyDetails.rules = existingrules;
                $scope.policyDetails.allthreatCounter = policyObject.allthreatCounter;
                $scope.policyDetails.lastModified = policyObject.lastModified;
                $scope.promiseCompleted = false;
                deferred.resolve();
            } else {
                policyService.getPolicyDetail("threatpreventionpolicy","policy",policyId).then(function(threatdata) {
                    $scope.threatDataFromApi = threatdata;
                    $scope.fromPolicyData = true;
                    renderData();
                    /*$scope.policyDetails = threatdata;
                    console.log($scope.policyDetails);
                    $scope.selectedTenantObj = _.find($scope.tenantsList,{"id":$scope.policyDetails.tenantId});
                    $scope.selectedTenantsValue = JSON.stringify($scope.selectedTenantObj); 
                    $scope.tenantSelected = true;
                    policyService.getListOfPoliciesDetails("threats",policyId).then(function(allthreatdata) {
                        console.log("This is all threat data here");
                        console.log(allthreatdata);
                        $scope.allRuleThreats = allthreatdata;
                        $scope.policyDetails.allthreatCounter = $scope.allRuleThreats.length;
                        $scope.promiseCompleted = false;
                        deferred.resolve();
                    }, function(err) {
                        console.log("threat prevention policy error data");
                        deferred.reject();
                        $scope.promiseCompleted = false;
                    });*/
                }, function(err) {
                    console.log("threat prevention policy error data");
                    deferred.reject();
                    $scope.fromPolicyData = true;
                    renderData();
                });
        }
        function renderData(){
            if($scope.fromPolicyData && $scope.tenantsListCompleted) {
                $scope.promiseCompleted = false;
                $scope.policyDetails = $scope.threatDataFromApi;
                console.log($scope.policyDetails);
                $scope.selectedTenantObj = _.find($scope.tenantsList,{"id":$scope.policyDetails.tenantId});
                $scope.selectedTenantsValue = JSON.stringify($scope.selectedTenantObj); 
                $scope.tenantSelected = true;
                policyService.getListOfPoliciesDetails("threats",policyId).then(function(allthreatdata) {
                    console.log("This is all threat data here");
                    console.log(allthreatdata);
                    $scope.allRuleThreats = allthreatdata;
                    $scope.policyDetails.allthreatCounter = $scope.allRuleThreats.length;
                    $scope.promiseCompleted = false;
                    deferred.resolve();
                }, function(err) {
                    console.log("threat prevention policy error data");
                    deferred.reject();
                    $scope.promiseCompleted = false;
                });
            }
        }
        /*$scope.allRuleThreats = dummyData;*/
        function tenantListCtr($scope, $mdDialog, policyService) {
                    $scope.canceltenantDialogue = function() {
                        //tenantSelection();
                        $mdDialog.hide();
                    };
                    //$scope.tenantSelected = false;
                    $scope.tenants = $scope.tenantsList;

                   $scope.onSelectTenantChanged = function() {
                        console.log(" onSelectionChanged >> ");
                        $scope.tenantSelected = true;
                    };
                     $scope.tenantdone = function(value) {
                        $scope.tenantselected = true;
                        $scope.selectedTenantObj = JSON.parse(value);
                        $scope.policyDetailForm.$dirty = true;
                        $mdDialog.hide();
                    };
                }
        $scope.callpopupTenats = function(event) {
                    $scope.edittenant = true;
                    $mdDialog.show({
                        skipHide: true,
                        preserveScope: true,
                        controller: tenantListCtr,
                        bindToController: true,
                        templateUrl: 'core/components/administration/policy/tenants.html',
                        parent: angular.element(document.body),
                        targetEvent: event,
                        fullscreen: false,
                        scope: $scope,
                        openFrom: { top: 1100, height: 0 },
                        closeTo: { left: 1500 }
                    }).then(function() {
                        $scope.edittenant = false;
                    });
                };

        $scope.toggleSearchBar = function(event) {
            $scope.isSearchBarOpen = $scope.isSearchBarOpen === false ? true : false;
            if ($scope.isSearchBarOpen)
                angular.element(event.currentTarget.firstElementChild).css('color', '#4a90e2');
            else
                angular.element(event.currentTarget.firstElementChild).css('color', '#6d6e71');
        };
        
        $scope.deleteRule =function(rule,event){
            $mdDialog.show({
                    controller: confirmDeleteRuleCtr,
                    templateUrl: 'core/components/administration/policy/delete-rule-dialog.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    clickOutsideToClose: true,
                    locals:{
                        rule:rule
                    },
                    skipHide: true,
                    preserveScope: true,
                   
                }).then(function (answerVal) {
                    $scope.deleteRuleFromPolicy(answerVal);
                }, function () {
                    
                });
        };

        function confirmDeleteRuleCtr($scope, $mdDialog,rule){
            $scope.rule = rule;
            $scope.hide = function (rule) {
                $mdDialog.hide(rule);
            };
            $scope.closeDialog = function () {
                $mdDialog.cancel();
            };
            $scope.closeDialogWithAnswer = function () {
                $scope.hide(rule);
            };
        }

            $scope.deleteRuleFromPolicy = function(rule){
               var idx = _.findIndex($scope.policyDetails.rules,rule);
               $scope.policyDetails.rules.splice(idx, 1);
            };
        $scope.updateThreat = function(){
            showToast(policyUpdateProgress);
            console.log($scope.policyDetails);
            var threatMainObj = $scope.policyDetails;
            threatMainObj.isEditable = true;
            threatMainObj.tenantId = $scope.selectedTenantObj.id;
            threatMainObj.lastModified = Math.round(new Date().getTime()/1000);
            policyService.updatePolicyData("policy/threatpreventionpolicy",threatMainObj).then(function(returnData){
                console.log(returnData);
                commonDataManagement.clearData();
                showToast(policyUpdateSuccess);
            },function(error){
                showToast(policyUpdateFailed);
                console.log(error);
            });
        };
        $scope.cancelNewThreat = function(){
            $state.go('home.policy.policylist.threatdetection');
        };
        $scope.openSpecificThreatPopup = function(event,specificThreats){
            $mdDialog.show({
                controller: rulespecificthreatCtr,
                templateUrl: 'core/components/administration/policy/rulespecificthreat.html',                
                parent: angular.element(document.body),
                event: event,
                scope: $scope,
                preserveScope: true,
                fullscreen: true,
                locals:{'policyId':$scope.policyId,'specificThreats':specificThreats}
            }).then(function() {

            });
        };
        function rulespecificthreatCtr($rootScope, $scope, $mdDialog,policyId,specificThreats,filterFilter,$filter,$q) {
            (function() {
                var deferred = $q.defer();
                $scope.promise = deferred.promise;
                $scope.specificThreats = specificThreats;
                $scope.promiseCompleted = true;
                $scope.threatResponse = [];
                $scope.enabledThreats = 0;
                $scope.policyData = {};
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
                $scope.policyId = policyId;
                $scope.query = {
                    order: 'name',
                    limit: 8,
                    page: 1
                };
                $scope.closeDialog = function(){
                    $mdDialog.hide();
                };
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
                    $scope.threatResponse = [];
                    $scope.policyselected =[];
                }
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
                $scope.clearEdits = function(){
                    resetData();
                    $scope.onReorder("name");
                    $scope.filterset = {"_status":["Enabled","Disabled"],"severity":["Medium","High","Critical","Low","Fixme"],"protectionType":["SERVER","CLIENT"],"response":["Block-true","Alert-true","Log-true","Block-false","Alert-false","Log-false"],"action":["notifySMTP-true","notifySysLog-true","notifySMTP-false","notifySysLog-false"]};
                    $scope.policythreatData = angular.copy($scope.policythreatDataCopy);
                };
                $scope.getSelectedText = function(receivedData,totalength){
                    if(typeof receivedData === 'undefined' || receivedData.length == totalength)
                        return "ALL";
                    return receivedData.length + " Selected";
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
                        resetData();
                        $scope.policythreatDataCopy = angular.copy($scope.policythreatData);
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
                        console.log(responseData);
                        var filteredResponse = [];
                        _.each(specificThreats,function(singleSpecific){
                            var currentData = _.find(data,{"protocolID":singleSpecific.protocolID.toString(),"threatID":singleSpecific.threatID.toString()});
                            if(typeof currentData !== 'undefined' ){
                                filteredResponse.push(currentData);
                            }
                        });
                        policyService.getDataBasedOnId("policy","protocol").then(function(protocolData) {
                            filteredResponse.map(function(currentObj){
                                currentObj.threatResponseData =  _.find(responseData,{"protocolId":currentObj.protocolID,"threatId":currentObj.threatID});
                                currentObj._numthreatID = parseInt(currentObj.threatID);
                                currentObj._numprotocolID = parseInt(currentObj.protocolID);
                                var matchedProtocol = _.find(protocolData,{"protocolID" : currentObj.protocolID});
                                
                                if(matchedProtocol)
                                    currentObj.protocolName = matchedProtocol.protocolName;
                                else
                                    currentObj.protocolName = "";
                                
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
                            $scope.policythreatData = filteredResponse;
                            $scope.policythreatDataCopy = angular.copy(filteredResponse);
                            console.log("threat data is this ",$scope.policythreatData);
                            $scope.getCount();
                            deferred.resolve();
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


            })();
        }
    }

    angular.module('shieldxApp').controller('threatDetectionDetailCtr', threatDetectionDetailCtrl);
})();
