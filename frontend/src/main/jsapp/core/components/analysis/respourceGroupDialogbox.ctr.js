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

    function respourceGroupDialogboxCtr($scope, coreservices, $mdDialog, selectedgroups) {

        $scope.selectedgroups = [];
         for(var j=0; j<selectedgroups.length; j++){
            $scope.selectedgroups.push({name:selectedgroups[j]});
        }
        $scope.no_of_rgs = 0;
        $scope.itemChangedBridge = new MethodBridge();
        $scope.items = [];
        $scope.selected = [];
        coreservices.getListOfResourceGroup().then(function(resourcesGroups){
           console.log(" getListOfResourceGroup " + resourcesGroups.length);
           console.dir(resourcesGroups);
           // resourcesGroups = [{name:"sagar"},{name:"sony"},{name:"sony3"}];
           for(var i=0; i<resourcesGroups.length; i++){
            $scope.items.push({name:resourcesGroups[i].name});
           }
          $scope.itemChangedBridge.call($scope.items);
        });
        console.log("selectedgroups");
        console.dir(selectedgroups);
        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.toggle = function (item, list) {
            console.log(" toggle list");
            console.dir(list);
            console.log(" toggle item");
            console.dir(item);
            var index = _.findIndex($scope.selectedgroups,function(ind){
                return item.name === ind.name;
            });
            if(index == -1){
                $scope.selectedgroups.push(item);
            } else{
                $scope.selectedgroups.splice(index,1);
            }
        };

        $scope.selectGroups = function(){
           
            console.log(" $scope.selectedgroups ");
            console.dir($scope.selectedgroups);
            var gr = [];
            for(var i=0; i<$scope.selectedgroups.length; i++){
              gr.push($scope.selectedgroups[i].name);
            }
            $mdDialog.hide(gr);

        };

         $scope.toggleAll = function ()
         {
            if ($scope.selectedgroups.length === $scope.items.length) { //uncheck all
                $scope.selectedgroups = [];
            } else if ($scope.selectedgroups.length === 0 || $scope.items.length > 0) {
                $scope.selectedgroups = $scope.items.slice(0); //check all
            }
            $scope.no_of_rgs = $scope.selected.length;
        };

        $scope.isIndeterminate = function () 
        {
            return ($scope.selectedgroups.length !== 0 &&
                $scope.selectedgroups.length !== $scope.items.length);
        };
        $scope.isChecked = function () {
            return $scope.selectedgroups.length === $scope.items.length;
        };

        $scope.exists = function (item, list) {
          if($scope.selectedgroups.length === 0){
            return false;
          }
           console.log(" $scope.selectedgroups "+$scope.selectedgroups); 
            var index = _.findIndex($scope.selectedgroups,function(ind){
                return item.name === ind.name;
            });
            console.log(" exists "+item); 
            console.log(" index "+index); 
            return index != -1;
        };
    }
    angular.module('shieldxApp').controller('respourceGroupDialogboxCtr', respourceGroupDialogboxCtr);

})();