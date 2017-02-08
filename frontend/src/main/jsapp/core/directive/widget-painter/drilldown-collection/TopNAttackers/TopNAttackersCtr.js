(function() {
	function TopNAttackersCtr($scope,dataVisualizationService,$location,$timeout,$filter) {
		console.log('TopNAttackersCtr initialised');
		var parentScope = $scope.$parent.$parent;
		$scope.selected = [];
		var dataOnWidget = angular.copy(parentScope.drilldowndata);
		
		$scope.title = widgetConfig.list.TopNAttackers.title;
		$scope.$emit('listenHeaderText', { headerText: "Security Analysis tools > Top N Attackers" });
		$scope.url = $location.absUrl().split('#')[1];
		$scope.getAllDrillDownData = function(){
			if( $scope.url.indexOf(WidgetName.TopNAttackers) > 0 ){
				
				var dataWidgetConfig = new DataWidgetConfig(widgetConfig.list[WidgetName.TopNAttackers].widgetType, WidgetName.TopNAttackers);
				dataWidgetConfig.nValue = 50;
				//dataWidgetConfigArray.push(dataWidgetConfig);	
				var dataWidgetConfigArray = [];
				dataWidgetConfigArray.push(dataWidgetConfig);
				dataVisualizationService.getFilteredDataForWidgets(dataWidgetConfigArray).then(function(responseData){
					console.log("data for main query in drilldowndata");
					console.log(responseData);
					dataOnWidget = responseData.TopNAttackers;
				}).finally(function(){
					loadDrillDownDataFromServer(WidgetName.TopNAttackers, ChartTypes.barChart,  getKeysForDrillDown(dataOnWidget)).then(function(data){
						console.log('Data for this drilldown from server', data);
						$scope.tableData = data;
					});
				});
			}else{
				loadDrillDownDataFromServer(WidgetName.TopNAttackers, ChartTypes.barChart,  getKeysForDrillDown(dataOnWidget)).then(function(data){
						console.log('Data for this drilldown from server', data);
						$scope.tableData = data;
					});
			}
		};

		$scope.updateDirllDownInterval = function(interval){
			$scope.timeInteval = interval;
			$scope.getAllDrillDownData();
		};
		$scope.intervalOptions = WidgetDataUtil.drillDownIntervaloptions;
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
			console.log(" TopNAttackersCtr loadDrillDownDataFromServer args "+args);
            console.dir(args);
            var interval = ($scope.timeInteval)?($scope.timeInteval):30;
			var dataWidgetConfig = new DataWidgetConfig(chartType, widgetType,interval,args);
			
			return dataVisualizationService.getDrillDownDataForWidget(dataWidgetConfig).then(function (chartData) {
	        	console.log(" TopNAttackersCtr getDrillDownDataForWidget args "+chartData);
	        	console.dir(chartData);
				return chartData;
			});
		}
		$scope.getAllDrillDownData();
        $scope.tableData = {};
		$scope.query = {
			order: 'name',
			limit: 10,
			page: 1
		};
		$timeout(function() {
	            fixContainerHeight(1);
		},0);
		$scope.onReorder = function(order){
            $scope.tableData.rowData =  $filter('orderBy')($scope.tableData.rowData,order);
            $timeout(function(){
                angular.element(document.querySelectorAll(".md-sort.md-active md-icon")).removeClass("ng-hide");
            }, 0);
            
        };
		/*loadDrillDownDataFromServer(WidgetName.TopNAttackers, ChartTypes.barChart, 30, getKeysForDrillDown(dataOnWidget)).then(function(data){
			console.log('Data for this drilldown from server', data);
			$scope.tableData = data;
		});*/
	}
	angular.module('shieldxApp').controller('TopNAttackersCtr', TopNAttackersCtr);
})();