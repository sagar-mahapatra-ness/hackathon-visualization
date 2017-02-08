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
    function spsPolicyListCtr(
        $scope,
        $state,
        $translate,
        policyService,
        $q,
        deploymentSpecificationService,
        infrastructureConnectorService,
        commonDataManagement
    ) {
        commonDataManagement.clearData();
        var deferred = $q.defer();
        $scope.promise = deferred.promise;
        $scope.promiseCompleted = true;
         $scope.tenantsListCompleted = true;
        $scope.promiseInProgress = true;
        $scope.policyselected = [];
        $scope.selected = [];
        $scope.policyList = [];
        $scope.query = {
            order: 'name',
            limit: 10,
            page: 1
        };
        policyService.getTotalTenats().then(function(data){
            $scope.tenantsList = data;
            $scope.tenantsListCompleted = false;
            renderData();
        },function(err){
            console.log("unable to fetch tenants");
            $scope.tenantsListCompleted = false;
            renderData();
        });
        policyService.getSecurityPolicySet().then(function (policyData) {
            
            $scope.ogPolicyData = policyData;
            /*  var PromiseData = _.each(policyData,function(item){
                        policyService.getPolicyDetail("policyassignments", "chassis", item.id).then(function(assignmentdata) {
                            console.log(item.id);
                            console.log(assignmentdata);
                            item.assignmentData= assignmentdata[item.id];
                        });
                    });*/
            $q.all(
                _.each(policyData,function(item){
                        policyService.getPolicyDetail("policyassignments", "chassis", item.id).then(function(assignmentdata) {
                            console.log(item.id);
                            console.log(assignmentdata);
                            item.assignmentData= assignmentdata[item.id];
                        });
                    })
                ).then(function(){
                    $scope.promiseInProgress = false;
                    renderData();    
                });
           /* _.each(policyData,function(item){
                console.log(item.id);

                policyService.getPolicyDetail("policyassignments", "chassis", item.id).then(function(assignmentdata) {
                    console.log(assignmentdata);
                    item.assignmentData= assignmentdata;
                }).finally(function(){
                    renderData();    
                });
            });*/
            deferred.resolve();
        }, function (err) {
            deferred.reject();
            $scope.promiseCompleted = false;
            $scope.promiseInProgress = false;
            renderData();
        });

        renderData = function(){
            if(!$scope.promiseInProgress && !$scope.tennatsListCompleted){
                $scope.promiseCompleted = false;
                $scope.policyList =  $scope.ogPolicyData;
                _.each($scope.tenantsList, function(value) {
                    for (var i = 0; i < $scope.policyList.length; i++) {
                        if ($scope.policyList[i].tenantId === value.id) {
                            $scope.policyList[i].tenantName = value.name;
                        }
                    }
                }); 
            }
        };

     /*   $scope.getTenantDataForCloud = function(cloudObj) {
            $scope.tenantsList = [];
            policyService.getDataBasedOnId("infras", cloudObj.id + "/tenants", "").then(function(tenants) {
                _.each(tenants, function(tenant) {
                    tenant.cloudName = cloudObj.name;
                    $scope.tenantsList.push(tenant);
                });
                $scope.cloudsLength = $scope.cloudsLength -1;
                if($scope.cloudsLength === 0){
                    $scope.tennatsListCompleted = false;  
                    renderData();  
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
        $scope.getTenants();*/

        $scope.toggleSearchBar = function (event) {
            $scope.isSearchBarOpen = $scope.isSearchBarOpen === false ? true : false;
            if ($scope.isSearchBarOpen)
                angular.element(event.currentTarget.firstElementChild).css('color', '#4a90e2');
            else
                angular.element(event.currentTarget.firstElementChild).css('color', '#6d6e71');
        };

        $scope.gotoAddPolicySetView = function() {
            $state.go("home.policy.policydetail.securitypolicyset");
        };

        $scope.deletePolicy = function(policy) {
            policyService.deletePolicyBasedOnID("policy/securitypolicyset", policy.id).then(function(res) {
                var toastparam = {
                    'heading': 'Policy deleted  Successfully',
                    'subHeading': 'Policy deleted  Successfully',
                    'type': 'success',
                    'timeout': 5000,
                    'callback': function () {
                        $state.reload();
                    }
                };
                showToast(toastparam);

        }, function (err) {
                var toastparam = {
                    'heading': 'Policy delete  failed',
                    'subHeading': 'Policy deletion failed with error ' + err.message,
                    'type': 'fail',
                    'timeout': 5000
                };
                showToast(toastparam);

        });
        };


        $scope.callpopupDuplicatePolicy = function(data) {
                var copyData = angular.copy(data);
                copyData.id = 0;
                copyData.name = copyData.name + ' copy';
                copyData.isEditable = true;
                var date = new Date();
                copyData.lastModified = date.getTime();
                var path = "policy/securitypolicyset";
                toastparam = {
                    'heading': 'Security Policy Set creation in progress',
                    'subHeading': 'Security Policy Set creation intiated with name ' + copyData.name,
                    'type': 'progress',
                    'timeout': 15000
                };
                showToast(toastparam);
                policyService.createPolicyData(path, copyData).then(function(data) {
                    $scope.newPolicyCreated = data;
                    toastparam = {
                        'heading': 'Security Policy Set created successfully',
                        'subHeading': 'New Security Policy Set created with name ' + copyData.name,
                        'type': 'success',
                        'timeout': 5000
                    };
                    showToast(toastparam);

                }, function(err) {
                    toastparam = {
                        'heading': 'Security Policy Set creation failed',
                        'subHeading': 'Security Policy Set ' + err.message,
                        'type': 'fail',
                        'timeout': 5000
                    };
                    showToast(toastparam);

                 }).finally(function() {
                    $state.go('home.policy.policylist.securitypolicyset', { 'newPolicy': $scope.newPolicyCreated,'duplicated':'d' });
                });
       };

        $scope.$on('$viewContentLoaded', function (event) {
            fixContainerHeight(1);
        });

    }
    angular.module('shieldxApp').controller('spsPolicyListCtr', spsPolicyListCtr);
})();