/*
ShieldX Networks Inc. CONFIDENTIAL
----------------------------------
*
Copyright (c) 2016 ShieldX Networks Inc.
All Rights Reserved.
*
NOTICE: All information contained herein is, and remains
the property of ShieldX Networks Incorporated and its suppliers,
if any. The intellectual and technical concepts contained
herein are proprietary to ShieldX Networks Incorporated
and its suppliers and may be covered by U.S. and Foreign Patents,
patents in process, and are protected by trade secret or copyright law.
Dissemination of this information or reproduction of this material
is strictly forbidden unless prior written permission is obtained
from ShieldX Networks Incorporated.
*/

(function () {
	function widgetPainterDirective() {
		var directive = {};
		directive.controller = ['$scope','$timeout','$element', 'dataVisualizationApi','dataVisualizationService',
			function($scope, $timeout, $element, dataVisualizationApi,dataVisualizationService){
			
			var chartObj,
				old,
				self = this;
			var functionList = [dataVisualizationApi.barChart, dataVisualizationApi.stackedArea, dataVisualizationApi.tables];

			self.rendered = 'INIT';
			self.data = [];
			self.refresh = true;

			function renderDbChart (chType) {
				if(chType.match(/barchart/i)) {
					return functionList[0];
				} else if (chType.match(/stackedarea/i)) {
					return functionList[1];
				} else if (chType.match(/tables/i)) {
					return functionList[2];
				}
			}


			var widgetTitleDOM = angular.element(angular.element($element[0]).children().find('div')[0]);
			//dynamically inject widget options
			var widgetOptionDOM = angular.element($element[0]).children()[1];
			
			function paintWidget(args) { //wdgName, elem, dataSet, from
				var chartObj = {
					elem: args.elem,
					dataset: args.dataSet,  // not customisable option
					columns: args.columns
				};
				if(widgetConfig.list[args.wdgName].hasOwnProperty("axis")) {
					chartObj.axis = widgetConfig.list[args.wdgName].axis;
				}
				self.data = args.dataSet;
				
				if(self.rendered.match(/INIT/)) {
					console.log(self.rendered);
					self.widgetDetails = widgetConfig.list[args.wdgName];
					//set widget title
					if(!widgetConfig.list[args.wdgName].chartType.match(/Alert/)) {
						widgetTitleDOM.append("<span>"+widgetConfig.list[args.wdgName].title+"</span>");
						if(widgetConfig.list[args.wdgName].drillDown) {
							widgetTitleDOM.append("<i class=\"material-icons drill-dn-icon\">border_all</i>").on('click', function(){
								$scope.$emit('showDrillDown', { type: self.widgetDetails, data: self.data});
							});
						}
						self.rendered = 'RENDERED';
					}
				} else {
					console.log(self.rendered);
				}

				renderDbChart(widgetConfig.list[args.wdgName].widgetType)(chartObj);
 				
 				
			}

			function paintAlerts(args) {
			
				if(self.rendered.match(/INIT/)) {
					switch (args.wdgName) {
						case WidgetName.TroubledMicroServices:
							console.log('painting >>',WidgetName.TroubledMicroServices);
							var TroubledMicroservicesDom = "<div class=\"top-row\">5/151</div>" +
								"<div class=\"bottom-row\">Troubled Microservices</div>";
							if(angular.element(args.elem).hasClass("rendered")) {
								return;
							} else {
								angular.element(args.elem).addClass("rendered");

								angular.element(args.elem).on('click',function(){
									$scope.$emit('showDrillDown', { type: widgetConfig.list[args.wdgName], data: args.dataSet});	
								});
							}
							break;			

						case WidgetName.InventoryofMicroServices:
							console.log('rendering InventoryofMicroServices');
							var InventoryofMicroServicesDOM = "<div style=\" font-size: 28px; font-weight: bold; line-height: 0.86;\">" +
								"<div style=\" float: left; width: 33%;\"><span style=\"color: #6d6e71; margin: 0 10px 0 0;\">"+args.dataSet[0].name +"</span><span style=\"color: #4a90e2;\">" + args.dataSet[0].count+"</span></div>" +
								"<div style=\" float: left; width: 33%;\"><span style=\"color: #6d6e71; margin: 0 10px 0 0;\">"+args.dataSet[1].name +"</span><span style=\"color: #4a90e2;\">" + args.dataSet[1].count+"</span></div>" +
								"<div style=\" float: left; width: 33%;\"><span style=\"color: #6d6e71; margin: 0 10px 0 0;\">"+args.dataSet[2].name +"</span><span style=\"color: #4a90e2;\">" + args.dataSet[2].count+"</span></div>"+
								"</div>" +
								"<div style=\" line-height: 1.14; font-size: 14px; color: #6d6e71; margin: 8px 0 0 0;\">Micro-Services</div>";
							/*if(angular.element(args.elem).hasClass("rendered")) {
								return;
							} else {*/
								angular.element(args.elem).addClass("rendered");
								angular.element(args.elem).html(InventoryofMicroServicesDOM);
								angular.element(args.elem).on('click',function(){
									$scope.$emit('showDrillDown', { type: widgetConfig.list[args.wdgName], data: args.dataSet});	
								});
							//}
							break;

						case WidgetName.SystemInformation:
							console.log('rendering SystemInformation');
							/*var SystemInformationDom = "<div style=\" font-size: 28px; font-weight: bold; line-height: 0.86;\">" +
								"<div  style=\" margin-top:5px; \"><span class='system-info-widget-1'>Build No: </span><span class='system-info-widget-2'>" + args.dataSet.build_number+"</span></div>" +
								"<div  style=\" margin-top:5px;\"><span class='system-info-widget-1'>Version: </span><span class='system-info-widget-2'>" + args.dataSet.version+"</span></div>" +
								"<div  style=\" margin-top:5px;\"><span class='system-info-widget-1'>Current Date: </span><span class='system-info-widget-2'>" + args.dataSet.currectDate+"</span></div>" +
								"<div  style=\" margin-top:5px;\"><span class='system-info-widget-1'>Current Time: </span><span class='system-info-widget-2'>" + args.dataSet.currentTime+"</span></div>" +
								"<div  style=\" margin-top:5px;\"><span class='system-info-widget-1'>System Up Time: </span><span class='system-info-widget-2'>" + args.dataSet.time+"</span></div>" +
								"<div  style=\" margin-top:5px;\"><span class='system-info-widget-1'>Content Version: </span><span class='system-info-widget-2'>" + args.dataSet.content_version+"</span></div>"+
								"</div>" +
								"<div class='system-info-title'>System Information</div>";*/
							var SystemInformationDom = "<div style=\" font-size: 28px; font-weight: bold; line-height: 0.86;\">" +
								"<div style=\" float: left; width: 27%;\"><span style=\"color: #6d6e71; margin: 0 10px 0 0;\">UP</span><span style=\"color: #4a90e2;\">" + args.dataSet.time+"</span></div>" +
								"<div style=\" float: left; width: 36%;\"><span style=\"color: #6d6e71; margin: 0 10px 0 0;\">SYS</span><span style=\"color: #4a90e2;\">" + args.dataSet.version+"</span></div>" +
								"<div style=\" float: left; width: 36%;\"><span style=\"color: #6d6e71; margin: 0 10px 0 0;\">CNT</span><span style=\"color: #4a90e2;\">" + args.dataSet.contentVersion+"</span></div>"+
								"</div>" +
								"<div style=\" line-height: 1.14; font-size: 14px; color: #6d6e71; margin: 8px 0 0 0;\">System Information</div>";

							/*var SystemInformationDom = "<div style=\" font-size: 28px; font-weight: bold; line-height: 0.86;\">" +
							"<div  style=\" margin-top:5px; \"><span class='system-info-widget-1'>Build No: </span><span class='system-info-widget-2'>" + args.dataSet.build_number+"</span></div>" +
							"<div  style=\" margin-top:5px;\"><span class='system-info-widget-1'>Version: </span><span class='system-info-widget-2'>" + args.dataSet.version+"</span></div>" +
							"<div  style=\" margin-top:5px;\"><span class='system-info-widget-1'>Current Date: </span><span class='system-info-widget-2'>" + args.dataSet.currectDate+"</span></div>" +
							"<div  style=\" margin-top:5px;\"><span class='system-info-widget-1'>Current Time: </span><span class='system-info-widget-2'>" + args.dataSet.currentTime+"</span></div>" +
							"<div  style=\" margin-top:5px;\"><span class='system-info-widget-1'>System Up Time: </span><span class='system-info-widget-2'>" + args.dataSet.time+"</span></div>" +
							"<div  style=\" margin-top:5px;\"><span class='system-info-widget-1'>Content Version: </span><span class='system-info-widget-2'>" + args.dataSet.content_version+"</span></div>"+
							"</div>" +
							"<div class='system-info-title'>System Information</div>";*/

							/*if(angular.element(args.elem).hasClass("rendered")) {
								return;
							} else {*/
								angular.element(args.elem).addClass("rendered");
								angular.element(args.elem).html(SystemInformationDom);
								/*angular.element(args.elem).on('click',function(){
									//$scope.$emit('showDrillDown', { type: widgetConfig.list[args.wdgName], data: args.dataSet});	
								});*/
							//}
							break;

						case WidgetName.NewApplications:
							console.log('rendering NewApplications');
							var NewApplicationsDom = "<table class="+WidgetName.NewApplications+"><thead><th>Application Name</th></thead><tbody>";
							var data= '';
							for(var i=0;i<args.dataSet.length;i++){
								 data = data + "<tr><td>"+args.dataSet[i].key+"</td></tr>";
							}
							NewApplicationsDom = NewApplicationsDom + data + "</tbody></table>";
							if(angular.element(args.elem).hasClass("rendered")) {
								return;
							} else {
								angular.element(args.elem).addClass("rendered");
								angular.element(args.elem).append(NewApplicationsDom);
								angular.element(args.elem).on('click',function(){
									$scope.$emit('showDrillDown', { type: widgetConfig.list[args.wdgName], data: args.dataSet});	
								});
							}							
							break;

						/*default:
							console.error("Something is wrong here");*/
					}
				}
			
			}

			function loadChartData(fileName,chartType,widgetType ) {
				var proxyData = new ProxyData(fileName);
                var dataWidgetConfig = new DataWidgetConfig(chartType,widgetType,proxyData);
				return dataVisualizationService.getDataForWidget(dataWidgetConfig).then(function (chartData) {
					return chartData;
				});
			}
			function loadChartDataFromServer(chartType, widgetType ) {
				var dataWidgetConfig = new DataWidgetConfig(chartType, widgetType);
				return dataVisualizationService.getDataForWidget(dataWidgetConfig).then(function (chartData) {
					return chartData;
				});
			}


			function loadDrillDownDataFromServer(widgetType,chartType,interval) {
				var args = [];
				for (var i = 3; i < arguments.length; i++) {
                     args.push(arguments[i]);
                }
                console.log("loadDrillDownDataFromServer args "+args);
                console.dir(args);
				var dataWidgetConfig = new DataWidgetConfig(chartType, widgetType,interval,args);
				
				return dataVisualizationService.getDrillDownDataForWidget(dataWidgetConfig).then(function (chartData) {
					return chartData;
				});
			}

			$scope.$on('item-resized', function(event,args){
				if(args.widget.content.widgetName.match(event.currentScope.widget)) {
					console.log('firing widget repaint', event.currentScope.widget);
					paintWidget({
						wdgName: event.currentScope.widget, 
						elem: args.elem[0],
						dataSet : args.widgetData,
						from : "RESIZE"
					});
				}				
			});

			$scope.$on('item-refresh', function(event,args){
				var currentWdgId;
				self.refresh = args.refreshStatus;
				
				if(event.currentScope.$parent.hasOwnProperty("gridsterItem")) {
					currentWdgId = event.currentScope.$parent.gridsterItem.$element["0"].firstElementChild.id;
					if(args.elem.id.match(currentWdgId) && self.refresh) {
						paintWidget({
							wdgName: args.wdgName, 
							elem: args.elem,
							dataSet : args.dataSet,
							from : "REFRESH",
							columns : args.columns
						});
					} 
				} else {
					if(event.currentScope.widget.match(args.wdgName)) {
						paintAlerts({
							wdgName: args.wdgName, 
							elem: args.elem,
							dataSet : args.dataSet,
							from : "REFRESH",
						});
					}
				}
				
			});
			
		}];
		directive.scope = {
            widget: '=widget'
        };
		directive.restrict = 'A';
		return directive;
	}
	angular.module('shieldxApp').directive('widget', widgetPainterDirective);
})();