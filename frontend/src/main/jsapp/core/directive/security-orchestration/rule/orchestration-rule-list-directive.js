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
    function orchestrationRuleListDirective() {
        var directive = {};
        directive.restrict = 'E';
        directive.replace = true;
        directive.templateUrl = 'core/directive/security-orchestration/rule/orchestration-rule-list-template.html';
        directive.scope = {
           rules : "=",
           broadcastevent: '&',
           configinfo : "="
        };

        directive.controller = ['$scope','dragularService','$filter','filterFilter', function($scope, dragularService,$filter,filterFilter) {
           
           $scope.sandboxMode = false;
           $scope.broadcastListSOREvents = function(nameOfEvent,arg){
               $scope.broadcastevent({event:nameOfEvent, args:arg});
           };
           $scope.$watchCollection('rules', function(newRules, oldRules) {
            if(!$scope.activeRules.length && $scope.rules.length){
              _.each($scope.rules,function(singleRule){
                    if(singleRule.id){
                      $scope.activeRules.push(angular.copy(singleRule));
                    }
                  });
            }
          });
           $scope.$on('counterChanged',function(event,args){
              _.each($scope.rules,function(singleRule){
                  if(singleRule.id){
                    var activeRule = _.find($scope.activeRules,{"id":singleRule.id});
                    activeRule.workloadsSecured = singleRule.workloadsSecured;
                    activeRule.noneSPS = singleRule.noneSPS;
                  }
                });
                $scope.broadcastevent({event:"drawSecureBar",args:$scope.activeRules});
           });
           $scope.$on(SOEvents.ruleAllCommitedEvent,function(event,args){
              console.log("caught all rules commited event");
              $scope.activeRules = angular.copy($scope.rules);
              $scope.broadcastevent({event:"drawSecureBar",args:$scope.activeRules});
           });
            $scope.$on('reorderRules',function(event,args){
              var selectedRule = _.find($scope.rules,args.rule);
              if(args.type === 1){
                var previousRule = _.find($scope.rules,{"precedence": (selectedRule.precedence-1) }); 
                if(typeof previousRule !== "undefined" && !previousRule.deleted){
                  selectedRule.precedence--;
                  previousRule.precedence++;
                  previousRule.dirty = true;
                }
              } else if(args.type === 2) {
                var nextRule = _.find($scope.rules,{"precedence": (selectedRule.precedence+1) }); 
                if(typeof nextRule !== "undefined" && !nextRule.deleted){
                  selectedRule.precedence++;
                  nextRule.precedence--;
                  nextRule.dirty = true;
                }
              }
              
            });
            

//            $scope.filterNotCommittedRules = function (rule) {
////                return (rule.id !==  "");
//                return rule;
//            };

            $scope.$on('sandboxModeToggled', function (event, sandboxMode) {
                console.log("sandboxModeToggled rulestrip call");
                $scope.sandboxMode = sandboxMode;
            });
            $scope.activeRules = [];
            /*$scope.$on('$viewContentLoaded', function (event) {
              console.log("present rules are ",$scope.rules);
                _each($scope.rules,function(singleRule){
                    if(singleRule.groupInfo.id !== -1 ){
                      $scope.activeRules.push(singleRule);
                    }
                });
            });*/
          /* $scope.activeRules = filterFilter($scope.rules, function (rule) {
              console.log("I am called here :) :) ");
               return rule.id !== '';
           });*/

            /*$scope.filteredRecords = function() {
              return $scope.rules.filter(function(rule, i) {
                  console.log("rule id : " + rule.groupInfo.id);
                  return (rule.groupInfo.id !== -1 && !rule.dirty);
              });
            };*/
            
            $scope.onCreateNewRuleClicked = function () {
                $scope.broadcastevent({event: "onCreateNewRuleClicked", args: null});
            };
            $scope.activeRules = [];
            console.log("original rules",$scope.rules);
            console.log("Active rules are ",$scope.activeRules);

        }];
        return directive;
        
    }

    angular.module('shieldxApp').directive('orchestrationrulelist', orchestrationRuleListDirective);

   
    
})();
