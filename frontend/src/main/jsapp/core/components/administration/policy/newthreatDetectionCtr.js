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
    function newthreatDetectionCtrl(
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
        $scope.saveupdatepolicyAdd = true;
        $scope.addNewPolicyArray = [];
        $scope.policyname = "";
        $scope.allRuleThreats = [];
        $scope.policyDetails = {};
        $scope.policyDetails.rules = [];
        var policyobject = $state.params.policyobject;
        var ruleData = $state.params.ruleobject;
        var existingrules = $state.params.existingrules;

        var policyCreateFailed = {
            'heading': 'Policy Creation failed',
            'subHeading': '&nbsp;',
            'type': 'fail',
            'timeout': 5000,
            'callback': function () {
                $state.reload();
            }
        };
        var policyCreateSuccess = {
            'heading': 'Policy Created Successfully',
            'subHeading': '&nbsp;',
            'type': 'success',
            'timeout': 5000
            
        };
        var policyCreateProgress = {
            'heading': 'Policy Create Inprogress',
            'subHeading': '&nbsp;',
            'type': 'success',
            'timeout': 5000
            
        };
        

        $scope.editRule = function(singleRule){
            singleRule.action = "edit";
            $state.go('home.policy.addthreatdetectionrule',{'policyobject':{'threatName':$scope.policyDetails.name,'tenantdetails':$scope.selectedTenantObj },'ruleobject':singleRule,'existingrules':$scope.policyDetails.rules});
        };

        
        if(policyobject){
            $scope.policyDetails.name = policyobject.threatName;
            $scope.selectedTenantObj = policyobject.tenantdetails;
            $scope.tenantSelected = true;
        }
        if(existingrules){
            $scope.policyDetails.rules = existingrules;
        }
         $scope.getTenantDataForCloud = function(cloudObj) {
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
        $scope.getTenants();

        $scope.addNewThreat = function(){
            showToast(policyCreateProgress);
            console.log($scope.policyDetails);
            var threatMainObj = $scope.policyDetails;
            threatMainObj.id = 0;
            threatMainObj.isEditable = true;
            threatMainObj.tenantId = $scope.selectedTenantObj.id;
            threatMainObj.lastModified = Math.round(new Date().getTime()/1000);
            policyService.updateMalwarePolicyData("policy/threatpreventionpolicy",threatMainObj).then(function(returnData){
                console.log(returnData);
                showToast(policyCreateSuccess);
                commonDataManagement.clearData();
                $state.go('home.policy.policylist.threatdetection', { 'newPolicy': returnData });
            },function(error){
                showToast(policyCreateFailed);
                console.log(error);
            });
            console.log(threatMainObj);

        };
        
        $scope.cancelNewThreat = function(){
            $state.go('home.policy.policylist.threatdetection');
        };
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

        $scope.addthreatRule = function(){
            var  singleRule = {action:"add",id:0};
            $state.go('home.policy.addthreatdetectionrule',{'policyobject':{'threatName':$scope.policyDetails.name,'tenantdetails':$scope.selectedTenantObj },'ruleobject':singleRule,'existingrules':$scope.policyDetails.rules});
        };
        function tenantListCtr($scope, $mdDialog, policyService) {
                    $scope.canceltenantDialogue = function() {
                        //tenantSelection();
                        $mdDialog.cancel();
                    };
                    $scope.tenantSelected = false;
                    $scope.tenants = $scope.tenantsList;

                    $scope.$watch("selectedTenantsValue", function(newvalue, oldvalue) {
                        if (newvalue) {
                            $scope.tenantSelected = true;
                            $scope.selectedTenantObj = JSON.parse(newvalue);
                        }

                    });
                    $scope.tenantdone = function() {
                        //tenantSelection();
                        $mdDialog.cancel();
                    };
                }
        $scope.callpopupTenats = function(event) {
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

                    });
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
    }

    angular.module('shieldxApp').controller('newthreatDetectionCtr', newthreatDetectionCtrl);
})();
