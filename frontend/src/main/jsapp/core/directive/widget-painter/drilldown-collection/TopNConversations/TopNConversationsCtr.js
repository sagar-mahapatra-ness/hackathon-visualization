(function() {
	function TopNConversationsCtr($scope,dataVisualizationService,$timeout,$location,$filter) {
		console.log('TopNConversationsCtr initialised');
		var parentScope = $scope.$parent.$parent;
		$scope.selected = [];
		var dataOnWidget = angular.copy(parentScope.drilldowndata);
		
		$scope.title = widgetConfig.list.TopNConversations.title;

		$scope.url = $location.absUrl().split('#')[1];
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
			$scope.timeInteval = interval;
			$scope.navalue= nValue;
			$scope.getAllDrillDownData();
			renderMainData();
			$scope.drillDownSearchData = false;
		};
		renderMainData = function(){
			var dataWidgetConfig = new DataWidgetConfig(widgetConfig.list[WidgetName.TopNConversations].widgetType, WidgetName.TopNConversations);
				dataWidgetConfig.nValue = ($scope.navalue)?parseInt($scope.navalue):50;
				//dataWidgetConfigArray.push(dataWidgetConfig);	
				var dataWidgetConfigArray = [];
				dataWidgetConfigArray.push(dataWidgetConfig);
				dataVisualizationService.getFilteredDataForWidgets(dataWidgetConfigArray).then(function(responseData){
					console.log("data for main query in drilldowndata");
					console.log(responseData);
					dataOnWidget = responseData.TopNConversations;
				}).finally(function(){
					renderDrillDownData();	
				});
		};
		$scope.intervalOptions = WidgetDataUtil.drillDownIntervaloptions;
		$scope.$emit('listenHeaderText', { headerText: "Security Analysis tools > Top N VMs by Data Transferred (measured in bytes)" });
		$scope.getAllDrillDownData = function(){
			if( $scope.url.indexOf(WidgetName.TopNConversations) > 0 ){
				
				renderMainData();
			}else{
					renderDrillDownData();
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
			loadDrillDownDataFromServer(WidgetName.TopNConversations, ChartTypes.barChart, getKeysForDrillDown($scope.getDrillDownForTisItem)).then(function(data){
				console.log('Data for this drilldown from server', data);
				$scope.drillDownSearchData = true;
				$scope.tableData = data;
			});
		};

        //$scope.tableData = {};
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
        $scope.onMainReorder = function(order){
        	$scope.mainQueryData =  $filter('orderBy')($scope.mainQueryData,order);
            $timeout(function(){
                angular.element(document.querySelectorAll(".md-sort.md-active md-icon")).removeClass("ng-hide");
            }, 0);
        };
		
	}
	angular.module('shieldxApp').controller('TopNConversationsCtr', TopNConversationsCtr);
})();
