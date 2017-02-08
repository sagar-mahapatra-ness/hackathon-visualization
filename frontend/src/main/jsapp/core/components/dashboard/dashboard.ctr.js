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
    function dashboardCtr($scope,
            $state,
            $interval,
            $timeout,
            $log,
            $mdDialog,
            chartDataLoader,
            dataVisualizationApi,
            $translate, 
            dataVisualizationService,
            $rootScope,coreservices, dashbordservice) {
        "ngInject";				

        $scope.widgetData = [];
        $scope.refreshInterval = 30000;
        $scope.refreshing = true;
        //$scope.createDashboard = false;
        $scope.timerRef = undefined;

        $scope.refreshData = function(currTab) {        
        	_.forEach(tabs, function(tab, index) {
				if(index === currTab) {
					var dataWidgetConfigArray = [];
					//for alerts;
					_.forEach(tab.alerts, function(alert, key){
						var dataWidgetConfig = new DataWidgetConfig(widgetConfig.list[alert.widgetName].widgetType, alert.widgetName);
						dataWidgetConfigArray.push(dataWidgetConfig);		
					});
					//for dashboard items
					_.forEach(tab.dashboardItems, function(dashboardItem, key){

						var dataWidgetConfig = new DataWidgetConfig(widgetConfig.list[dashboardItem.content.widgetName].widgetType, dashboardItem.content.widgetName, dashboardItem.content.interval);
						dataWidgetConfig.nValue = (dashboardItem.content.nValue)?dashboardItem.content.nValue:3;
						dashboardItem.content.nValue = (dashboardItem.content.nValue)?dashboardItem.content.nValue:3;
						dataWidgetConfig.interval = (dashboardItem.content.interval)?dashboardItem.content.interval:30;
						dashboardItem.content.interval = (dashboardItem.content.interval)?dashboardItem.content.interval:30;
						dataWidgetConfig.otheroption = dashboardItem.content.otheroption;
						dataWidgetConfigArray.push(dataWidgetConfig);		
					});

					if(dataWidgetConfigArray.length > 0) {
						dataVisualizationService.getDataForWidgets(dataWidgetConfigArray).then(function(response){
							console.log("multifetch enabled response"+response);
							$scope.widgetData[index] = response;
						});	
					}
				}						
			});			
        };


     
        $scope.dashboardTemplate = {};  
        $scope.dashboardTemplate.columns = 1; //default
       	var tabs = [],
        selected = null,
        previous = null,
        stop;
    	//$scope.tabs = tabs;
    	$scope.selectedIndex = 0;
    	$scope.tenentID = 0;
    	$scope.logoURL = "";
		
    	
    	$scope.$watch('selectedIndex', function(current, old){
			/*previous = selected;
			selected = tabs[current];
			if ( old + 1 && (old != current)) $log.debug('Goodbye ' + previous.title + '!');
			if ( current + 1 )                $log.debug('Hello ' + selected.title + '!');*/
			if(!!current)
				$scope.refreshData(current);
		});

		$scope.$watchCollection('widgetData', function(newlist, old){
			console.log(" deep equality test >> ",_.isEqual(newlist, old));
			var curr = angular.copy(newlist[$scope.selectedIndex]);
			_.forEach(curr, function(wData, key){
				//if(wData.length) {
					var d = angular.copy(wData);
					var tempElem = angular.element(document.querySelector('#t'+$scope.selectedIndex+'-'+key));
					var curTab = tabs[$scope.selectedIndex];
	    			var thisDbItem = _.find(curTab.dashboardItems, function(o) { 
	    				return o.id === 't'+$scope.selectedIndex+'-'+key; 
	    			});
	    			if(!thisDbItem) {
	    				thisDbItem = _.find(curTab.alerts, function(o) { 
	    					return o.id === 't'+$scope.selectedIndex+'-'+key; 
	    				});
	    			}
	    			if(!thisDbItem) {
	    				console.error("Something went wrong. PLease contact the UI dev team");
	    			}
					$scope.$broadcast('item-refresh', {
						wdgName: key,
						elem : tempElem[0],
						dataSet : d, 
						activeTab: $scope.selectedIndex,
						refreshStatus: thisDbItem.refresh,
						columns: $scope.dashboardTemplate.columns
					});
				//} else {
				//	console.error('Error: No data available for %o in Tab: %o', key, $scope.selectedIndex);
				//}
			});			
			$scope.refreshing = false;
		});

		/*$scope.$watchCollection('tabs', function(newlist, old){
			console.log('tab content changed!');
		});*/

    	$scope.removeTab = function (tab, ev) {
    		var confirm = $mdDialog.confirm({
    			onComplete: function afterShowAnimation() {
                    var $dialog = angular.element(document.querySelector('md-dialog'));
                    var $actionsSection = $dialog.find('md-dialog-actions');
                    var $cancelButton = $actionsSection.children()[0];
                    var $confirmButton = $actionsSection.children()[1];

                    var $contentBody = $dialog.find('md-dialog-content');
                    var $contentText = $contentBody.find('div');
                    angular.element($contentText).addClass('remove-dialog-content-style');

                    angular.element($cancelButton).addClass('md-accent md-hue-3');
                    angular.element($confirmButton).addClass('md-accent md-raised').css('color','#fff');
                }
    		})
		          .title('Remove Dashboard?')
		          .textContent('Are you sure you want to remove '+ tab.title.toUpperCase() +'?')
		          .targetEvent(ev)
		          .ok('Remove')
		          .cancel('Cancel');

		    $mdDialog.show(confirm).then(function() {
		    	var index = tabs.indexOf(tab);
	    		tabs.splice(index, 1);
	    		if(tabs.length === 0) {
	    			$scope.createDashboard = true;
					$scope.addDashboard = true;
	    		}
	    		dashbordservice.saveDashboardData($scope.tenentID, {
	    			columns: $scope.dashboardTemplate.columns, //$scope.dashboardTemplate.columns = 1,
	    			lastActiveTab: $scope.selectedIndex, //$scope.dashboardTemplate.lastActiveTab = index,
	    			tabs: tabs, //$scope.dashboardTemplate.tabs = tabs,
	    			theme: $scope.dashboardTemplate.theme  //$scope.dashboardTemplate.theme = "LIGHT"	    			
	    		});	    		
		    }, function() {
		    	//do nothing
		    });	    	
	    };

	    $scope.addTab = function (event) {
	    	 $mdDialog.show({
                skipHide: true,
                controller: 'newDasboardNameCtrl',
                bindToController: true,
                preserveScope: true,
                templateUrl: 'core/components/dashboard/dashboard-name.html',
                parent: angular.element(document.body),
                targetEvent: event,
                fullscreen: false,
                scope: $scope,
                openFrom: { top: 1100, height: 0 },
                closeTo: { left: 1500 }
            }).then(function(res) {
            	$scope.createDashboard = false;
            	var newIndex = tabs.push({ title: res, alerts : [], dashboardItems: [] });
            	$timeout(function() {
					$scope.selectedIndex = newIndex - 1;
				});
            	dashbordservice.saveDashboardData($scope.tenentID, {
	    			columns: $scope.dashboardTemplate.columns, //$scope.dashboardTemplate.columns = 1,
	    			lastActiveTab: $scope.selectedIndex, //$scope.dashboardTemplate.lastActiveTab = index,
	    			tabs: tabs, //$scope.dashboardTemplate.tabs = tabs,
	    			theme: $scope.dashboardTemplate.theme  //$scope.dashboardTemplate.theme = "LIGHT"	    			
	    		});
            });
	    };


	    $scope.configureTab = function(event, index) {
	    	console.log(tabs[index]);
	    	var itemList = [];
	    	
	    	_.forEach(widgetConfig.list, function(value, key) {
				itemList.push(value);
			});

	    	$mdDialog.show({
                controller: 'configureDashboardCtrl', 
                templateUrl: 'core/components/dashboard/configure-dashboard-tmpl.html', 
                parent: angular.element(document.body), 
                targetEvent: event, 
                clickOutsideToClose: true,                 
                locals: { tabConfig: tabs, activeTabIndex: index, dashboardItemList: itemList}
            }).then(function (response) {
                console.log(' data back from dialog box >> ', response);
                tabs[index].alerts.length = 0;
                tabs[index].dashboardItems.length = 0;

                tabs[index].title = response.title;

                _.forEach(response.selected, function(obj){
                	if(obj.chartType.match(/Alert/g)) {
                		tabs[index].alerts.push({
                			id: 't'+ index + '-' + obj.value,
                			refresh: true,
                			widgetName : obj.value          			
                		});
                	} else if (obj.chartType.match(/Chart/g)) {
                		tabs[index].dashboardItems.push({                			
							id: 't'+ index + '-' + obj.value, 
							refresh: true,
							content: {							
								widgetName: obj.value,
								options : widgetConfig.list[obj.value].otherConfig,
								nValue :3,
        						interval:30,
        						otheroption:""
							}
                		});
                	}
                });
               var tempObj = _.remove( tabs[index].dashboardItems,function(deleteWidget){
									return deleteWidget.content.widgetName === 'IOP';
							});
				if(tempObj && tempObj.length !== 0){
					tabs[index].dashboardItems.push(tempObj[0]);
				}
               
                $scope.refreshing = true;
                $scope.refreshData(index);
                $scope.switchLayout(null, $scope.dashboardTemplate.columns);
                dashbordservice.saveDashboardData($scope.tenentID, {
	    			columns: $scope.dashboardTemplate.columns, // = 1,
	    			lastActiveTab: index, //$scope.dashboardTemplate.lastActiveTab = index,
	    			tabs: tabs, //$scope.dashboardTemplate.tabs = tabs,
	    			theme: $scope.dashboardTemplate.theme  //$scope.dashboardTemplate.theme = "LIGHT"	    			
	    		});
            }, function () {
                //$scope.editIPRangeMode = false;
            });

	    };	

	    $scope.switchLayout = function(event, layout) {
	    	//setting state to menu item
	    	for(var i = 1; i <= 3; i++){
	    		var menuElem = document.querySelector('#db-config-'+i+'-col');
	    		if(i === layout) {
	    			angular.element(menuElem).addClass('config-selected');
	    		} else {
	    			angular.element(menuElem).removeClass('config-selected');
	    		}
	    	}	    	
			var gridster = document.querySelector('.gridster');
			if(layout == 1){
				angular.element(gridster).addClass('layoutOneColumn').removeClass('layoutTwoColumn').removeClass('layoutThreeColumn');
				$scope.gridsterOpts.rowHeight = 600;
			}else if(layout == 2){
				angular.element(gridster).addClass('layoutTwoColumn').removeClass('layoutOneColumn').removeClass('layoutThreeColumn');
				$scope.gridsterOpts.rowHeight = 500;
			}else if(layout == 3){
				angular.element(gridster).addClass('layoutThreeColumn').removeClass('layoutOneColumn').removeClass('layoutTwoColumn');
				$scope.gridsterOpts.rowHeight = 400;
			}

	    	var tempTab = tabs[$scope.selectedIndex];
	    	var r = 0;
    		_.forEach(tempTab.dashboardItems, function(item, key){
    			//sizeX =6 col =0
    			if(item.content.widgetName === "IOP"){
    				item.sizeX = 6;
    				item.col = 0;
    			}else{
    				if(layout==2){
	    				if( key%2 === 1) {
	    					r++;
	    				}
	    				item.row = r;
	    			}
    				item.sizeX = $scope.gridsterOpts.columns/layout;	
    				item.col = ((key * ($scope.gridsterOpts.columns/layout)) % $scope.gridsterOpts.columns);
    			}

    			//item.sizeY = $scope.gridsterOpts.columns/layout;


    			//item.sizeY = 1/layout;
    			//setting rows and cols
    			
    		});
    		$scope.dashboardTemplate.columns = layout; // ($scope.dashboardTemplate.columns !== layout) ? layout : $scope.dashboardTemplate.columns;
    		$scope.refreshing = true;
    		$scope.refreshData($scope.selectedIndex);	
    		if(!!event) {
	    		dashbordservice.saveDashboardData($scope.tenentID, {
	    			columns: $scope.dashboardTemplate.columns, //$scope.dashboardTemplate.columns = 1,
	    			lastActiveTab: $scope.selectedIndex, //$scope.dashboardTemplate.lastActiveTab = index,
	    			tabs: tabs, //$scope.dashboardTemplate.tabs = tabs,
	    			theme: $scope.dashboardTemplate.theme  //$scope.dashboardTemplate.theme = "LIGHT"	    			
	    		});   	
	    	}
	    };

	    $scope.removeWidget = function(event, dbItem) {
	    	var confirm = $mdDialog.confirm({
    			onComplete: function afterShowAnimation() {
                    var $dialog = angular.element(document.querySelector('md-dialog'));
                    var $actionsSection = $dialog.find('md-dialog-actions');
                    var $cancelButton = $actionsSection.children()[0];
                    var $confirmButton = $actionsSection.children()[1];

                    var $contentBody = $dialog.find('md-dialog-content');
                    var $contentText = $contentBody.find('div');
                    angular.element($contentText).addClass('remove-dialog-content-style');

                    angular.element($cancelButton).addClass('md-accent md-hue-3');
                    angular.element($confirmButton).addClass('md-accent md-raised').css('color','#fff');
                }
    		})
		          .title('Remove Widget?')
		          .textContent('Are you sure you want to remove '+widgetConfig.list[dbItem.content.widgetName].title+'?')
		          .targetEvent(event)
		          .ok('Remove')
		          .cancel('Cancel');

		    $mdDialog.show(confirm).then(function() {
		    	var curTab = tabs[$scope.selectedIndex];
		    	var thisIndex = _.findIndex(curTab.dashboardItems, function(o) { return o.id == dbItem.id; });
	    		curTab.dashboardItems.splice(thisIndex, 1);
	    		dashbordservice.saveDashboardData($scope.tenentID, {
	    			columns: $scope.dashboardTemplate.columns, //$scope.dashboardTemplate.columns = 1,
	    			lastActiveTab: $scope.selectedIndex, //$scope.dashboardTemplate.lastActiveTab = index,
	    			tabs: tabs, //$scope.dashboardTemplate.tabs = tabs,
	    			theme: $scope.dashboardTemplate.theme  //$scope.dashboardTemplate.theme = "LIGHT"	    			
	    		});
		    });	 
	    };
	    
	    $scope.selectedNavlue = function(event, dbItem, interval, nvalue){
	    	/*dbItem.content.nValue = parseInt(nvalue);
	    	dbItem.content.interval = parseInt(interval);*/
	    	console.log(dbItem.content.nvalue);
	    	console.log(dbItem.content.interval);
	    	console.log(dbItem.content.otheroption);
	    };

	    $scope.pauseRefreshToggle = function(event, dbItem) {
	    	var curTab = tabs[$scope.selectedIndex];
	    	var thisIndex = _.find(curTab.dashboardItems, function(o) { return o.id == dbItem.id; });
	    	thisIndex.refresh = !thisIndex.refresh;
	    	console.log(tabs);
	    };

	    $scope.drillDownConfig = {};
	    $scope.drillDownConfig.ready = false;

	    
	    $scope.$on('showDrillDown', function(event, args){	    	
	    	$scope.drillDownConfig.widgetname = args.type.value;
	    	$scope.drillDownConfig.drilldowndata = args.data;
			$scope.drillDownConfig.ready = true;
			$scope.$apply();
			d3.selectAll(".d3-tip.n").remove();
			setTimeout(function(){
				$scope.stopTimer();
			},0);
		});

	    $scope.$on('closeDrillDown', function(event, args){
	    	$scope.drillDownConfig = {};
	    	$scope.drillDownConfig.ready = false;
	    	$scope.refreshing = true;
	    	$scope.$emit('listenHeaderText', { headerText: "Dashboard" });
    		$scope.refreshData($scope.selectedIndex);
	    	//$state.reload();
	    });

	    $scope.toggleFullScreen = function(event) {
	    	var toggleList = ["md-tabs-canvas", "md-tabs-wrapper", "#dashboard-config-cog", "#home-toolbar", ".drill-dn-icon", ".widget-button-controls", ".widget-options"];
	    	_.forEach(toggleList, function(elems, key) {
	    		angular.element(document.querySelectorAll(elems)).css('display','none');
	    	});
	    	angular.element(document.querySelector("#dashboard-page")).css('background','#f7f7f7');
	    	angular.element(document.querySelector("#fullscreen-toolbar")).css('display','block');
	    };

	    angular.element(document).on('keydown keypress', function(event){ 
	    	if(!angular.element(document.querySelector('#fullscreen-toolbar')).css('display')) {
	    		return;
	    	}
			if(!!angular.element(document.querySelector('#fullscreen-toolbar')).css('display').match(/block/) && !!event.key.match(/Escape/)) {
				console.log("exit full screen");
				var toggleList = ["md-tabs-canvas", "md-tabs-wrapper", "#dashboard-config-cog", "#home-toolbar", ".drill-dn-icon", ".widget-button-controls", ".widget-options"];
	    		_.forEach(toggleList, function(elems, key) {
	    			angular.element(document.querySelectorAll(elems)).css('display','block');
	    		});
	    		angular.element(document.querySelector("#dashboard-page")).css('background','#fff');
	    		angular.element(document.querySelector("#fullscreen-toolbar")).css('display','none');
			}
		});

		window.onresize = function(){
			$scope.refreshing = true;
			$scope.refreshData($scope.selectedIndex);
		};

		$scope.toggleTheme = function(event, theme) {
			if(theme.match(/_LIGHT/gi) || theme.match(/LIGHT/gi)) {
				angular.element(document.querySelector('#db-config-light')).addClass('config-selected');
				angular.element(document.querySelector('#db-config-dark')).removeClass('config-selected');
				angular.element(document.querySelector('#dashboard-page')).removeClass('dark-theme');
				angular.element(document.querySelector('#dashboard-page')).addClass('light-theme');
				angular.element(document.querySelector('.headerBar')).removeClass('dark-theme');
				$scope.logoURL = 'images/ui-light-logo@2x.png';
			} else {
				angular.element(document.querySelector('#db-config-dark')).addClass('config-selected');
				angular.element(document.querySelector('#db-config-light')).removeClass('config-selected');
				angular.element(document.querySelector('#dashboard-page')).removeClass('light-theme');
				angular.element(document.querySelector('#dashboard-page')).addClass('dark-theme');
				angular.element(document.querySelector('.headerBar')).addClass('dark-theme');
				$scope.logoURL = 'images/ui-dark-logo@2x.png';
			}
			$scope.dashboardTemplate.theme = theme;
			if(!!event) {
				dashbordservice.saveDashboardData($scope.tenentID, {
	    			columns: $scope.dashboardTemplate.columns, //$scope.dashboardTemplate.columns = 1,
	    			lastActiveTab: $scope.selectedIndex, //$scope.dashboardTemplate.lastActiveTab = index,
	    			tabs: tabs, //$scope.dashboardTemplate.tabs = tabs,
	    			theme: $scope.dashboardTemplate.theme  //$scope.dashboardTemplate.theme = "LIGHT"	    			
	    		});
			}
		};

		$scope.setMessageHeight = function() {
			var winHeight = window.innerHeight;
			return (winHeight - 64 - 49) + 'px';
		};

		$scope.gridsterOpts = {
		    columns: 6, // the width of the grid, in columns
		    pushing: true, // whether to push other items out of the way on move or resize
		    floating: true, // whether to automatically float items up so they stack (you can temporarily disable if you are adding unsorted items with ng-repeat)
		    swapping: true, // whether or not to have items of the same size switch places instead of pushing down if they are the same size
		    width: 'auto', // can be an integer or 'auto'. 'auto' scales gridster to be the full width of its containing element
		    colWidth: 'auto', // can be an integer or 'auto'.  'auto' uses the pixel width of the element divided by 'columns'
		    rowHeight: 600, // can be an integer or 'match'.  Match uses the colWidth, giving you square widgets.
		    margins: [10, 10], // the pixel distance between each widget
		    outerMargin: true, // whether margins apply to outer edges of the grid
		    sparse: false, // "true" can increase performance of dragging and resizing for big grid (e.g. 20x50)
		    isMobile: false, // stacks the grid items if true
		    mobileBreakPoint: 600, // if the screen is not wider that this, remove the grid layout and stack the items
		    mobileModeEnabled: true, // whether or not to toggle mobile mode when screen width is less than mobileBreakPoint
		    minColumns: 1, // the minimum columns the grid must have
		    minRows: 2, // the minimum height of the grid, in rows
		    maxRows: 100,
		    defaultSizeX: 6, // the default width of a gridster item, if not specifed
		    defaultSizeY: 1, // the default height of a gridster item, if not specified
		    minSizeX: 1, // minimum column width of an item
		    maxSizeX: null, // maximum column width of an item
		    minSizeY: 1, // minumum row height of an item
		    maxSizeY: null, // maximum row height of an item
		    resizable: {
		       enabled: false,
		       handles: ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'],
		       start: function(event, $element, widget) {}, // optional callback fired when resize is started,
		       resize: function(event, $element, widget) {}, // optional callback fired when item is resized,
		       stop: function(event, $element, widget) { // optional callback fired when item is finished resizing
		       		$scope.refreshing = true;
		       		$scope.refreshData($scope.selectedIndex);       		       		
		       	} 
		    },
		    draggable: {
		       enabled: true, // whether dragging items is supported
		       //handle: '.my-class', // optional selector for drag handle
		       start: function(event, $element, widget) {}, // optional callback fired when drag is started,
		       drag: function(event, $element, widget) {}, // optional callback fired when item is moved,
		       stop: function(event, $element, widget) {} // optional callback fired when item is finished dragging
		    }
		};

		
		$scope.setTabData = function(datashabordData){

        	tabs = datashabordData.tabs;
			$scope.tabs = tabs;

			if(tabs.length === 0) {
				$scope.createDashboard = true;
				return;
			}

			$scope.dashboardTemplate.theme = datashabordData.theme;
			$scope.toggleTheme(null, $scope.dashboardTemplate.theme);
			$scope.dashboardTemplate.columns = datashabordData.columns;
			$scope.switchLayout(null, $scope.dashboardTemplate.columns);

			$scope.selectedIndex = 0;

			//update tabs with otherConfig
	    	_.forEach(tabs, function(tabItem, key){
	    		_.forEach(tabItem.dashboardItems, function(widgetItem){
	    			if(widgetConfig.list[widgetItem.content.widgetName].hasOwnProperty('otherConfig'))
	    				widgetItem.content["options"] = widgetConfig.list[widgetItem.content.widgetName].otherConfig; // jshint ignore:line
	    			widgetItem.refresh = true;
	    		});
	    	});
	    	$scope.refreshData($scope.selectedIndex);
        };
        /*$scope.createDashboard = true;
    	$scope.noTenantAvaliable = true;
    	$scope.addDashboard = false;  */
        coreservices.getTenantForVMWare().then(function(tenantid){
			console.log(" getTenantForVMWare ");
			console.dir(tenantid);
			$scope.tenentID = tenantid;
            var self = this;
            var tempObj = '';
            if(tenantid === undefined || tenantid === ''){
				$scope.createDashboard = true;
	        	$scope.noTenantAvaliable = true;
	        	$scope.addDashboard = false;            	
            }else{
            	return dashbordservice.getDashboardData($scope.tenentID).then(function(datashabordData){
					console.log(" getDashboardData "+datashabordData);
					console.dir(datashabordData);
					if(datashabordData && datashabordData !== '' ){
						_.each(datashabordData.tabs,function(dashboardItem){
							tempObj = _.remove(dashboardItem.dashboardItems,function(deleteWidget){
									return deleteWidget.content.widgetName === 'IOP';
							});
							if(tempObj && tempObj.length !== 0){
								dashboardItem.dashboardItems.push(tempObj[0]);
							}
							console.log(tempObj);
						});
						$scope.createDashboard = false;
						if(datashabordData.tabs.length===0){
	        				$scope.addDashboard = true;
						}else{
							$scope.addDashboard = false;
						}
	        			$scope.setTabData(datashabordData);
					}else{
		            	$scope.createDashboard = true;
						$scope.noTenantAvaliable = false;
						$scope.addDashboard = true;
					}
		    	});
            }
            //console.dir(scope.tenentID);
			
		});

		$scope.$emit('listenHeaderText', { headerText: "Dashboard"});			
		
		$scope.startTimer = function(){
			if(!$scope.timerRef){
	        $scope.timerRef = $interval(function(){
					console.log(' #################################   REFRESHING NOW!  #################################');
					$scope.refreshData($scope.selectedIndex);
				}, $scope.refreshInterval);
			}
	       	
		};

		$scope.stopTimer = function(){
			if($scope.timerRef){
			 $interval.cancel($scope.timerRef);
			 $scope.timerRef  = undefined;
		   }
		};

        $scope.startTimer();
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        	$scope.stopTimer();
        });
		
 }

    angular.module('shieldxApp').controller('dashboardCtr', dashboardCtr).directive('directiv', function(){
	    return {
	        restrict: 'A',
	        link: function(scope, element, attrs) {
	            element.bind('click', function(event, element) {
	               scope.$parent.$parent.selectedIndex = scope.$index;	               
	            });
	        }
	    };
	});
	
})();