(function() {
	function TopNTalkersbyVMnameCtr($scope,dataVisualizationService,$timeout,$filter,$location) {
		console.log('TopNAttackerResourceGroups initialised');
		var parentScope = $scope.$parent.$parent;
		$scope.selected = [];
		var dataOnWidget = angular.copy(parentScope.drilldowndata);

		console.log(" TopNTalkersbyVMnameCtr  >>>> data");
		console.dir(dataOnWidget);
		
		$scope.title = widgetConfig.list.TopNTalkersbyVMname.title;
		$scope.updateDirllDownInterval = function(interval){
			$scope.timeInteval = interval;
		};
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
		
		$scope.$emit('listenHeaderText', { headerText: "Security Analysis tools > Top N VMs by Number of Connections" });
		$scope.getAllDrillDownData = function(){
			if( $scope.url.indexOf(WidgetName.TopNTalkersbyVMname) > 0 ){
				
				renderMainData();
			}else{
					renderDrillDownData();
				}
		};
		renderMainData = function(){
			var dataWidgetConfig = new DataWidgetConfig(widgetConfig.list[WidgetName.TopNTalkersbyVMname].widgetType, WidgetName.TopNTalkersbyVMname);
				dataWidgetConfig.nValue = ($scope.navalue)?parseInt($scope.navalue):50;
				//dataWidgetConfigArray.push(dataWidgetConfig);	
				var dataWidgetConfigArray = [];
				dataWidgetConfigArray.push(dataWidgetConfig);
				dataVisualizationService.getFilteredDataForWidgets(dataWidgetConfigArray).then(function(responseData){
					console.log("data for main query in drilldowndata");
					console.log(responseData);
					dataOnWidget = responseData.TopNTalkersbyVMname;
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
			loadDrillDownDataFromServer(WidgetName.TopNTalkersbyVMname, ChartTypes.barChart, getKeysForDrillDown($scope.getDrillDownForTisItem)).then(function(data){
				console.log('Data for this drilldown from server', data);
				$scope.drillDownSearchData = true;
				$scope.tableData = data;
			});
		};
		function loadDrillDownDataFromServer(widgetType,chartType,args) {
			console.log(" TopNTalkersbyVMname loadDrillDownDataFromServer args "+args);
            console.dir(args);
            var interval = ($scope.timeInteval)?($scope.timeInteval):30;
			var dataWidgetConfig = new DataWidgetConfig(chartType, widgetType,interval,args);
			
			return dataVisualizationService.getDrillDownDataForWidget(dataWidgetConfig).then(function (chartData) {
	        	console.log(" TopNTalkersbyVMname getDrillDownDataForWidget args "+chartData);
	        	console.dir(chartData);
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
        //$scope.tableData = {};
		$scope.query = {
			order: 'name',
			limit: 10,
			page: 1
		};
		$timeout(function() {
	            fixContainerHeight(1);
		},0);

		/*loadDrillDownDataFromServer(WidgetName.TopNTalkersbyVMname, ChartTypes.barChart, getKeysForDrillDown(dataOnWidget)).then(function(data){
			console.log('Data for this drilldown from server', data);
			$scope.tableData = data;
		}); */
         $scope.filterData = null;
         $scope.selectedVM = null;
		/* dataVisualizationService.getWidgetDrillDownFilteredData(WidgetName.TopNTalkersbyVMname).then(function(filtterData){
		 	console.log(" TopNTalkersbyVMnameCtr getWidgetDrillDownFilteredData ");
		 	console.dir(filtterData);
		 	$scope.filterData = filtterData;
		 });*/

		 $scope.vmSelecttionChanged = function(){

		 };
		 $scope.onReorder = function(order){
            $scope.tableData.rowData =  $filter('orderBy')($scope.tableData.rowData,order);
            $timeout(function(){
                angular.element(document.querySelectorAll(".md-sort.md-active md-icon")).removeClass("ng-hide");
            }, 0);
            
        };

		 /*$scope.updateDirllDownInterval = function(){

		 	console.log("updateDirllDownInterval  ");
		 	console.dir($scope.selectedVM);

		 	loadDrillDownDataFromServer(WidgetName.TopNTalkersbyVMname, ChartTypes.barChart, [$scope.selectedVM]).then(function(data){
			console.log(' TopNTalkersbyVMnameCtr Data for this drilldown from server', data);
			$scope.tableData = data;
		});

		 };*/
		 $scope.getAllDrillDownData();
	}
	angular.module('shieldxApp').controller('TopNTalkersbyVMnameCtr', TopNTalkersbyVMnameCtr);
})();