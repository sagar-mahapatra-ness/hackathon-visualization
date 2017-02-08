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
    function updateDataService(
            getDataService,
            $sessionStorage,
            $q
            ) {
        "ngInject";


        this.updateSessionData = function (routeName, data, infraid) {
            console.log("updateSessionData ");
            var infras = $sessionStorage.infrastructureObj;
            console.dir(infras);
            var infarIndex = -1;
            if (routeName === "infras") {
                console.log("updateSessionData after  delete " + infarIndex);
                console.dir(infras);
                infarIndex = this.getInfraIndexFromId(data.id);
                if (infarIndex != -1) {
                    infras.splice(infarIndex, 1);
                    infras.push(data);
                }
                console.log("updateSessionData after infra delete " + infarIndex);
                console.dir(infras);
            } else {
                if (infraid) {
                    infarIndex = this.getInfraIndexFromId(infraid);
                    if (infarIndex != -1) {
                        var infraRef = infras[infarIndex];
                        this.updateResourceInSession(routeName, data, infraRef);
                    }
                } else
                {
                    for (var i = 0; i < infras.length; i++) {
                        this.updateResourceInSession(routeName, data, infras[i]);
                    }
                }
            }

        };

        this.updateResourceInSession = function (routeName, data, infraRef) {
            var resourceRef = infraRef[routeName];
            console.log(" before updateResourceInSession" + infraRef.name);
            console.dir(resourceRef);
            if (resourceRef && resourceRef.length > 0) {
                var deleteIndex = -1;
                if(data)
                deleteIndex = _.findIndex(resourceRef, function (resource) {
                    return resource.id === data.id;
                });
                console.log(" resource to be deleted " + deleteIndex);
                console.dir(resourceRef);
                if (deleteIndex !== -1) {
                    resourceRef.splice(deleteIndex, 1);
                    resourceRef.push(data);
                }
                console.log(" after updateResourceInSession ");
                console.dir(resourceRef);
            }



        };


        this.getInfraIndexFromId = function (infraid) {
            var infras = $sessionStorage.infrastructureObj;
            return  _.findIndex(infras, function (infra) {
                return infra.id === infraid;
            });
        };

        this.updateData = function (routeName, data, infraid) {
            console.log(" updateData  >> ");
            var path = getApiRoute("PUT", routeName);
            var that = this;
            var returnVal = getDataService.makeRESTDataCall('PUT', path, data).then(function (result) {
                if(typeof result === 'object' )
                    that.updateSessionData(routeName, result, infraid);
                else
                    that.updateSessionData(routeName, data, infraid);
                return result;
            }, function (error) {
                return $q.reject(error);
            });

            return returnVal;
        };
    }
    angular.module('shieldxApp').service('updateDataService', updateDataService);
})();