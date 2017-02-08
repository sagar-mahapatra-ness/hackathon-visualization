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

    function smbService(getDataService, Restangular, $q, readDataService,createDataService, deleteDataService, updateDataService) {
        "ngInject";

        this.testConnection = function (paramObj) {
        	console.log("smbService : testConnection() called. backup config = "+paramObj);
            return getDataService.makeRESTDataCall('POST', 'manage/smbserver/test', paramObj).then(function (response) {
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

        this.saveSmbServerSettings = function (paramObj) {
        	console.log("smbService : save smb server settings "+paramObj);
            return getDataService.makeRESTDataCall('PUT', 'manage/smbserver', paramObj).then(function (response) {
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

        
        this.getSmbServerSettings = function(tenantId) {
        	console.log("smbService : get smb server settings.");
        	tenantId = '1';
            var callingRoute = "manage/"+tenantId+"/smbserver";
        	return getDataService.customGet(callingRoute).then(function(response) {
        		console.log("Response = "+response);
                if (response) {
                	return response;
                    /*return {
                        'status': true,
                        'response': response
                    };*/
                } else {
                    return {
                        'status': false,
                        'response': response
                    };

                }
        	}, function(error) {
        		throw (error);
        	});
        };
       
    }
    angular.module('shieldxApp').service('smbService', smbService);

})();