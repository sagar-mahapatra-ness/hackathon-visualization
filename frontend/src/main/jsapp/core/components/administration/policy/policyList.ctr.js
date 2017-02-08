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
    function policyListCtrl(
        $scope,
        $state,
        policyService,
        $q,
        userSessionMenagment
    ) {

        $scope.$emit('listenHeaderText', { headerText: "Policy" });
        var url = $state.current.url;
        if (url.indexOf("threatdetection") > 0 ) {
            $state.go('home.policy.policylist.threatdetection');
        } else if (url.indexOf("malware") >0 ) {
            $state.go('home.policy.policylist.malware');
        } else if (url.indexOf("securitypolicyset") >0 ) {
            $state.go('home.policy.policylist.securitypolicyset');
        } else if (url.indexOf("globalthreat") >0 ) {
            $state.go('home.policy.policylist.globalthreat');
        } 
        else {
            $state.go('home.policy.policylist.accesscontrol');
        }

        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            if (toState.data) {
                $scope.currentTab = toState.data.selectedTab;
            }

        });

        var deferred = $q.defer();
        $scope.promise = deferred.promise;
        $scope.promiseInProgress = true;
        $scope.policyselected = [];
        $scope.selected = [];
        $scope.policyList = [];
        $scope.query = {
            order: 'name',
            limit: 10,
            page: 1
        };

        /*policyService.getSecurityPolicySet().then(function (policyData) {
            $scope.promiseInProgress = false;
            $scope.policyList = policyData;
            deferred.resolve();
        }, function (err) {
            deferred.reject();
            $scope.promiseInProgress = false;
        });*/

        $scope.toggleSearchBar = function (event) {
            $scope.isSearchBarOpen = $scope.isSearchBarOpen === false ? true : false;
            if ($scope.isSearchBarOpen)
                angular.element(event.currentTarget.firstElementChild).css('color', '#4a90e2');
            else
                angular.element(event.currentTarget.firstElementChild).css('color', '#6d6e71');
        };


      
        var create_id = authorities("policy_create");
        var delete_id = authorities("policy_delete");
        var update_id = authorities("policy_update");
        $scope.is_create_policy = userSessionMenagment.isUserAllowd(create_id);
        $scope.is_update_policy = userSessionMenagment.isUserAllowd(update_id);
        $scope.is_delete_policy = userSessionMenagment.isUserAllowd(delete_id);
       
        /*$scope.gotoAddPolicySetView = function() {
            $state.go("home.policy.policydetail");
        };*/

        /*$scope.deletePolicy = function(id) {
            policyService.deletePolicyBasedOnID("policy/securitypolicyset", id).then(function(res) {
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
        };*/

        $scope.$on('$viewContentLoaded', function (event) {
            fixContainerHeight(1);
        });

    }
    angular.module('shieldxApp').controller('policyListCtrl', policyListCtrl);
})();