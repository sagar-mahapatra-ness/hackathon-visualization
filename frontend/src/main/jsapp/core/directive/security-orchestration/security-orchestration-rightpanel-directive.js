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
    function securityOrchestrationRightpanelDirective() {
        var directive = {};
        directive.restrict = 'E';
        directive.replace = true;
        directive.templateUrl = 'core/directive/security-orchestration/security-orchestration-rightpanel-template.html';
        directive.scope = {
            seccloudid :  "=",
            sectenantid : "=",
            secrules: "=",
            configinfo : "=",
            networksavailable: '=',
            tenants: "=",
            workloads: "=",
            broadcastevent: '&',
            vcname: "="
        };
        
        directive.link = function(scope, element, attrs) {
           console.log(" llink "+scope);    
           scope.$watch('secrules', function(newValue, oldValue) {
                console.log(" secrules  >> "+newValue);    
                if (newValue){
                   scope.rulesArray = scope.secrules;
                   scope.initDirective();
                }
             }, true);

                scope.$watch('sectenantid', function(newValue, oldValue) {
                if (newValue){
                   console.log(" sectenantid change >>>>  "+newValue);
                    scope.sectenantid = newValue;
                }
                }, true);
        };
        
        directive.controller = ['$scope','virtualChassisService','$mdDialog', function ($scope,virtualChassisService,$mdDialog) {
            $scope.toggleNetworkData = function (attribute) {
                $scope.attributeDetailsView = false;
                $scope.$emit('toggleNetworkDataInit', attribute);
            };
            
            $scope.$on("onRestorePreAttributeSession", function (event, args) {
                $scope.attributeDetailsView = false;
            });

            $scope.inmemoryRule = null;
            $scope.lastShownRule = null;
            $scope.sandboxMode = false;
            console.log("calling from the right panel ",$scope.networksavailable);
           $scope.OrchestrationRulesText = "Orchestration Rules";

           $scope.parentTitle = "right hand panel  directive";
           console.log($scope);
           $scope.rulesArray =  $scope.secrules;
           console.log(" securityOrchestrationRightpanelDirective ");
           console.log(" seccloudid "+$scope.seccloudid);
           console.log(" sectenantid "+$scope.sectenantid);
           console.log(" secrules "+$scope.secrules);
           console.dir($scope.secrules);
        $scope.groupsAlreadySelectedinMemory = [];
        _.each($scope.rulesArray,function(singleRule){
            if(singleRule.groupInfo.id !== -1){
                $scope.groupsAlreadySelectedinMemory.push(singleRule.groupInfo.id);
            }
        });
        $scope.returnToPreviousState = function(){
          $scope.$broadcast('returnToPrevious');
        };
        $scope.chassisgroupIds = [];
        $scope.groupData = [];
        virtualChassisService.getListOfVirtualChassis().then(function(allChassis){
            _.each(allChassis,function(singleChassis){
                _.each(singleChassis.subscriptionList,function(singleGroup){
                      $scope.chassisgroupIds.push(singleGroup.resourceGroupId);
                });
            });
            virtualChassisService.getListOfResourceGroups($scope.seccloudid).then(function(allGroups){
              $scope.broadcastevent({event:"existingResourceGroupsData",args:allGroups});
                _.each(allGroups,function(singleGroup){
                    if($scope.chassisgroupIds.indexOf(singleGroup.id) === -1 && $scope.groupsAlreadySelectedinMemory.indexOf(singleGroup.id) === -1 ){
                        $scope.groupData.push(singleGroup);
                    }
                });
            });
        },
        function(error){
          console.log("call failed ",error);
        });
        $scope.broadcastRightSOREvents = function(nameOfEvent, arg) {
             $scope.broadcastevent({event:nameOfEvent, args:arg});
        };
        
        $scope.$on(SOEvents.ruleDeletedEvent, function (event, args) {
           /* if(args.ruleref.groupInfo.id === -1 && args.ruleref.deleted){
              var ind = _.findIndex($scope.secrules, function(rule){
                return  rule.name === args.ruleref.name;
              });
              $scope.secrules.splice(ind, 1);
              $scope.broadcastevent({event: 'refereshNetworks'});
            }*/
            
        });

        $scope.openMenu = function($mdOpenMenu, ev) {
           $mdOpenMenu(ev);
        };

        $scope.onOrchestrationRulesSelected = function(){
           $scope.OrchestrationRulesText = "Orchestration Rules";
           $scope.broadcastevent({event:SOEvents.popUpMenuSelectionChangeEvent, args:{selection:"orchestration-rules"}}); 
        };
        $scope.onWorkAttributesSelected = function(){
           $scope.OrchestrationRulesText = "Workload Attributes";
          $scope.broadcastevent({event:SOEvents.popUpMenuSelectionChangeEvent, args:{selection:"work-attributes"}}); 
        };
        $scope.onGuideSelected = function(){
           $scope.OrchestrationRulesText = "Guide";
           $scope.broadcastevent({event:SOEvents.popUpMenuSelectionChangeEvent, args:{selection:"guid"}});
        };

        

        $scope.initCallback = null;

        $scope.registeInitrCallback = function( arg ){
           $scope.initCallback = arg;
        };
        
        $scope.initDirective = function(){
          if($scope.initCallback){
            $scope.initCallback();
          }
        };
        
        $scope.sandboxMode = false;
        $scope.ruleChanged = false;
        $scope.$on('reorderRules',function(event,args){
          $scope.ruleChanged = true;
        });
        $scope.setSandboxState = function (sandboxMode) {
            $scope.sandboxMode = sandboxMode;
            $scope.$emit('sandboxModeToggleInit', $scope.sandboxMode);
        };
        
        $scope.$on('sandboxModeToggled', function (event, sandboxMode) {
            $scope.sandboxMode = sandboxMode;
        });
        $scope.clickToCreateextOrIntRule = function(item){            
          console.log(item);    
          $scope.newSoRule = new SORule();    
          var ruleattributes = '';    
          $scope.newSoRule.ruleDesc.push(new SORuleDesc());   
          if(item === 0){   
            ruleattributes = SORule.ruleAttribute.CIDR;   
            $scope.newSoRule.groupInfo.id= -1;    
            $scope.newSoRule.groupInfo.name= "External Rule - "+$scope.vcname;    
            $scope.newSoRule.ruleDesc[0].networkSpec = "0.0.0.0/0";   
          }else{    
            ruleattributes = SORule.ruleAttribute.WORKLOAD;   
            $scope.newSoRule.groupInfo.id= -1;    
            $scope.newSoRule.groupInfo.name="Internal Rule - "+$scope.vcname;    
            $scope.newSoRule.ruleDesc[0].networkSpec = ".*";    
          }   
          $scope.newSoRule.ruleDesc[0].ruleAttribute = ruleattributes.id;   
          $scope.newSoRule.ruleDesc[0].matchingCritaria = SORule.matchingCritarias.IS.id;   
          $scope.broadcastevent({event:"externalInternalRuleCreation",args:{"data":$scope.newSoRule}});   
          console.log(ruleattributes);    
        };
        $scope.showgroupPopup = function(event){
          console.log("This is the data required ",$scope.groupData);
            $mdDialog.show({
              controller: 'groupsCtr',
              templateUrl: 'core/components/administration/quick-setup/virtual-chassis/groupPopup.html',
              parent: angular.element(document.body),
              skipHide: true,
              targetEvent: event,
              clickOutsideToClose: true,
              locals: {
                  groupdata: $scope.groupData
              }
            }).then(function (chosenGroups) {
                  _.each($scope.rulesArray,function(singleRule){
                    singleRule.precedence = chosenGroups.length + singleRule.precedence;
                  });
                  var precedence = 1;
                _.each(chosenGroups,function(chosenGroup){
                  var removeIndex = _.findIndex($scope.groupData,chosenGroup);
                  $scope.groupData.splice(removeIndex, 1);
                  var resourceGroup = angular.copy(chosenGroup);
                  var sr = new SORule();
                  sr.mergeExistingGroup(resourceGroup);
                  sr.aspInfo = new ASPInfo();
                  sr.precedence = precedence;
                  sr.imported = true;
                  $scope.rulesArray.push(sr);
                  precedence++;
                });
                
            }, function () {
                $scope.status = 'You cancelled the dialog.';
            });
      };

        $scope.$on('inmemoryRuleSet', function (event, inmemoryRule) {
            // $scope.editModeInit = false;
            // $scope.inmemoryRule = inmemoryRule;
        });
        
        $scope.editModeInit = false;
        $scope.restorePreviousState = function () {
            if ($scope.lastShownRule) {
                $scope.editModeInit = true;
                $scope.lastShownRule.deleted = false;
                $scope.$broadcast("editClicked", $scope.lastShownRule);
            }
        };
        
        $scope.attributeDetailsView = false;
        $scope.$on('showObjectDetail', function (event, data) {
            $scope.attributeDetailsView = true;
        });

        $scope.$watch('rulesArray', function (newValue, oldValue) {
            if (newValue) {
                $scope.$emit('rulesArrayChangedInit', newValue);
            }
        }, true);

        }];
        return directive;
    }

    angular.module('shieldxApp').directive('securityorchestrationrightpanel', securityOrchestrationRightpanelDirective);
    

    function manageOrchestrationRuleCtr($scope) {
        console.log(" manageOrchestrationRuleCtr  >> "+$scope.parentTitle);
        $scope.viewStates = {
                INITIAL_NEW_RULE: 0,
                LIST_RULES: 1,
                EDIT_RULES: 2,
                CREATE_NEW_RULE: 3,
                GUID:4,
                WORK_LOAD:5,
                OBJECT_ATTRIBUTE:6
        };
        console.log("manageOrchestrationRuleCtr sending values ",$scope.groupData);
        $scope.currentState =  -1;
        $scope.previousState = -1;
        $scope.saveRuleStateOnMenuSelection = -1;

        $scope.newSoRule = new SORule();
        //$scope.newSoRule.addSORuleDesc(new SORuleDesc());
        $scope.editSoRule = null;
        $scope.inmemoryRule = null;
        $scope.initEntityCount =  0;
        $scope.disableSave = true;
       
//        var entityAttribute = {
//            NETWORK: {name: "Network", id: "0", type: "NETWORK"},
//            CIDR : {name:"Cidr", id:"1", type:"CIDR"},
//            WORKLOAD: {name: "Workload", id: "2", type: "WORKLOAD"}
//        };

        $scope.$on('returnToPrevious',function(event,args){
          $scope.returnToPreviousState();
        });
        $scope.restorePreAttributeSession = function () {
            $scope.returnToPreviousState();
            $scope.$emit("restorePreAttributeSession", {});
        };
        $scope.setCurrentState = function(arg){
           $scope.previousState =  $scope.currentState;
           $scope.currentState = arg;
           var states = {prevStat:$scope.previousState, currStat:$scope.currentState}; 
           $scope.$broadcast('currentStateChanged', states);
        };

        $scope.isStateInitialNewRule = function(){
           return $scope.currentState === $scope.viewStates.INITIAL_NEW_RULE;
        };

        $scope.isStateListRules = function(){
           return $scope.currentState === $scope.viewStates.LIST_RULES;
        }; 

        $scope.isStateEditRules = function(){
           return $scope.currentState === $scope.viewStates.EDIT_RULES;
        }; 

        $scope.isStateCreateNewRule = function(){
           return $scope.currentState === $scope.viewStates.CREATE_NEW_RULE;
        };

        $scope.isStateGuid = function(){
           return $scope.currentState === $scope.viewStates.GUID;
        };

        $scope.isStateWorkload = function(){
            return $scope.currentState === $scope.viewStates.WORK_LOAD;
        };

        $scope.isObjectAttribute = function(){
            return $scope.currentState === $scope.viewStates.OBJECT_ATTRIBUTE;
        };

        $scope.showGuid = function(gideUrl){
            $scope.$parent.OrchestrationRulesText = "Guide";
            if(!($scope.isStateGuid() || $scope.isStateWorkload())){
              $scope.saveRuleStateOnMenuSelection = $scope.currentState;
            }
            console.log("showGuid "+$scope.saveRuleStateOnMenuSelection);
            $scope.broadcastevent({event:"guideUrlChnaged",args:{url:gideUrl}});
            $scope.setCurrentState($scope.viewStates.GUID);    
        };

        $scope.showWorkload = function(){

            if(!($scope.isStateGuid() || $scope.isStateWorkload())){
              $scope.saveRuleStateOnMenuSelection = $scope.currentState;
            }
            console.log("showWorkload "+$scope.saveRuleStateOnMenuSelection);
            $scope.setCurrentState($scope.viewStates.WORK_LOAD);    
        };

        $scope.restoreRule = function(){
           if($scope.saveRuleStateOnMenuSelection != -1){
            console.log("restoreRule "+$scope.saveRuleStateOnMenuSelection);
            $scope.setCurrentState($scope.saveRuleStateOnMenuSelection);  
           }
        };

        $scope.showCreateNewRule = function(){
            $scope.setCurrentState($scope.viewStates.CREATE_NEW_RULE);
             $scope.disableSave = true;
             $scope.enableSave();
        };

        $scope.showInitNewRule = function(entities){
            if(entities) {
                $scope.setEntitiesMesage(entities);
                $scope.initEntityCount = entities.length;
            } else {
              $scope.newSoRule = new SORule();
            }
            $scope.setCurrentState($scope.viewStates.INITIAL_NEW_RULE);
             $scope.disableSave = true;    
        };

        $scope.showRuleList = function(){
            $scope.setCurrentState($scope.viewStates.LIST_RULES);    
        };

        $scope.showEditRule = function(){
            $scope.setCurrentState($scope.viewStates.EDIT_RULES);    
        };

        $scope.showObjectAttribute = function(){
            $scope.setCurrentState($scope.viewStates.OBJECT_ATTRIBUTE);    
        };

        $scope.cancelCreateNewRule = function(){
           $scope.returnToPreviousState();
        };

        $scope.setEntitiesMesage = function(entities) {
            $scope.entityCounter = {};
            $scope.entityCounter.NETWORK=0;
            $scope.entityCounter.WORKLOAD=0;
            var networkCountMessage = '';
            var workloadCountMessage = '';
            var joinMessage = '';
            $scope.notmixedtype = false;
            _.each(entities, function(entity) {
                
                if(entity.type === SORule.ruleAttribute.NETWORK.link) {
                    $scope.entityCounter.NETWORK++;
                } else if (entity.type === SORule.ruleAttribute.WORKLOAD.link) {
                    $scope.entityCounter.WORKLOAD++;
                }
            });
            if($scope.entityCounter.NETWORK > 0 && $scope.entityCounter.WORKLOAD > 0){
                $scope.notmixedtype = true;
            }
            if($scope.entityCounter.NETWORK > 0) {
                networkCountMessage = $scope.entityCounter.NETWORK + 
                        " Network"  + 
                        (($scope.entityCounter.NETWORK > 1 ) ? "s" : "" );
            }
            if($scope.entityCounter.WORKLOAD > 0) {
                workloadCountMessage = $scope.entityCounter.WORKLOAD + 
                        " Workload" + 
                        (($scope.entityCounter.WORKLOAD > 1 ) ? "s" : "" );
            }
            if(networkCountMessage !== '' && workloadCountMessage  !== '') {
                joinMessage = " & ";
            }
            $scope.entityInitScreenMessage = networkCountMessage +  " " + joinMessage + " " + workloadCountMessage + " " + " selected";
        };

        $scope.$on('sandboxModeToggled', function (event, sandboxMode) {
            if (!sandboxMode) {
              $scope.cancelCreateNewRule();
            }
        });
        $scope.returnToPreviousState = function(){
            if($scope.isStateEditRules() || $scope.isStateCreateNewRule() || $scope.isObjectAttribute() || $scope.isStateGuid()){
                if($scope.isStateGuid()){
                    $scope.$parent.OrchestrationRulesText = "Orchestration Rules";
                    $scope.setCurrentState($scope.previousState);
                }else if($scope.rulesArray.length > 0)
                {
                  $scope.showRuleList();
                }else{
                  $scope.setCurrentState($scope.viewStates.INITIAL_NEW_RULE);
                }
            }
          /* if($scope.previousState !== -1) {
             $scope.setCurrentState($scope.previousState);
           }*/
        };

        $scope.initState = function(){
          $scope.previousState = -1;
          if($scope.currentState ===  $scope.viewStates.INITIAL_NEW_RULE || $scope.currentState === -1){
            if(!$scope.rulesArray){
               $scope.setCurrentState($scope.viewStates.INITIAL_NEW_RULE); 
            } else {
                if($scope.rulesArray.length > 0)
                {
                  $scope.showRuleList();
                }else{
                  $scope.setCurrentState($scope.viewStates.INITIAL_NEW_RULE);
                }
            }
          }
          
            
        };
        
        $scope.$on('onCreateNewRuleClicked', function (event, args) {
            $scope.onCreateNewRuleClicked();
        });

        $scope.onCreateNewRuleClicked = function(){
               $scope.setSandboxState(true);
               $scope.showCreateNewRule();
               $scope.$broadcast('createNewRuleClick');
               if(!$scope.newSoRule.ruleDesc.length)
                $scope.newSoRule.addSORuleDesc(new SORuleDesc());//we need to initialise the new SORuleDesc prototype instead of Object Type
        };
        $scope.showCreateNewRuleMergeWorkload = function(){
          //clear all the networks in the selected network and add the workloads of these networks
         /* _.each($scope.newSoRule.ruleDesc,function(singleDesc){
            //check if it is a network based rule, then clear the network data and add the workload of that network
            if(singleDesc.ruleAttribute == "0"){

            }
          });*/
          var updateNetworkArray = [];
          for (var i = $scope.newSoRule.ruleDesc.length - 1; i >= 0; i--) {
            var currentDesc = $scope.newSoRule.ruleDesc[i];
            if(currentDesc.ruleAttribute == "0"){
              updateNetworkArray = _.unionWith(updateNetworkArray,currentDesc.networks);
              $scope.newSoRule.ruleDesc.splice(i,1);
            }
          }
          $scope.$emit('addWorkloadsofNetworks',{'networks':updateNetworkArray});
          console.log("the existing rule present is ",$scope.newSoRule);
          $scope.setSandboxState(true);
          $scope.showCreateNewRule();
        };
        $scope.onCancelClicked = function(){
            $scope.initEntityCount = 0;
            $scope.broadcastevent({event:SOEvents.newRuleCreationCanceledEvent, args:{rule:$scope.newSoRule}});
            $scope.newSoRule = new SORule();
            console.log($scope.newSoRule);
            $scope.returnToPreviousState();
        };

        $scope.onCreateRuleClicked = function(){
          var tempRule = angular.copy($scope.newSoRule);
          

          if(tempRule.ruleDesc[0].ruleAttribute == "0"){
              $scope.newSoRule.ruleDesc.length = 0;
             setNetworksbyCriteria(tempRule,1);
             $scope.broadcastevent({event:SOEvents.ruleCreatedEvent, args:{rule:$scope.newSoRule}});
           } else if(tempRule.ruleDesc[0].ruleAttribute == "1") {
            $scope.newSoRule.ruleDesc.length = 0;
              _.each(tempRule.ruleDesc,function(singleDesc){
                    $scope.createNewRule(singleDesc.networkSpec, [], SORule.matchingCritarias.IS.id,"CIDR");
              });
           } else if(tempRule.ruleDesc[0].ruleAttribute == "2") {
              $scope.newSoRule.ruleDesc.length = 0;
              setNetworksbyCriteria(tempRule,1, 'WORKLOAD');
              //$scope.$emit('newruleaddedworkload',{rule:$scope.newSoRule});
              $scope.broadcastevent({event:SOEvents.ruleCreatedEvent, args:{rule:$scope.newSoRule,type:'WORKLOAD'}});
           } else if((tempRule.ruleDesc[0].ruleAttribute == "3")){
              $scope.newSoRule.ruleDesc.length = 0;
              setNetworksbyFilter(tempRule,1,"application");
              $scope.broadcastevent({event:SOEvents.ruleCreatedEvent, args:{rule:$scope.newSoRule,type:'WORKLOAD'}});
              
           } else if((tempRule.ruleDesc[0].ruleAttribute == "4")){
              $scope.newSoRule.ruleDesc.length = 0;
              setNetworksbyFilter(tempRule,1,"os");
              $scope.broadcastevent({event:SOEvents.ruleCreatedEvent, args:{rule:$scope.newSoRule,type:'WORKLOAD'}});
           }


           $scope.newSoRule.workloadsSecured = tempRule.workloadsSecured;
           console.log("Newly created rule is this ",$scope.newSoRule);
           $scope.addNewRuleToList();
           $scope.showRuleList();
           $scope.broadcastevent({event:"ClearSelections", args:{rule:$scope.newSoRule}});
           $scope.$parent.ruleChanged = true;
        };

        $scope.$on("externalInternalRuleCreation",function(event,args){    
              console.log(args);    
              $scope.newSoRule = args.data;   
              $scope.setDefaultSps($scope.newSoRule);   
              $scope.setSandboxState(true);   
              $scope.onCreateRuleClicked();   
          });   
        $scope.setDefaultSps = function(rule){    
              rule.aspInfo.id = $scope.noneSpsPolicy.id;    
              rule.aspInfo.name = $scope.noneSpsPolicy.name;    
          };
        function setNetworksbyCriteria(ruleObj,type, entityType){
            var searchEntity = null;
            if(entityType === "WORKLOAD") {
                searchEntity = $scope.workloads;
            } else {
                searchEntity = $scope.networksavailable;
            }
            ruleObj.workloadsSecured = 0;
          _.each(ruleObj.ruleDesc,function(singleDesc){
                console.log("Single Rule Desc ",singleDesc);
                if(singleDesc.matchingCritaria === "1"){
                  var alreadypresent = _.find($scope.newSoRule.ruleDesc,{"name":singleDesc.networkSpec});
                  if(typeof alreadypresent === 'undefined'){
                    var matchedValue = _.find(searchEntity,{"name":singleDesc.networkSpec});
                    if(typeof matchedValue !== "undefined"){
                      if(type === 1)
                        $scope.createNewRule(singleDesc.networkSpec, [matchedValue], SORule.matchingCritarias.IS.id, entityType);
                      else if(type === 2)
                        $scope.updateRule(singleDesc.networkSpec, [matchedValue], SORule.matchingCritarias.IS.id, entityType);
                      if(entityType === "WORKLOAD"){
                        ruleObj.workloadsSecured++;
                      } else{
                        ruleObj.workloadsSecured += matchedValue.workloads.length;
                      }
                  } else {
                      if(type === 1)
                        $scope.createNewRule(singleDesc.networkSpec, [], SORule.matchingCritarias.IS.id, entityType);
                      else if(type === 2)
                        $scope.updateRule(singleDesc.networkSpec, [], SORule.matchingCritarias.IS.id, entityType);
                  }
                } 
              } else if(singleDesc.matchingCritaria === "2") {
                var matchedNetworks = [];
                _.each(searchEntity,function(singleNetwork){
                    if(singleNetwork.name.toLowerCase().indexOf(singleDesc.networkSpec.toLowerCase()) !== -1){
                          matchedNetworks.push(singleNetwork);
                          if(entityType === "WORKLOAD"){
                            ruleObj.workloadsSecured++;
                          } else{
                            ruleObj.workloadsSecured += singleNetwork.workloads.length;
                          }
                    }
                });
                if(type === 1)
                  $scope.createNewRule(singleDesc.networkSpec, matchedNetworks, SORule.matchingCritarias.CONTAINS.id, entityType);
                else if(type === 2)
                  $scope.updateRule(singleDesc.networkSpec, matchedNetworks, SORule.matchingCritarias.CONTAINS.id, entityType);
              } else if(singleDesc.matchingCritaria === "3") {
                var matchedNetworksStarts = [];
                _.each(searchEntity,function(singleNetwork){
                    if(singleNetwork.name.toLowerCase().indexOf(singleDesc.networkSpec.toLowerCase()) === 0){
                          matchedNetworksStarts.push(singleNetwork);
                          if(entityType === "WORKLOAD"){
                            ruleObj.workloadsSecured++;
                          } else{
                            ruleObj.workloadsSecured += singleNetwork.workloads.length;
                          }
                    }
                });
                if(type === 1)
                  $scope.createNewRule(singleDesc.networkSpec, matchedNetworksStarts, SORule.matchingCritarias.BEGIN_WITH.id, entityType);
                else if(type === 2)
                  $scope.updateRule(singleDesc.networkSpec, matchedNetworksStarts, SORule.matchingCritarias.BEGIN_WITH.id, entityType);
              }
          });
        }

        function setNetworksbyFilter(ruleObj,type,attributeType){
            var searchEntity = $scope.workloads;
            var  entityType = attributeType;
            var i,currentWorkload,matchedValue,j;
            ruleObj.workloadsSecured = 0;
          _.each(ruleObj.ruleDesc,function(singleDesc){
                if(singleDesc.matchingCritaria === "1"){
                  var alreadypresent = _.find($scope.newSoRule.ruleDesc,{"name":singleDesc.networkSpec});
                  var matchedWorkloadArray = [];
                  if(typeof alreadypresent === 'undefined'){
                      for(i=0;i<searchEntity.length;i++){
                        currentWorkload = searchEntity[i];
                        /*matchedValue = _.find(searchEntity[i].ports[0].attributes,{"name":singleDesc.networkSpec,"type":attributeType}); 
                        if(typeof matchedValue !== "undefined"){
                          matchedWorkloadArray.push(currentWorkload);
                        }*/
                        for(j = 0;j < searchEntity[i].ports[0].attributes.length;j++){
                          var singleAttribute2 = searchEntity[i].ports[0].attributes[j];
                          if((singleAttribute2.name.toLowerCase() === singleDesc.networkSpec.toLowerCase() ) && (singleAttribute2.type === attributeType)){
                            matchedWorkloadArray.push(currentWorkload);
                            ruleObj.workloadsSecured++;
                            break;
                          }
                        }
                      }
                    }
                    if(type === 1)
                      $scope.createNewRule(singleDesc.networkSpec, matchedWorkloadArray, SORule.matchingCritarias.IS.id, entityType);
                    else if(type === 2)
                      $scope.updateRule(singleDesc.networkSpec, matchedWorkloadArray, SORule.matchingCritarias.IS.id, entityType);
              } else if(singleDesc.matchingCritaria === "2") {
                var containsMatchedWorkloads = [];
                /*_.each(searchEntity,function(singleNetwork){
                    if(singleNetwork.name.toLowerCase().indexOf(singleDesc.networkSpec.toLowerCase()) !== -1){
                          containsMatchedWorkloads.push(singleNetwork);
                    }
                });*/
                for(i=0;i<searchEntity.length;i++){
                    currentWorkload = searchEntity[i];
                    /*matchedValue = _.find(searchEntity.ports[0].attributes,function(singleAttribute){
                      return (singleAttribute.name.toLowerCase().indexOf(singleDesc.networkSpec.toLowerCase()) !== -1) && (singleAttribute.type === attributeType);
                  }); 
                  if(typeof matchedValue !== "undefined"){
                    containsMatchedWorkloads.push(currentWorkload);
                  }*/
                  for(j = 0;j < searchEntity[i].ports[0].attributes.length;j++){
                      var singleAttribute1 = searchEntity[i].ports[0].attributes[j];
                      if((singleAttribute1.name.toLowerCase().indexOf(singleDesc.networkSpec.toLowerCase()) !== -1) && (singleAttribute1.type === attributeType)){
                          containsMatchedWorkloads.push(currentWorkload);
                          ruleObj.workloadsSecured++;
                          break;
                      }
                    }
                }
                if(type === 1)
                  $scope.createNewRule(singleDesc.networkSpec, containsMatchedWorkloads, SORule.matchingCritarias.CONTAINS.id, entityType);
                else if(type === 2)
                  $scope.updateRule(singleDesc.networkSpec, containsMatchedWorkloads, SORule.matchingCritarias.CONTAINS.id, entityType);
              } else if(singleDesc.matchingCritaria === "3") {
                var matchedWorkloadsStarts = [];
                for(i=0;i<searchEntity.length;i++){
                  currentWorkload = searchEntity[i];
                  for(j = 0;j < searchEntity[i].ports[0].attributes.length;j++){
                      var singleAttribute = searchEntity[i].ports[0].attributes[j];
                      if((singleAttribute.name.toLowerCase().indexOf(singleDesc.networkSpec.toLowerCase()) === 0) && (singleAttribute.type === attributeType)){
                          matchedWorkloadsStarts.push(currentWorkload);
                          ruleObj.workloadsSecured++;
                          break;
                      }
                    }
                  }
                if(type === 1)
                  $scope.createNewRule(singleDesc.networkSpec, matchedWorkloadsStarts, SORule.matchingCritarias.BEGIN_WITH.id, entityType);
                else if(type === 2)
                  $scope.updateRule(singleDesc.networkSpec, matchedWorkloadsStarts, SORule.matchingCritarias.BEGIN_WITH.id, entityType);
              }
          });
        }

        $scope.onSaveRuleClicked = function(){
              var tempRule = angular.copy($scope.inmemoryRule);
              if($scope.inmemoryRule !== null){
               
                if($scope.inmemoryRule.equal($scope.editSoRule)){
                   $scope.inmemoryRule.dirty = false;
                  
                } else{
                  if(tempRule.ruleDesc[0].ruleAttribute == "0"){
                    $scope.broadcastevent({event:"deleteOldNetworks", args:{rule:$scope.editSoRule}});
                    $scope.inmemoryRule.ruleDesc.length = 0;
                    setNetworksbyCriteria(tempRule,2);
                  } else if(tempRule.ruleDesc[0].ruleAttribute == "1") {
                    $scope.inmemoryRule.ruleDesc.length = 0;
                    _.each(tempRule.ruleDesc,function(singleDesc){
                          $scope.updateRule(singleDesc.networkSpec, [], SORule.matchingCritarias.IS.id,"CIDR");
                    });
                 }
                 else if(tempRule.ruleDesc[0].ruleAttribute == "2") {
                    $scope.broadcastevent({event:"deleteOldNetworks", args:{rule:$scope.editSoRule,type:'WORKLOAD'}});
                    $scope.inmemoryRule.ruleDesc.length = 0;
                    setNetworksbyCriteria(tempRule,2, 'WORKLOAD');
                 } else if(tempRule.ruleDesc[0].ruleAttribute == "3"){
                  $scope.broadcastevent({event:"deleteOldNetworks", args:{rule:$scope.editSoRule,type:'WORKLOAD'}});
                    $scope.inmemoryRule.ruleDesc.length = 0;
                  setNetworksbyFilter(tempRule,2,"application");
                 } else if(tempRule.ruleDesc[0].ruleAttribute == "4"){
                  $scope.broadcastevent({event:"deleteOldNetworks", args:{rule:$scope.editSoRule,type:'WORKLOAD'}});
                    $scope.inmemoryRule.ruleDesc.length = 0;
                  setNetworksbyFilter(tempRule,2,"os");
                 }
                  tempRule.dirty = true;
//                  if($scope.inmemoryRule.inline !== $scope.editSoRule.inline){
//                    $scope.inmemoryRule.dirty = false;
//                  } else if(!$scope.inmemoryRule.aspInfo.equal($scope.editSoRule.aspInfo)){
//                    $scope.inmemoryRule.dirty = false;
//                  }
                  $scope.$emit('inmemoryRuleSet',tempRule);
                }

                $scope.editSoRule.init($scope.inmemoryRule);
                $scope.editSoRule.workloadsSecured = tempRule.workloadsSecured;
                //$scope.editSoRule.init(tempRule);
                //when only SPS is changed the rule remains same,hence to fire event outside equal check
                if(tempRule.ruleDesc[0].ruleAttribute == "0"){
                  $scope.broadcastevent({event:SOEvents.ruleUpdatedEvent, args:{rule:$scope.inmemoryRule}});
                } else if(tempRule.ruleDesc[0].ruleAttribute >= "2") {
                  $scope.broadcastevent({event:SOEvents.ruleUpdatedEvent, args:{rule:$scope.inmemoryRule,type:'WORKLOAD'}});
                }
              }
              
              $scope.$parent.ruleChanged = true;
              $scope.$parent.lastShownRule = $scope.editSoRule;
              $scope.showRuleList();
              $scope.broadcastevent({event:"ClearSelections", args:{rule:$scope.editSoRule}});
        };
        $scope.onCancelEditClicked = function(){
          if($scope.isStateEditRules()){
           $scope.broadcastevent({event:SOEvents.ruleEditCanceledEvent, args:{rule:$scope.inmemoryRule}}); 
          }else{
            $scope.broadcastevent({event:SOEvents.ruleEditCanceledEvent, args:{rule:$scope.newSoRule}});
          }
            
           if($scope.configinfo.mode !== 'edit_rc'){
              $scope.inmemoryRule = null; 
              $scope.newSoRule = new SORule();
           } 
           $scope.returnToPreviousState();
        };
        $scope.addNewRuleToList = function(){
            var sameRuleFlag = false;
            _.each($scope.rulesArray, function (existingRule) {
               existingRule.precedence++;
               existingRule.dirty = true;
               if(existingRule.aspInfo.id === '' && existingRule.aspInfo.name === ''){    
                    $scope.setDefaultSps(existingRule);   
                  }
                if(existingRule.groupInfo.name === $scope.newSoRule.groupInfo.name) {
                    _.each($scope.newSoRule.ruleDesc, function(NewRuleDesc) {
                        if(!_.find(existingRule.ruleDesc, {"networkSpec": NewRuleDesc.networkSpec})) {
                            existingRule.ruleDesc.push(NewRuleDesc);
                        }
                    });
                    sameRuleFlag = true;
                    return false;
                }
            });
            if(!sameRuleFlag) {
                $scope.rulesArray.push($scope.newSoRule);
            }
            console.log("added rule to the list here : :");
            console.log($scope.rulesArray);
            $scope.newSoRule.precedence = 1;
            $scope.$parent.lastShownRule = $scope.newSoRule; // copy down the last created rule
            $scope.newSoRule = new SORule();
        };
        
        $scope.$on('editClicked', function (event, args) {
          $scope.editSoRule = args;
          $scope.broadcastevent({event:"EditRuleClicked", args:{rule:args}});
          $scope.inmemoryRule = $scope.editSoRule.clone();
          $scope.inmemoryRule.dirty = true;
          $scope.showEditRule();
        });
      $scope.$on("onTotalDeleteStateChange",function(event,args){
          console.log("these are the total rules ",$scope.secrules);
          var tempRule = args.rule;
          _.each($scope.secrules,function(singleRule){
            if(singleRule.precedence > tempRule.precedence){
                singleRule.precedence--;
                singleRule.dirty = true;
            }
          });
          tempRule.precedence = $scope.secrules.length;
          tempRule.dirty = true;
          $scope.$parent.ruleChanged = true;
          $scope.showRuleList();
      });
       $scope.$on("resourceGroupModeNetworks",function(event,args){
          $scope.editSoRule = args;
          $scope.inmemoryRule = $scope.editSoRule.clone();
          $scope.inmemoryRule.dirty = true;
       });
       $scope.enableSave = function(){
          if($scope.isStateCreateNewRule()){
            var newRule = $scope.newSoRule;
            if(newRule.groupInfo.name !== "" ){
              if($scope.configinfo.showSps === true){
                 if(newRule.aspInfo.name !== "") {
                   $scope.disableSave = false;
                 }
              }else{
                  $scope.disableSave = false;
              }
            }
          }
          //$scope.$broadcast('checkMainForm',{});
        };
        $scope.invalidForm = true;
        $scope.$on('mainformvalidityChanged',function(event,args){
          //if form is valid  (true) set disable to false and vice-versa
          $scope.invalidForm = !args.validity;
        });

        $scope.createNewRule = function(pattern, entities, matchingCritaria,typeofRule)
        {
              if($scope.newSoRule === null){
                 $scope.newSoRule = new SORule();
              }
              $scope.newSoRule.dirty = true;
               var ruleDesc = new SORuleDesc();
               if(typeof typeofRule == "undefined" || typeofRule == "NETWORK")
                  ruleDesc.ruleAttribute = SORule.ruleAttribute.NETWORK.id;
               else if(typeofRule == "CIDR")
                  ruleDesc.ruleAttribute = SORule.ruleAttribute.CIDR.id;
               else if(typeofRule == "WORKLOAD")
                  ruleDesc.ruleAttribute = SORule.ruleAttribute.WORKLOAD.id;
               else if(typeofRule == "application")
                ruleDesc.ruleAttribute = SORule.ruleAttribute.WORKLOAD_APP.id;
               else if(typeofRule == "os")
                ruleDesc.ruleAttribute = SORule.ruleAttribute.WORKLOAD_OS.id;
               ruleDesc.matchingCritaria = matchingCritaria; 
               ruleDesc.networkSpec = pattern;
               ruleDesc.precedence = 1;
               ruleDesc.networks = [];
               for(var i = 0; i < entities.length; i++){
                 var network = entities[i];
                 var networkInfo = new NetworkInfo();
                 networkInfo.id = network.id; 
                 networkInfo.name = network.name;
                 ruleDesc.networks.push(networkInfo);
               } 
               $scope.newSoRule.addSORuleDesc(ruleDesc);
        }; 

        $scope.updateRule = function(pattern, networks, matchingCritaria,typeofRule)
        {
                       
               var ruleDesc = new SORuleDesc();
               if(typeof typeofRule == "undefined" || typeofRule == "NETWORK")
                  ruleDesc.ruleAttribute = SORule.ruleAttribute.NETWORK.id;
               else if(typeofRule == "CIDR")
                  ruleDesc.ruleAttribute = SORule.ruleAttribute.CIDR.id;
               else if(typeofRule == "WORKLOAD")
                  ruleDesc.ruleAttribute = SORule.ruleAttribute.WORKLOAD.id;
               else if(typeofRule == "application")
                  ruleDesc.ruleAttribute = SORule.ruleAttribute.WORKLOAD_APP.id;
               else if(typeofRule == "os")
                  ruleDesc.ruleAttribute = SORule.ruleAttribute.WORKLOAD_OS.id;
               ruleDesc.matchingCritaria = matchingCritaria; 
               ruleDesc.networkSpec = pattern;
               ruleDesc.networks = [];
               for(var i = 0; i < networks.length; i++){
                 var network = networks[i];
                 var networkInfo = new NetworkInfo();
                 networkInfo.id = network.id; 
                 networkInfo.name = network.name;
                 ruleDesc.networks.push(networkInfo);
               }
               if($scope.inmemoryRule){
                $scope.inmemoryRule.addSORuleDesc(ruleDesc);
               }
               
        }; 


        $scope.registeInitrCallback($scope.initState);
        
        $scope.$on("playButtonClick",function(event,args){
          args.op = "selected";
          console.log("play action start ");
          console.dir(args);
          $scope.$parent.attributeDetailsView = false;
          $scope.$parent.onOrchestrationRulesSelected();
          $scope.$parent.setSandboxState(true);
          $scope.createRulebasedOnSelection(args);
          $scope.showCreateNewRule();
        });
        $scope.createRulebasedOnSelection = function(args) {
            var name = "";
            if (args.op === "selected") {
                if (typeof args.selectedEntities !== "undefined" && args.selectedEntities.length > 0) {
                    if(!$scope.newSoRule.aspInfo.name && !$scope.newSoRule.groupInfo.name )
                      $scope.newSoRule = new SORule();
                    _.each(args.selectedEntities, function (selectedEntity) {
                        $scope.createNewRule(selectedEntity.name, [selectedEntity], SORule.matchingCritarias.IS.id, selectedEntity.type);
                    });
//                    name = args.selectedNetworks[args.selectedNetworks.length - 1].name;
//                    var networks = [args.selectedNetworks[args.selectedNetworks.length - 1]];
//                    $scope.createNewRule(name, networks, SORule.matchingCritarias.IS.id);
                } else {
                    if($scope.newSoRule.ruleDesc.length > 0){
                      $scope.setCurrentState($scope.viewStates.LIST_RULES);
                    }else{
                      $scope.setCurrentState($scope.viewStates.INITIAL_NEW_RULE);
                      $scope.newSoRule = new SORule();
                    }
                    
                }
                
            } else if (args.op === "searched") {
              if(!$scope.newSoRule.aspInfo.name && !$scope.newSoRule.groupInfo.name)
                $scope.newSoRule = new SORule();
                _.each(args.searchText, function (name) {
//                name = args.searchText;
                    $scope.createNewRule(name, args.selectedEntities, SORule.matchingCritarias.CONTAINS.id );
                });
            }
        };

        $scope.upadateRulebasedOnSelection = function(args) {
            for(var i = ($scope.inmemoryRule.ruleDesc.length -1);i>=0;i--) {
              var singleDesc = $scope.inmemoryRule.ruleDesc[i];
                if((!!!singleDesc.matchingCritaria) || (!!!singleDesc.networkSpec)){
                  $scope.inmemoryRule.ruleDesc.splice(i,1);
                }
            }
            var name = "";
            if (args.op === "selected") {
                name = args.selectedEntities[args.selectedEntities.length-1].name;
                var networks = [args.selectedEntities[args.selectedEntities.length-1]];
                 $scope.updateRule(name, networks, SORule.matchingCritarias.IS.id);
                
            } else if (args.op === "searched") {
                name = args.searchText[0];
                $scope.updateRule(name, args.selectedNetworks, SORule.matchingCritarias.CONTAINS.id );
            }
        };

        $scope.$on('networkSelectionChanged', function(event, args) {
            console.log(" securityOrchestrationRightpanelDirective onNetworkSelectionChanged  >>>> ");
            console.dir(args);
            console.log($scope.configinfo);
             if(typeof args.removeNetork  !== 'undefined' && args.removeNetork  !== '' && $scope.inmemoryRule !== null){
                _.remove($scope.inmemoryRule.ruleDesc,function(item){
                  return item.networkSpec == args.removeNetork.name;
                });
              }else if($scope.configinfo.mode === 'edit_rc' && args.selectedNetworks.length >0 && !$scope.isStateEditRules()){
                $scope.showEditRule();
                $scope.upadateRulebasedOnSelection(args);
            }else if($scope.isStateEditRules()){
                $scope.upadateRulebasedOnSelection(args);   
            } else if (args.selectedNetworks.length === 0){
                $scope.showInitNewRule();
            } else {
                if ($scope.isStateInitialNewRule()) {
                    //$scope.showInitNewRule("Network", args.selectedNetworks.length);
                    $scope.showInitNewRule(args.selectedNetworks);
                } else {
                    $scope.showCreateNewRule();
                }
                $scope.createRulebasedOnSelection(args);
            }
        });

        $scope.$on('entitySelectionChanged', function(event, args) {
            console.log(" securityOrchestrationRightpanelDirective onNetworkSelectionChanged  >>>> ");
            console.dir(args);
            console.log($scope.configinfo);
             if(typeof args.removeEntity  !== 'undefined' && args.removeEntity  !== '' && $scope.inmemoryRule !== null){
                _.remove($scope.inmemoryRule.ruleDesc,function(item){
                    // need to add check
                  return item.networkSpec == args.removeEntity.name;
                });
              }else if($scope.configinfo.mode === 'edit_rc' && args.selectedEntities.length >0 && !$scope.isStateEditRules()){
                   // need to add check
                $scope.showEditRule();
                $scope.upadateRulebasedOnSelection(args);
            }else if($scope.isStateEditRules()){
                 // need to add check
                $scope.upadateRulebasedOnSelection(args);   
            } else if (args.selectedEntities.length === 0 && !$scope.rulesArray.length){
                $scope.newSoRule = new SORule();
                $scope.showInitNewRule();
            }  else if (args.selectedEntities.length === 0 && $scope.rulesArray.length){
                $scope.newSoRule = new SORule();
                $scope.showRuleList();
            } else {
//                if ($scope.isStateInitialNewRule()) {
                    $scope.showInitNewRule(args.selectedEntities);
//                } else {
//                    $scope.showCreateNewRule();
//                }
                $scope.createRulebasedOnSelection(args);
            }
            if(!args.selectedEntities.length)
              $scope.initEntityCount = 0;
        });


        $scope.$on('workloadSelectionChanged', function(event, args) {
            console.log(" securityOrchestrationRightpanelDirective onNetworkSelectionChanged  >>>> ");
            console.dir(args);
            console.log($scope.configinfo);
             if(typeof args.removeWorkload  !== 'undefined' && args.removeWorkload  !== '' && $scope.inmemoryRule !== null){
                _.remove($scope.inmemoryRule.ruleDesc,function(item){
                  return item.networkSpec == args.removeWorkload.name;
                });
              }else if($scope.configinfo.mode === 'edit_rc' && args.selectedWorkloads.length >0 && !$scope.isStateEditRules()){
                $scope.showEditRule();
                $scope.upadateRulebasedOnSelection(args);
            }else if($scope.isStateEditRules()){
                $scope.upadateRulebasedOnSelection(args);   
            } else if (args.selectedWorkloads.length === 0){
                $scope.showInitNewRule();
            } else {
                if ($scope.isStateInitialNewRule()) {
                    $scope.showInitNewRule(args.selectedWorkloads);
                } else {
                    $scope.showCreateNewRule();
                }
                $scope.createRulebasedOnSelection(args);
            }
        });
        $scope.$on(SOEvents.noneSpsPolicy, function (event, args) {    
             $scope.noneSpsPolicy = args.asp;   
        });
        $scope.$on(SOEvents.spsChangeEvent, function (event, args) {
             $scope.enableSave();   
        }); 
        
        $scope.$on(SOEvents.groupChangeEvent, function (event, args) {
            $scope.enableSave();
        });   

        $scope.$on(SOEvents.popUpMenuSelectionChangeEvent, function (event, args) {
          switch(args.selection){
            case "orchestration-rules":
               $scope.restoreRule();
            break;
            case"work-attributes":
               $scope.showWorkload();
            break;
            case"guid":
               $scope.showGuid(args.guideUrl);
            break;
          }

        }); 

        $scope.showAtributeDataPane = false;
        $scope.attributeSrceenDetails = null;
        $scope.networkData = null;
        $scope.$on('showObjectDetail', function (event, objectData) {
            $scope.attributeSrceenDetails = objectData.data.val;
            $scope.attributeType = objectData.data.type;
            $scope.tenant = _.find($scope.tenants, { id : $scope.sectenantid});
            if($scope.attributeType === "WORKLOAD") {
                var networkId = $scope.attributeSrceenDetails.ports[0].networkId;
                $scope.networkData = angular.copy(_.find($scope.networksavailable, {id : networkId}));
                _.each($scope.rulesArray, function (rule) {
                    _.each(rule.ruleDesc, function (SORuleDesc) {
                            if (SORuleDesc.networkSpec === $scope.attributeSrceenDetails.name) {
                                $scope.attributeSrceenDetails.groupInfo = rule.groupInfo;
                                $scope.attributeSrceenDetails.aspInfo = rule.aspInfo;
                            }
                    });
                });
            } else if ($scope.attributeType === "NETWORK"){
                $scope.networkData = objectData.data.val;
                _.each($scope.rulesArray, function (rule) {
                    _.each(rule.ruleDesc, function (SORuleDesc) {
                        _.each(SORuleDesc.networks, function (network) {
                           if(network.id === $scope.networkData.id) {
                               $scope.attributeSrceenDetails.groupInfo =rule.groupInfo;
                               $scope.attributeSrceenDetails.aspInfo =rule.aspInfo;
                           }
                        });
                    });
                });
            }
            $scope.showObjectAttribute();
        });

        $scope.initDirective(); 
    }


    angular.module('shieldxApp').controller('manageOrchestrationRuleCtr', manageOrchestrationRuleCtr);


    function listRulesCtr($scope, $sessionStorage,resourceGroupService,coreservices){
       console.log("sessionStorage is ",$sessionStorage);
       //$scope.commitButtonText =  "Commit Rules "+"(2)";
       $scope.commitButtonText =  "COMMIT TO ACTIVE";
       $scope.creationCount = 0;
       $scope.showGroupCreationProgress = false;
       $scope.temporaryGroups = [];
       $scope.onCommitButtonClicked = function(){
        
        console.log(" commit button clicked >>>> ");
        console.dir($scope.rulesArray);
        
        $scope.creationCount = 0;
       $scope.showGroupCreationProgress = true; 
       $scope.creationCount = ($scope.rulesArray.length-1);   
        $scope.createResourceGroup();
       
       };
       $scope.$on("unsavedExistInIt",function(event,args){
        /* jshint ignore:start */
        for (var i = 0; i < $scope.temporaryGroups.length; i++) {
            var resourceGroupId = $scope.temporaryGroups[i];
            resourceGroupService.deleteGroupList(resourceGroupId,$scope.seccloudid).then(function(deRGa){
               console.log("fee hanging resource deleted  "+deRGa);
            });
          }
        /* jshint ignore:end */
       });
       /*function groupsCtr($scope, $mdDialog,groupdata){
          console.log("  groupsCtr ");
          
          $scope.hide = function (groupdata) {
              $mdDialog.hide(groupdata);
          };
          $scope.closeDialog = function () {
              $mdDialog.cancel();
          };
          $scope.closeDialogWithAnswer = function () {
              $scope.hide(groupdata);
          };
        }*/
       
       $scope.createResourceGroup = function() {
          console.log(" createResourceGroup ");
          console.log("   $scope.tenantIdChanged              2 "+$scope.tenantid);
          console.dir($scope.rulesArray); 
          if($scope.creationCount >= 0){
            var ruleRef = $scope.rulesArray[$scope.creationCount];
            console.log(ruleRef);
            var data = ruleRef.getJSONDataForPOST($scope.seccloudid, $scope.sectenantid);
            data.precedence = ($scope.rulesArray.length+1) - data.precedence;
            if(ruleRef.groupInfo.id === -1 && ! ruleRef.deleted){
              console.log("createResourceGroup ");
              console.dir(data); 
              resourceGroupService.createResourceGroup(data).then(function(newResourceId){
                coreservices.getmemberListofResourceGroup(newResourceId,$scope.seccloudid).then(function(resourceData){
                  console.dir(" resource group created success");
                  $scope.temporaryGroups.push(newResourceId);
                  console.log(" resource group data for this created thing ",resourceData);
                  //ruleRef.mergeExistingGroup(resourceData);
                  $scope.creationCount = $scope.creationCount - 1;
                  console.log("resourceGroup  ");
                  console.dir(ruleRef);
                  ruleRef.groupInfo.id = newResourceId;
                  ruleRef.id = newResourceId;
                  ruleRef.dirty = false;
                  $scope.broadcastevent({event:SOEvents.ruleCommitedEvent, args:{rule:ruleRef,op:"add"}}); 
                  $scope.createResourceGroup();
                });
              },function(error){
                if($scope.creationCount === 0)
                  $scope.showGroupCreationProgress = false;
                  $scope.creationCount = $scope.creationCount - 1;
                  $scope.createResourceGroup();
                });
            } else if(ruleRef.groupInfo.id !== -1 && ! ruleRef.deleted && ruleRef.dirty) {
              data.id = ruleRef.groupInfo.id;
              coreservices.getmemberListofResourceGroup(ruleRef.groupInfo.id,$scope.seccloudid).then(function(originalList){
                var originalRule = new SORule();
                originalRule.mergeExistingGroup(originalList);
                originalRule.resourceType = data.resourceType;
                $scope.broadcastevent({event:SOEvents.ruleCommitedEvent, args:{rule:originalRule,op:"deletePermanent"}}); 
                resourceGroupService.updateResourceGroup(data).then(function(data){
                  coreservices.getmemberListofResourceGroup(ruleRef.groupInfo.id,$scope.seccloudid).then(function(resourceData){
                    console.log(" resource group data for updated this thing ",resourceData);
                    ruleRef.mergeExistingGroup(resourceData);
                    console.dir(" resource group updated success",ruleRef); 
                    $scope.broadcastevent({event:SOEvents.ruleCommitedEvent, args:{rule:ruleRef,op:"add"}}); 
                    $scope.creationCount = $scope.creationCount - 1;
                    ruleRef.dirty = false;
                    $scope.createResourceGroup();
                  });
                },function(error){
                  if($scope.creationCount === 0)
                  $scope.showGroupCreationProgress = false;
                  $scope.creationCount = $scope.creationCount - 1;
                  $scope.createResourceGroup();
                });
              },function(error){
                  $scope.showGroupCreationProgress = false;
                });
            } else if(ruleRef.groupInfo.id !== -1 && ruleRef.deleted) {
                 data.id = ruleRef.groupInfo.id;
                 console.log("createResourceGroup deleted >> ");
                 coreservices.getSubscriptionListBelongToAGroup(ruleRef.groupInfo.id).then(function(vcData){
                 console.log(" Subscription to dilink from vc ");
                 console.dir(vcData);
                 if(vcData){
                      return coreservices.deletSubscriptionByID(vcData.id, $scope.seccloudid).then(function(delData){
                             console.log(" Subscription  dilinked from vc ");
                             console.dir(delData);
                             return resourceGroupService.deleteGroupList(data.id,$scope.seccloudid).then(function(deRG){
                                 console.log(" resource deleted after vc dilink  ");
                                 return deRG;
                             });
                      });
                  }
                  else
                  {
                     return resourceGroupService.deleteGroupList(data.id,$scope.seccloudid).then(function(deRGa){
                                 console.log("fee hanging resource deleted  ");
                                 return deRGa;
                     });
                  }
                 
                }).then(function(fiData){
                  $scope.broadcastevent({event:SOEvents.ruleCommitedEvent, args:{rule:ruleRef, op:"deletePermanent"}});                 
                  $scope.rulesArray.splice($scope.creationCount, 1);
                  ruleRef.deleted = true;
                  $scope.broadcastevent({event:SOEvents.ruleDeletedEvent, args:{ruleref: ruleRef}});
                  $scope.creationCount = $scope.creationCount - 1;
                  $scope.createResourceGroup();
                },function(error){
                  if($scope.creationCount === 0)
                    $scope.showGroupCreationProgress = false;
                  $scope.creationCount = $scope.creationCount - 1;
                  $scope.createResourceGroup();
                });
            } else if(ruleRef.groupInfo.id === -1 && ruleRef.deleted){
                    $scope.rulesArray.splice($scope.creationCount, 1);
                    $scope.creationCount = $scope.creationCount - 1;
                    $scope.createResourceGroup();
            } else{
               $scope.creationCount = $scope.creationCount - 1;
               $scope.createResourceGroup();
            }
               
           $scope.inmemoryRule = null;
          } else{
             console.log("all resource group created ");
             $scope.showGroupCreationProgress = false; 
             $scope.broadcastevent({event:SOEvents.ruleAllCommitedEvent, args:{}});
             $scope.$parent.$parent.ruleChanged = false;
          }
               
       };
    }

    angular.module('shieldxApp').controller('listRulesCtr', listRulesCtr);


    function guidCtr($scope, resourceGroupService, $translate){
        $scope.languageInUse = $translate.use();
        $scope.helpContentID = "virtualchassis_vieweditaddisecgroup_wizard";
        $scope.$on("guideUrlChnaged",function(event,args){
          $scope.helpContentID = args.url;
          $scope.helpContentURL = "help/"+$scope.languageInUse+"/"+$scope.helpContentID+".html";
        });
        $scope.helpContentURL = "help/"+$scope.languageInUse+"/"+$scope.helpContentID+".html";
    }

    angular.module('shieldxApp').controller('guidCtr', guidCtr);

    function workLoadCtr($scope, resourceGroupService){
       
       
    }

    angular.module('shieldxApp').controller('workLoadCtr', workLoadCtr);

    function objectAttributeCtr($scope, resourceGroupService){
       $scope.createRuleByplay = function(argsObj){
          console.log("this is the received obj ",argsObj);
          argsObj.selectedEntities[0].type = argsObj.type;
          $scope.broadcastevent({event:"playButtonClick", args:argsObj});
       };
    }

    angular.module('shieldxApp').controller('objectAttributeCtr', objectAttributeCtr);

    function groupsCtr($scope, $mdDialog,groupdata){
          console.log("  groupsCtr ");
          $scope.isSearchBarOpen = false;
          $scope.selected = [];
          $scope.groupdata = groupdata;
          _.each($scope.groupdata,function(singleGroup){
              singleGroup.rulesCriteria = getCriteriaFromRegex(singleGroup.regex);
          });
          console.log($scope.groupdata);
          $scope.toggleSearchBar = function(event) {
            $scope.isSearchBarOpen = $scope.isSearchBarOpen === false ? true : false;
            if ($scope.isSearchBarOpen)
                angular.element(event.currentTarget.firstElementChild).css('color', '#4a90e2');
            else
                angular.element(event.currentTarget.firstElementChild).css('color', '#6d6e71');
          };
          
          $scope.cancelDialog = function () {
              $mdDialog.cancel();
          };
          $scope.applyDialog = function () {
              $mdDialog.hide($scope.selected);
          };
          function getCriteriaFromRegex(regEx){
              var res = regEx.substring(6, regEx.length-2);
              var conditionArray = res.split(").*|(");
              console.log("condition is ",conditionArray);
              var containCriteriaString = "";
              var startsCriteriaString = "";
              var equalCriteriaString = "";
              var remainingCriterias = [];
              var startsCriteriaArray = [];
              var equalCriteriaArray = [];
              var containCriteriaArray = [];
              //string matches contains criteria if length is 2 else no contains criteria is set
              if(conditionArray.length == 2){
                containCriteriaString = conditionArray[0].substring(3,conditionArray[0].length);
                console.log("contains criteria string is ",containCriteriaString);
                containCriteriaArray = containCriteriaString.split("|");
                console.log("contains criteria selected are ",containCriteriaArray);
                remainingCriterias = conditionArray[1].split(")|(");
                console.log("remaining criteria ",remainingCriterias);
                //remaining criteria is 2 if equal and start both are present
                  
              } else {
                remainingCriterias = conditionArray[0].split(")|(");
                console.log("remaining criteria ",remainingCriterias);
              }
              if(remainingCriterias.length == 2){
                equalCriteriaArray = remainingCriterias[0].split("|");
                console.log(equalCriteriaArray);
                startsCriteriaString = remainingCriterias[1].substring(0,remainingCriterias[1].length-3);
                console.log("starts criteria ",startsCriteriaString);
                startsCriteriaArray = startsCriteriaString.split("|");
                console.log("start criteria array ",startsCriteriaArray);
              } else {
                //presence of ").*" indicates begins with criteria is present
                if(remainingCriterias[0].indexOf(").*") !== -1){
                    startsCriteriaString = remainingCriterias[0].substring(0,remainingCriterias[0].length-3);
                    console.log("starts criteria single ",startsCriteriaString);
                    startsCriteriaArray = startsCriteriaString.split("|");
                    console.log("start criteria array single ",startsCriteriaArray);
                  } else {
                    equalCriteriaString = remainingCriterias[0].substring(1,remainingCriterias[0].length-1);
                    console.log("equal criteria single ",equalCriteriaString);
                    equalCriteriaArray = equalCriteriaString.split("|");
                    console.log("equal criteria array single ",equalCriteriaArray);
                  }
              }
              return {"equal":equalCriteriaArray,"begins":startsCriteriaArray,"contains":containCriteriaArray};
          }
        }
    angular.module('shieldxApp').controller('groupsCtr', groupsCtr);

})();
