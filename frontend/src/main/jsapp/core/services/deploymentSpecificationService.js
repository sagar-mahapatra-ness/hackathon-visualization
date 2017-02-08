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
    function deploymentSpecificationService(getDataService, Restangular, createDataService, readDataService, updateDataService, deleteDataService) {
        "ngInject";

        this.createDeploymentSpecfication = function (paramObj) {
            //POST /shieldxapi/deployspec
            return createDataService.createData("deployspec", paramObj, paramObj.cloudid).then(function (data) {
                //return getDataService.makeRESTDataCall('POST', 'deployspec', paramObj).then(function(data) {
                return data;
            });
        };
        this.updateDeploymentSpecfication = function (paramObj) {
            //getDataService.makeRESTDataCall('PUT', paramObj)
            return updateDataService.updateData('deployspec', paramObj, paramObj.cloudid);
            //return getDataService.makeRESTDataCall('PUT', 'deployspec', paramObj);
        };
        this.getHosts = function (cloudId) {
            return readDataService.readData("hosts", cloudId).then(function (data) {
//            return getDataService.makeRESTDataCall('GET', 'infras', cloudId, 'hosts').then(function(data){
                return data;
            });
        };

        this.getDatastore = function (cloudId) {
            return readDataService.readData("datastore", cloudId).then(function (data) {
//            return getDataService.makeRESTDataCall('GET', 'infras', cloudId,'datastore').then(function(data){
                return data;
            });

        };
        //GET /shieldxapi/infras/{infraId}/tenants
        this.getTenants = function (cloudId) {
            return readDataService.readData("tenants", cloudId).then(function (data) {
//            return getDataService.makeRESTDataCall('GET', 'infras', cloudId,'tenants').then(function(data){
                return data;
            });

        };

        this.getRegions = function (cloudId) {
            return readDataService.readData("regions", cloudId).then(function (data) {
//            return getDataService.makeRESTDataCall('GET', 'infras', cloudId,'tenants').then(function(data){
                return data;
            });

        };

        this.deleteDeploymentSpecfication = function (deploymentSpecId, cloudId) {
            return deleteDataService.deleteData('deployspec', deploymentSpecId, cloudId).then(function (data) {
                //return getDataService.makeRESTDataCall('DELETE', 'deployspec', deploymentSpecId).then(function(data){
                console.log("Deployment Specification with id %i deleted successfully...", deploymentSpecId);
                //console.log(data);
                return {'status': true};
            }, function (error) {
                console.log(error);
                return {'status': false, 'errorMessage': error.data.message};
            });
        };

        this.getDeploymentSpecList = function (cloudId) {
            return readDataService.readData("deployspec", cloudId).then(function (data) {
//            return getDataService.makeRESTDataCall('GET', '', cloudId, 'deployspec').then(function(data){
                return data;
            }, function (error) {
                console.log(error);
                //THIS IS MOCK DATA
                return [];

            });
        };

        this.isinlineModeAvailable = function (cloudId, deploymentSpecId) {
            var deploymentSpecData = readDataService.readDataFromSession("deployspec", false, cloudId);
            var inlineModeAvailable = false;
            if (deploymentSpecData) {
                for (var i = 0; i < deploymentSpecData.length; i++) {
                    if(deploymentSpecData[i].id === deploymentSpecId) {
                        inlineModeAvailable = (typeof deploymentSpecData[i].vlanPoolId !== "undefined" &&
                deploymentSpecData[i].vlanPoolId) ? true : false;
                    }
                }
            }
            return inlineModeAvailable;
        };

    }
    angular.module('shieldxApp').service('deploymentSpecificationService', deploymentSpecificationService);
})();
