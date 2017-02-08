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
    function createDataService(
            getDataService,
            $sessionStorage,
            $q
            ) {
        "ngInject";

        //$sessionStorage.infrastructureObj = [];

        this.updateSessionData = function (routeName, data, infraid) {
            var infras = $sessionStorage.infrastructureObj;
            console.log("updateSessionData ");
            console.dir(data);
            var infarIndex = -1;
            if (routeName === "infras") {
                if (!infras) {
                    infras = [];
                }
                infras.push(data);
                console.log("cache updated  ");
                console.dir(infras);
            } else {
                if (infraid) {
                    infarIndex = this.getInfraIndexFromId(infraid);
                    if (infarIndex != -1) {
                        var infraRef = infras[infarIndex];
                        this.addResourceToSession(routeName, data, infraRef);
                    }
                }
            }

        };

        this.addResourceToSession = function (routeName, data, infraRef) {
            var resourceRef = infraRef[routeName];
            if (!resourceRef) {
                resourceRef = [];
                infraRef[routeName] = resourceRef;
            }
            resourceRef.push(data);
        };


        this.getInfraIndexFromId = function (infraid) {
            var infras = $sessionStorage.infrastructureObj;
            return  _.findIndex(infras, function (infra) {
                return infra.id === infraid;
            });
        };

        this.createData = function (routeName, data, infraid) {
            console.log("createData    ");
            console.dir(data);
            var path = getApiRoute("POST", routeName);

            var that = this;
            var returnVal = getDataService.makeRESTDataCall('POST', path, data).then(function (result) {

                //data.id = (routeName === "chassis") ? result.id : result;
                if(routeName === "chassis"){
                    data.id = result.id;
                    data.subscriptionList = result.subscriptionList;
                } else {
                    data.id = result;
                }
                var dataCloneRef = angular.copy(data);
                console.log("dataCloneRef  ");
                console.dir(dataCloneRef);
                that.updateSessionData(routeName, dataCloneRef, infraid);
                return result;
            }, function (error) {
                return $q.reject(error);
            });

            return returnVal;
        };
    }
    angular.module('shieldxApp').service('createDataService', createDataService);
})();