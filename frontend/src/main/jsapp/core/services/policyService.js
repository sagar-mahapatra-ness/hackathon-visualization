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

(function() {
    function policyService(getDataService,  infrastructureConnectorService, Restangular, createDataService, readDataService, updateDataService, deleteDataService, $q, $sessionStorage) {
        "ngInject";

        var policyData = [];
        this.getSecurityPolicySet = function() {
            return getDataService.makeRESTDataCall('GET', 'policy/securitypolicyset').then(function(data) {
                return data;
            }, function(error) {
                console.log(error);
                //THIS IS MOCK DATA
                return [{
                    "id": 4,
                    "name": "ACL"
                }, {
                    "id": 2,
                    "name": "ThreatPrevention"
                }, {
                    "id": 3,
                    "name": "AppID"
                }, {
                    "id": 1,
                    "name": "ThreatPreventionAndAppID"
                }, {
                    "id": 5,
                    "name": "ThreatPreventionAndACL"
                }, {
                    "id": 6,
                    "name": "ACLAndAppId"
                }, {
                    "id": 7,
                    "name": "ACLThreatPreventionAndAppID"
                }];

            });
        };
        this.getSPSByTenant = function(tenantId){
            return getDataService.makeRESTDataCall('GET', 'policy/securitypolicyset/tenant/'+tenantId).then(function(data) {
                return data;
            }, function(error) {
                console.log("Error Occured");
            });
        };
        this.getListOfPoliciesDetails = function(routename, name, objId) {
            //policyData[routename] = [];
            objId = typeof objId !== 'undefined' ? objId : null;
            return readDataService.readData(routename, name, objId, { nocache: true }).then(function(data) {
                //            return getDataService.makeRESTDataCall('GET', '', cloudId, 'deployspec').then(function(data){

                return data;
            }, function(error) {
                console.log(error);
                //THIS IS MOCK DATA
                return $q.reject(error);
            });
        };
        this.getPolicyDetail = function(routename, name, objId) {
            if(objId){
                var dataurl = name + '/' + routename + '/' + objId;
                return getDataService.customGet(dataurl).then(function(response) {
                    return response;
                });
            } else {
                return $q.reject();
            }
        };
        this.getDataBasedOnId = function(path, id, obj) {
            var data = (obj === true) ? (id + '/' + path) : path + '/' + id;
            return getDataService.makeRESTDataCall('GET', data).then(function(result) {
                return result;
            }, function(err) {
                console.log(err);
                return $q.reject(err);
            });
            //$q.promise();
        };

        this.loadClouds = function(clouds, index, datalist,name){
                var cloudsLength = clouds.length;
                var cloud;
                var count = 0; 
                var self = this;
                if(clouds.length > index){
                   cloud = clouds[index];
                   return self.getDataBasedOnId("infras",cloud.id+"/"+name).then(function(tenantData){
                     _.each(tenantData, function(tenant) {
                        tenant.cloudName = cloud.name;
                        datalist.push(tenant);
                      });
                      if(index < cloudsLength){
                         return self.loadClouds(clouds, index+1, datalist,name);  
                      }
                   }); 
                }
        };
        this.getDataFromCloud = function(name){
            var self = this;
            return infrastructureConnectorService.getListOfInfrastructures().then(function(clouds) {
               var dataList = [];
               if(clouds.length > 0){
                   return self.loadClouds(clouds, 0, dataList,name).then(function(data){
                     console.log(" getdata "+dataList);
                     return dataList;
                   }); 
               }else{
                    return $q.reject();
               }
            });
                
        };
       this.getTotalTenats = function(){
            var self = this;
            return self.getDataFromCloud("tenants");
        };
        this.getResourceGroupData = function(){
            var self = this;
            return self.getDataFromCloud("resourcegroup");
        };
        
        
        this.updateMalwarePolicyData = function(path, data) {

            return getDataService.makeRESTDataCall('POST', path, data).then(function(result) {
                return result;
            }, function(err) {
                console.log(err);
                return $q.reject(err);
            });
        };
        this.updateExistingPolicyData = function(path, data) {

            return getDataService.makeRESTDataCall('PUT', path, data).then(function(result) {
                return result;
            }, function(err) {
                console.log(err);
                return $q.reject(err);
            });
        };
        this.deletePolicyBasedOnID = function(path, id) {
            return getDataService.makeRESTDataCall('DELETE', path, id).then(function(data) {
                return data;
            }, function(error) {
                return $q.reject(error);
            });
        };

        this.updatePolicyData = function(path, data) {

            return getDataService.makeRESTDataCall('PUT', path, data).then(function(result) {
                return result;
            }, function(err) {
                console.log(err);
                return $q.reject(err);
            });
        };

        this.createPolicyData = function(path, data) {

            return getDataService.makeRESTDataCall('POST', path, data).then(function(result) {
                return result;
            }, function(err) {
                console.log(err);
                return $q.reject(err);
            });
        };

        this.getDummyData = function(dummyData,path,id){
            return getDataService.makeRESTDataCall('GET', path, id).then(function(result) {
                return result;
            }, function(err) {
                console.log(err);
                return $q.resolve(dummyData);
            });
        };
    }
    angular.module('shieldxApp').service('policyService', policyService);
})();
