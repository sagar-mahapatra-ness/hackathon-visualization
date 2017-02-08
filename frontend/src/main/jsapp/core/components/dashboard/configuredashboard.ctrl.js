 /*
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
	function configureDashboardCtrl($scope,
		$mdDialog, 
		tabConfig,
		activeTabIndex,
		dashboardItemList) {
		"ngInject";

		var response = {};
		$scope.totalCount = dashboardItemList.length;
		$scope.items = dashboardItemList;
		$scope.selected = [];
		$scope.categoryFilter = '';
		$scope.categoriesList = [];
		
		var currentTab = tabConfig[activeTabIndex];
		$scope.dashboardName = currentTab.title;

		//init pre-selected widgets
		//1. chart widgets
		_.forEach(currentTab.dashboardItems, function(value, key){
			var temp = _.find($scope.items, function(obj){
				return value.content.widgetName.match(obj.value); 
			});
			$scope.selected.push(temp);
		});		
		//2. alert widgets
		_.forEach(currentTab.alerts, function(value, key){
			var temp = _.find($scope.items, function(obj){
				return value.widgetName.match(obj.value); 
			});
			$scope.selected.push(temp);
		});

		//create list for category filter
		_.forEach(widgetConfig.categories, function(value, key){
			$scope.categoriesList.push({value : key, name : value});
		});

		$scope.applyDialog = function() {
			var response = { title: $scope.dashboardName, selected: $scope.selected};
			$mdDialog.hide(response);
		};
		$scope.cancelDialog = function() {
			$mdDialog.cancel();
		};

		$scope.editDashboardTitle = function(event, dashboardName) {
			$scope.groupName = dashboardName;
			$mdDialog.show({
                skipHide: true,
                controller: 'newDasboardNameCtrl',
                bindToController: true,
                preserveScope: true,
                templateUrl: 'core/components/dashboard/dashboard-name.html',
                parent: angular.element(document.body),
                targetEvent: event,
                fullscreen: false,
                scope: $scope,
                openFrom: { top: 1100, height: 0 },
                closeTo: { left: 1500 }
            }).then(function(res, $scope) {
            	//currentTab.title = res;
            });
		};

		$scope.showAll = function(event) {
			$scope.items = dashboardItemList;
			angular.element(event.currentTarget).css('color','#4a90e2');
			angular.element(event.currentTarget.nextElementSibling).css('color','#6d6e71');			
		};

		$scope.showSelected = function(event) {
			$scope.items = $scope.selected;
			angular.element(event.currentTarget).css('color','#4a90e2');
			angular.element(event.currentTarget.previousElementSibling).css('color','#6d6e71');
		};

        $scope.isIndeterminate = function () {
            return ($scope.selected.length !== 0 &&
                $scope.selected.length !== $scope.items.length);
        };
        $scope.isChecked = function () {
            return $scope.selected.length === $scope.items.length;
        };
        $scope.toggleAll = function () {
            if ($scope.selected.length === $scope.items.length) { //uncheck all
                $scope.selected = [];
            } else if ($scope.selected.length === 0 || $scope.selected.length > 0) {
                $scope.selected = $scope.items.slice(0); //check all
            }
        };

	}
	angular.module('shieldxApp').controller('configureDashboardCtrl', configureDashboardCtrl);
})();