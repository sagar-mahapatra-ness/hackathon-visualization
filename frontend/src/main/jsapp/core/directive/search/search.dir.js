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

    function searchkDirective() {
        var directive = {};

        directive.controller = ['$scope', function ($scope) {
                function init() {
                    $scope.originalList = angular.copy($scope.datalist);
                    $scope.items = mapItems();
                    $scope.customTooltip = $scope.searchconfig.customTooltip ? $scope.searchconfig.customTooltip : "Search";
                }

                var onDataChanged = function(data){
                    $scope.datalist = data;
                    init();
                }; 

                if($scope.methodbridge){
                    $scope.methodbridge.registerBridge(onDataChanged);
                }
                function getLowerCase(val) {
                    if (!val)
                        return null;
                    if (typeof val === "string")
                        return val.toLowerCase();
                    if (typeof val === "number")
                        return val.toString().toLowerCase();
                }
                function mapItems() {
                    if (!$scope.datalist)
                        return [];
                    var itemsMapped = angular.copy($scope.datalist);
                    return itemsMapped.map(function (i) {
                        if (!i)
                            return i;
                        /*if($scope.searchconfig.searchkeylocale === "^" ){
                         i._lowername = i.label.toLowerCase();
                         i._searchname = i.label;
                         return i;
                         }*/
                        var locale = $scope.searchconfig.searchkeylocale.split(".");
                        locale.shift();
                        var tempObj = i;
                        while (locale.length > 0) {
                            if (tempObj.hasOwnProperty(locale[0])) {
                                tempObj = tempObj[locale[0]];
                                locale.shift();
                            }
                        }
                        i._lowername = getLowerCase(tempObj[$scope.searchconfig.key]); //tempObj[$scope.searchconfig.key].toLowerCase();
                        i._searchname = tempObj[$scope.searchconfig.key];
                        return i;
                    });
                }
                init();
                //$scope.items = mapItems();
                $scope.selectedItemsList = [];
                $scope.selectedItem = null;
                $scope.searchText = [];
                $scope.querySearch = querySearch;
                $scope.transformChip = transformChip;
                $scope.autocompleteRequireMatch = false;

                console.log(" prefix value "+$scope.boxprfix);
                console.log(" searchconfig value "+$scope.searchconfig);
               
                $scope.boxprfix  = "";

                if($scope.searchconfig.serchboxprifix){
                  $scope.boxprfix = $scope.searchconfig.serchboxprifix;   
                } 
               console.dir($scope.boxprfix);
               /// $scope.boxprfix = "abc";
                if ($scope.showicon)
                    $scope.isSearchFieldOpen = false;
                else
                    $scope.isSearchFieldOpen = true;

                $scope.$watchCollection('datalist', function () {
                    if ($scope.originalList === undefined || !$scope.originalList.length)
                        init();
                });

                $scope.filterGrid = function () {
                    var tempArray = [];
                    var arrayHold = [];
                    var partialSearchList = [];
                    var searchTextList = [];
                    if ($scope.selectedItemsList.length) {
                        for (var selItems in $scope.selectedItemsList) {
                            searchTextList.push($scope.selectedItemsList[selItems].name);
                            if ($scope.selectedItemsList[selItems].hasOwnProperty('chiptype')) {
                                if ($scope.selectedItemsList[selItems].chiptype.match(/new/ig)) {
                                    var testStr = $scope.selectedItemsList[selItems].name;
                                    var exp = new RegExp(testStr, 'ig');
                                    console.log('Run partial string search');
                                    for (var i = 0; i < $scope.items.length; ++i) {
                                            if ($scope.items[i]._lowername && $scope.items[i]._lowername.match(exp)) {
                                                partialSearchList.push($scope.items[i]);
                                            }
                                    }
                                }
                                console.log('partial match list', partialSearchList);
                                arrayHold = _.concat(arrayHold, partialSearchList);
                            } else {
                                tempArray = _.filter($scope.items, ['_lowername', $scope.selectedItemsList[selItems]._lowername]);
                                arrayHold = _.concat(arrayHold, tempArray);
                                console.log('full match list', tempArray);
                            }
                            console.log('Array Hold', arrayHold);
                        }
                        //console.log(_.unionBy(arrayHold, '_lowername'));
                        $scope.datalist = _.uniqWith(arrayHold, _.isEqual);
                    } else { //when there are no search chips
                        console.log('restore grid list');
                        $scope.datalist = angular.copy($scope.originalList);
                    }
                    $scope.datalist = _.union(partialSearchList, $scope.datalist);
                    $scope.searchText = searchTextList;
                    _.each($scope.datalist, function(data) {
                        data.type = "NETWORK";
                    });
                    var arg = {'op':"searched",'searchText':searchTextList,selectedEntities:$scope.datalist};
                    $scope.$emit('onNetworkSelectionChanged', arg);
                    $scope.$emit('onChipItemCreated', $scope.selectedItemsList);

                };
                $scope.$on("actionMadeOnChip",function(eve,data){
                    //$scope.searchText = data.data;
                    $scope.selectedItemsList = data.data;
                    $scope.filterGrid();
                });

                /* Return the proper object when the append is called. */
                function transformChip(chip) {
                    // If it is an object, it's already a known chip
                    if (angular.isObject(chip)) {
                        return chip;
                    }
                    // Otherwise, create a new one
                    $scope.searchText.push(chip);
                    return {name: chip, chiptype: 'new'};
                }

                function querySearch(query) {
                    var results = query ? $scope.items.filter(createFilterFor(query)) : [];
                    var data = _.uniqBy(results, '_lowername');
                    return data;
                }

                function createFilterFor(query) {
                    var lowercaseQuery = angular.lowercase(query);
                    return function filterFn(itemX) {
                        if (itemX._lowername !== null) {
                            return  itemX._lowername.indexOf(lowercaseQuery) >=  0;  // || (itemX._lowertype.indexOf(lowercaseQuery) === 0
                        }
                    };
                }

                $scope.toggleSearchFieldView = function () {
                    $scope.isSearchFieldOpen = $scope.isSearchFieldOpen === false ? true : false;
                    setTimeout(function () {
                        document.querySelector("#search-box"+$scope.boxprfix).focus();
                    }, 0);
                };

            }];
        directive.scope = {
            datalist: '=',
            searchconfig: '=',
            showicon: '=',
            hidechips:'=',
            methodbridge:'='
        };
        directive.restrict = 'EA';
        directive.templateUrl = 'core/directive/search/search.html';
        return directive;
    }

    angular.module('shieldxApp').directive('search', searchkDirective);
})();