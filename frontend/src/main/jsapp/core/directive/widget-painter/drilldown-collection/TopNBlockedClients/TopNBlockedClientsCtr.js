(function() {
	function TopNBlockedClientsCtr($scope,dataVisualizationService,$timeout,$location,$filter) {
		console.log('TopNDetectedAppsCtr initialised');
		var parentScope = $scope.$parent.$parent;
		$scope.selected = [];
		var dataOnWidget = angular.copy(parentScope.drilldowndata);
		
		$scope.title = widgetConfig.list.TopNBlockedClients.title;

		$scope.url = $location.absUrl().split('#')[1];
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
		$scope.updateDirllDownInterval = function(interval){
			$scope.timeInteval = interval;
			$scope.getAllDrillDownData();
		};
		$scope.intervalOptions = WidgetDataUtil.drillDownIntervaloptions;
		$scope.$emit('listenHeaderText', { headerText: "Security Analysis tools > Top N Blocked Clients" });
		$scope.getAllDrillDownData = function(){
			if( $scope.url.indexOf(WidgetName.TopNBlockedClients) > 0 ){
				
				var dataWidgetConfig = new DataWidgetConfig(widgetConfig.list[WidgetName.TopNBlockedClients].widgetType, WidgetName.TopNBlockedClients);
				dataWidgetConfig.nValue = 50;
				//dataWidgetConfigArray.push(dataWidgetConfig);	
				var dataWidgetConfigArray = [];
				dataWidgetConfigArray.push(dataWidgetConfig);
				dataVisualizationService.getFilteredDataForWidgets(dataWidgetConfigArray).then(function(responseData){
					console.log("data for main query in drilldowndata");
					console.log(responseData);
					dataOnWidget = responseData.TopNBlockedClients;
				}).finally(function(){
					loadDrillDownDataFromServer(WidgetName.TopNBlockedClients, ChartTypes.barChart,  getKeysForDrillDown(dataOnWidget)).then(function(data){
						console.log('Data for this drilldown from server', data);
						$scope.tableData = data;
					});
				});
			}else{
				loadDrillDownDataFromServer(WidgetName.TopNBlockedClients, ChartTypes.barChart, getKeysForDrillDown(dataOnWidget)).then(function(data){
					console.log('Data for this drilldown from server', data);
					$scope.tableData = data;
				});
				}
		};
		function loadDrillDownDataFromServer(widgetType,chartType,args) {
			console.log("loadDrillDownDataFromServer args "+args);
            console.dir(args);
            var interval = ($scope.timeInteval)?($scope.timeInteval):30;
			var dataWidgetConfig = new DataWidgetConfig(chartType, widgetType,interval,args);
			
			return dataVisualizationService.getDrillDownDataForWidget(dataWidgetConfig).then(function (chartData) {
				return chartData;
			});
		}
		/*$scope.tableData = {
			headers : [
				{title: 'title 1'},
				{title: 'title 2'},
				{title: 'title 3'},
				{title: 'title 4'},
				{title: 'title 5'}
			],
			rowData: [
				{ val1: 'abc', val2: 'def', val3: 'ghi', val4: 'jkl', val5: 'mno'},
				{ val1: 'abc', val2: 'def', val3: 'ghi', val4: 'jkl', val5: 'mno'},
				{ val1: 'abc', val2: 'def', val3: 'ghi', val4: 'jkl', val5: 'mno'},
				{ val1: 'abc', val2: 'def', val3: 'ghi', val4: 'jkl', val5: 'mno'},
				{ val1: 'abc', val2: 'def', val3: 'ghi', val4: 'jkl', val5: 'mno'},
				{ val1: 'abc', val2: 'def', val3: 'ghi', val4: 'jkl', val5: 'mno'},
				{ val1: 'abc', val2: 'def', val3: 'ghi', val4: 'jkl', val5: 'mno'},
				{ val1: 'abc', val2: 'def', val3: 'ghi', val4: 'jkl', val5: 'mno'},
				{ val1: 'abc', val2: 'def', val3: 'ghi', val4: 'jkl', val5: 'mno'},
				{ val1: 'abc', val2: 'def', val3: 'ghi', val4: 'jkl', val5: 'mno'}
			]			
		};*/
        $scope.tableData = {};
		$scope.query = {
			order: 'name',
			limit: 10,
			page: 1
		};
		$scope.getAllDrillDownData();
		$timeout(function() {
	            fixContainerHeight(1);
		},0);
		$scope.onReorder = function(order){
            $scope.tableData.rowData =  $filter('orderBy')($scope.tableData.rowData,order);
            $timeout(function(){
                angular.element(document.querySelectorAll(".md-sort.md-active md-icon")).removeClass("ng-hide");
            }, 0);
            
        };
		
	}
	angular.module('shieldxApp').controller('TopNBlockedClientsCtr', TopNBlockedClientsCtr);
})();
