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
	function drilldownDirective() {
		var directive = {};
		directive.controller = ['$scope', 
			function($scope){
				var baseURL = 'core/directive/widget-painter/drilldown-collection/';
				$scope.drillDownTmpl = baseURL+"/"+$scope.widgetname+"/"+$scope.widgetname+".html";
				console.log("Received for drilldown ",$scope.drilldowndata);

				$scope.closeDrillDown = function(event) {
					$scope.$emit('closeDrillDown', {});
				};
			}
		];
		directive.scope = {
            widgetname: '=widgetname',
            drilldowndata : '=drilldowndata'
        };
        directive.restrict = 'E';
        directive.templateUrl = 'core/directive/widget-painter/dashboardDrillDown.html';
		return directive;
	}
	angular.module('shieldxApp').directive('drilldowncontainer', drilldownDirective);
})();