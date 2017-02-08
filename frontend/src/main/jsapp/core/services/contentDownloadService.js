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

    function contentDownloadService(getDataService, Restangular, $q, readDataService,createDataService, deleteDataService, updateDataService) {
        "ngInject";

        this.autodownloadcontent = function (paramObj) {
        	console.log("contentDownloadService : autodownloadcontent() : scheduler configuration for auto download of content = "+paramObj);
        	console.log("day of the week ---->> "+paramObj.dayOfTheWeek);
            return getDataService.makeRESTDataCall('POST', 'manage/schedule/downloadcontent', paramObj).then(function (response) {
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
        
        this.getContentDownloadSchedulerDetails = function(tenantId, type) {
        	console.log("contentDownloadService : get content download scheduler config.");
            var callingRoute = "/manage/"+tenantId+"/contentscheduler";
        	return getDataService.customGet(callingRoute).then(function(response) {
        		console.log("Response = "+response);
                if (response) {
                	return response;
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
    angular.module('shieldxApp').service('contentDownloadService', contentDownloadService);

})();