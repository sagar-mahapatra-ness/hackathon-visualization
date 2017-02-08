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
    function aclPolicyDetailsCtrl(
        $scope,
        $state,
        $sessionStorage,
        policyService,
        $timeout,
        $q,
        $mdDialog,
        infrastructureConnectorService,
        userSessionMenagment
    ) {

        var initializing = true;
        var paramId = parseInt($state.params.policyId);
        $scope.editSavePolicy = true;
        $scope.$emit('listenHeaderText', { headerText: "Policy" });
        $scope.editcontainer = true;
        //$scope.edittenant = true;
        $scope.query = {
                order: 'name',
                limit: 10,
                page: 1
        };
        //$scope.resGroupTotalList = [];
        $scope.modeValue = "edit_mode";
        $scope.$on("listenAclPolicyData", function(event, data) {
            if(data.data !== undefined ){
                $scope.accessEditForm.$dirty = true;    
            }
        });
        var update_id = authorities("policy_update");
        $scope.is_update_policy = userSessionMenagment.isUserAllowd(update_id);
        policyService.getTotalTenats().then(function(data){
                    $scope.tenantsList = data;
                    $scope.tenantsListCompleted = true;
                    renderData();
            },function(err){
                $scope.tenantsListCompleted = true;
                $scope.tenantsList = [];
                console.log("unable to fetch tenants");
                renderData();
            });
         policyService.getResourceGroupData().then(function(data){
                $scope.totalResGroupTotalList = data;
                $scope.resListCompleted = true;
                renderData();
             },function(err){
                $scope.resListCompleted = true;
                console.log("unable to fetch Resource Groups");
                $scope.totalResGroupTotalList = [];
                renderData();
             });

        policyService.getPolicyDetail("accesscontrolpolicy", "policy", paramId).then(function(res) {
                   /*var d = new Date(res.lastModified);
                   res.modifiedDate =  d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear();*/
                    $scope.apiResponseForPolicy = true;
                    $scope.aclPolicyBasedIdTotalList = res;
                    $scope.aclPolicyBasedIdTotalList.aclRules = _.sortBy( $scope.aclPolicyBasedIdTotalList.aclRules, 'orderNum');
                   /* _.each($scope.aclPolicyBasedIdTotalList.aclRules,function(item){
                        var d = new Date(item.lastModified);
                        item.modifiedDate =  d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear();
                    });*/
                    renderData();
                   
        }, function(err) {
            console.log("getting policy based on Id failes with" + err);
            $scope.aclPolicyBasedIdTotalList = [];
            renderData();
        });

       function renderData(){
            if($scope.resListCompleted && $scope.tenantsListCompleted && $scope.apiResponseForPolicy){
                 $scope.aclPolicyBasedId = $scope.aclPolicyBasedIdTotalList;
                 _.each($scope.tenantsList, function(value) {
                    if (value.id === $scope.aclPolicyBasedId.tenantId) {
                        $scope.TenantFromAPI = value;
                    }
                });
                _.each($scope.aclPolicyBasedId.aclRules, function(aclRules ,key){
                    aclRules.resourcegroupNames = [];
                    /*aclRules.destinationAppsList = [];
                    if (aclRules.destinationApps) {
                        aclRules.destinationAppsList = aclRules.destinationApps.split(',');    
                    }*/
                if(aclRules.destinationResourceGroupList.length > 0){
                    _.each(aclRules.destinationResourceGroupList,function(value){
                        var resgroup =_.find($scope.totalResGroupTotalList,function(resGroup){
                            return resGroup.id === value;
                        });
                        if(resgroup){
                           aclRules.resourcegroupNames.push(resgroup.name); 
                        }
                    });
                }

            }); 
            if($scope.TenantFromAPI){
                        $scope.aclPolicyBasedId.tenantName = $scope.TenantFromAPI.name;    
                        $scope.selectedTenantsValue = JSON.stringify($scope.TenantFromAPI); 
                        $scope.tenantSelected = true;
            }
            if($scope.totalResGroupTotalList){
                $scope.aclPolicyBasedId.resourceGroupList = $scope.totalResGroupTotalList;    
            }  

            }
       }
        $scope.callUpdatePolicyData = function(data) {
            console.log("clicked on update Access Control policy");

            var date = new Date();
            data.lastModified = date.getTime();
            if($scope.selectedTenantObj){
                data.tenantId = $scope.selectedTenantObj.id;
            }
            var path = "policy/accesscontrolpolicy";
            toastparam = {
                'heading': 'Access Control Policy Update inprogress',
                'subHeading': 'Access Control Policy Update intiated with name ' + data.name,
                'type': 'progress',
                'timeout': 15000
            };
            showToast(toastparam);
            policyService.updateExistingPolicyData(path, data).then(function(res) {
                // console.log(data);
                toastparam = {
                    'heading': 'Access Control Policy updated Successfully',
                    'subHeading': 'Access Control updated with name ' + data.name,
                    'type': 'success',
                    'timeout': 5000
                };
                showToast(toastparam);

            }, function(err) {
                toastparam = {
                    'heading': 'Access Control Policy update  failed',
                    'subHeading': 'Access Control Policy ' + err.message,
                    'type': 'fail',
                    'timeout': 5000
                };
                showToast(toastparam);
                //concole.log(data);
            }).finally(function() {
                $mdDialog.cancel();
                $state.reload();
            });
        };
        $scope.editTenant = function(event) {
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
            $scope.tenantselected = false;
            //$scope.selectedTenantsValue = '';
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
                $scope.tenantselected = true;
                $scope.accessEditForm.$dirty = true;
                $scope.selectedTenantObj = JSON.parse(value);
                $mdDialog.hide();
            };
        }

      /*  $scope.$watch("malwarePolicyBasedId.fileActions", function(newvalue, oldvalue) {
            if (initializing) {
                $timeout(function() { initializing = false; });
            } else {
                $scope.editSavePolicy = false;
            }

        }, true);*/
        $scope.$on('$viewContentLoaded', function(event){ 
            console.log(event);
            fixContainerHeight(1);
        });

    }

    angular.module('shieldxApp').controller('aclPolicyDetailsCtr', aclPolicyDetailsCtrl);
})();
