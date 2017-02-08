(function() {
	function IOPCtr($scope,dataVisualizationService,$timeout, $location) {
		console.log('Iop DrillDown initialised');
		var parentScope = $scope.$parent.$parent;
		$scope.selected = [];
		var dataOnWidget = angular.copy(parentScope.drilldowndata);
		$scope.tableData = [];
		$scope.title = widgetConfig.list.IOP.title;
		$scope.query = {
			order: 'val1',
			limit: 10,
			page: 1
		};

		$scope.$emit('listenHeaderText', { headerText: "Security Analysis tools > Indicator of Pivot" });
		$scope.url = $location.absUrl().split('#')[1];
		$scope.getAllDrillDownData = function(){
			if( $scope.url.indexOf(WidgetName.IOP) > 0 ){
				$scope.$emit('listenHeaderText', { headerText: "Security Analysis > Indicator of Pivot" });
				var dataWidgetConfig = new DataWidgetConfig(widgetConfig.list[WidgetName.IOP].widgetType, WidgetName.IOP);
				dataWidgetConfig.nValue = 50;
				//dataWidgetConfigArray.push(dataWidgetConfig);	
				var dataWidgetConfigArray = [];
				dataWidgetConfigArray.push(dataWidgetConfig);
				dataVisualizationService.getFilteredDataForWidgets(dataWidgetConfigArray).then(function(responseData){
					console.log("data for main query in drilldowndata");
					console.log(responseData);
					dataOnWidget = responseData.IOP;
				}).finally(function(){
					loadDrillDownDataFromServer(WidgetName.IOP, ChartTypes.barChart,  getKeysForDrillDown(dataOnWidget)).then(function(data){
						console.log('Data for this drilldown from server', data);
						$scope.tableData = data;
						renderExportData(data);
					});
				});
			}else{
				loadDrillDownDataFromServer(WidgetName.IOP, ChartTypes.barChart,  getKeysForDrillDown(dataOnWidget)).then(function(data){
						console.log('Data for this drilldown from server', data);
						$scope.tableData = data;
						renderExportData(data);
					});
				}
		};
		renderExportData = function(data){
			$scope.exportData = []; 
			$scope.csvData = [];
			_.each(data,function(dataItem,i){
				$scope.exportData = $scope.exportData.concat(dataItem.val);
				console.log(dataItem);
			});
			var date,datex,timex;
			_.each($scope.exportData,function(singeleItem,i){
				date = new Date(singeleItem.iopThreatTimeStamp);
				datex = ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/' + date.getFullYear();
				timex = ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
				/*datex = dataUnixTemp.format("dd.mm.yyyy"); 
				timex = dataUnixTemp.format("hh:MM:ss");*/
				$scope.csvData.push({val0:singeleItem.iopHop,val1:singeleItem.appId,val2:datex,val3:timex,val4:singeleItem.dstIpAddress,val5:singeleItem.dstPort,val6:singeleItem.iopDetectionId,val7:singeleItem.iopThreatName,val8:singeleItem.protocol,val9:singeleItem.protocolName,val10:singeleItem.srcIpAddress,val11:singeleItem.srcPort,val12:singeleItem.threatName});
			});
			$scope.csvData = _.sortBy( $scope.csvData, 'val0');
			console.log($scope.csvData);
		};
		console.log("url " + $scope.url);
		/*$scope.updateDirllDownInterval = function(interval){
			$scope.timeInteval = interval;
			$scope.getAllDrillDownData();
		};
		$scope.intervalOptions =  [
				{ value : 5, text: 'Past 5 mins'},
				{ value : 10, text: 'Past 10 mins'},
				{ value : 15, text: 'Past 15 mins'},
				];*/
		function getKeysForDrillDown (list) {
			console.log(list);
			//if(Array.isArray(list.rowData)) {
				var tempArray = [];
				_.forEach(list.rowData, function(value, key){
					tempArray.push(value.id);
				});
				console.log("getKeysForDrillDown ");
				console.dir(tempArray);
				return tempArray;
			//}
		}
		function loadDrillDownDataFromServer(widgetType,chartType,args) {
			console.log(" TopNDetectedAppsCtr loadDrillDownDataFromServer args "+args);
            console.dir(args);
           var interval = ($scope.timeInteval)?($scope.timeInteval):30;
			var dataWidgetConfig = new DataWidgetConfig(chartType, widgetType,interval,args);
			
			return dataVisualizationService.getDrillDownDataForWidget(dataWidgetConfig).then(function (chartData) {
	        	console.log(" TopNDetectedAppsCtr getDrillDownDataForWidget args "+chartData);
	        	console.dir(chartData);
				return chartData;
			});
		}

		$scope.getAllDrillDownData();
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
       // $scope.tableData = {};
/*		$scope.query = {
			order: 'name',
			limit: 5,
			page: 1
		};*/
		$timeout(function() {
	            fixContainerHeight(1);
		},0);
		
	}
	angular.module('shieldxApp').controller('IOPCtr', IOPCtr);
})();