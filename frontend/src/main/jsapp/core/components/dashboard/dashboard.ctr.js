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

    		console.log("hello");
    		$scope.cardType= [{"type":"c1","value":"c1"},{"type":"c2","value":"c2"},{"type":"c3","value":"c3"},{"type":"c4","value":"c4"},{"type":"c5","value":"c5"},{"type":"c6","value":"c6"},{"type":"c7","value":"c7"}];
            var currentDate = new Date();
            var endDate = new Date(currentDate.getTime()- (24*60*60*1000));
            $scope.startDate = endDate;
            $scope.startTime = endDate;
            $scope.endDate = currentDate;
            $scope.endTime = currentDate;
    		$scope.showGraph = function(){
    			console.log("show 2d  event data clicked ");
                console.log($scope.cardTypeSelected);
    			dataVisualizationService.setTwoDDataTwoAnalsis({"data":$scope.cardTypeSelected});
    			$state.go("home.EventCorrelationExplorer");
    		};
        $scope.$emit('listenHeaderText', { headerText: "Select Details"});
	
	}
	angular.module('shieldxApp').controller('dashboardCtr', dashboardCtr);
})();