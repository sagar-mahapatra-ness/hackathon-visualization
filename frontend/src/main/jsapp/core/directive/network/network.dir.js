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
    function networkDirective() {
        var directive = {};
        directive.restrict = 'E';
        directive.templateUrl = 'core/directive/network/network.html';
        directive.scope = {
            networkInfo: '=netinfo',
            selectedNetworks: '=selectednetworks',
            selectedWorkloads: '=selectedworkloads',
            secrules: '=',
            allNetworksFetched: '=allNetworksFetched',
            groupednet:'=',
            toggle: '&onToggle'
        };
        directive.controller = ['$scope', function ($scope) {
//                console.log("****************$scope.networkInfo***********");
//                console.log($scope.selectedNetworks);
//                console.log("****************$scope.networkInfo***********");
                $scope.sandboxedNetworks = [];
                $scope.showWorkload = false;
                
                $scope.pageObjModel = {};
                
                $scope.pageObjModel.firstPageIndex = 0;
                $scope.pageObjModel.lastPageIndex = 6;
                $scope.pageObjModel.startIndex = 0;
                $scope.pageObjModel.endIndex = 6;
                //$scope.pageObjModel.pageLength = 6; //default
                $scope.pageObjModel.pages = 0;

                $scope.manageZoomPagination = function() {
                    _.forEach($scope.networkInfo, function(obj, key){
                        if(key >= $scope.pageObjModel.startIndex && key <= $scope.pageObjModel.endIndex)
                            obj.hideForZoom = false;
                        else
                            obj.hideForZoom = true;
                    });
                    $scope.$emit("pageModelSet", {data : $scope.pageObjModel});
                };
                
                $scope.$watchCollection('networkInfo', function(newCollection,oldCollection){
                    
                    console.log(newCollection);

                    var canvasWidth = document.querySelector('network').children[0].clientWidth;
                    if(canvasWidth === 0)
                            canvasWidth = document.querySelector('#canvas-load-here').clientWidth;
                    $scope.pageObjModel.pageLength = (Math.floor(canvasWidth / 174) <= 0)?7:Math.floor(canvasWidth / 174);
                    $scope.pageObjModel.lastPageIndex = newCollection.length - 1;
                    if(newCollection.length < 5)
                        $scope.pageObjModel.endIndex = newCollection.length;
                    else
                        $scope.pageObjModel.endIndex = 6;
                    $scope.$emit("pageModelSet", {data : $scope.pageObjModel});

                    if($scope.showWorkload)
                        $scope.$emit('zoomInCanvas');
                    else
                        $scope.$emit('zoomInOut');
                });

                _.each($scope.secrules, function (rule) {

                    var groupName = rule.groupInfo;
                    _.each(rule.ruleDesc, function (ruleDesc) {
                        _.each(ruleDesc.networks, function (network) {
                            if (!_.find($scope.sandboxedNetworks, {"id": network.id})) {
                                network.ruleId = rule.id;
                                network.groupName = groupName.name;
                                $scope.sandboxedNetworks.push(network);
                            }
                        });
                    });
                });

                _.each($scope.networkInfo, function (value, key) {
                    var sanboxObj = _.find($scope.sandboxedNetworks, {"id": value.id});
                    if (sanboxObj) {
                        $scope.networkInfo[key].ruleId = sanboxObj.ruleId;
                        $scope.networkInfo[key].resourceGroupName = sanboxObj.groupName;
                    }
                });
                $scope.getStrokeColor = function(network,workload){
                    if(workload === undefined){
                        if($scope.sandboxMode){
                            if(network.resourceGroupName){
                                if(!network.noneSPS)
                                    return '#13ce66';
                                else
                                    return '#ffc030';
                            }
                            else{
                                return '#ff4949';
                            }
                        } else {
                            if(network.resourceGroupId){
                                if(!network.noneSPS)
                                    return '#13ce66';
                                else
                                    return '#ffc030';
                            }
                            else{
                                return '#ff4949';
                            }
                        }
                    } else {
                        if($scope.sandboxMode){
                            if(network.resourceGroupName || workload.resourceGroupName){
                               /*if(!network.noneSPS )
                                    return '#13ce66';
                                else*/ if(workload.noneSPS || network.noneSPS)
                                    return '#ffc030';
                                else
                                    return '#13ce66';
                            }
                            else{
                                return '#ff4949';
                            }
                        } else {
                            if(network.resourceGroupId || workload.resourceGroupId){
                                /*if(!network.noneSPS )
                                    return '#13ce66';
                                else*/ if(workload.noneSPS || network.noneSPS)
                                    return '#ffc030';
                                else
                                    return '#13ce66';
                            }
                            else{
                                return '#ff4949';
                            }
                        }
                    }
                };
                $scope.existsNetwork = function (networkvalue) {
                    if ($scope.selectedNetworks) {
                        return $scope.selectedNetworks.indexOf(networkvalue) > -1;
                    }
                    return false;
                };

                $scope.existsWorkload = function (wlvalue) {
                    if ($scope.selectedWorkloads) {
                        return $scope.selectedWorkloads.indexOf(wlvalue) > -1;
                    }
                    return false;
                };
                $scope.getPercentage = function(network){
                    var totalWorkloads = network.workloads;
                    var securedWorkloads = 0;
                    if(totalWorkloads){
                        for (var i = network.workloads.length - 1; i >= 0; i--) {
                            if(network.workloads[i].resourceGroupName)
                                securedWorkloads++;
                        }
                        return (securedWorkloads*360)/totalWorkloads;
                    }
                    return 0;
                };
                $scope.getVMcountText = function(allWorkloads){
                    var visibleWorkloads = 0;
                    for(var i = (allWorkloads.length - 1);i>=0;i--){
                        if(!allWorkloads[i].faded)
                            visibleWorkloads++;
                    }
                    if(visibleWorkloads < 1000)
                        return visibleWorkloads;
                    else
                        return Math.floor(visibleWorkloads/1000) + "k";
                };
                $scope.toggleAllNetworks = function(typeOfSelection){
                    $scope.selectedNetworks = [];
                    if(typeOfSelection === 1){
                        _.each($scope.networkInfo,function(availableNetwork){
                            if(!availableNetwork.faded && !availableNetwork.hideForZoom)
                                $scope.selectedNetworks.push(availableNetwork);
                        });
                    }
                    $scope.$emit('toggleAllNetworks',{typeOfSelection:typeOfSelection});
                };
                $scope.$on('addWorkload',function(event,args){
                    _.each(args.networks,function(networkChosen){
                        var currentNetwork = _.find($scope.networkInfo,{'id':networkChosen.id});
                        $scope.selectAllWorkloads(currentNetwork);        
                    });
                });
                $scope.selectAllWorkloads = function(network){
                    _.each(network.workloads,function(singleWorkload){
                            var alreadyPresentWorkload = _.findIndex($scope.selectedWorkloads,{'id':singleWorkload.id});
                            if(alreadyPresentWorkload === -1)
                                $scope.selectedWorkloads.push(singleWorkload);
                        });
                        $scope.$emit('selectAllWorkloadStart',{'selectedworkloads':$scope.selectedWorkloads});
                };
                $scope.sandboxMode = false;
                $scope.$on('sandboxModeToggled', function (event, sandboxMode) {
                    $scope.sandboxMode = sandboxMode;
                });
                function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
                  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

                  return {
                    x: centerX + (radius * Math.cos(angleInRadians)),
                    y: centerY + (radius * Math.sin(angleInRadians))
                  };
                }

                $scope.describeArc = function(x, y, radius, startAngle, endAngle){

                    var start = polarToCartesian(x, y, radius, endAngle);
                    var end = polarToCartesian(x, y, radius, startAngle);

                    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

                    var d = [
                        "M", start.x, start.y, 
                        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
                    ].join(" ");

                    return d;       
                };

                $scope.$on('zoomInCanvas', function(event, args){
                    
                    $scope.showWorkload = true;
                    _.forEach($scope.networkInfo, function(obj, key){
                        if( key >= 0 && key < $scope.pageObjModel.pageLength )
                            obj.hideForZoom = false;
                        else
                            obj.hideForZoom = true;
                    });
                });
                $scope.$on('zoomOutCanvas', function(event, args){
                    $scope.showWorkload = false; 
                    _.forEach($scope.networkInfo, function(obj, key){
                        obj.hideForZoom = false;
                    });
                });
                $scope.$on('gotoFirstPage', function(event, args){
                    console.log('gotoFirstPage');
                    $scope.pageObjModel.startIndex = $scope.pageObjModel.firstPageIndex;
                    $scope.pageObjModel.endIndex = $scope.pageObjModel.firstPageIndex + ($scope.pageObjModel.pageLength - 1);
                    $scope.manageZoomPagination();
                });
                $scope.$on('gotoLastPage', function(event, args){
                    console.log('gotoLastPage');
                    $scope.pageObjModel.endIndex = $scope.pageObjModel.lastPageIndex;
                    if($scope.pageObjModel.lastPageIndex > $scope.pageObjModel.pageLength)
                        $scope.pageObjModel.startIndex = $scope.pageObjModel.lastPageIndex - ($scope.pageObjModel.pageLength - 1);
                    $scope.manageZoomPagination();
                });
                $scope.$on('gotoNextPage', function(event, args){
                    console.log('gotoNextPage');
                    $scope.pageObjModel.startIndex = $scope.pageObjModel.endIndex + 1;
                    $scope.pageObjModel.endIndex = $scope.pageObjModel.startIndex + ($scope.pageObjModel.pageLength - 1);
                    $scope.manageZoomPagination();
                });
                $scope.$on('gotoPrevPage', function(event, args){
                    console.log('gotoPrevPage');
                    $scope.pageObjModel.endIndex = $scope.pageObjModel.startIndex - 1;
                    $scope.pageObjModel.startIndex = $scope.pageObjModel.endIndex - ($scope.pageObjModel.pageLength - 1);
                    $scope.manageZoomPagination();
                });
                
                $scope.showObjectDetails = function (items) {
                    $scope.$emit("showObjectDetailClicked", {data: items});
                };
            }];
        return directive;
    }

    angular.module('shieldxApp').directive('network', networkDirective);
})();
