(function() {
	function TopNBadCertificatesCtr($scope,dataVisualizationService,$location,$timeout,$filter) {
		console.log('TopNDetectedAppsCtr initialised');
		var parentScope = $scope.$parent.$parent;
		$scope.selected = [];
		var dataOnWidget = angular.copy(parentScope.drilldowndata);
		
		$scope.title = widgetConfig.list.TopNBadCertificates.title;
		$scope.updateDirllDownInterval = function(interval,nValue){
			$scope.timeInteval = interval;
			$scope.navalue= nValue;
			$scope.getAllDrillDownData();
			renderMainData();
		};
		$scope.intervalOptions = WidgetDataUtil.drillDownIntervaloptions;
		renderMainData = function(){
			var dataWidgetConfig = new DataWidgetConfig(widgetConfig.list[WidgetName.TopNBadCertificates].widgetType, WidgetName.TopNBadCertificates);
				dataWidgetConfig.nValue = ($scope.navalue)?parseInt($scope.navalue):50;
				var dataWidgetConfigArray = [];
				dataWidgetConfigArray.push(dataWidgetConfig);
				dataVisualizationService.getFilteredDataForWidgets(dataWidgetConfigArray).then(function(responseData){
					console.log("data for main query in drilldowndata");
					console.log(responseData);
					dataOnWidget = responseData.TopNBadCertificates;
				}).finally(function(){
					renderDrillDownData();
					
				});
		};

		$scope.$emit('listenHeaderText', { headerText: "Security Analysis tools > Top N Bad Certificates" });
		$scope.url = $location.absUrl().split('#')[1];
		$scope.getAllDrillDownData = function(){
			if( $scope.url.indexOf(WidgetName.TopNBadCertificates) > 0 ){
				
				renderMainData();
			}else{
				renderDrillDownData();
			/*	loadDrillDownDataFromServer(WidgetName.TopNBadCertificates, ChartTypes.barChart,  getKeysForDrillDown(dataOnWidget)).then(function(data){
						console.log('Data for this drilldown from server', data);
						$scope.tableData = data;
					});*/
			}
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
			_.each(dataOnWidget,function(item){
				if(item.Letter === fiterItem){
					$scope.getDrillDownForTisItem.push(item);
				}
			});
			loadDrillDownDataFromServer(WidgetName.TopNBadCertificates, ChartTypes.barChart,  getKeysForDrillDown($scope.getDrillDownForTisItem)).then(function(data){
				console.log('Data for this drilldown from server', data);
				$scope.tableData = data;
			});
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
		$timeout(function() {
	            fixContainerHeight(1);
		},0);
		$scope.getAllDrillDownData();
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
		/*loadDrillDownDataFromServer(WidgetName.TopNBadCertificates, ChartTypes.barChart, 30, getKeysForDrillDown(dataOnWidget)).then(function(data){
			console.log('Data for this drilldown from server', data);
			$scope.tableData = data;
		});*/
	}
	angular.module('shieldxApp').controller('TopNBadCertificatesCtr', TopNBadCertificatesCtr);
})();