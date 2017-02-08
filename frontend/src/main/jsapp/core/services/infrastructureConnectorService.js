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

    function infrastructureConnectorService(getDataService, Restangular, $q, readDataService,createDataService, deleteDataService, updateDataService) {
        "ngInject";

        this.createInfrastructure = function (paramObj) {
            console.log(paramObj);
            var infrastructureObject1 = paramObj;
            /*var infrastructureObject = {
             "id": 0,
             "ip": paramObj.ip,
             "name": paramObj.name,
             "password": paramObj.password,
             "type": paramObj.type,
             "username": paramObj.username,
             "https" : paramObj.https,
             "domain" : paramObj.domain
             };*/

            return createDataService.createData('infras', infrastructureObject1).then(function (data) {
                console.log(" infrastructureConnectorService data file");
                return data;
            });
        };
        this.updateInfrastructure = function (paramObj) {
            //getDataService.makeRESTDataCall('PUT', paramObj)
            return updateDataService.updateData ('infras', paramObj , paramObj.id).then(function(response) {
                return response;
            }, function (error) {
                throw (error);
            });
        };

        this.getListOfInfrastructures = function () {
            return readDataService.readData('infras').then(function (response) {
                return response;
            });
            /*var deferred = $q.defer();
             
             items = [{"id":1,"name":"shieldx-ness","ip":"10.8.103.14","username":"administer@vsphere.local","password":null,"type":"VMWARE"},{"id":2,"name":"NessDevTeam","ip":"192.168.1.1","username":"mahesh","password":null,"type":"VMWARE"},{"id":3,"name":"NessDevTeam1","ip":"192.168.1.1","username":"mahesh","password":null,"type":"VMWARE"},{"id":4,"name":"NessShieldXTest1","ip":"172.27.255.255","username":"Test","password":null,"type":"VMWARE"},{"id":5,"name":"f","ip":"fadsf","username":"adsf","password":null,"type":"VMWARE"},{"id":6,"name":"Sudeep","ip":"10.10.101.10","username":"sudeep","password":null,"type":"VMWARE"},{"id":7,"name":"NESS-TESTING","ip":"10.8.103.15","username":"ness-user","password":null,"type":"VMWARE"},{"id":8,"name":"dsfdfd","ip":"dfsdfdfs","username":"dfdsfsfdsfdsfdf","password":null,"type":"VMWARE"},{"id":9,"name":"MaheshTest11","ip":"Test By Mahesh from app","username":"mahesh","password":null,"type":"VMWARE"},{"id":10,"name":"dsff","ip":"dfsdf","username":"dfsdf","password":null,"type":"VMWARE"},{"id":11,"name":"retrtrt","ip":"rtertrt","username":"rtertrt","password":null,"type":"VMWARE"},{"id":12,"name":"asdsadsad","ip":"asdsad","username":"asdsad","password":null,"type":"VMWARE"}];
             deferred.resolve(items);
             return deferred.promise;*/
        };

        this.deleteInfrastructure = function (id) {
            if (id) {
                return deleteDataService.deleteData('infras', id).then(function (res) {
                    console.log("Infrastructure deleted successfully");
                    //console.log(data);
                    return {'status': true};
                }, function (error) {
                    console.log(error);
                    return {'status': false, 'errorMessage': error.data.message};
                });
            } else {
                return {'status': false};
            }
        };

        this.discoverInfrastructure = function (cloudId) {
            return getDataService.customGet("infras", cloudId + "/discover").then(function (response) {
                if (response) {
                    return {'status': true};
                } else {
                    return {'status': false};

                }
            }, function (error) {
                console.log(error);
                return {'status': false, 'errorMessage': error.data.message};
            });
        };

        this.uploadSslKeys = function(tenantId, file) {
            
            var callingRoute = "/infras/"+tenantId+"/uploadsslkeys";
            
            return getDataService.uploadFile(callingRoute, file).then(function (response) {
                if (response) {
                    return {
                        'status': true,
                        'response': response
                    };
                } else {
                    return {
                        'status': false,
                        'response': response
                    };

                }
            }, function (error) {
                throw (error);
            });
        };
    }
    angular.module('shieldxApp').service('infrastructureConnectorService', infrastructureConnectorService);
})();
