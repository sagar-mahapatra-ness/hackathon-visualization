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
    function licenseService(getDataService) {
        "ngInject";

        // Make a POST call to activate given license
        this.callActivateLicense = function (paramObj) {
            return getDataService.makeRESTDataCall('POST', 'manage/license/activate', paramObj).then(function (response) {
                console.log("Activate License Called for id: " + paramObj);
                return response;
            });
        };

        // GET call to retrieve License from UUID
        this.callGetLicense = function (paramObj) {
            return getDataService.customGet('manage/license/' + paramObj).then(function (data) {
                console.log("Get License Called for id: " + paramObj);
                return data;
            });
        };
    }

    angular.module('shieldxApp').service('licenseService', licenseService);
})();
