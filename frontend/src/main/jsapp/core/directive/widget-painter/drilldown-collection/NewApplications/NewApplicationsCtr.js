(function() {

	function NewApplicationsCtr($scope,dataVisualizationService,$timeout,$filter,$location) {
		console.log('NewApplicationsCtr initialised');
		var parentScope = $scope.$parent.$parent;
		$scope.selected = [];
		var dataOnWidget = angular.copy(parentScope.drilldowndata);
		
		$scope.title = widgetConfig.list.NewApplications.title;
		$scope.url = $location.absUrl().split('#')[1];
		$scope.$emit('listenHeaderText', { headerText: "Security Analysis > New Applications" });
			$scope.getAllDrillDownData = function(){
				loadDrillDownDataFromServer(WidgetName.NewApplications, ChartTypes.table).then(function(data){
					console.log('Data for this drilldown from server', data);
					$scope.tableData = data;
				});
			};

		function loadDrillDownDataFromServer(widgetType,chartType) {
			var args = [];
			for (var i = 2; i < arguments.length; i++) {
                 args.push(arguments[i]);
            }
            var interval = ($scope.timeInteval)?($scope.timeInteval):30;
            console.log("loadDrillDownDataFromServer args "+args);
            console.dir(args);
			var dataWidgetConfig = new DataWidgetConfig(chartType, widgetType,interval,args);
			
			return dataVisualizationService.getDrillDownDataForWidget(dataWidgetConfig).then(function (chartData) {
				return chartData;
			});
		}
		$scope.getSelectedText = function(receivedData,totalength){
            if(typeof receivedData === 'undefined' || receivedData.length == totalength)
                return "ALL";
            return receivedData.length + " Selected";
        };
        $scope.updateDirllDownInterval = function(interval){
			$scope.timeInteval = interval;
			$scope.getAllDrillDownData();
		};
		$scope.intervalOptions =  WidgetDataUtil.drillDownIntervaloptions;
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
            $scope.tableData =  $filter('orderBy')($scope.tableData,order);
            $timeout(function(){
                angular.element(document.querySelectorAll(".md-sort.md-active md-icon")).removeClass("ng-hide");
            }, 0);
            
        };

		/*, getKeysForDrillDown(dataOnWidget)*/
		/*loadDrillDownDataFromServer(WidgetName.NewApplications, ChartTypes.table, 30).then(function(data){
			console.log('Data for this drilldown from server', data);
			$scope.tableData = data;
		});*/
		

	}
	angular.module('shieldxApp').controller('NewApplicationsCtr', NewApplicationsCtr);
})();