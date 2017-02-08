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
    function orchestrationRuleDirective() {
        var directive = {};
        directive.restrict = 'E';
        directive.replace = true;
        directive.templateUrl = 'core/directive/security-orchestration/rule/orchestration-rule-template.html';
        directive.scope = {
          orcloudid :  "=" ,
          ortenantid : "=" ,
          rule : "=",
          configinfo : "=",
          broadcastevent: '&',
          editstate : "="
        };
        directive.link = function(scope, element, attrs) {
           console.log(" llink "+scope);    
           scope.$watchCollection('rule', function(newValue, oldValue) {
                if (newValue){
                    console.log(" new rule has been intor duced ");
                     scope.updateRule();
                }
            }, true);
            scope.$watch('ortenantid',function(newv,oldv){
              if(newv && newv !== -1){
                console.log("new Tenant value" + newv);
                 scope.getAllSpsPolicycies();
              }
           });
        };
        directive.controller = ['$scope','$mdDialog','policyService',function ($scope,$mdDialog,policyService) {

            
            
            var vChassisSelectedDeploymentSpec = "";
            console.log("Console from inline mode : :  "+ $scope.inlineModeAvailable);
            console.log(SORule);
            $scope.ruleAttributes = SORule.ruleAttributeArray;
            $scope.matchCritaria  = SORule.matchingCritariaArray;
            console.log(" orchestrationRuleDirective ");
            console.log(" cloudid "+$scope.orcloudid);
            console.log(" ortenantid "+$scope.ortenantid);
            console.dir($scope.configinfo );
            console.log("edit state is "+$scope.editstate);
            $scope.$on('cloudChanged', function (event, args) {
                console.log(" orchestrationRuleDirective cloudChanged event called  >>>> " + args);
            });
            $scope.updateCriteria = function(ruleChanged){
              if(ruleChanged.ruleAttribute == 1)
                ruleChanged.matchingCritaria = 1;
            };
            $scope.$watch('outerMainForm.$valid', function(validity) {
              $scope.$emit('mainformvalidityChanged',{validity:validity});
            });
            $scope.$on('checkMainForm',function(event,args){
              if(typeof $scope.outerMainForm.$valid !== "undefined")
                $scope.$emit('mainformvalidityChanged',{validity:$scope.outerMainForm.$valid});
            });
            $scope.$on('tenatChanged', function (event, args) {
                console.log(" orchestrationRuleDirective tenatChanged event called  >>>> " + args);
               // console.dir(arg);
            });
            
            $scope.ruleDesc = [new SORuleDesc()]; 
            $scope.groupInfo = null; 
            $scope.aspInfo =  null;
            $scope.skipUpdate = false;
            $scope.inline = false;
            $scope.trunkMode = false;
            $scope.existingGroups = [];

            if($scope.rule && $scope.rule.groupInfo.name !== ""){
               var newGroup = {id:$scope.rule.groupInfo.id , name:$scope.rule.groupInfo.name, existing:true};
               $scope.existingGroups.push(newGroup);
            }
//            console.log("I am writing from here : :");
//            console.log($scope.rule);
            
            $scope.$on(SOEvents.newRuleCreationCanceledEvent, function(){
              $scope.outerMainForm.$setPristine();
              $scope.outerMainForm.$setUntouched();
            });
            $scope.$on('createNewRuleClick', function(){
              $scope.outerMainForm.$setPristine();
              $scope.outerMainForm.$setUntouched();
               $scope.showDeleteTotalRuleButton = false;
            });
            $scope.$on('EditRuleClicked', function (event, args) {
               $scope.existingRulesInMemory = args.rule;
               $scope.showDeleteTotalRuleButton = true;
            });
            $scope.onDeleteTotalRule = function(event,ruleDescArray){
              $mdDialog.show({
                    controller: 'confirmDeleteGroupDialogCtr',
                    templateUrl: 'core/directive/security-orchestration/rule/delete-group-dialog.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    clickOutsideToClose: true,
                    locals:{
                        ruleref:ruleDescArray
                    },
                    skipHide: true
                   
                }).then(function (answerVal) {
                  $scope.existingRulesInMemory.deleted = true;
                  $scope.existingRulesInMemory.dirty = true;
                  $scope.broadcastevent({event:"onTotalDeleteStateChange", args:{rule:$scope.existingRulesInMemory}});
                }, function () {
                    
                });
                
                 //console.log("Delete Total Rule ");
            };
            $scope.updateRule = function(){
                if($scope.skipUpdate)
                {
                  $scope.skipUpdate = false;
                  return;
                }
               if($scope.rule){ 
                   $scope.existingGroups = [];
                  if($scope.rule && $scope.rule.groupInfo.name !== ""){
                     var newGroup = {id:$scope.rule.groupInfo.id , name:$scope.rule.groupInfo.name, existing:true};
                     $scope.existingGroups.push(newGroup);
                  }   
                  $scope.ruleDesc = $scope.rule.ruleDesc;
                  $scope.groupInfo = $scope.rule.groupInfo;
                  if($scope.rule.aspInfo.id === '' &&  $scope.rule.aspInfo.name === '' && $scope.noneSpsPolicy){
                    $scope.aspInfo = {"id":$scope.noneSpsPolicy.id,"name":$scope.noneSpsPolicy.name};
                  }else{
                    $scope.aspInfo = $scope.rule.aspInfo;  
                  }
                  $scope.inline = $scope.rule.inline;
                  $scope.trunkMode = $scope.rule.trunkMode;
                console.log("updateRule >>>>");
                console.dir($scope.rule);
                console.dir($scope.ruleDesc);
               }
            };  

            $scope.addMoreRules = function(ruleAttribute){
                console.log(" addMoreRules "+$scope.ruleDesc.length);
                $scope.skipUpdate = true;
                var tempRuleDesc = new SORuleDesc();
                tempRuleDesc.ruleAttribute = ruleAttribute;
                $scope.ruleDesc.push(tempRuleDesc);
                console.log(" addMoreRules "+$scope.ruleDesc.length);
            };

           $scope.onDeleteDescClicked = function(key)
           {
               var ruleDesc = $scope.ruleDesc[key];
              if(ruleDesc){
                 $scope.broadcastevent({event:SOEvents.ruleDescDeletedEvent, args:{ruleDescRef:ruleDesc}});
                 console.log(" onDeleteDescClicked "); 
                 $scope.ruleDesc.splice(key,1);
              }
               

           };

           
            $scope.addMoreRulesClicked = function(event,startRule){
                  $scope.addMoreRules(startRule.ruleAttribute);
            };


            $scope.selectSPS = function(sps){
                  console.log(" selectSPS "); 
                  console.dir(sps);   
                  var aspInfo = new ASPInfo();
                  aspInfo.name = sps.name;
                  aspInfo.id = sps.id;
                  if( $scope.rule){
                    $scope.rule.aspInfo = aspInfo;  
                    $scope.broadcastevent({event:SOEvents.spsChangeEvent, args:{asp:$scope.rule.aspInfo}});
                  }
              
            };
            $scope.updateInline = function(){
              $scope.rule.inline = $scope.inline;
              if($scope.inline)
                $scope.rule.trunkMode = false;
            };
            $scope.toggleTrunk = function(){
              $scope.rule.trunkMode = $scope.trunkMode;
            };
            $scope.noneSpsPolicy  = {};
            $scope.getAllSpsPolicycies = function(){
                //policyService.getSPSByTenant($scope.ortenantid).then(function(data){
                policyService.getSecurityPolicySet().then(function(data){
                   var noneData = {};
                   noneData = _.find(data,{'isNull':true});
                   /*if(noneData === undefined){ 
                     noneData = {"accessControlPolicyId":1,
                      "id":9,
                      "lastModified":1482578470798,
                      "malwarePolicyId":3,
                      "name":"None",
                      "tenantId":1,
                      "threatPreventionPolicyId":1};
                      if(data){
                        data.push(noneData);  
                      }else{
                        data = [noneData];  
                      }
                  }*/
                    $scope.existingSPS = data;
                   console.dir($scope.existingSPS);
                   $scope.noneSpsPolicy = noneData;
                   $scope.selectSPS($scope.noneSpsPolicy);
                   $scope.broadcastevent({event:SOEvents.noneSpsPolicy, args:{asp:$scope.noneSpsPolicy}});
                   //$scope.spsFetched = true;
                }, function(error){

              });
            };
            
             $scope.helpButtonClicked = function(id){
                $scope.active_help_id = id;
                console.log("  helpButtonClicked ");
                $scope.bordcastEventHelpButtonClicked($scope.active_help_id);
            }; 
            $scope.bordcastEventHelpButtonClicked = function(helpId){
              $scope.broadcastevent({event:SOEvents.popUpMenuSelectionChangeEvent, args:{selection:"guid",guideUrl:helpId}});
             }; 
            $scope.selectGroup = function(group){
               console.log("selectNewGroup");
               console.dir(group);
               if(!group.existing){
                   if(!$scope.rule.groupInfo.name){
                      var groupinfo = new GroupInfo();
                      groupinfo.name = group.name;
                      groupinfo.id =-1;
                      $scope.rule.groupInfo = groupinfo;
                    } else {
                      $scope.rule.groupInfo.name = group.name;
                    }
                } else {
                  $scope.rule.mergeExistingGroup(group.data);
               }
               
               $scope.groupInfo = $scope.rule.groupInfo;

               console.log("group info selectNewGroup");
               console.dir($scope.rule);
               $scope.broadcastevent({event:SOEvents.groupChangeEvent, args:{group:$scope.groupInfo}});
               if($scope.rule.aspInfo.id === '' && $scope.rule.aspInfo.name === '' ){
                  $scope.selectSPS($scope.noneSpsPolicy); 
               }
               
            };


            $scope.showGropSelectionDialog = function(event) {
                console.log(" showGropSelectionDialog "+$scope.existingGroups.length);
                console.dir($scope.existingGroups);
                $mdDialog.show({
                    controller: 'showGroupSelectionDialogCtr',
                    templateUrl: 'core/directive/security-orchestration/rule/select-group-dialog.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    clickOutsideToClose: true,
                    locals:{
                        existingGroups:$scope.existingGroups,
                        tenantid:$scope.ortenantid,
                        cloudid:$scope.orcloudid,
                        groupInfo:$scope.rule.groupInfo
                    },
                    skipHide: true
                   
                }).then(function (answerVal) {
                    $scope.selectGroup(answerVal);
                }, function () {
                    
                });
            };

            $scope.showSPSSelectionDialog = function(event,seletedSpsData) {
                   $mdDialog.show({
                    controller: 'showASPSelectionDialogCtr',
                    templateUrl: 'core/directive/security-orchestration/rule/select-asp-dialog.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    clickOutsideToClose: true,
                    locals:{
                        existingSpsTotal:$scope.existingSPS,
                        tenantid:$scope.ortenantid,
                        cloudid:$scope.orcloudid,
                        selectedSpsData:seletedSpsData
                    },
                    skipHide: true
                   
                }).then(function (answerVal) {
                    $scope.selectSPS(answerVal);
                }, function () {
                    
                });
            };
            $scope.cancelSPSSelectionDialog = function(event){
              $scope.selectSPS($scope.noneSpsPolicy);
            };
            
            $scope.updateRule(); 
               
        }];
        return directive;
    }

    angular.module('shieldxApp').directive('orchestrationrule', orchestrationRuleDirective);

    function showGroupSelectionDialogCtr($scope,$mdDialog,resourceGroupService, existingGroups,tenantid, cloudid,groupInfo){
        
        $scope.groupsFetched = true; 
         $scope.selectedGroup = "";
         if(groupInfo){
          $scope.selectedGroup = groupInfo.name;
         }
        $scope.selectEnableState = false;
        console.log(" showGroupSelectionDialogCtr tenantid "+tenantid);
        console.log(" existingGroups "+existingGroups);
        console.dir(existingGroups);
        /* jshint ignore:start */
        resourceGroupService.getGroupList(cloudid).then(function(data){
          console.log(" resourceGroupService ");
          console.dir(data);
          $scope.existingGroups = existingGroups;
          var groups = _.filter(data, function(item){
            return item.tenantId ===  tenantid;     
          });
         
          for(var i =0 ; i < groups.length; i++){
            
            var exist = _.find($scope.existingGroups, function(f){
               return f.name === groups[i].name;
            });

            if(!exist){
              var newGroup = {id:groups[i].id , name:groups[i].name, existing:true,data:groups[i]};
              $scope.existingGroups.push(newGroup);
            }
            
          }
       
         
        },function(error){

        });

        /* jshint ignore:end */
        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.closeDialog = function () {
            $mdDialog.cancel();
        };

        $scope.onSelectionChanged = function(){
           $scope.selectEnableState = true;
         };
        $scope.closeDialogWithAnswer = function (answer) {
           var  returnVal =  _.find($scope.existingGroups, function(item){
               return  item.name === $scope.selectedGroup;
            });
           $mdDialog.hide(returnVal);
        };
        $scope.groupNameEntered = function(grpname){
          if($scope.groupnameForm.$invalid){
            return ;
          }
          $scope.createNewGroupInput =false;
          console.log(grpname);
          var newGroup = {id:-1, name:grpname, existing:false};
          $scope.selectedGroup = newGroup.name;
          $scope.existingGroups.unshift(newGroup);
          $scope.selectEnableState = true;
        };
        $scope.clearGroup = function(){
          $scope.createNewGroupInput = false;
          $scope.groupName = "";
        };
        $scope.openEdit = function(event,group){
          $scope.createNewGroupInput = true;
          $scope.groupName = group.name;
          var matchedIndex = _.findIndex($scope.existingGroups,{id:-1, name:group.name, existing:false});
          $scope.existingGroups.splice(matchedIndex,1);
        };
        $scope.deleteGroup = function(event,group){
          var matchedIndex = _.findIndex($scope.existingGroups,{id:-1, name:group.name, existing:false});
          $scope.existingGroups.splice(matchedIndex,1);
          $scope.groupName = "";
        };
        $scope.createNewGroupClicked = function(event){
          $scope.createNewGroupInput = true;

             /* $mdDialog.show({
                    controller: 'createNewGroupDialogCtr',
                    templateUrl: 'core/directive/security-orchestration/rule/new-group-dialog.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    clickOutsideToClose: true,
                    skipHide: true,
                    locals:{
                        existingGroups:existingGroups
                    }
                   
                }).then(function (answerVal) {
                  var newGroup = {id:-1, name:answerVal, existing:false};
                  $scope.selectedGroup = newGroup.name;
                   $scope.existingGroups.push(newGroup);
                  $scope.selectEnableState = true;
                }, function () {
                    
                });*/
        };

    }
    angular.module('shieldxApp').controller('showGroupSelectionDialogCtr', showGroupSelectionDialogCtr);

    function showASPSelectionDialogCtr($scope, $mdDialog,policyService,deploymentSpecificationService,existingSpsTotal,tenantid, cloudid,selectedSpsData){
        console.log("  showASPSelectionDialogCtr ");
        $scope.spsFetched = true; 
       // $scope.existingSPS = [];
       // $scope.selectedSPS = "";
        $scope.existingSPS = existingSpsTotal;
        $scope.selectEnableState = false;
        $scope.showAddPolicy = false;
        $scope.sopTenant = true;
         if(selectedSpsData){
          var spsdata  = _.find($scope.existingSPS, function(item){
                 return  item.id === selectedSpsData;
              });
          $scope.selectedSPS = spsdata.name;
        }else{
          $scope.selectedSPS = "";  
        }
        $scope.showAddSPSSelectionDialogCtrDialog = function(event) {
          angular.element(document.querySelectorAll(".spsQuickSetUpDialog.ip-config-dialog")).removeClass('ip-config-dialog').addClass('fullscreen-dialog');
          $scope.showAddPolicy = true;
          $scope.policy = {};

          deploymentSpecificationService.getTenants(cloudid).then(function (data) {
              $scope.tenants = data;
              $scope.selectedTenantObj = $scope.getTenantNameFromID(tenantid);
          });

          $scope.getTenantNameFromID = function (id) {

              var retVal = _.find($scope.tenants, function (tenantInd) {
                  return tenantInd.id === id;
              });

              return retVal;
          };

          $scope.redirectInSPS = function(cancel){
              $scope.showAddPolicy = false;
              angular.element(document.querySelectorAll(".spsQuickSetUpDialog.fullscreen-dialog")).removeClass('fullscreen-dialog').addClass('ip-config-dialog');

              if(!cancel){

                   $scope.selectEnableState = true;
                   //var newSPS = {id:-1, name:answerVal, existing:false};
                  $scope.selectedSPS = $scope.policy.name;
                   //$scope.existingSPS.push(newSPS);
                  var allSpsBeforeFetch = $scope.existingSPS;
                  //policyService.getSPSByTenant(tenantid).then(function(data){
                  policyService.getSecurityPolicySet().then(function(data){
                     console.log(" sps data fatched ");
                     //$scope.existingSPS = data;
                     console.dir($scope.existingSPS);
                     $scope.spsFetched = true;
                     _.each(data, function(thisSPS){
                        if(thisSPS.name == $scope.selectedSPS){
                          //$scope.selectedSPS = thisSPS.name;
                          allSpsBeforeFetch.unshift(thisSPS);
                          $scope.existingSPS = allSpsBeforeFetch;
                        }
                     });

                  }, function(error){

                  });
              }
          };

            /*  $mdDialog.show({
                controller: 'showAddSPSSelectionDialogCtr',
                templateUrl: 'core/directive/security-orchestration/rule/select-addSps-dialog.html',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                locals:{
                    tenantid:tenantid,
                    cloudid:cloudid
                },
                skipHide: true,
                fullscreen: true
               
            }).then(function (answerVal) {
                $scope.selectSPS(answerVal);
            }, function () {
                
            });*/

        };

        $scope.onSelectionChanged = function(){
           $scope.selectEnableState = true;
        };
        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.closeDialog = function () {
            $mdDialog.cancel();
        };
        $scope.closeDialogWithAnswer = function (answer) {
            console.log(" answer " + answer);
            var  returnVal =  _.find($scope.existingSPS, function(item){
               return  item.name === $scope.selectedSPS;
            });
            $mdDialog.hide(returnVal);
        };
    }
    angular.module('shieldxApp').controller('showASPSelectionDialogCtr', showASPSelectionDialogCtr);
})();
