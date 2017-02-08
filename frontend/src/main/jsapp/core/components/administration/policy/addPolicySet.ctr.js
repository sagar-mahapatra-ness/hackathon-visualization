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
    function addPolicySetCtr(
            $scope,
            $q,
            policyService,
            $mdDialog,
            $state,
            infrastructureConnectorService,
            $rootScope
            ) {

        $scope.$emit('listenHeaderText', {headerText: "Policy"});

        var deferred = $q.defer();
        $scope.promise = deferred.promise;

        $scope.malwarepolicy = null;
        $scope.accesscontrolpolicy = null;
        $scope.threatpreventionpolicy = null;
        $scope.policyName = null;
        $scope.showSPSCreationProgress = false;
        $scope.aclDataRetrieved = false;
        $scope.malwareDataRetrieved = false;
        $scope.threatDetectionDataRetrieved = false;


        $scope.malwarepolicyList = [];
        $scope.accesscontrolpolicyList = [];
        $scope.threatpreventionpolicyList = [];


        $scope.policy = {};
        $scope.disablAdd = true;

        $scope.sopTenant = $scope.$parent.sopTenant;

        $q.all([
            policyService.getDataBasedOnId("policy", "malwarepolicy").then(function (data) {
                console.log(data);
                $scope.malwareDataRetrieved = true;
                $scope.malwarepolicyList = data;
            }),
            policyService.getDataBasedOnId("policy", "accesscontrolpolicy").then(function (data) {
                console.log(data);
                $scope.aclDataRetrieved = true;
                $scope.accesscontrolpolicyList = data;
            }),
            policyService.getDataBasedOnId("policy", "threatpreventionpolicy").then(function (data) {
                $scope.threatDetectionDataRetrieved = true;
                console.log(data);
                $scope.threatpreventionpolicyList = data;
            })
        ]).then(function () {
            deferred.resolve();
        });

        $scope.policy.accessControlPolicyId = null;
        $scope.policy.threatPreventionPolicyId = null;
        $scope.policy.malwarePolicyId = null;
        $scope.policy.tenantId = null;
        $scope.policy.id = null;
        $scope.policy.name = null;

        /*// to be removed once tenant data is available
        $scope.policy.tenantId = 1;
        $scope.policy.tenantName = "Default";*/


        // to be uncommented once md-input-container is resolved
//        $scope.disableAddButton = (!$scope.policy.name || !$scope.policy.tenantId) ? true : false;

        $scope.callpopupTenats = function(event,selectedtenant) {
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
        

        function tenantListCtr($scope, $mdDialog, policyService,$rootScope,selectedtenant) {
             $scope.tenantSelected = false;
             $scope.selectedTenantsValue = selectedtenant;

             
            $scope.canceltenantDialogue = function() {
                //tenantSelection();
                $mdDialog.cancel();
            };
            $scope.tenantSelected = false;
            $scope.tenants = $scope.tenantsList;
            

            $scope.onSelectTenantChanged = function() {
                console.log(" onSelectionChanged >> ");
                $scope.tenantSelected = true;
            };
            $scope.tenantdone = function(value) {
                $scope.tenantSelected = true;
                if($scope.selectedTenantsValue){
                 var fo =  _.find($scope.tenants, function(sel){
                     return sel.id === parseInt($scope.selectedTenantsValue);
                  });
                 
                 if(fo){
                  $scope.selectedTenantObj = fo;  
                  $rootScope.$broadcast('listenPolicyChange', $scope.selectedTenantObj, 'tenantId');
                 }
                  
                }
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


        if(!$scope.sopTenant){
            $scope.getTenants();    
        }else{
            $scope.selectedTenantObj = $scope.$parent.selectedTenantObj;
        }

        $scope.cancel = function () {            
            $scope.$parent.redirectInSPS(true);
        };

        $scope.addSecurityPolicy = function () {
            $scope.disablAdd = true;
            $scope.showSPSCreationProgress = true;
            
            var d = new Date();
            var n = d.getTime();

            var param = {};


            param.lastModified = n;
            param.name = $scope.policy.name;
            //param.tenantId = $scope.policy.tenantId;

            if ($scope.policy.accessControlPolicy && $scope.policy.accessControlPolicy.id) {
                param.accessControlPolicyId = $scope.policy.accessControlPolicy.id;
            }

            if ($scope.policy.malwarePolicy && $scope.policy.malwarePolicy.id) {
                param.malwarePolicyId = $scope.policy.malwarePolicy.id;
            }

            if ($scope.policy.threatPreventionPolicy && $scope.policy.threatPreventionPolicy.id) {
                param.threatPreventionPolicyId = $scope.policy.threatPreventionPolicy.id;
            }

            if ($scope.selectedTenantObj && $scope.selectedTenantObj.id) {
                param.tenantId = $scope.selectedTenantObj.id;
            }
//            var accessControlPolicyId = ($scope.policy.accessControlPolicy &&
//                    $scope.policy.accessControlPolicy.id) ? $scope.policy.accessControlPolicy.id : null;
//
//            var malwarePolicyId = ($scope.policy.malwarePolicy &&
//                    $scope.policy.malwarePolicy.id) ? $scope.policy.malwarePolicy.id : null;
//
//            var threatPreventionPolicyId = ($scope.policy.threatPreventionPolicy &&
//                    $scope.policy.threatPreventionPolicy.id) ? $scope.policy.threatPreventionPolicy.id : null;
//
//            param = {
//                "accessControlPolicyId": accessControlPolicyId,
//                "lastModified": n,
//                "malwarePolicyId": malwarePolicyId,
//                "name": $scope.policy.name,
//                "tenantId": $scope.policy.tenantId,
//                "threatPreventionPolicyId": threatPreventionPolicyId
//            };

            var startPolicyCreation = {
                'heading': 'Security Policy Creation Started',
                'subHeading': 'Security Policy Creation Started.',
                'type': 'progress',
                'timeout': 5000
            };
            var policyUpdated = {
                'heading': 'Security Policy Created',
                'subHeading': 'Security Policy Created.',
                'type': 'success',
                'timeout': 5000,
                'callback': function () {
                    $scope.$parent.redirectInSPS();
                }
            };
            var policyUpdateFailed = {
                'heading': 'Security Policy Creation Failed',
                'subHeading': 'Security Policy Creation Failed.',
                'type': 'fail',
                'timeout': 5000,
                'callback': function () {
                    $scope.$parent.redirectInSPS();
               }
            };

            showToast(startPolicyCreation);
            policyService.createPolicyData("policy/securitypolicyset", param).then(function (data) {
                console.log(data);                

                if($scope.sopTenant){
                    $scope.$parent.policy.name = $scope.policy.name;
                }

                showToast(policyUpdated);                
            }, function (err) {
                console.log(err);
                $scope.disablAdd = false;
                $scope.showSPSCreationProgress = false;
                showToast(policyUpdateFailed);
            });
        };

        $scope.clearPolicy = function (policytype) {
            if (typeof $scope.policy[policytype] !== "undefined") {
                delete($scope.policy[policytype]);
            }

            if(!($scope.policy.accessControlPolicy || $scope.policy.malwarePolicy || $scope.policy.threatPreventionPolicy )){
                 $scope.disablAdd = true;
             }
        };

        $scope.onNameChanged =function(){
          $rootScope.$broadcast('listenPolicyChange', $scope.policy.name, 'name');
        };

        $scope.$on('listenPolicyChange', function (event, paramValue, paramtype) {

            var searchObj = {"id": paramValue};
            switch (paramtype) {
                case "accessControlPolicyId":
                    $scope.policy.accessControlPolicy = _.find($scope.accesscontrolpolicyList, searchObj);
                    break;
                case "malwarePolicyId":
                    $scope.policy.malwarePolicy = _.find($scope.malwarepolicyList, searchObj);
                    break;
                case "threatPreventionPolicyId":
                    $scope.policy.threatPreventionPolicy = _.find($scope.threatpreventionpolicyList, searchObj);
                    break;
                case "name":
                    $scope.policy.name = paramValue;
                    break;
                case "tenantId":
                    $scope.policy.tenantId = paramValue;
                    break;
                default:
            }

            if($scope.sopTenant){
                if($scope.policy.name && ($scope.policy.accessControlPolicy || $scope.policy.malwarePolicy || $scope.policy.threatPreventionPolicy) ){
                    $scope.disablAdd = false;
                }
            }else{
                if($scope.policy.name && $scope.policy.tenantId && ($scope.policy.accessControlPolicy || $scope.policy.malwarePolicy || $scope.policy.threatPreventionPolicy) ){
                    $scope.disablAdd = false;
                }
            }
             
        });

        $scope.callAccessControlPopup = function (accesscontrolpolicy, aclDataRetrieved, accesscontrolpolicyList, ev, selectedid) {
            $mdDialog.show({
                skipHide: true,
                preserveScope: true,
                controller: accessControlPopupController,
                templateUrl: 'core/components/administration/policy/policy.accesscontrolPopup.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                locals: {'accesscontrolpolicy': accesscontrolpolicy,
                    'aclDataRetrieved': aclDataRetrieved,
                    'accesscontrolpolicyList': accesscontrolpolicyList,
                    'selectedid':selectedid}
            }).then(function () {
//                        console.log($scope.selectedTenants);
//                        $sessionStorage.cloudData.selectedTenants = $scope.selectedTenants;
//                        console.log($sessionStorage.cloudData.selectedTenants);
            });
        };

        function accessControlPopupController($rootScope, $scope, $mdDialog, accesscontrolpolicy, aclDataRetrieved, accesscontrolpolicyList, selectedid) {
//            $scope.tenant_activated = true;
//            if (!$sessionStorage.cloudData.selectedTenants) {
//                $sessionStorage.cloudData.selectedTenants = {};
//            }
            (function () {
                $scope.accesscontrolpolicy = $scope.selectedPolicy = accesscontrolpolicy;
                $scope.aclDataRetrieved = aclDataRetrieved;
                $scope.accesscontrolpolicyList = accesscontrolpolicyList;
                $scope.selectedPolicy = selectedid;
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

        $scope.callMalwarePopup = function (malwarepolicy, malwareDataRetrieved, malwarepolicyList, ev,selectedmalwarepolicy) {
            $mdDialog.show({
                skipHide: true,
                preserveScope: true,
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
                skipHide: true,
                preserveScope: true,
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
       /* $scope.$on('$viewContentLoaded', function(event){ 
            console.log(event);*/
            fixContainerHeight(1);
        /*});*/
    }

    angular.module('shieldxApp').controller('addPolicySetCtr', addPolicySetCtr);
})();
