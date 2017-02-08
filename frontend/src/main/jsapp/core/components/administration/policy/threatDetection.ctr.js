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
    function threatDetectionCtrl(
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
        commonDataManagement
    ) {
        commonDataManagement.clearData();
        var deferred = $q.defer();
        $scope.promise = deferred.promise;
        $scope.promiseCompleted = true;
        $scope.disableSavePolicy = true;
        var initializing = true;
        $scope.policyselected = [];
        $scope.malwareAddForm = [];
        $scope.isSearchBarOpen = false;
        $scope.selected = [];
        //$scope.threatList = [];
        $scope.saveupdatepolicyAdd = true;
        $scope.addNewPolicyArray = [];
        $scope.policyname = "";
        //var paramId = parseInt($state.params.policyId);
        var newPolicyId = parseInt($state.params.newPolicy);
        var DuplicatedPolicy = $state.params.duplicated; 
        //$scope.dataUpdated = false;
        
        var policyDeleteFailed = {
            'heading': 'Policy Delete failed',
            'subHeading': '&nbsp;',
            'type': 'fail',
            'timeout': 5000
            
        };
        var policyDeleteSuccess = {
            'heading': 'Policy Deleted Successfully',
            'subHeading': '&nbsp;',
            'type': 'success',
            'timeout': 5000,
            
        };
        var policyDeleteProgress = {
            'heading': 'Policy Deleted Inprogress',
            'subHeading': '&nbsp;',
            'type': 'progress',
            'timeout': 5000
            
        };
         var policyCreateProgress = {
            'heading': 'Policy Create Inprogress',
            'subHeading': '&nbsp;',
            'type': 'progress',
            'timeout': 5000
            
        };
        var policyCreateFailed = {
            'heading': 'Policy Creation failed',
            'subHeading': '&nbsp;',
            'type': 'fail',
            'timeout': 5000
            
        };
        var policyCreateSuccess = {
            'heading': 'Policy Created Successfully',
            'subHeading': '&nbsp;',
            'type': 'success',
            'timeout': 5000
            
        };

         policyService.getTotalTenats().then(function(data){
            $scope.tenantsList = data;
            $scope.tenantsListCompleted = true;
            renderData();
        },function(err){
            console.log("unable to fetch tenants");
            $scope.tenantsListCompleted = true;
            renderData();
        });
        $scope.openGroups = function(event,policyName){
            $scope.assignmentPolicyName = policyName;
            $mdDialog.show({
                skipHide: true,
                controller: assignmentCountCtrl,
                bindToController: true,
                preserveScope: true,
                templateUrl: 'core/components/administration/policy/res-group-list.html',
                parent: angular.element(document.body),
                targetEvent: event,
                fullscreen: true,
                scope: $scope,
                openFrom: { top: 1100, height: 0 },
                closeTo: { left: 1500 }
            }).then(function() {

            });

        };
        function assignmentCountCtrl(){
            $scope.isAGSearchBarOpen = false;
             $scope.cancelassignmentControlDialogue = function() {
                    $mdDialog.cancel();
                    //$state.reload();
             };
             $scope.toggleSearchBarAsignment = function(event) {
                $scope.isAGSearchBarOpen = $scope.isAGSearchBarOpen === false ? true : false;
                if ($scope.isAGSearchBarOpen)
                    angular.element(event.currentTarget.firstElementChild).css('color', '#4a90e2');
                else
                    angular.element(event.currentTarget.firstElementChild).css('color', '#6d6e71');
            };
        }
        $scope.duplicateThreat = function(singleThreat){
            var newThreatObj = angular.copy(singleThreat);
            newThreatObj.id = 0;
            _.each(newThreatObj.rules,function(rule){
                rule.id = 0;
            });
            newThreatObj.name = singleThreat.name + " copy";
            showToast(policyCreateProgress);
            policyService.updateMalwarePolicyData("policy/threatpreventionpolicy",newThreatObj).then(function(returnData){
                console.log(returnData);
                $scope.newthreatCreated = returnData;
                showToast(policyCreateSuccess);
                commonDataManagement.clearData();
            },function(error){
                showToast(policyCreateFailed);
                console.log(error);
            }).finally(function(){
                $state.go('home.policy.policylist.threatdetection', { 'newPolicy': $scope.newthreatCreated,'duplicated':'d' });
            });

        };
        function renderData(){
            policyService.getListOfPoliciesDetails("threatpreventionpolicy","policy").then(function(threatdata) {
                    $scope.threatList = [];
                    $scope.intialThreatData = [];
                    _.each(threatdata,function(singleThreat){
                        singleThreat.tenantData = _.find($scope.tenantsList, {"id": parseInt(singleThreat.tenantId)});
                        if (singleThreat.id === newPolicyId) {
                               if(DuplicatedPolicy !== ''){
                                    singleThreat.duplicatedPolicy = true;
                                }else{
                                    singleThreat.newPolicy = true;    
                                }
                                $scope.intialThreatData.unshift(singleThreat);
                            } else {
                                $scope.intialThreatData.push(singleThreat);
                            }
                        
                        $scope.threatList.push(singleThreat);
                    });
                    //$scope.threatList = tempList;
                    $scope.promiseCompleted = false;
                    //$scope.threatList = threatdata;
                    console.log($scope.threatList);
                    //$scope.threatList = threatdata;
                    deferred.resolve();
                }, function(err) {
                    console.log("threat prevention policy error data");
                    deferred.reject();
                    $scope.promiseCompleted = false;
                });
            }
        //}
        $scope.$emit('listenHeaderText', { headerText: "Policy" });
        //$scope.malwarePolicyBasedId = policyService.getDataBasedOnId(paramId, "malwarepolicy");
        /*.then(function (data) {
            $scope.malwarepolicystoredData = data;
        });*/
        //$scope.malwarepolicystoredData = $sessionStorage.infrastructureObj[0].malwarepolicy;
        function confirmDeletePolicyCtr($scope, $mdDialog,policy){
        console.log("  confirmDeletePolicyCtr ",policy);
        $scope.policy = policy;
        $scope.hide = function (policy) {
            $mdDialog.hide(policy);
        };
        $scope.closeDialog = function () {
            $mdDialog.cancel();
        };
        $scope.closeDialogWithAnswer = function () {
            $scope.hide(policy);
        };
    }
       /* $scope.deleteThreat = function(policy,event){
            $mdDialog.show({
                    controller: confirmDeletePolicyCtr,
                    templateUrl: 'core/components/administration/policy/delete-threat-dialog.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    clickOutsideToClose: true,
                    locals:{
                        policy:policy
                    },
                    skipHide: true,
                    preserveScope: true,
                   
                }).then(function (answerVal) {
                    $scope.deletePolicy(answerVal);
                }, function () {
                    
                });
            };*/

            $scope.deletePolicy = function(policy){
               showToast(policyDeleteProgress);
            policyService.deletePolicyBasedOnID("policy/threatpreventionpolicy",policy.id).then(function(responseData){
                showToast(policyDeleteSuccess);
            },function(error){
                showToast(policyDeleteFailed);
                console.log("Error while deleting data");
            }).finally(function(){
                $state.reload();
            });
            };

        
        $scope.toggleSearchBar = function(event) {
            $scope.isSearchBarOpen = $scope.isSearchBarOpen === false ? true : false;
            if ($scope.isSearchBarOpen)
                angular.element(event.currentTarget.firstElementChild).css('color', '#4a90e2');
            else
                angular.element(event.currentTarget.firstElementChild).css('color', '#6d6e71');
        };

    }

    angular.module('shieldxApp').controller('threatDetectionCtr', threatDetectionCtrl);
})();
