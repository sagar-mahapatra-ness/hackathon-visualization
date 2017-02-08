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
    function aclPolicyTableDirective() {
        var directive = {};
        directive.restrict = 'E';
        directive.templateUrl = 'core/directive/acl-table/acl-table.html';
        directive.scope = {
            content: '=content',
            totaldata:'=totaldata',
            mode:'=mode'
        };
        directive.controller = ['$scope', '$state', 'policyService', '$translate', '$mdDialog', 'dragularService', 'infrastructureConnectorService', '$sessionStorage', 'userSessionMenagment', function($scope, $state, policyService, $translate, $mdDialog, dragularService, infrastructureConnectorService,$sessionStorage,userSessionMenagment) {

            $scope.selectedcheckBox = false;
            $scope.brand = false;
            $scope.policiesList = [];
            $scope.languageInUse = $translate.use();
            $scope.blockingThreshold = '';
            $scope.resGroupTotalList = [];
            $scope.dateInSateParams = false;
            $scope.resPromiseComplited = true;
            $scope.isSearchBarOpen = false;
            $scope.rsGroupselectedValues = [];
            $scope.selectedCopyResList = [];
            if($state.params.policyId){
                $scope.dataInSateParams = true;
            }
            var update_id = authorities("policy_update");
            $scope.is_update_policy = userSessionMenagment.isUserAllowd(update_id);
            policyService.getDataBasedOnId("threatpreventionpolicy/appid", "policy", true).then(function(data) {
                $scope.dataList = data;
                $scope.list_app_activated = false;
            }, function(err) {
                console.log("error while getting the appid list");
                $scope.list_app_activated = false;
            });
            policyService.getDataBasedOnId("policy", "accesscontrolpolicy/action").then(function(res) {
                    $scope.actionList = res;
                }, function(err) {
                    console.log("Error Data From Action");
                    $scope.actionList = ["PERMIT", "DENY"];
                });
            $scope.ProtocolList = [{"protocolName":"TCP"},{"protocolName":"UDP"},{"protocolName":"BOTH"}];
            policyService.getResourceGroupData().then(function(data){
                $scope.totalResGroup = data;
                $scope.resPromiseComplited = false;
             },function(err){
                $scope.resPromiseComplited = false;
                console.log("unable to fetch Resource Groups");
             });
            //$scope.totalResGroup = $sessionStorage.resourcegroup;
            var dragAndDropContainer = document.querySelector('#updateAclRowcontent');
            dragularService([dragAndDropContainer], {
                //containersModel: [$scope.items1],
                //copy: true,
                //move only from left to right  
                //accepts: accepts,
                moves: function(el, container, handle) {
                    return handle.id === 'handle';
                },
                invalid:function(el,container,hadle){
                    var temp  = el.className;
                    return temp.indexOf("ImplicitDenyAll") > 0;
                },
                scope: $scope
            });

            $scope.$on('dragulardrag', function(e, el) {
                console.log(" drag start ");
                e.stopPropagation();

            });
/*            $scope.$on('dragulardrop',function(e,target,source,sibiling){
                console.log(target);
            }); */    
            $scope.$on('dragularrelease',function(e,el){
                 console.log("relase");
                 var elements = angular.element(dragAndDropContainer);
                // console.log(" dragAndDropContainer elements "); 
                // console.dir(elements);
                var dragElements = elements[0].children;
                /* jshint ignore:start */
                for (var i = 0; i < dragElements.length; i++) {
                    var dragElement = dragElements[i];
                     var ruleval = _.find($scope.content, function(o) {
                        return o.orderNum === parseInt(dragElement.id);
                    });
                    ruleval.orderNum = (i + 1);
                }
                $scope.content = _.sortBy( $scope.content, 'orderNum');
                for(var i=0,j=1;i<$scope.content.length;i++){
                    if($scope.content[i].name === 'ImplicitDenyAll'){
                        $scope.content[i].orderNum = $scope.content.length;
                    }else{
                        $scope.content[i].orderNum = j;
                        j++;
                    }
                }
                 $scope.content = _.sortBy( $scope.content, 'orderNum');
                 $scope.$emit('listenAclPolicyData', { data: $scope.content });
                 /* jshint ignore:end */
                  e.stopPropagation();
            });
            $scope.toggleSearchBar = function(event) {
                    $scope.isSearchBarOpen = $scope.isSearchBarOpen === false ? true : false;
                    if ($scope.isSearchBarOpen)
                        angular.element(event.currentTarget.firstElementChild).css('color', '#4a90e2');
                    else
                        angular.element(event.currentTarget.firstElementChild).css('color', '#6d6e71');
            };
            $scope.deleteAclPolicy = function(data){
                _.remove($scope.content, function(item){
                    return item.id === data.id;
                });
                $scope.$emit('listenAclPolicyData', { data: $scope.content });
                console.log($scope.content);
                console.log(data);
            };
            $scope.$emit('listenAclPolicyData', { data: $scope.content });
         /*   $scope.chnageOrderInACLTabel = function(data,key){
                if(data !== '' && $scope.content.length >= parseInt(data) && parseInt(data) > 0  ){
                    $scope.content[key].orderNum = parseInt(data);
                    $scope.content[key].editOrderNumber = false;
                    $scope.content = _.sortBy( $scope.content, 'orderNum');
                   // _.sortBy($scope.content, 'orderNum');
                }
            };*/
            $scope.rangesList = [{
                    'portnumber': '',
                    'start': '',
                    'end': '',
                    'rangeEndEnableState':true,
                    'PortnumberEnableState':true
                }];
            $scope.addAnthorRange = function() {
                var data = {
                    'portnumber': '',
                    'start': '',
                    'end': '',
                    'rangeEndEnableState':true,
                    'PortnumberEnableState':true
                };
                $scope.rangesList.push(data);
            };
            $scope.addAnthorCidr = function(){
                var data = {'value':''};
                $scope.cidrList.push(data);
            };
            $scope.deleteCidr = function(cidr){
                var i = _.findIndex($scope.cidrList, function(item) {
                    return cidr === item;
                });

                if (i !== undefined) {
                    $scope.cidrList.splice(i, 1);
                }
                $scope.IsValidForm();
            };
            $scope.deleterange = function(range) {
                var i = _.findIndex($scope.rangesList, function(item) {
                    return range === item;
                });

                if (i !== undefined) {
                    $scope.rangesList.splice(i, 1);
                }
                if($scope.rangesList.length === 0){
                    $scope.addAnthorRange();
                }
                $scope.IsValidForm();
                //_.remove()
                //$scope.deleted({ranges:$scope.rangesRef}); 
            };
           $scope.endRangeKeyDown = function ($event, rangeData) {
                    if(rangeData.portnumber !==  ''  ){
                        rangeData.rangeEndEnableState = false;
                    }else if(rangeData.start !==  '' || rangeData.end !==  '' ){
                        rangeData.PortnumberEnableState = false;
                    }else{
                        rangeData.rangeEndEnableState = true;
                        rangeData.PortnumberEnableState = true;
                    }

                };

           /* $scope.callToOpenPopUp = function(event,id){
                console.log(id);
                $scope.showMoreResGruops = false;
                if(id === "Server Objects"){
                    $scope.callResourceGroupList(event,id);
                }
            };*/
            $scope.emptyServerObjects = function(){
                $scope.selectedGroupList = [];
                $scope.selectedResGroupObj = []; 
                $scope.selectedResGroupObjID = [];
                $scope.RemoveExistingData =  false;
                $scope.ResGroupRadioSelected = false; 
            };
            $scope.emptyCidrs = function(){
                $scope.cidrList = [{
                    'value':''
                }];
                $scope.RemoveExistingData =  false;
            };

            $scope.callToOpenPopUpForProtocolAppId =  function(event, id){
                if(id === 'AppIDs' ){
                    $scope.callgetListPopUp(event,"AppId");
                }else{
                    $scope.callgetprotocolListPopUp(event,'Protocols');
                }
            };
            $scope.emptyAppIDs = function(){
                $scope.selectedAPPIDGroupList = [];
                $scope.selectedAPPIDObj = [];
                $scope.selectedAPPIDObjID = [];
                $scope.RemoveExistingDataForAPPProto = false;
                $scope.appIDSelected = false;
            };
            $scope.emptyProtoclos = function(){
                $scope.protocolSelectedValue = {'protocolName':''};
                $scope.protocolSelected = false;
                $scope.selectedprotocol = '';
                $scope.RemoveExistingDataForAPPProto = false;
            };
            $scope.cancelDataForTheExisting = function(id){
                if(id === 'Server Objects'){
                    $scope.emptyServerObjects();
                }else if(id === 'CIDRs'){
                    $scope.emptyCidrs();
                }else if(id === 'AppIDs'){
                    $scope.emptyAppIDs();
                }else{
                    $scope.emptyProtoclos();
                }
                $scope.IsValidForm(); 
            };
            $scope.onSelectProtocolCidrsChanged = function(data){
                if( data === "Server Objects" && $scope.cidrList.length > 0){
                    if($scope.cidrList.length > 1){
                        $scope.RemoveExistingData =  true;    
                    }else if($scope.cidrList.length === 1 && $scope.cidrList[0].value !== ''){
                        $scope.RemoveExistingData =  true;    
                    }                        
                }else if(data === "CIDRs" && $scope.ResGroupRadioSelected){
                    $scope.RemoveExistingData =  true;
                }else if(data === "AppIDs" && $scope.protocolSelectedValue !== undefined && $scope.protocolSelectedValue.protocolName !== ''){
                    $scope.RemoveExistingDataForAPPProto =  true;
                }else if(data  === "L4 Protocols" && $scope.selectedAPPIDGroupList.length > 0){
                    $scope.RemoveExistingDataForAPPProto =  true;
                }else{
                    $scope.RemoveExistingData =  false;
                    $scope.RemoveExistingDataForAPPProto = false;
                }
                
            };
            $scope.IsValidForm = function(){
                 if($scope.aclPolicyIndexOfEditRow !== undefined ){
                        if($scope.aclrulename !== ''){
                            $scope.aclnewRForm.$dirty = true; 
                        }
                    }
            };
            $scope.showMoreItemPopUp = function(event,data,name){
                $scope.showmorePopUpData = data;
                $scope.showMoreDataName = name;
                $mdDialog.show({
                    skipHide: true,
                    preserveScope: true,
                    controller: showMoreDataCtrl,
                    bindToController: true,
                    templateUrl: 'core/directive/acl-table/more-data.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    fullscreen: false,
                    scope: $scope,
                    openFrom: { top: 1100, height: 0 },
                    closeTo: { left: 1500 }
                }).then(function() {

                });
            };
            function showMoreDataCtrl($mdDialog,$scope){
                $scope.cancelShowMoreDataPopup = function(){
                    $mdDialog.cancel();
                };
            }
            $scope.callResourceGroupList = function(event, data) {
                // $scope.clickedItemForPopup = data;
                $scope.isresSearchBarOpen = false;
                $scope.resGroupFromPopupSeleted=[];
                $mdDialog.show({
                    skipHide: true,
                    preserveScope: true,
                    controller: aclResourceGroupListCtrl,
                    bindToController: true,
                    templateUrl: 'core/directive/acl-table/rs-group.html',
                    parent: angular.element(document.body),
                    locals: {'originalResGroupData': $scope.totalResGroup},
                    targetEvent: event,
                    fullscreen: false,
                    scope: $scope,
                    openFrom: { top: 1100, height: 0 },
                    closeTo: { left: 1500 }
                }).then(function() {

                });
            };

            function aclResourceGroupListCtrl($scope, $mdDialog,originalResGroupData) {
                $scope.popheading = 'Select Resource Groups to Monitor';
                $scope.rcGrouplenghtText = "ResourceGroup(s)";
                $scope.rcGroupSelected = "";
                $scope.selectedResGroup = '';
                $scope.selectedResGroupObj = [];
                $scope.selectedResGroupObjID = [];
                $scope.totalResGroupData = originalResGroupData;
                //$scope.ResGroupRadioSelected = false;
        
                $scope.toggle = function(item, list) {
                    var idx = list.indexOf(item);
                    if (idx > -1) {
                        list.splice(idx, 1);
                    } else {
                        list.push(item);
                    }
                    $scope.radioResGroupSelected = (list.length > 0)?true:false;
                };

                $scope.exists = function(item, list) {
                    return list.indexOf(item) > -1;
                };

                $scope.canceResGroupDialogue = function() {
                    $mdDialog.cancel();
                };
                $scope.isIndeterminate = function () {
                    if($scope.selectedGroupList && $scope.totalResGroup){
                        return ($scope.selectedGroupList.length !== 0 &&
                            $scope.selectedGroupList.length !== $scope.totalResGroup.length);
                    }
                };
                $scope.isChecked = function () {
                    if($scope.totalResGroup && $scope.selectedGroupList){
                        return $scope.selectedGroupList.length === $scope.totalResGroup.length;    
                    }
                    
                };
                $scope.toggleAll = function () {
                    if ($scope.selectedGroupList.length === $scope.totalResGroup.length) { //uncheck all
                        $scope.selectedGroupList = [];
                        $scope.radioResGroupSelected  = false;
                    } else if ($scope.selectedGroupList.length === 0 || $scope.selectedGroupList.length > 0) {
                        $scope.selectedGroupList = $scope.totalResGroup.slice(0);
                        $scope.radioResGroupSelected  = true; //check all
                    }
                    $scope.no_of_selected_ResGroup = $scope.selectedGroupList.length;
                };
                 $scope.toggleSearchBarRes = function(event) {
                    $scope.isresSearchBarOpen = $scope.isresSearchBarOpen === false ? true : false;
                    if ($scope.isresSearchBarOpen)
                        angular.element(event.currentTarget.firstElementChild).css('color', '#4a90e2');
                    else
                        angular.element(event.currentTarget.firstElementChild).css('color', '#6d6e71');
                 };
                $scope.listResGroupDone = function(value) {
                    $mdDialog.hide();
                      $scope.selectedResGroupObj = [];
                      $scope.selectedResGroupObjID = [];
                    $scope.ResGroupRadioSelected = true;
                    $scope.RemoveExistingData = false;
                    _.each($scope.selectedGroupList , function(val){
                        $scope.selectedResGroupObj.push(val.name); 
                        $scope.selectedResGroupObjID.push(val.id); 
                    });
                    $scope.selectedCopyResList = angular.copy($scope.selectedGroupList);
                   $scope.IsValidForm();
                };

            }
            $scope.callgetListPopUp = function(eve, data) {
                $scope.clickedItemForPopup = data;
                $scope.showMoreAppIds = false;
                $mdDialog.show({
                    skipHide: true,
                    preserveScope: true,
                    controller: aclAppIDToMonitorCtrl,
                    bindToController: true,
                    templateUrl: 'core/directive/acl-table/app-id-list.html',
                    parent: angular.element(document.body),
                    locals: {'appIDDataList': $scope.dataList},
                    targetEvent: eve,
                    fullscreen: false,
                    scope: $scope,
                    openFrom: { top: 1100, height: 0 },
                    closeTo: { left: 1500 }
                }).then(function() {

                });
            };
            
            $scope.callgetprotocolListPopUp = function(eve, data) {
                $scope.clickedItemForPopup = data;
                $mdDialog.show({
                    skipHide: true,
                    preserveScope: true,
                    controller: aclprotocolListCtrl,
                    bindToController: true,
                    templateUrl: 'core/directive/acl-table/protocol-list.html',
                    parent: angular.element(document.body),
                    locals: {'orgProtoColList': $scope.ProtocolList},
                    targetEvent: eve,
                    fullscreen: false,
                    scope: $scope,
                    openFrom: { top: 1100, height: 0 },
                    closeTo: { left: 1500 }
                }).then(function() {

                });
            };

            function aclprotocolListCtrl($scope, $mdDialog,orgProtoColList) {
                $scope.heading = 'L4 Protocols to Monitor';
                $scope.ProtocollenghtText = "Protocol(s)";
                $scope.list_protocol_activated = false;
                //$scope.protocolSelected = false;
                $scope.protocolCopyList = orgProtoColList;
                $scope.onSelectProtocolChanged = function() {
                    $scope.protocolFromPopSelected = true;
                };
                $scope.canceProtocolDialogue = function() {
                    $mdDialog.cancel();
                };
                $scope.listProtocolIdDone = function(value) {
                    $mdDialog.hide();
                    $scope.protocolSelected = true;
                    $scope.protocolSelectedValue = JSON.parse(value);
                    $scope.IsValidForm();
                };
            }

            function aclAppIDToMonitorCtrl($scope, $mdDialog,appIDDataList) {
                $scope.selectedAppIdValue = "";
                //$scope.appIDSelected = false;
                //console.log(appIDDataList);
                $scope.originalAppDataList = appIDDataList;
                $scope.selectedAPPIDObjID = [];
                $scope.heading = 'Select AppID to Monitor';
                $scope.lenghtText = "AppID(s)";
                $scope.APPIDFromPopSelected = false;
                $scope.appIdSelectedValue = {};
                $scope.selectedAppIdValue = '';
                if($scope.selectedAPPIDGroupList.length > 0){
                     $scope.APPIDFromPopSelected = true;
                }
                $scope.toggleAppID = function(item, list) {
                    var idx = list.indexOf(item);
                    if (idx > -1) {
                        list.splice(idx, 1);
                    } else {
                        list.push(item);
                    }
                    $scope.APPIDFromPopSelected = (list.length > 0)?true:false;
                };

                $scope.existsAppid = function(item, list) {
                    return list.indexOf(item) > -1;
                };

                $scope.isIndeterminate = function () {
                    if($scope.selectedAPPIDGroupList && $scope.originalAppDataList){
                        return ($scope.selectedAPPIDGroupList.length !== 0 &&
                            $scope.selectedAPPIDGroupList.length !== $scope.originalAppDataList.length);
                    }
                };
                $scope.isChecked = function () {
                    if($scope.selectedAPPIDGroupList && $scope.originalAppDataList){
                        return $scope.selectedAPPIDGroupList.length === $scope.originalAppDataList.length;    
                    }
                };
                $scope.toggleAll = function () {
                    if ($scope.selectedAPPIDGroupList.length === $scope.originalAppDataList.length) { //uncheck all
                        $scope.selectedAPPIDGroupList = [];
                    } else if ($scope.selectedAPPIDGroupList.length === 0 || $scope.selectedAPPIDGroupList.length > 0) {
                        $scope.selectedAPPIDGroupList = $scope.originalAppDataList.slice(0); //check all
                    }
                    $scope.no_of_selected_APPID = $scope.selectedAPPIDGroupList.length;
                };
                /*$scope.onSelectAPPIDChanged = function() {
                    $scope.APPIDFromPopSelected = true;
                };*/
                $scope.cancellistIdDialogue = function() {
                    $mdDialog.cancel();
                };
                $scope.listIdDone = function(value) {
                    $scope.selectedAPPIDObj = [];
                    $scope.selectedAPPIDObjID = [];
                    $mdDialog.hide();
                    $scope.appIDSelected = true;
                    _.each($scope.selectedAPPIDGroupList , function(val){
                        $scope.selectedAPPIDObj.push(val.name); 
                        $scope.selectedAPPIDObjID.push(val.id); 
                    });
                    $scope.IsValidForm();
                    //$scope.appIdSelectedValue = JSON.parse(value);
                };
            }
            $scope.callToAddNewAclRule = function(event,data,key,mode) {
                $scope.FromExistingPolicy = data;
                $scope.aclPolicyIndexOfEditRow = key;
                $scope.mode = mode;
                $mdDialog.show({
                    skipHide: true,
                    preserveScope: true,
                    controller: newAclPolciyDetailsCtr,
                    bindToController: true,
                    templateUrl: 'core/directive/acl-table/acl-policy.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    fullscreen: false,
                    scope: $scope,
                    openFrom: { top: 1100, height: 0 },
                    closeTo: { left: 1500 }
                }).then(function() {

                });
            };
            function serialize(data){
                if(data.start && data.end){
                    return ""+data.start+"-"+data.end;    
                }else if(data.portnumber){
                    return data.portnumber;
                }else if(data.value){
                    return data.value;
                }else{
                    return '';
                }
            }
            function serializeACLRanges(data,key){
               var ret = "";
                var appender = "";
                if(key === 'ranges'){
                    _.remove(data,function(item){
                        return (item.end === '' && item.start === '' && item.portnumber === '');
                    });
                        
                }else{
                     _.remove(data,function(item){
                        return item.value === '' ;
                    }); 
                }
                
                for(var i=0; i < data.length; i++){
                    var range = data[i];
                    //if(range.end !== '' || range.start !== '' || range.portnumber !== ''){
                        if(i===0){
                            appender = "";
                        } else {
                            appender = ",";
                        }
                        ret = ret +appender + serialize(range);
                   // }
                         
                } 
                return ret;
            }
            function deserializeACLcidrs(data){
                var cidrAr = data;
                var cidrs = [];
                if(typeof data === "string"){
                    cidrAr = data.split(",");
                }
                for(var i=0; i < cidrAr.length; i++){
                    cidrs.push({'value':cidrAr[i]});
                }
                return cidrs;
            }
            function deserializeACLRanges(data){
                var sampleObj = {
                    'portnumber': '',
                    'start': '',
                    'end': '',
                    'rangeEndEnableState':true,
                    'PortnumberEnableState':true
                };
                var avalRanges = data;
                var rangesDataAfterDes = [];
                if(typeof data === "string"){
                    avalRanges = data.split(",");
                }
                for(var i=0; i < avalRanges.length; i++){
                    var datobj = angular.copy(sampleObj); 
                    if(avalRanges[i].indexOf('-') > 0){
                        var rangearray = avalRanges[i].split("-");
                        datobj.start = rangearray[0];
                        datobj.end = rangearray[1];
                        datobj.PortnumberEnableState = false;
                        rangesDataAfterDes.push(datobj);
                    }else{
                        datobj.portnumber = avalRanges[i];
                         datobj.rangeEndEnableState = false;
                        rangesDataAfterDes.push(datobj);
                    }
                }
                return rangesDataAfterDes;
            }
            $scope.updateAddRuleToAcl = function() {
                var ruleObj = { "id": 0, "name": "", "description": "", "orderNum": 0, "destinationCidrs": "", "destinationResourceGroupList": [], "destinationProtocol": "TCP", "destinationPortRanges": "", "destinationApps": "", "action": '', "enableTLSInspection": false};
                ruleObj.name = $scope.aclrulename;
                ruleObj.description = $scope.aclruledes;
                var serializedRanges = serializeACLRanges($scope.rangesList,'ranges');
                var serializedCidr = serializeACLRanges($scope.cidrList, 'cidrs');
                ruleObj.destinationPortRanges = serializedRanges;
                ruleObj.enabled = $scope.enableButtonChecked;
                ruleObj.enableTLSInspection=$scope.enableTLSInspection;
                ruleObj.action = $scope.actionValue;
                ruleObj.resourcegroupNames= $scope.selectedResGroupObj;
                //selectedResGroupObj
                if($scope.appIDSelected){
                    ruleObj.destinationApps = $scope.selectedAPPIDObj.toString();  
                   // ruleObj.destinationAppsList =  ruleObj.destinationApps.split(',');  
                }
                if($scope.selectedprotocolCidr === "CIDRs"){
                    ruleObj.destinationCidrs = serializedCidr;
                }
                if($scope.selectedprotocolCidr === "Server Objects"){
                    ruleObj.destinationResourceGroupList = $scope.selectedResGroupObjID;    
                }
                _.each($scope.resGroupTotalList,function(resGp){
                        //if(resGp.)
                });
                
                //ruleObj.destinationProtocol = $scope.protocolSelectedValue.protocolName; /*$scope.protocolSelectedValue.protocolName*/
                if($scope.protocolSelectedValue && $scope.protocolFromPopSelected ){
                    ruleObj.destinationProtocol = $scope.protocolSelectedValue.protocolName;    
                }else{
                    ruleObj.destinationProtocol = null;
                }
                
                //$scope.aclRules.push(ruleObj);
                if ($scope.content === undefined) {
                    $scope.content = [];
                }
                if($scope.aclPolicyIndexOfEditRow !== undefined && $scope.aclPolicyIndexOfEditRow !== '' ){
                    ruleObj.id = $scope.content[$scope.aclPolicyIndexOfEditRow].id;
                    ruleObj.orderNum = $scope.content[$scope.aclPolicyIndexOfEditRow].orderNum;
                    $scope.content[$scope.aclPolicyIndexOfEditRow] = ruleObj;
                }else{
                    _.each($scope.content, function(val, key) {
                       // val.orderNum = key + 1;
                       val.newRule = false;
                    });
                     ruleObj.newRule = true;
                     $scope.content.unshift(ruleObj);
                    _.each($scope.content, function(val, key) {
                        val.orderNum = key + 1;
                    });
                }
                console.log("$scope.rangesList >>>>>>>>>>> 2");
                console.dir($scope.rangesList);
                console.dir($scope.aclRules);
                $scope.$emit('listenAclPolicyData', { data: $scope.content });
                $mdDialog.cancel($scope.aclRules);
            };

            function newAclPolciyDetailsCtr($scope, $mdDialog) {
                console.log("from the new acl Polciy dir");
                $scope.enableButtonChecked = true;
                $scope.enableTLSInspection = false;
                $scope.ResGroupRadioSelected = false;
                $scope.protocolSelected = false;
                $scope.appIDSelected = false;
                $scope.aclrulename = '';
                $scope.aclruledes = '';
                $scope.protocolFromPopSelected = false;
                $scope.selectedAPPIDGroupList = [];
                $scope.selectedGroupList = [];
                $scope.selectedResGroupObj = [];
                $scope.selectedprotocol = "";
                $scope.showMoreResGruops = false;
                $scope.showMoreAppIds = false;
                $scope.rangesAvaliable = false;
                $scope.selectedCopyResList = [];
                if(!$scope.dataList){
                    $scope.list_app_activated = true;    
                }
                $scope.aclnewRForm = [];
                //$scope.dataList = [];
                $scope.actionValue = $scope.actionList[0];
                $scope.radioResGroupSelected = false;
                $scope.selectedprotocolCidr = "Server Objects"; 
                $scope.selectedAppIDProtocol = "AppIDs";   
                $scope.rangesList = [{
                    'portnumber': '',
                    'start': '',
                    'end': '',
                    'rangeEndEnableState':true,
                    'PortnumberEnableState':true
                }];
                $scope.cidrList = [{
                    'value':''
                }];
                $scope.cancelAddRuleDialogue = function() {
                    $mdDialog.hide();
                };
                if($scope.FromExistingPolicy) {
                    $scope.aclnewRForm.$dirty = true;  
                    $scope.selectedAPPIDObj = [];
                    $scope.selectedAPPIDObjID = [];
                    $scope.aclrulename = $scope.FromExistingPolicy.name;
                    $scope.aclruledes = $scope.FromExistingPolicy.description;
                    $scope.enableButtonChecked = $scope.FromExistingPolicy.enabled;
                    $scope.enableTLSInspection=$scope.FromExistingPolicy.enableTLSInspection;
                    $scope.actionValue = $scope.FromExistingPolicy.action;    
                    if($scope.FromExistingPolicy.destinationCidrs){
                        $scope.cidrList = deserializeACLcidrs($scope.FromExistingPolicy.destinationCidrs);
                        $scope.selectedprotocolCidr = 'CIDRs';    
                    }
                    if($scope.FromExistingPolicy.destinationPortRanges){
                        $scope.rangesList= deserializeACLRanges($scope.FromExistingPolicy.destinationPortRanges);    
                        $scope.rangesAvaliable = true;
                    }
                    if($scope.FromExistingPolicy.destinationProtocol){
                        $scope.protocolSelectedValue = {'protocolName':''};
                        $scope.protocolSelectedValue.protocolName = $scope.FromExistingPolicy.destinationProtocol;
                        $scope.selectedprotocol = JSON.stringify($scope.protocolSelectedValue);
                        $scope.protocolSelected = true;
                        $scope.protocolFromPopSelected = true;  
                        $scope.selectedAppIDProtocol   = 'L4 Protocols';
                    }
                    
                    //$scope.enableButtonChecked = $scope.FromExistingPolicy.enabled;
                    //$scope.selectedResGroupObjID
                    if($scope.FromExistingPolicy.destinationResourceGroupList !== undefined && $scope.FromExistingPolicy.destinationResourceGroupList.length > 0){
                       _.each($scope.FromExistingPolicy.destinationResourceGroupList,function(resGp){
                           var resGroup = _.find($scope.totalResGroup,function(singleGp){
                                        return singleGp.id === resGp;
                           });
                           if(resGroup){
                                $scope.selectedResGroupObj.push(resGroup.name); 
                                $scope.selectedGroupList.push(resGroup);
                                $scope.ResGroupRadioSelected = true;
                                $scope.radioResGroupSelected = true;

                           }
                        });
                        $scope.selectedprotocolCidr = 'Server Objects'; 
                        $scope.selectedCopyResList =  angular.copy($scope.selectedGroupList); 
                    }
                    if($scope.FromExistingPolicy.destinationApps && $scope.FromExistingPolicy.destinationApps !== ''){
                        var appIdsFromEdit = $scope.FromExistingPolicy.destinationApps.split(",");
                        _.each(appIdsFromEdit,function(val){
                            var appData = _.find($scope.dataList,function(appId){
                                return appId.name === val;
                            });
                            if(appData){
                                $scope.selectedAPPIDGroupList.push(appData);    
                            }
                        });
                      _.each($scope.selectedAPPIDGroupList , function(val){
                            $scope.selectedAPPIDObj.push(val.name); 
                            $scope.selectedAPPIDObjID.push(val.id); 
                        });
                        $scope.appIDSelected = true;   
                        $scope.selectedAppIDProtocol   = 'AppIDs'; 
                    }
                    
                }
   
            }
        }];
        return directive;
    }

    angular.module('shieldxApp').directive('aclPolicyTable', aclPolicyTableDirective);
})();
