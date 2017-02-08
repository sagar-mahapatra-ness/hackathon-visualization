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
    function resourceGroupService(getDataService, Restangular, readDataService, updateDataService, deleteDataService, createDataService) {
        "ngInject";


         this.createResourceGroup = function (paramObj) {
            //POST /shieldxapi/infras/resourcegroup
            return createDataService.createData("resourcegroup", paramObj, paramObj.cloudId).then(function (data) {
                //return getDataService.makeRESTDataCall('POST', 'infras/resourcegroup',  paramObj).then(function(data) {
                return data;
            });
        };

        /**
         * Function to get List of groups under given Infrastructure
         * @param cloudId (Cloud Id/ Infrastructure Id)
         * @returns array (GroupListData)
         * 
         */

        //GET /shieldxapi/infras/{infraId}/resourcegroup
        this.getGroupList = function (cloudId) {
//            return getDataService.makeRESTDataCall('GET', 'infras', cloudId,'resourcegroup').then(function(data){
            return readDataService.readData("resourcegroup", cloudId).then(function (data) {
                return data;
            }, function (error) {
                console.log(error);
                return [];
            });
        };
       /* this.getResourceGroupListBasedOnId = function(cloudId,objID){
            return readDataService.readData("resourcegroup", cloudId,objID).then(function (data) {
                return data;
            }, function (error) {
                console.log(error);
                return [];
            });
        };*/
        /**
         * Function to Delete resource group Id
         * @param rgId (Group Id)
         * @param cloudId (Cloud Id)
         * @returns object (Object of status)
         *
         */
        //DELETE /shieldxapi/infras/resourcegroup/{rgId}
        this.deleteGroupList = function (rgId, cloudId) {
            return deleteDataService.deleteData('resourcegroup', rgId, cloudId).then(function (data) {
                //return getDataService.makeRESTDataCall('DELETE', 'infras/resourcegroup', rgId).then(function(data){
                console.log("Resource Group with id %i deleted successfully...", rgId);
                //console.log(data);
                return {'status': true};
            }, function (error) {
                console.log(error);
                return {'status': false, 'errorMessage': error.data.message};
            });
        };

        /**
         * Function to Update resource group Id
         * @param paramObject (Object to update)
         * @returns promise
         *
         */
        this.updateResourceGroup = function (paramObject) {
            return updateDataService.updateData('resourcegroup', paramObject, paramObject.cloudId);
            //return getDataService.makeRESTDataCall('PUT', 'infras/resourcegroup', paramObject);
        };

    }
    angular.module('shieldxApp').service('resourceGroupService', resourceGroupService);
})();
