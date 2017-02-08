(function() {
	function TopNTalkersbyResourceGroupCtr($scope,dataVisualizationService,$timeout,$filter,$location) {
		console.log('TopNTalkersbyResourceGroup initialised');
		var parentScope = $scope.$parent.$parent;
		$scope.selected = [];
		var dataOnWidget = angular.copy(parentScope.drilldowndata);
		
		$scope.title = widgetConfig.list.TopNTalkersbyResourceGroup.title;
		//$scope.title = widgetConfig.list[parentScope.widgetname].title;
		/*$scope.updateDirllDownInterval = function(interval){
			$scope.timeInteval = interval;
		};*/
		$scope.url = $location.absUrl().split('#')[1];
		$scope.intervalOptions = WidgetDataUtil.drillDownIntervaloptions;
		function getKeysForDrillDown (list) {
			if(Array.isArray(list)) {
				var tempArray = [];
				_.forEach(list, function(value, key){
					tempArray.push({"source":value.source,"victim":value.victim});
				});
				console.log("getKeysForDrillDown ");
				console.dir(tempArray);
				return tempArray;
			}
		}
		$scope.updateDirllDownInterval = function(interval,nValue){
			if(interval === 'showMainData'){
				renderDrillDownData();
			}else{
				$scope.timeInteval = interval;
				$scope.navalue= nValue;
				$scope.getAllDrillDownData();	
				renderMainData();
				$scope.drillDownSearchData = false;
			}
		};
		$scope.getAllDrillDownData = function(){
			if( $scope.url.indexOf(WidgetName.TopNTalkersbyVMname) > 0 ){
				
				renderMainData();
			}else{
					renderDrillDownData();
				}
		};
		$scope.$emit('listenHeaderText', { headerText: "Security Analysis tools > Top N Resource Groups by Number of Connections" });
		
		function loadDrillDownDataFromServer(widgetType,chartType,args) {
			console.log(" TopNTalkersbyResourceGroup loadDrillDownDataFromServer args "+args);
            console.dir(args);
            var interval = ($scope.timeInteval)?($scope.timeInteval):30;
			var dataWidgetConfig = new DataWidgetConfig(chartType, widgetType,interval,args);
			
			return dataVisualizationService.getDrillDownDataForWidget(dataWidgetConfig).then(function (chartData) {
	        	console.log(" TopNTalkersbyResourceGroup getDrillDownDataForWidget args "+chartData);
	        	console.dir(chartData);
	        	$scope.filterData = chartData;
				return chartData;
			});
		}
		$scope.query = {
			order: 'name',
			limit: 10,
			page: 1
		};
		renderMainData = function(){
			var dataWidgetConfig = new DataWidgetConfig(widgetConfig.list[WidgetName.TopNTalkersbyResourceGroup].widgetType, WidgetName.TopNTalkersbyResourceGroup);
				dataWidgetConfig.nValue = ($scope.navalue)?parseInt($scope.navalue):50;
				//dataWidgetConfigArray.push(dataWidgetConfig);	
				var dataWidgetConfigArray = [];
				dataWidgetConfigArray.push(dataWidgetConfig);
				dataVisualizationService.getFilteredDataForWidgets(dataWidgetConfigArray).then(function(responseData){
					console.log("data for main query in drilldowndata");
					console.log(responseData);
					dataOnWidget = responseData.TopNTalkersbyResourceGroup;
				}).finally(function(){
					renderDrillDownData();	
				});
		};
		
		renderDrillDownData = function(){
			$scope.mainQueryData = dataOnWidget;
			$scope.drillDownDataPresent = false;
			$scope.mainCerticicatesAvaliable = true;

		};
		$scope.getListBasedOnCertficate = function(fiterItem){
			$scope.drillDownDataPresent = true;
			$scope.mainCerticicatesAvaliable = false;
			$scope.itemToBeFiltered = fiterItem;
			$scope.getDrillDownForTisItem = [];
			$scope.tableData = [];
			$scope.getDrillDownForTisItem.push(fiterItem);
			/*_.each(dataOnWidget,function(item){
				if(item.source === fiterItem.source){
					$scope.getDrillDownForTisItem.push(item);
				}
			});*/
			loadDrillDownDataFromServer(WidgetName.TopNTalkersbyResourceGroup, ChartTypes.barChart, getKeysForDrillDown($scope.getDrillDownForTisItem)).then(function(data){
				console.log('Data for this drilldown from server', data);
				$scope.drillDownSearchData = true;
				$scope.tableData = data;
			});
		};
		$scope.filterData = null;
         $scope.selectedRG = null;
		/* dataVisualizationService.getWidgetDrillDownFilteredData(WidgetName.TopNTalkersbyResourceGroup).then(function(filtterData){
		 	console.log(" TopNTalkersbyResourceGroup getWidgetDrillDownFilteredData ");
		 	console.dir(filtterData);
		 	$scope.filterData = filtterData;
		 });
*/
		 $scope.rgSelecttionChanged = function(){

		 };

		/* $scope.updateDirllDownInterval = function(){

		 	console.log("updateDirllDownInterval  ");
		 	console.dir($scope.selectedVM);

		 	loadDrillDownDataFromServer(WidgetName.TopNTalkersbyResourceGroup, ChartTypes.barChart, [$scope.selectedRG]).then(function(data){
			console.log(' TopNTalkersbyResourceGroup Data for this drilldown from server', data);
			$scope.tableData = data;
		});

		 };*/
		$timeout(function() {
	            fixContainerHeight(1);
		},0);
		$scope.onReorder = function(order){
            $scope.tableData.rowData =  $filter('orderBy')($scope.tableData.rowData,order);
            $timeout(function(){
                angular.element(document.querySelectorAll(".md-sort.md-active md-icon")).removeClass("ng-hide");
            }, 0);
            
        };
        $scope.getAllDrillDownData();
		/*loadDrillDownDataFromServer(WidgetName.TopNTalkersbyResourceGroup, ChartTypes.barChart, getKeysForDrillDown(dataOnWidget)).then(function(data){
			console.log('Data for this drilldown from server', data);
			$scope.tableData = data;
		}); */
	}
	angular.module('shieldxApp').controller('TopNTalkersbyResourceGroupCtr', TopNTalkersbyResourceGroupCtr);
})();