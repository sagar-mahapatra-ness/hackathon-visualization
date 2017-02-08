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

    function eventGridCtr($scope, $mdDialog, dataVisualizationService,vc) {
        $scope.vc = vc;
        this.startTime = null;
        var endTime = new Date();
        endTime.setTime(parseInt($scope.vc.endTime));
        var startTime = new Date(); 
        startTime.setTime(parseInt($scope.vc.startTime)); 
        $scope.startTime = startTime.getFullYear()+"/"+(startTime.getMonth()+1)+"/"+startTime.getDate()+" "+(startTime.getHours()+1)+":"+(startTime.getMinutes()+1);
        $scope.endTime  = endTime.getFullYear()+"/"+(endTime.getMonth()+1)+"/"+endTime.getDate()+" "+(endTime.getHours()+1)+":"+(endTime.getMinutes()+1);
        $scope.eventData = [];
        $scope.query = {
  			order: 'name',
  			limit: 10,
  			page: 1
		    };
        dataVisualizationService.getEventDataFor3DGridData($scope.vc).then(function(eventdata){
           console.log("data recived from server");
           console.dir(eventdata);
           for(var i=0; i<eventdata.length; i++){
           	  var node = eventdata[i];
              var timeStr = "";
           	  var st = node['start time']; 
              if(st){
                var time = new Date(); 
                timeStr = (time.getMonth()+1)+"/"+time.getDate()+"/"+time.getFullYear();
                timeStr = timeStr +":"+(time.getMinutes()+1)+":"+(time.getHours()+1)+":"+(time.getSeconds()+1);
              }
           	  var rowData = {
           	  	startTime:timeStr,
				severirty:node.severity,
				srcResourceGroup:node.srcResourceGroup,
				dstResourceGroup:node.dstResourceGroup,
				srcIpAddress:node.srcIpAddress,
				dstIpAddress:node.dstIpAddress,
				dstMachineName:node.dstMachineName,
				srcMachineName:node.srcMachineName,
        policyName:node.policyName,
        threatName:node.threatName,
        fileTag:node.fileTag
           	  };
           	  $scope.eventData.push(rowData);
           }
           console.log(" eventGridCtr ");
           console.dir($scope.eventData);   
        });
        $scope.cancel = function(){
        	$mdDialog.hide();
        };
        //fixContainerHeight(1);
    }
    angular.module('shieldxApp').controller('eventGridCtr', eventGridCtr);

})();