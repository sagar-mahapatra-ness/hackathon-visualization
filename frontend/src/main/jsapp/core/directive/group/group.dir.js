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
    function groupDirective() {
        var directive = {};
        directive.restrict = 'E';
        directive.templateUrl = 'core/directive/group/group.html';
        directive.scope = {
            networkInfo: '=netinfo',
            selectedNetworks: '=selectednetworks',
            selectedWorkloads: '=selectedworkloads',
            secrules: '=',
            toggle: '&onToggle',
            resouregroupassigned: "=",
            workloads : "=",
            networksavailable : "=",
            sandboxgroups : "=",
            activeGroups : "=activegroups",
        };
        directive.controller = ['$scope', function ($scope) {

                $scope.sandboxgroups = [];
                $scope.activeGroups = [];
                $scope.sandboxMode = false;

                $scope.pageObjModel = {};
                
                $scope.pageObjModel.firstPageIndexGroup = 0;
                $scope.pageObjModel.lastPageIndexGroup = 6;
                $scope.pageObjModel.startIndexGroup = 0;
                $scope.pageObjModel.endIndexGroup = 6;
                //$scope.pageObjModel.pageLength = 6; //default
                $scope.pageObjModel.pages = 0;

                $scope.manageZoomPagination = function() {
                    var dataToIterate = "";
                    if($scope.sandboxMode){
                        dataToIterate = $scope.sandboxgroups;
                    } else {
                        dataToIterate = $scope.activegroups;
                    }
                    _.forEach(dataToIterate, function(obj, key){
                        if(key >= $scope.pageObjModel.startIndexGroup && key <= $scope.pageObjModel.endIndexGroup)
                            obj.hideForZoom = false;
                        else
                            obj.hideForZoom = true;
                    });
                    $scope.$emit("pageModelSetGroup", {data : $scope.pageObjModel});
                };
                
                $scope.$watchCollection('networksavailable', function(newCollection,oldCollection){
                    if(newCollection.length){
                        console.log("networksavailable called",newCollection);
                        console.log("ruleSet",$scope.ruleSet);
                        $scope.seggregateGroupsFromRulesByStates($scope.ruleSet);
                    }
                });
                $scope.$watchCollection('sandboxgroups', function(newCollection,oldCollection){
                    
                    console.log(newCollection);
                    $scope.init();
                    _.forEach(newCollection, function(obj, key){
                        obj.hideForZoom = false;
                    });
                });
                $scope.init = function(){
                    var dataToIterate;
                    if($scope.sandboxMode){
                        dataToIterate = $scope.sandboxgroups;
                    } else {
                        dataToIterate = $scope.activeGroups;
                    }
                    if(dataToIterate){
                        var canvasWidth = document.querySelector('network').children[0].clientWidth;
                        if(canvasWidth === 0)
                            canvasWidth = document.querySelector('group').children[0].clientWidth;
                        if(canvasWidth === 0)
                            canvasWidth = document.querySelector('#canvas-load-here').clientWidth;      
                        $scope.pageObjModel.pageLengthGroup = (Math.floor(canvasWidth / 174) <= 0)?7:Math.floor(canvasWidth / 174);
                        //$scope.pageObjModel.pageLengthGroup = Math.floor(canvasWidth / 174);
                        $scope.pageObjModel.lastPageIndexGroup = dataToIterate.length;
                    
                        $scope.$emit("pageModelSetGroup", {data : $scope.pageObjModel});
                    }
                };
                $scope.$watchCollection('activeGroups', function(newCollection,oldCollection){
                    $scope.init();
                    console.log(newCollection);
                    
                    _.forEach(newCollection, function(obj, key){
                        obj.hideForZoom = false;
                    });
                });

                $scope.$on('zoomInCanvasGroup', function(event, args){
                    
                    $scope.showWorkload = true;
                    var dataToIterate = "";
                    if($scope.sandboxMode){
                        dataToIterate = $scope.sandboxgroups;
                    } else {
                        dataToIterate = $scope.activeGroups;
                    }
                    _.forEach(dataToIterate, function(obj, key){
                        if( key >= 0 && key < $scope.pageObjModel.pageLengthGroup )
                            obj.hideForZoom = false;
                        else
                            obj.hideForZoom = true;
                    });
                });
                $scope.$on('zoomOutCanvasGroup', function(event, args){
                    $scope.showWorkload = false;
                    var dataToIterate = "";
                    if($scope.sandboxMode){
                        dataToIterate = $scope.sandboxgroups;
                    } else {
                        dataToIterate = $scope.activeGroups;
                    }
                    _.forEach(dataToIterate, function(obj, key){
                        obj.hideForZoom = false;
                    });
                });
                $scope.$on('gotoFirstPageGroup', function(event, args){
                    console.log('gotoFirstPageGroup');
                    $scope.pageObjModel.startIndexGroup = $scope.pageObjModel.firstPageIndexGroup;
                    $scope.pageObjModel.endIndexGroup = $scope.pageObjModel.firstPageIndexGroup + ($scope.pageObjModel.pageLengthGroup - 1);
                    $scope.manageZoomPagination();
                });
                $scope.$on('gotoLastPageGroup', function(event, args){
                    console.log('gotoLastPageGroup');
                    if($scope.pageObjModel.pageLengthGroup < $scope.pageObjModel.lastPageIndexGroup){
                        $scope.pageObjModel.startIndexGroup = $scope.pageObjModel.lastPageIndexGroup - ($scope.pageObjModel.pageLengthGroup - 1);
                        $scope.pageObjModel.endIndexGroup = $scope.pageObjModel.lastPageIndexGroup;
                    }
                    else{
                        $scope.pageObjModel.startIndexGroup = 0;
                        $scope.pageObjModel.endIndexGroup = 6;
                    }
                    $scope.manageZoomPagination();
                });
                $scope.$on('gotoNextPageGroup', function(event, args){
                    console.log('gotoNextPageGroup');
                    $scope.pageObjModel.startIndexGroup = $scope.pageObjModel.endIndexGroup + 1;
                    $scope.pageObjModel.endIndexGroup = $scope.pageObjModel.startIndexGroup + ($scope.pageObjModel.pageLengthGroup - 1);
                    $scope.manageZoomPagination();
                });
                $scope.$on('gotoPrevPageGroup', function(event, args){
                    console.log('gotoPrevPageGroup');
                    $scope.pageObjModel.endIndexGroup = $scope.pageObjModel.startIndexGroup - 1;
                    $scope.pageObjModel.startIndexGroup = $scope.pageObjModel.endIndexGroup - ($scope.pageObjModel.pageLengthGroup - 1);
                    $scope.manageZoomPagination();
                });

                $scope.$on('sandboxModeToggled', function (event, sandboxMode) {
                    $scope.sandboxMode = sandboxMode;
                });
                
                $scope.ruleSet = [];
                $scope.$on("rulesArrayChanged", function (event, args) {
                    $scope.seggregateGroupsFromRulesByStates(args);
                    $scope.ruleSet = args;
                });

                $scope.seggregateGroupsFromRulesByStates = function (rules) {
                    $scope.sandboxgroups = [];
                    $scope.activeGroups = [];
                    if($scope.networksavailable !== undefined){
                        _.each(rules, function (rule) {
                            console.log(rule.groupInfo);
                            console.log("this is the single rule ",rule);
                            var ruleWorkloads = [];
                            _.each(rule.ruleDesc,function(singleDescription){
                                _.each(singleDescription.networks,function(singleNetwork){
                                    if(singleDescription.ruleAttribute == "0"){
                                        var matchingNetwork = _.find($scope.networksavailable,{'id':singleNetwork.id});
                                        if(matchingNetwork !== undefined){
                                            //ruleWorkloads = (matchingNetwork.workloads);
                                            ruleWorkloads = _.union(ruleWorkloads, matchingNetwork.workloads);
                                        }
                                    } else if(singleDescription.ruleAttribute == "2"){
                                        if(singleNetwork.id && !_.find(ruleWorkloads,{'id':singleNetwork.id})){
                                            var matchingWorkloads = _.find($scope.workloads,{'id':singleNetwork.id});
                                            if(matchingWorkloads)
                                                ruleWorkloads.push(matchingWorkloads);
                                        }
                                    }
                                });
                            });
                            rule.noneSPS = rule.aspInfo.name === "None" ? true : false;
                            $scope.sandboxgroups.push(angular.copy({'groupinfo':rule.groupInfo,'workloadinfo':ruleWorkloads,'noneSPS':rule.noneSPS}));
                            if(rule.id) {
                                $scope.activeGroups.push(angular.copy({'groupinfo':rule.groupInfo,'workloadinfo':ruleWorkloads,'noneSPS':rule.noneSPS}));
                            } 
                        });
//                    console.log($scope.sandboxgroups);
//                    console.log($scope.activeGroups);
                        $scope.$emit("groupCountsChangedInit", {
                           active :  $scope.activeGroups.length,
                           sandbox :  $scope.sandboxgroups.length
                        });
                    }
                };
                $scope.init();
            }];
        return directive;
    }

    angular.module('shieldxApp').directive('group', groupDirective);
})();
