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

    function orchestrationRuleStripDirective() {
        var directive = {};
        directive.restrict = 'E';
        directive.replace = true;
        directive.templateUrl = 'core/directive/security-orchestration/rule/rule-strip-template.html';
        directive.scope = {
           ruleref : "=",
           editclicked : "&",
           broadcastevent: '&',
           lastindex : "=",
           configinfo : "=",
           totalrules : "=",
        };
        directive.link = function(scope, element, attrs) {
           console.log(" orchestrationRuleStripDirective ");   
           var intialize = true; 
           scope.$watch('ruleref', function(newValue, oldValue) {
                if (newValue){
                    scope.updateRuleDesc();
                }
            }, true);
        };
        directive.controller = ['$scope','$mdDialog', function($scope,$mdDialog) {
            $scope.showDrag = false;
            $scope.networkCount = -1;
            $scope.ruleDesc = null;
                        
            $scope.updateRuleDesc  = function(){
               $scope.ruleDesc = $scope.ruleref.ruleDesc;
               $scope.networkCount = 0;   
               var uniqueNetworks = [];
                _.each($scope.ruleDesc, function (ruleDesc) {
                    if (ruleDesc.ruleAttribute === "1") {
                        ruleDesc.ruleImg = 'images/cidr.svg';
                        ruleDesc.ruleTooltip = 'CIDR';
                    } else if (ruleDesc.ruleAttribute >= "2") {
                        ruleDesc.ruleImg = "images/workloads.svg";
                        ruleDesc.ruleTooltip = 'Workloads';
                    } else {
                        ruleDesc.ruleImg = 'images/share.svg';
                        ruleDesc.ruleTooltip = 'Network';
                    }
                    if (ruleDesc.matchingCritaria === "1") {
                        ruleDesc.matchingCriteriaImg = "images/ic_equals.svg";
                        ruleDesc.matchingCriteriaTooltip = 'Equals';
                    } else if (ruleDesc.matchingCritaria === "2") {
                        ruleDesc.matchingCriteriaImg = "images/contains.svg";
                        ruleDesc.matchingCriteriaTooltip = 'Contains';
                    } else {
                        ruleDesc.matchingCriteriaImg = "images/ic_begins_with.svg";
                        ruleDesc.matchingCriteriaTooltip = 'Begins with';
                    }
                    /*if(ruleDesc.networks){
                        _.each(ruleDesc.networks, function (network) {
                            if (!_.find(uniqueNetworks, network)) {
                                uniqueNetworks.push(angular.copy(network));
                            }
                        });
                    }*/
                }); 
                //$scope.networkCount = uniqueNetworks.length;
            };
            if($scope.configinfo.mode == 'edit_rc'){
                 $scope.$emit("resourceGroupModeNetworks",$scope.ruleref);
            }
            
            $scope.editRuleClicked = function(ruleref){
               $scope.$emit("editClicked",ruleref); 
            };

            $scope.onMouseDown = function(event){
               event.target.style.cursor = "-webkit-grabbing"; 
            };

            $scope.reorder = function(ruleset,type){
                $scope.broadcastevent({event:'reorderRules', args:{rule:ruleset,type:type}});
            };

            $scope.updateRuleDesc();

            _.each($scope.show, function(show) {
                show = false;
            });

            $scope.showResourceGroup = function (event, groupRef,action) {
              console.log(" showResourceGroup >>>> ");
               $scope.broadcastevent({event:'showNetoworksBelongToRuleEvent', args:{groups:groupRef,action:action}});
            };
            $scope.containsRule = function(ruleDesc,criteria){
                for (var i = 0; i < ruleDesc.length; i++) {
                    if(ruleDesc[i].matchingCritaria == criteria)
                        return false;
                }
                return true;
            };
            $scope.showStaticPopup = function(event,filteredequal,title){
                $mdDialog.show({
                    controller: 'staticDataCtr',
                    templateUrl: 'core/components/screenComponents/static-dialog.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    clickOutsideToClose: true,
                    locals:{
                        title:title,
                        staticData:filteredequal,
                    },
                    skipHide: true
                   
                }).then(function (answerVal) {
                    
                }, function () {
                    
                });
            };
            $scope.helpButtonClicked = function(helpId){
              $scope.broadcastevent({event:SOEvents.popUpMenuSelectionChangeEvent, args:{selection:"guid",guideUrl:helpId}});
             };
         /*   $scope.deleteRuleClicked = function(ruleref,event){
                $mdDialog.show({
                    controller: 'confirmDeleteGroupDialogCtr',
                    templateUrl: 'core/directive/security-orchestration/rule/delete-group-dialog.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    clickOutsideToClose: true,
                    locals:{
                        ruleref:ruleref
                    },
                    skipHide: true
                   
                }).then(function (answerVal) {
                    $scope.deleteGroup(answerVal);
                }, function () {
                    
                });
            };
            $scope.deleteGroup = function(ruleref){
              ruleref.deleted = true;
            };*/

            $scope.sandboxMode = false;
            $scope.$on('sandboxModeToggled', function (event, sandboxMode) {
                console.log("sandboxModeToggled rulestrip call");
                $scope.sandboxMode = sandboxMode;
            });

            $scope.hoverIn = function(){
                this.hoverEdit = true;
            };

            $scope.hoverOut = function(){
                this.hoverEdit = false;
            };
        }];
        return directive;
    }

    angular.module('shieldxApp').directive('orchestrationrulestrip', orchestrationRuleStripDirective);
function confirmDeleteGroupDialogCtr($scope, $mdDialog,ruleref){
        console.log("  confirmDeleteGroupDialogCtr ");
        
        $scope.hide = function (ruleref) {
            $mdDialog.hide(ruleref);
        };
        $scope.closeDialog = function () {
            $mdDialog.cancel();
        };
        $scope.closeDialogWithAnswer = function () {
            $scope.hide(ruleref);
        };
    }
    angular.module('shieldxApp').controller('confirmDeleteGroupDialogCtr', confirmDeleteGroupDialogCtr);

    function staticDataCtr($scope,$mdDialog,title,staticData){
        $scope.staticData = staticData;
        $scope.title = title;
        $scope.selected = [];
        _.each($scope.staticData, function (item) {
           if(item.ruleAttribute === "1")  {
               item.ruleTooltip= 'CIDR';
               item.ruleImg= 'images/share.svg';
           } else if (item.ruleAttribute === "2")  {
               item.ruleTooltip= "Workloads";
               item.ruleImg= "images/workloads.svg";
           } else {
               item.ruleTooltip= 'Network';
               item.ruleImg= 'images/share.svg';
           }
           if(item.matchingCritaria === "1")  {
               item.matchingCriteriaTooltip= "Equals";
               item.matchingCriteriaImg= "images/ic_equals.svg";
           } else if (item.matchingCritaria === "2")  {
               item.matchingCriteriaTooltip= "Contains";
               item.matchingCriteriaImg= "images/contains.svg";
           } else {
               item.matchingCriteriaTooltip= "Begins With";
               item.matchingCriteriaImg= "images/ic_begins_with.svg";
           }
        });
        $scope.cancelDialog = function(){
            $mdDialog.hide();
        };
    }

    angular.module('shieldxApp').controller('staticDataCtr', staticDataCtr);
})();
