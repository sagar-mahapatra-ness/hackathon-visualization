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
    function deleteDataService(
            getDataService,
            $sessionStorage,
            $q
            ) {
        "ngInject";


        this.updateSessionData = function (routeName, id, infraid) {
            console.log("updateSessionData " + id);
            var infras = $sessionStorage.infrastructureObj;
            console.dir(infras);
            var infarIndex = -1;
            if (routeName === "infras") {
                console.log("updateSessionData after  delete " + infarIndex);
                console.dir(infras);
                infarIndex = this.getInfraIndexFromId(id);
                if (infarIndex != -1) {
                    infras.splice(infarIndex, 1);
                }
                console.log("updateSessionData after infra delete " + infarIndex);
                console.dir(infras);
            } else {
                if (infraid) {
                    infarIndex = this.getInfraIndexFromId(infraid);
                    if (infarIndex != -1) {
                        var infraRef = infras[infarIndex];
                        this.deleteResourceFromSession(routeName, id, infraRef);
                    }
                } else
                {
                    for (var i = 0; i < infras.length; i++) {
                        this.deleteResourceFromSession(routeName, id, infras[i]);
                    }
                }
            }

        };

        this.deleteResourceFromSession = function (routeName, id, infraRef) {
            var resourceRef = infraRef[routeName];
            console.log(" before deleteResourceFromSession  " + infraRef.name);
            console.dir(resourceRef);
            if (resourceRef && resourceRef.length > 0) {
                var deleteIndex = -1;
                deleteIndex = _.findIndex(resourceRef, function (resource) {
                    console.log("resource.id " + resource.id);
                    return resource.id === id;
                });
                console.log(" resource to be deleted " + deleteIndex);
                console.dir(resourceRef);
                if (deleteIndex !== -1) {
                    resourceRef.splice(deleteIndex, 1);
                }
                console.log(" after deleteResourceFromSession ");
                console.dir(resourceRef);
            }



        };


        this.getInfraIndexFromId = function (infraid) {
            var infras = $sessionStorage.infrastructureObj;
            return  _.findIndex(infras, function (infra) {
                return infra.id === infraid;
            });
        };

        this.deleteData = function (routeName, id, infraid) {
            console.log(" deleteData >> ");
            var path = getApiRoute("DELETE", routeName);
            var that = this;
            var returnVal = getDataService.makeRESTDataCall('DELETE', path, id).then(function (data) {
                that.updateSessionData(routeName, id, infraid);
                return data;
            }, function (error) {
                return $q.reject(error);
            });

            return returnVal;
        };
    }
    angular.module('shieldxApp').service('deleteDataService', deleteDataService);
})();