(function() {
	function InventoryofMicroServicesCtr($scope,dataVisualizationService,$timeout,$location) {
		console.log('InventoryofMicroServicesCtr initialised');
		var parentScope = $scope.$parent.$parent;
		$scope.selected = [];
		var dataOnWidget = angular.copy(parentScope.drilldowndata);
		
		$scope.title = widgetConfig.list.InventoryofMicroServices.title;
		
	/*	function getKeysForDrillDown (list) {
			if(Array.isArray(list)) {
				var tempArray = [];
				_.forEach(list, function(value, key){
					tempArray.push(value.Letter);
				});
				return tempArray;
			}
		}*/
		$scope.$emit('listenHeaderText', { headerText: "System Health tools > Inventory of Microservices" });
		$scope.url = $location.absUrl().split('#')[1];
		$scope.getAllDrillDownData = function(){
			if( $scope.url.indexOf(WidgetName.InventoryofMicroServices) > 0 ){

				var dataWidgetConfig = new DataWidgetConfig(widgetConfig.list[WidgetName.InventoryofMicroServices].widgetType, WidgetName.InventoryofMicroServices);
				dataWidgetConfig.nValue = 50;
				//dataWidgetConfigArray.push(dataWidgetConfig);	
				var dataWidgetConfigArray = [];
				dataWidgetConfigArray.push(dataWidgetConfig);
				dataVisualizationService.getFilteredDataForWidgets(dataWidgetConfigArray).then(function(responseData){
					console.log("data for main query in drilldowndata");
					console.log(responseData);
					dataOnWidget = responseData.InventoryofMicroServices;
				}).finally(function(){
					loadDrillDownDataFromServer(WidgetName.InventoryofMicroServices, ChartTypes.table).then(function(data){
						$scope.tableData = data;
						getminimumMaximumValues(data);
		     		$scope.masterData = angular.copy($scope.tableData);
					});
				});
			}else{
				loadDrillDownDataFromServer(WidgetName.InventoryofMicroServices, ChartTypes.table).then(function(data){
					$scope.tableData = data;
					getminimumMaximumValues(data);
		     		$scope.masterData = angular.copy($scope.tableData);
				});
			}
		};
		$scope.updateDirllDownInterval = function(interval){
			$scope.timeInteval = interval;
			$scope.getAllDrillDownData();
		};
		$scope.intervalOptions = WidgetDataUtil.drillDownIntervaloptions;
		function loadDrillDownDataFromServer(widgetType,chartType) {
			var args = [];
			for (var i = 3; i < arguments.length; i++) {
                 args.push(arguments[i]);
            }
            console.log("loadDrillDownDataFromServer args "+args);
            console.dir(args);
			var interval = ($scope.timeInteval)?($scope.timeInteval):30;
			var dataWidgetConfig = new DataWidgetConfig(chartType, widgetType,interval,args);
			return dataVisualizationService.getDrillDownDataForWidget(dataWidgetConfig).then(function (chartData) {
				return chartData;
			});
		}
		$scope.getSelectedText = function(receivedData,totalength){
            if(typeof receivedData === 'undefined' || receivedData.length == totalength || receivedData.length === 0){
                     $scope.tableData = angular.copy($scope.masterData);
                     return "ALL";
            }else{
	    	    if($scope.masterData !== undefined && $scope.masterData.length ){
					var output = [];
					_.each($scope.masterData,function(item){
						_.each(receivedData,function(res){
							if(item.name === res){
								output.push(item);
							}
						});
						
					});
					$scope.tableData = output;
				}
				 return receivedData.length + " Selected";
            }
           
        };
		$scope.query = {
			order: 'name',
			limit: 10,
			page: 1
		};

		var getminimumMaximumValues = function(data){
			$scope.distinctNames = [];
			_.each(data,function(item){
				if($scope.distinctNames.length >0){
					var findItem = _.find($scope.distinctNames,function(distinctName){
						return distinctName.name === item.name;
					});
					if(findItem === undefined){
						$scope.distinctNames.push(item);	
					}
				}else{
					$scope.distinctNames.push(item);
				}
			});	
			$scope.maxvalues = angular.copy($scope.distinctNames);
			_.each(data,function(totalListItems){
				var minValue = _.find($scope.distinctNames,function(mindistItem){
					return (mindistItem.name === totalListItems.name &&  mindistItem.count > totalListItems.count);
				});
				if(minValue !== undefined){
					minValue.count = totalListItems.count;
				}
				var maxValue = _.find($scope.maxvalues,function(maxItem){
					return (maxItem.name === totalListItems.name &&  maxItem.count < totalListItems.count);
				});
				if(maxValue !== undefined){
					maxValue.count = totalListItems.count;
				}
			});
			$scope.minItemValue = function(minItem){
				return _.find($scope.distinctNames,function(distminvalue){
					return distminvalue.name === minItem;
				});
			};
			$scope.maxItemValue = function(maxGetItem){
				return _.find($scope.maxvalues,function(distmaxvalue){
					return distmaxvalue.name === maxGetItem;
				});
			};
		};

		/*, getKeysForDrillDown(dataOnWidget)*/
		/*loadDrillDownDataFromServer(WidgetName.InventoryofMicroServices, ChartTypes.table).then(function(data){
			$scope.tableData = data;
			getminimumMaximumValues(data);
     		$scope.masterData = angular.copy($scope.tableData);
		});*/
		$scope.getAllDrillDownData();
		$timeout(function() {
	            fixContainerHeight(1);
		},0);
	}
	angular.module('shieldxApp').controller('InventoryofMicroServicesCtr', InventoryofMicroServicesCtr);
})();

