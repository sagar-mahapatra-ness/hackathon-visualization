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
    function policyTableDirective() {
        var directive = {};
        directive.restrict = 'E';
        directive.templateUrl = 'core/directive/policy-table/policy-table.html';
        directive.scope = {
            content: '=content'

        };
        directive.controller = ['$rootScope', '$scope', '$translate', '$mdDialog','userSessionMenagment', function($rootScope, $scope, $translate,$mdDialog,userSessionMenagment) {

            //$scope.thresholdVlaues = [{"action":"HIGH"},{"action":"MODERATE"},{"action":"LOW"},{"action":"CLEAN"}];
            $scope.selectedcheckBox = false;
            $scope.brand = false;
            $scope.policiesList = [];
            $scope.languageInUse = $translate.use();
            $scope.blockingThreshold = '';
            //$scope.saveUpdateNewPolicy = false;
            var update_id = authorities("policy_update");
            $scope.is_update_policy = userSessionMenagment.isUserAllowd(update_id);
            $scope.updatedMalwarePolicyRow = function(data, event) {
                if (data.blockingThreshold !== "" && data.alertingThreshold !== "" && data.blackListingThreshold !== "") {
                    $scope.$emit("saveUpdateNewPolicy", {data:data});
                }
            };
            $scope.infoRegardingFileType = function(event,fileType,data){
                 $mdDialog.show({
                        skipHide: true,
                        preserveScope: true,
                        controller: infoListCtr,
                        bindToController: true,
                        templateUrl: 'core/directive/policy-table/info.html',
                        parent: angular.element(document.body),
                        targetEvent: event,
                        fullscreen: false,
                        scope: $scope,
                        openFrom: { top: 1100, height: 0 },
                        closeTo: { left: 1500 }
                    }).then(function() {

                    });
            };
            function infoListCtr($scope, $mdDialog){
                 $scope.cancelTypeInfoDialogue = function() {
                        $mdDialog.cancel();
                };
            }
        }];
        return directive;
    }

    angular.module('shieldxApp').directive('policytable', policyTableDirective);
})();
