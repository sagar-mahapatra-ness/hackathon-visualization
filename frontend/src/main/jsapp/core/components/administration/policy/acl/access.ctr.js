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
        function accessPolicyCtrl(
            $scope,
            $state,
            $translate,
            $sessionStorage,
            policyService,
            $timeout,
            $q,
            $mdDialog,
            infrastructureConnectorService
        ) {
            var deferred = $q.defer();
            $scope.promise = deferred.promise;
            $scope.promiseCompleted = true;
            $scope.policyselected = [];
            $scope.query = {
                order: 'name',
                limit: 10,
                page: 1
            };
            $scope.isSearchBarOpen = false;
            $scope.saveupdatepolicyAdd = true;
            $scope.modeValue = "add_mode";
            $scope.$on("listenAclPolicyData", function(event, data) {
                $scope.aclRules = data.data;
                $scope.saveupdatepolicyAdd = false;
            });
            $scope.resGroupTotalList = [];
            var newPolicyId = parseInt($state.params.newPolicy);
            var DuplicatedPolicy = $state.params.duplicated;
            $scope.tenantsList = [];
            $scope.tenantsListCompleted = false;
            $scope.resListCompleted = false;
            $scope.aclPolicyListPromise = false;
            policyService.getTotalTenats().then(function(data){
                    $scope.tenantsList = data;
                    $scope.tenantsListCompleted = true;
                    renderData();
            },function(err) {
                $scope.tenantsListCompleted = true;
                console.log("unable to fetch tenants");
                renderData();
            });

            /* policyService.getResourceGroupData().then(function(data){
                $scope.totalResGroupTotalList = data;
                $scope.resListCompleted = true;
             },function(err){
                $scope.resListCompleted = true;
                console.log("unable to fetch Resource Groups")
             });*/
            policyService.getDataBasedOnId("policy", "accesscontrolpolicy").then(function(data) {
                   /*  _.each(data,function(item){
                        var d = new Date(item.lastModified);
                        item.modifiedDate = d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear();
                    });*/
                    $scope.aclPolicyTotalData = data;
                    $scope.aclPolicyListPromise = true;
                    deferred.resolve();
                    renderData();
                },function(err) {
                    console.log("Access Control policy error data");
                    deferred.reject();
                    $scope.aclPolicyListPromise = true;
                    renderData();
                
            }); 

            function renderData(){
                if($scope.aclPolicyListPromise && $scope.tenantsListCompleted){
                    $scope.accessPolicyData = [];
                    $scope.promiseCompleted = false;
                    _.each($scope.tenantsList, function(value) {
                        for (var i = 0; i < $scope.aclPolicyTotalData.length; i++) {
                            if ($scope.aclPolicyTotalData[i].tenantId === value.id) {
                                $scope.aclPolicyTotalData[i].tenantName = value.name;
                            }
                        }
                    });
                    if (newPolicyId) {
                        _.each($scope.aclPolicyTotalData, function(value, key) {
                            if (value.id === newPolicyId) {
                                if (DuplicatedPolicy !== '') {
                                    value.duplicatedPolicy = true;
                                } else {
                                    value.newPolicy = true;
                                }
                                $scope.accessPolicyData.unshift(value);
                            } else {
                                $scope.accessPolicyData.push(value);
                            }
                        });
                    } else {
                        $scope.accessPolicyData = $scope.aclPolicyTotalData;
                    }
                }
            }


            $scope.deleteaccessPolicy = function(data) {
                        toastparam = {
                            'heading': 'Access Control Policy delete inprogress',
                            'subHeading': 'Access Control Policy delete Intiated with name ' + data.name,
                            'type': 'progress',
                            'timeout': 15000
                        };
                        showToast(toastparam);
                        policyService.deletePolicyBasedOnID("policy/accesscontrolpolicy", data.id).then(function(res) {
                            toastparam = {
                                'heading': 'Access Control Policy deleted  Successfully',
                                'subHeading': 'Access Control Policy deleted with name ' + data.name,
                                'type': 'success',
                                'timeout': 5000
                            };
                            showToast(toastparam);
                        }, function(err) {
                            toastparam = {
                                'heading': 'Access Control Policy delete  failed',
                                'subHeading': 'Access Control Policy delete failed with error ' + err.message,
                                'type': 'fail',
                                'timeout': 5000
                            };
                            showToast(toastparam);
                        }).finally(function() {
                            $state.reload();
                        });

                };
                $scope.showResourceGroupData = function(event,data){
                    $scope.assignmentPolicyName = data;
                    $mdDialog.show({
                        skipHide: true,
                        controller: resGroupListCtrl,
                        bindToController: true,
                        preserveScope: true,
                        templateUrl: 'core/components/administration/policy/res-group-list.html',
                        parent: angular.element(document.body),
                        targetEvent: event,
                        fullscreen: false,
                        scope: $scope,
                        openFrom: { top: 1100, height: 0 },
                        closeTo: { left: 1500 }
                    }).then(function() {

                    });

                };
                function resGroupListCtrl($scope,$mdDialog){
                    $scope.isAGSearchBarOpen = false;
                    $scope.cancelassignmentControlDialogue = function() {
                            $mdDialog.cancel();
                            //$state.reload();
                    };
             /*       _.each($scope.aclRulesData,function(aclrules){
                        if(aclrules.destinationResourceGroupList.length>0){
                            aclrules.resourcegroupNames = [];
                            _.each(aclrules.destinationResourceGroupList,function(value){
                                     var resgroup = _.find($scope.totalResGroupTotalList, function(resGroup) {
                                            return resGroup.id === value;
                                        });
                                        if (resgroup) {
                                            aclrules.resourcegroupNames.push(resgroup.name);
                                        }
                            });
                        }
                    });*/
                    $scope.toggleSearchBarAsignment = function(event) {
                    $scope.isAGSearchBarOpen = $scope.isAGSearchBarOpen === false ? true : false;
                    if ($scope.isAGSearchBarOpen)
                        angular.element(event.currentTarget.firstElementChild).css('color', '#4a90e2');
                    else
                        angular.element(event.currentTarget.firstElementChild).css('color', '#6d6e71');
                };

                }

                $scope.callpopupToAddNewAccess = function(eve) {
                    $scope.tenantselected = false;
                    $scope.policyname = '';
                    //$scope.selectedTenantObj = '';
                    $scope.selectedTenantsValue = '';
                    var ImplicitDenyAllData = [{"action":"DENY",
                        "description":"ImplicitDenyAll",                                    
                        "destinationApps":"Any",
                        "destinationCidrs":"Any",
                        "destinationPortRanges":"Any",
                        "destinationProtocol":null,
                        "destinationResourceGroupList":[],
                        "resourcegroupNames":[],
                        "enabled":true,
                        "enableTLSInspection":false,
                        "id":0,
                        "name":"ImplicitDenyAll",
                        "orderNum":1}];
                    $scope.aclPolicyData = ImplicitDenyAllData;
                    $mdDialog.show({
                        skipHide: true,
                        controller: policyListACLTypeCtr,
                        bindToController: true,
                        preserveScope: true,
                        templateUrl: 'core/components/administration/policy/acl/new-acl-policy.html',
                        parent: angular.element(document.body),
                        targetEvent: eve,
                        fullscreen: true,
                        scope: $scope,
                        openFrom: { top: 1100, height: 0 },
                        closeTo: { left: 1500 }
                    }).then(function() {

                    });
                };

                function policyListACLTypeCtr($rootScope, $scope, $mdDialog) {
                    (function() {
                        $scope.cancelNewPolicyDialogue = function() {
                            $mdDialog.cancel();
                            //$state.reload();
                        };
                        $scope.callUpdatePolicyData = function(data) {
                            //console.log($scope.addNewPolicyArray);
                            $mdDialog.cancel();
                            var objData = {};
                            objData.aclRules = $scope.aclRules;
                            objData.id = 0;
                            objData.name = $scope.policyname;
                            objData.tenantId = $scope.selectedTenantObj.id;
                            toastparam = {
                                'heading': 'Access Control Policy creation inprogress',
                                'subHeading': 'Access Control Policy creation Intiated with name ' + objData.name,
                                'type': 'progress',
                                'timeout': 15000
                            };
                            showToast(toastparam);
                            var path = "policy/accesscontrolpolicy";
                            policyService.updateMalwarePolicyData(path, objData).then(function(data) {
                                // console.log(data);
                                $scope.policyCreated = data;
                                toastparam = {
                                    'heading': 'Access Control Policy Created Successfully',
                                    'subHeading': 'New Access Control Policy Created with name ' + objData.name,
                                    'type': 'success',
                                    'timeout': 5000
                                };
                                showToast(toastparam);

                            }, function(err) {
                                toastparam = {
                                    'heading': 'Access Control Policy creation  failed',
                                    'subHeading': 'Access Control creation Policy failed ' + err.message,
                                    'type': 'fail',
                                    'timeout': 5000
                                };
                                showToast(toastparam);
                                //concole.log(data);
                            }).finally(function() {
                                //$state.reload();
                                $state.go('home.policy.policylist.accesscontrol', { 'newPolicy': $scope.policyCreated });
                            });
                        };
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

                        function tenantListCtr($scope, $mdDialog, policyService) {
                            //$scope.tenantselected = false;
                            // $scope.selectedTenantsValue = '';
                            $scope.canceltenantDialogue = function() {
                                //tenantSelection();
                                $mdDialog.cancel();
                            };
                            $scope.tenants = $scope.tenantsList;
                            $scope.onSelectTenantChanged = function() {
                                console.log(" onSelectionChanged >> ");
                                $scope.tenantSelected = true;
                            };
                            $scope.tenantdone = function(value) {
                                $scope.tenantselected = true;
                                $scope.selectedTenantObj = JSON.parse(value);
                                $mdDialog.hide();
                            };
                        }
                    })();
                }
                $scope.callDuplicatePolicy = function(data) {
                    var copyData = angular.copy(data);
                    copyData.id = 0;
                    copyData.name = copyData.name + ' copy';
                    _.each(copyData.aclRules, function(val) {
                        val.id = 0;
                    });
                    var date = new Date();
                    copyData.lastModified = date.getTime();
                    // POST /shieldxapi/policy/accesscontrolpolicy
                    var path = "policy/accesscontrolpolicy";
                    toastparam = {
                        'heading': 'Access Control Policy creation inprogress',
                        'subHeading': 'Access Control Policy creation Intiated with name ' + copyData.name,
                        'type': 'progress',
                        'timeout': 15000
                    };
                    showToast(toastparam);
                    policyService.updateMalwarePolicyData(path, copyData).then(function(data) {
                        $scope.policyCreated = data;
                        toastparam = {
                            'heading': 'Access Control Policy Created Successfully',
                            'subHeading': 'New Access Control Policy Created with name ' + copyData.name,
                            'type': 'success',
                            'timeout': 5000
                        };
                        showToast(toastparam);

                    }, function(err) {
                        toastparam = {
                            'heading': 'Access Control Policy create failed',
                            'subHeading': 'Access Control Policy create failed with ' + err.message,
                            'type': 'fail',
                            'timeout': 5000
                        };
                        showToast(toastparam);

                    }).finally(function() {
                        $state.go('home.policy.policylist.accesscontrol', { 'newPolicy': $scope.policyCreated, 'duplicated': 'new' });
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

            angular.module('shieldxApp').controller('accessPolicyCtr', accessPolicyCtrl);
        })();
