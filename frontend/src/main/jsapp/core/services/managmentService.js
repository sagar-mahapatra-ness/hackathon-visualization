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
    function managementService(
            $q,
            getDataService
            ) {
        "ngInject";



        this.callUpgradeSoftware = function () {
            return getDataService.makeRESTDataCall('GET', 'manage/upgrade').then(function (response) {
                return response;
            });
        };

        this.listDeployedSoftwarePackage = function () {
            return getDataService.makeRESTDataCall('GET', 'manage/software/deployed').then(function (response) {
                return response;
            });
        };

        this.checkForSoftwareUpdates = function () {
            return getDataService.makeRESTDataCall('GET', 'manage/software/latest').then(function (response) {
                return response;
            });
        };

        this.upgradeSoftwarePatch = function (hfbuild) {
            console.log("Upgrade to hot fix build "+hfbuild);
            return getDataService.makeRESTDataCall('GET', 'manage/software/update/'+hfbuild+'/').then(function (response) {
                return response;
            });
        };

        this.upgradeSoftware = function () {
            console.log("Upgrade Software to latest");
            return getDataService.makeRESTDataCall('GET', 'manage/software/update').then(function (response) {
                return response;
            });
        };

        this.callUpgradeContent = function () {
            return getDataService.makeRESTDataCall('GET', 'manage/updatecontent').then(function (response) {
                return response;
            });
        };

        this.callUploadLogs = function () {
            return getDataService.makeRESTDataCall('GET', 'manage/upload').then(function (response) {
                return response;
            });
        };

        this.callDownloadEventLogs = function () {
            return getDataService.makeRESTDataCall('GET', 'manage/downloadcsv').then(function (response) {
                return response;
            });
        };

        this.getFireEyeIntegrationDetails = function () {
            return getDataService.customGet('manage/fireeyeconfig').then(function (response) {
                return response;
            });
        };

        this.updateFireEyeIntegrationDetails = function (paramObj) {
            return getDataService.makeRESTDataCall('PUT', 'manage/fireeyeconfig', paramObj);
        };

        this.updateControlPlaneSetting = function (paramObj) {
            return getDataService.makeRESTDataCall('PUT', 'manage/controlplaneconfig', paramObj);
        };


        this.uploadFile = function(tenantId, file) {            
            console.log(" managementService : Upload File for tenantId "+tenantId);
            var callingRoute = "/manage/"+tenantId+"/urlfiltering";            
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


        this.exportUrlFilteringData = function(tenantId) {
            console.log("managementservice : Export Url filtering content data.");

            var callingRoute = "/manage/"+tenantId+"/exporturlcontent";

            return getDataService.downloadFile(callingRoute).then(function(response) {
                console.log("download file Response = "+response);
                if (response) {
                    console.log(" managementservice : exportUrlFilteringData : response = "+response);
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



//        this.getControlPlaneSetting = function () {
//            return getDataService.makeRESTDataCall('GET', 'manage/controlplaneconfig').then(function (response) {
//                return response;
//            });
//        };

    }
    angular.module('shieldxApp').service('managementService', managementService);
})();
