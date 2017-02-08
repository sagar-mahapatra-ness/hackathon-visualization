(function() {
	function TopNAttackerResourceGroupsCtr($scope,dataVisualizationService,$timeout,$location,$filter) {
		console.log('TopNAttackerResourceGroups initialised');
		var parentScope = $scope.$parent.$parent;
		$scope.selected = [];
		var dataOnWidget = angular.copy(parentScope.drilldowndata);
		
		$scope.title = widgetConfig.list.TopNAttackerResourceGroups.title;
		$scope.updateDirllDownInterval = function(interval){
			$scope.timeInteval = interval;
			$scope.getAllDrillDownData();
		};
		$scope.intervalOptions =  WidgetDataUtil.drillDownIntervaloptions;

		$scope.$emit('listenHeaderText', { headerText: "Security Analysis tools > Top N Attacker Resource Groups" });
		$scope.url = $location.absUrl().split('#')[1];
		$scope.getAllDrillDownData = function(){
		if( $scope.url.indexOf(WidgetName.TopNAttackerResourceGroups) > 0 ){
			
			var dataWidgetConfig = new DataWidgetConfig(widgetConfig.list[WidgetName.TopNAttackerResourceGroups].widgetType, WidgetName.TopNAttackerResourceGroups);
			dataWidgetConfig.nValue = 50;
			//dataWidgetConfigArray.push(dataWidgetConfig);	
			var dataWidgetConfigArray = [];
			dataWidgetConfigArray.push(dataWidgetConfig);
			dataVisualizationService.getFilteredDataForWidgets(dataWidgetConfigArray).then(function(responseData){
				console.log("data for main query in drilldowndata");
				console.log(responseData);
				dataOnWidget = responseData.TopNAttackerResourceGroups;
			}).finally(function(){
				loadDrillDownDataFromServer(WidgetName.TopNAttackerResourceGroups, ChartTypes.barChart,  getKeysForDrillDown(dataOnWidget)).then(function(data){
					console.log('Data for this drilldown from server', data);
					$scope.tableData = data;
				});
			});
		}else{
			loadDrillDownDataFromServer(WidgetName.TopNAttackerResourceGroups, ChartTypes.barChart, getKeysForDrillDown(dataOnWidget)).then(function(data){
				console.log('Data for this drilldown from server', data);
				$scope.tableData = data;
			});
		}
	};
		function getKeysForDrillDown (list) {
			if(Array.isArray(list)) {
				var tempArray = [];
				_.forEach(list, function(value, key){
					tempArray.push(value.Letter);
				});
				console.log("getKeysForDrillDown ");
				console.dir(tempArray);
				return tempArray;
			}
		}
		function loadDrillDownDataFromServer(widgetType,chartType,args) {
			console.log(" TopNAttackerResourceGroups loadDrillDownDataFromServer args "+args);
            console.dir(args);
            var interval = ($scope.timeInteval)?($scope.timeInteval):30;
			var dataWidgetConfig = new DataWidgetConfig(chartType, widgetType,interval,args);
			
			return dataVisualizationService.getDrillDownDataForWidget(dataWidgetConfig).then(function (chartData) {
	        	console.log(" TopNAttackerResourceGroups getDrillDownDataForWidget args "+chartData);
	        	console.dir(chartData);
				return chartData;
			});
		}
		$scope.query = {
			order: 'name',
			limit: 10,
			page: 1
		};
		$timeout(function() {
	            fixContainerHeight(1);
		},0);
		$scope.getAllDrillDownData();
		/*$scope.sortBasedOnID = function(id){
			$scope.tableData = WidgetDataUtil.sortEachTableBasedOnId($scope.tableData,id);
		};*/
		 $scope.onReorder = function(order){
            $scope.tableData =  $filter('orderBy')($scope.tableData,order);
            $timeout(function(){
                angular.element(document.querySelectorAll(".md-sort.md-active md-icon")).removeClass("ng-hide");
            }, 0);
            
        };
		/*loadDrillDownDataFromServer(WidgetName.TopNAttackerResourceGroups, ChartTypes.barChart, getKeysForDrillDown(dataOnWidget)).then(function(data){
			console.log('Data for this drilldown from server', data);
			$scope.tableData = data;
		});*/
	}
	angular.module('shieldxApp').controller('TopNAttackerResourceGroupsCtr', TopNAttackerResourceGroupsCtr);
})();