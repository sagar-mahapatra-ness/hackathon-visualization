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
    function tenantDialogBoxCtr($scope, $mdDialog, selectedTenatnID, tenants) {


        $scope.selectedTenatnID = selectedTenatnID;
        $scope.title = "Select Tenant";
        $scope.tenantFetched = false;
        $scope.tenants = tenants;
        $scope.numberOfTenant = $scope.tenants.length;
        $scope.selectEnableState = false;
        /*ipPoolServices.getNetworksFromCache({success:function(data){ 
         console.log("data recived &&&& ");
         console.dir(data);
         $scope.networkFetched = true; 
         $scope.newtworks = [];                                        
         for(var i in data){
         $scope.newtworks.push({id:data[i].id ,label:data[i].name,data:""}); 
         } 
         // console.dir($scope.managmentNetworks); 
         $scope.numberOfNetwork = $scope.newtworks.length;                                               
         }
         });*/

        $scope.onSelectionChanged = function () {
            console.log(" onSelectionChanged >> ");
            $scope.selectEnableState = true;
        };

        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.closeDialog = function () {
            $mdDialog.cancel();
        };
        $scope.closeDialogWithAnswer = function (answer) {
            console.log(" answer " + answer);
            var returnVal = {selectedVal: answer, tenants: $scope.tenants};
            $mdDialog.hide(returnVal);
        };
    }
    angular.module('shieldxApp').controller('tenantDialogBoxCtr', tenantDialogBoxCtr);

})();