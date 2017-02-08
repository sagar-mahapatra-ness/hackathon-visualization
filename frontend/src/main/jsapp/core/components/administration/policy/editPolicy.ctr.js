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
    function editPolicyCtr(
            $stateParams,
            $scope,
            $state,
            policyService,
            $mdDialog,
            $q,
            infrastructureConnectorService,
            userSessionMenagment
            ) {

        var deferred = $q.defer();
        $scope.promise = deferred.promise;

        $scope.$emit('listenHeaderText', {headerText: "Policy"});

        $scope.policyselected = [];

        var policyId = null;
        $scope.policy = null;
        $scope.malwarepolicy = null;
        $scope.accesscontrolpolicy = null;
        $scope.threatpreventionpolicy = null;
        $scope.policyName = null;

        $scope.aclDataRetrieved = false;
        $scope.malwareDataRetrieved = false;
        $scope.threatDetectionDataRetrieved = false;

        var update_id = authorities("policy_update");
        $scope.is_update_policy = userSessionMenagment.isUserAllowd(update_id);

        $scope.malwarepolicyList = [];
        $scope.accesscontrolpolicyList = [];
        $scope.threatpreventionpolicyList = [];

        $scope.updatePolicyName = function (policyName) {
            $scope.$emit("listenPolicyChange", policyName, "name");
        };


        $scope.setEditMode = function (key, value) {
            if (!key) {
                $scope.editPolicyName = false;
                $scope.editTenant = false;
                $scope.editACLPolicy = false;
                $scope.editMalwarePolicy = false;
                $scope.editThreatPolicy = false;
            } else {
                $scope[key] = value;
            }
        };

        var policyIdSet = ($stateParams && $stateParams.policyId) ? parseInt($stateParams.policyId) : null;

        if (policyIdSet) {
            policyId = $stateParams.policyId;
            policyService.getPolicyDetail("securitypolicyset", "policy", policyId).then(function (data) {
                $scope.policy = data;
                $scope.policyName = angular.copy($scope.policy.name);
                $q.all([
                    policyService.getPolicyDetail("malwarepolicy", "policy", data.malwarePolicyId).then(function (data) {
                        console.log(data);
                        $scope.malwarepolicy = data;
                    }),
                    policyService.getListOfPoliciesDetails("malwarepolicy", "policy").then(function (data) {
                        console.log(data);
                        $scope.malwareDataRetrieved = true;
                        $scope.malwarepolicyList = data;
                    }),
                    policyService.getPolicyDetail("accesscontrolpolicy", "policy", data.accessControlPolicyId).then(function (data) {
                        console.log(data);
                        $scope.accesscontrolpolicy = data;
                    }),
                    policyService.getListOfPoliciesDetails("accesscontrolpolicy", "policy").then(function (data) {
                        console.log(data);
                        $scope.aclDataRetrieved = true;
                        $scope.accesscontrolpolicyList = data;
                    }),
                    policyService.getPolicyDetail("threatpreventionpolicy", "policy", data.threatPreventionPolicyId).then(function (data) {
                        console.log(data);
                        $scope.threatpreventionpolicy = data;
                    }),
                    policyService.getListOfPoliciesDetails("threatpreventionpolicy", "policy").then(function (data) {
                        $scope.threatDetectionDataRetrieved = true;
                        console.log(data);
                        $scope.threatpreventionpolicyList = data;
                    })
                ]).then(function () {
                    deferred.resolve();
                });


                var d = new Date(data.lastModified);
                $scope.policy.modifiedDate = d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear();

                policyService.getDataBasedOnId("infras", data.tenantId + "/tenants", "").then(function(tenants) {
                    _.each(tenants, function(tenant) {
                        $scope.selectedTenantObj = tenant;
                    });
                });

            }, function (err) {
                console.log("policy error data");
                deferred.reject();
                $scope.promiseCompleted = false;
            });

            $scope.clearPolicy = function (policytype) {
                if (typeof $scope.policy[policytype] !== "undefined") {
                   // delete($scope.policy[policytype]);
                    $scope.$emit("listenPolicyChange", undefined, policytype);
                }
            };

            $scope.$on('listenPolicyChange', function (event, paramValue, paramtype) {

                var policy = {};

                policy.accessControlPolicyId = angular.copy($scope.policy.accessControlPolicyId);
                policy.threatPreventionPolicyId = angular.copy($scope.policy.threatPreventionPolicyId);
                policy.malwarePolicyId = angular.copy($scope.policy.malwarePolicyId);
                policy.id = angular.copy($scope.policy.id);
                policy.name = angular.copy($scope.policy.name);
                policy.tenantId = angular.copy($scope.policy.tenantId);

                switch (paramtype) {
                    case "accessControlPolicyId":
                        policy.accessControlPolicyId = paramValue;
                        break;
                    case "malwarePolicyId":
                        policy.malwarePolicyId = paramValue;
                        break;
                    case "threatPreventionPolicyId":
                        policy.threatPreventionPolicyId = paramValue;
                        break;
                    case "name":                        
                        policy.name = paramValue;                        
                        break;
                    case "tenantId":
                        policy.tenantId = paramValue;
                        break;
                    default:
                }
                $scope.updatePolicySet(policy);
            });

            $scope.updatePolicySet = function (policy) {
                var d = new Date();
                var n = d.getTime();

                var startPolicyUpdate = {
                    'heading': 'Security Policy Update Started',
                    'subHeading': 'Security Policy Update Started.',
                    'type': 'progress',
                    'timeout': 5000
                };
                var policyUpdated = {
                    'heading': 'Security Policy Updated',
                    'subHeading': 'Security Policy Updated.',
                    'type': 'success',
                    'timeout': 5000,
                    'callback': function () {
                        $state.reload();
                    }
                };
                var policyUpdateFailed = {
                    'heading': 'Security Policy Update Failed',
                    'subHeading': 'Security Policy Update Failed.',
                    'type': 'fail',
                    'timeout': 5000,
                    'callback': function () {
                        $state.reload();
                    }
                };

                var param = {};

                param.lastModified = n;
                param.name = policy.name;
                param.tenantId = policy.tenantId;
                param.id = parseInt($stateParams.policyId,10);

                if (policy.accessControlPolicyId) {
                    param.accessControlPolicyId = policy.accessControlPolicyId;
                }

                if (policy.malwarePolicyId) {
                    param.malwarePolicyId = policy.malwarePolicyId;
                }

                if (policy.threatPreventionPolicyId) {
                    param.threatPreventionPolicyId = policy.threatPreventionPolicyId;
                }

                showToast(startPolicyUpdate);
                policyService.updatePolicyData("policy/securitypolicyset/", param).then(function (data) {
                    console.log(data);
                    console.log(data);
                    showToast(policyUpdated);
                }, function (err) {
                    console.log(err);
                    showToast(policyUpdateFailed);
                });
            };

        }

        $scope.updatePolicy = function () {
            alert("updatePolicy called");
            $scope.setEditMode();
        };


        $scope.callAccessControlPopup = function (accesscontrolpolicy, aclDataRetrieved, accesscontrolpolicyList, ev, selectedid) {
            $mdDialog.show({
                controller: accessControlPopupController,
                templateUrl: 'core/components/administration/policy/policy.accesscontrolPopup.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                locals: {'accesscontrolpolicy': accesscontrolpolicy,
                    'aclDataRetrieved': aclDataRetrieved,
                    'accesscontrolpolicyList': accesscontrolpolicyList}
            }).then(function () {
//                        console.log($scope.selectedTenants);
//                        $sessionStorage.cloudData.selectedTenants = $scope.selectedTenants;
//                        console.log($sessionStorage.cloudData.selectedTenants);
            });
        };

        function accessControlPopupController($rootScope, $scope, $mdDialog, accesscontrolpolicy, aclDataRetrieved, accesscontrolpolicyList) {
//            $scope.tenant_activated = true;
//            if (!$sessionStorage.cloudData.selectedTenants) {
//                $sessionStorage.cloudData.selectedTenants = {};
//            }
            (function () {
                $scope.accesscontrolpolicy = $scope.selectedPolicy = accesscontrolpolicy;
                $scope.aclDataRetrieved = aclDataRetrieved;
                $scope.accesscontrolpolicyList = accesscontrolpolicyList;
                $scope.cancelDialog = function () {
                    $mdDialog.cancel();
                };

                $scope.done = function () {
                    console.log($scope.selectedPolicy);
                    $rootScope.$broadcast('listenPolicyChange', parseInt($scope.selectedPolicy), 'accessControlPolicyId');
//                    $rootScope.$broadcast('listenSelectedHosts', $scope.selected);
                    $mdDialog.hide();
                };
            })();

        }
        $scope.callMalwarePopup = function (malwarepolicy, malwareDataRetrieved, malwarepolicyList, ev) {
            $mdDialog.show({
                controller: malwarePopupController,
                templateUrl: 'core/components/administration/policy/policy.malwarePopup.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                locals: {'malwarepolicy': malwarepolicy,
                    'malwareDataRetrieved': malwareDataRetrieved,
                    'malwarepolicyList': malwarepolicyList}
            })
                    .then(function () {
//                        console.log($scope.selectedTenants);
//                        $sessionStorage.cloudData.selectedTenants = $scope.selectedTenants;
//                        console.log($sessionStorage.cloudData.selectedTenants);
                    });
        };

        function malwarePopupController($rootScope, $scope, $mdDialog, malwarepolicy, malwareDataRetrieved, malwarepolicyList) {
//            $scope.tenant_activated = true;
//            if (!$sessionStorage.cloudData.selectedTenants) {
//                $sessionStorage.cloudData.selectedTenants = {};
//            }
            (function () {
                $scope.malwarepolicy = malwarepolicy;
                $scope.malwareDataRetrieved = malwareDataRetrieved;
                $scope.malwarepolicyList = malwarepolicyList;
                $scope.selectedPolicy = malwarepolicy;

                $scope.cancelDialog = function () {
                    $mdDialog.cancel();
                };

                $scope.done = function () {
                    console.log($scope.selectedPolicy);
                    $rootScope.$broadcast('listenPolicyChange', parseInt($scope.selectedPolicy), 'malwarePolicyId');
                    $mdDialog.hide();
                };
            })();

        }
        $scope.callThreatDetectionPopup = function (threatpreventionpolicy, threatDetectionDataRetrieved, threatpreventionpolicyList, ev) {
            $mdDialog.show({
                controller: threatDetectionPopupController,
                templateUrl: 'core/components/administration/policy/policy.threatDetectionPopup.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                locals: {'threatpreventionpolicy': threatpreventionpolicy,
                    'threatDetectionDataRetrieved': threatDetectionDataRetrieved,
                    'threatpreventionpolicyList': threatpreventionpolicyList}
            })
                    .then(function () {
//                        console.log($scope.selectedTenants);
//                        $sessionStorage.cloudData.selectedTenants = $scope.selectedTenants;
//                        console.log($sessionStorage.cloudData.selectedTenants);
                    });
        };

        function threatDetectionPopupController($rootScope, $scope, $mdDialog, threatpreventionpolicy, threatDetectionDataRetrieved, threatpreventionpolicyList) {
//            $scope.tenant_activated = true;
//            if (!$sessionStorage.cloudData.selectedTenants) {
//                $sessionStorage.cloudData.selectedTenants = {};
//            }
            (function () {
                $scope.threatpreventionpolicy = threatpreventionpolicy;
                $scope.threatDetectionDataRetrieved = threatDetectionDataRetrieved;
                $scope.threatpreventionpolicyList = threatpreventionpolicyList;
                $scope.selectedPolicy = threatpreventionpolicy;
                $scope.cancelDialog = function () {
                    $mdDialog.cancel();
                };

                $scope.done = function () {
                    console.log($scope.selectedPolicy);
                    $rootScope.$broadcast('listenPolicyChange', parseInt($scope.selectedPolicy), 'threatPreventionPolicyId');
//                    $rootScope.$broadcast('listenSelectedHosts', $scope.selected);
                    $mdDialog.hide();
                };
            })();

        }

        $scope.editTenantPopUp = function(event,selectedtenant) {
            $scope.setEditMode('editTenant', true);
            $mdDialog.show({
                skipHide: true,
                preserveScope: true,
                controller: tenantListCtr,
                bindToController: true,
                templateUrl: 'core/components/administration/policy/tenants-dialogbox.html',
                parent: angular.element(document.body),
                targetEvent: event,
                fullscreen: false,
                scope: $scope,
                openFrom: { top: 1100, height: 0 },
                closeTo: { left: 1500 },
                locals: {'selectedtenant': selectedtenant}
            }).then(function() {

            });
        };

        function tenantListCtr($rootScope, $scope, $mdDialog, policyService,selectedtenant) {
            $scope.tenantselected = false;
            $scope.selectedTenantsValue = selectedtenant;

            $scope.canceltenantDialogue = function() {
                $mdDialog.cancel();
            };
            $scope.tenantSelected = false;
            $scope.tenants = $scope.tenantsList;
            $scope.onSelectTenantChanged = function() {
                console.log(" onSelectionChanged >> ");
                $scope.tenantSelected = true;
            };
            $scope.tenantdone = function(value) {
                $scope.tenantselected = true;
                if($scope.selectedTenantsValue){
                 var fo =  _.find($scope.tenants, function(sel){
                     return sel.id === parseInt($scope.selectedTenantsValue);
                  });
                 
                 if(fo){
                  $scope.selectedTenantObj = fo;  
                  $rootScope.$broadcast('listenPolicyChange', $scope.selectedTenantObj.id, 'tenantId');
                 }
                  
                }

                /*$scope.selectedTenantObj = JSON.parse(value);
                $rootScope.$broadcast('listenPolicyChange', parseInt($scope.selectedTenantObj.id), 'tenantId');*/
                $mdDialog.hide();
            };
        }


        $scope.getTenantDataForCloud = function(cloudObj) {
            $scope.tenantsList = [];
             policyService.getDataBasedOnId("infras", cloudObj.id + "/tenants", "").then(function(tenants) {
                _.each(tenants, function(tenant) {
                    tenant.cloudName = cloudObj.name;
                    $scope.tenantsList.push(tenant);
                });
                $scope.cloudsLength = $scope.cloudsLength -1;
                if($scope.cloudsLength === 0){
                    $scope.tennatsListCompleted = false;    
                }
            });
        };
        $scope.getTenants = function() {
            infrastructureConnectorService.getListOfInfrastructures().then(function(clouds) {
                $scope.cloudsLength = clouds.length;
                _.each(clouds, function(cloud) {
                    $scope.getTenantDataForCloud(cloud);
                });
            });
        };
        $scope.getTenants();
        $scope.$on('$viewContentLoaded', function(event){ 
            console.log(event);
            fixContainerHeight(1);
        });


    }

    angular.module('shieldxApp').controller('editPolicyCtr', editPolicyCtr);
})();
