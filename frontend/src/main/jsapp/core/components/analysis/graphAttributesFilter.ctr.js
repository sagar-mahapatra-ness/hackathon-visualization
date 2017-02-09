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
    function graphAttributesFilterCtr($scope,dataVisualizationService){
    	//dynamically correcting all the heights and widths of elements
        var twodData = dataVisualizationService.returnTwoDDataToAnalysis();
        if(twodData.length === 0 || twodData.data === "c1"){
               twodData.data = "c1"; 
               $scope.dataarrya = [{"value":"Utlility"},{"value":"Fuel"},{"value":"Shopping"}];
        }
        if(twodData.data === "c2"){
              $scope.dataarrya = [{"value":"Theft"},{"value":"Lost"},{"value":"Fraud"}];   
        }
        if(twodData.data === "c3"){
              $scope.dataarrya = [{"value":"2L"},{"value":"5L"},{"value":"8L"}];      
        }
        if(twodData.data === "c4" || twodData.data === "c5"){
              $scope.dataarrya = [{"value":"25K"},{"value":"50K"},{"value":"1L"}];      
        }
        
        angular.element(document.querySelector('#graph-attributes')).css('height', (window.innerHeight-113)+'px');
        angular.element(document.querySelector('#navigator')).css('width', (window.innerWidth*0.25)+'px');
        angular.element(document.querySelector('#navigator')).css('height', (window.innerWidth*0.25)/1.7+'px');
        angular.element(document.querySelector('#navigator svg')).css('width', (window.innerWidth*0.25)+'px');
        angular.element(document.querySelector('#navigator svg')).css('height', (window.innerWidth*0.25)/1.7+'px');

        angular.element(document.querySelectorAll('#events-tabs md-tab-content')[1]).css('overflow','hidden');     
    }
    angular.module('shieldxApp').controller('graphAttributesFilterCtr', graphAttributesFilterCtr);
})();