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
    function readDataService(
            getDataService,
            $sessionStorage,
            $q
            ) {
        "ngInject";
        this.config = null;
        getVChassisSessionData = function () {
            var vChassisList = [];

            if (typeof $sessionStorage.infrastructureObj !== "undefined") {

                _.each($sessionStorage.infrastructureObj, function (infraObj) {

                    if (typeof infraObj.chassis !== "undefined") {

                        _.each(infraObj.chassis, function (vChassis) {

                            vChassisList.push(vChassis);
                        });
                    }
                });
            }
            return vChassisList;
        };


        getSessionData = function (routeName, isRoot, infraId) {

            var currentInfraObj;

            if (isRoot === true) {
                currentInfraObj = $sessionStorage.infrastructureObj;
            } else {
                currentInfraObj = (infraId === "undefined") ?
                        $sessionStorage.infrastructureObj :
                        _.find($sessionStorage.infrastructureObj, {"id": infraId});
            }

            if (typeof currentInfraObj === "undefined") {
                return currentInfraObj;
            }

            if (isRoot === true) {
                return currentInfraObj;
            } else {
                return currentInfraObj[routeName];
            }
        };

        getServerData = function (routeName, route, isRoot, infraId) {
            if(typeof infraId === 'string'){
                infraId = parseInt(infraId);
            } 
            return getDataService.makeRESTDataCall('GET', route).then(function (data) {
            if(typeof readDataService.config === 'object') {   
                if(readDataService.config.hasOwnProperty('nocache')) {
                    if(readDataService.config.nocache) {
                        return data;
                    }
                }
            } 
            if (isRoot === true) {
                    $sessionStorage.infrastructureObj = data;
                } else {
                    if(routeName === "malwarepolicy"){
                         $sessionStorage[routeName] = data;
                            
                    }else{
                         var currentInfraObj = (infraId === "undefined") ?
                            $sessionStorage.infrastructureObj :
                            _.find($sessionStorage.infrastructureObj, {"id": parseInt(infraId)});    
                        currentInfraObj[routeName] = data; 
                    }
                         
                }

                return data;
            });
        };

        this.readData = function (routeName, infraId, objectId, conf) {
            return readDataObj(routeName, infraId, objectId, conf);
        };

        readDataObj = function (routeName, infraId, objectId, conf) {
            readDataService.config = conf;
            if (routeName === "chassislist") {
                return readVChassisData();
            }

            var isRoot = (routeName === "infras") ? true : false;

            var route = getApiRoute("GET", routeName, infraId, objectId);

            if(typeof conf === 'object') {
                if(conf.hasOwnProperty('nocache')) {
                    if(conf.nocache) {
                        return getServerData(routeName, route, isRoot, infraId);
                    }
                } 
            }

            var returnData = getSessionData(routeName, isRoot, infraId);

            if (typeof returnData === "undefined") {
                return getServerData(routeName, route, isRoot, infraId);
            } else {
                return returnCurrentObj(returnData);
            }
        };

        getVChassisServerData = function () {
            return getDataService.makeRESTDataCall('GET', "chassislist").then(function (chassisList) {
                    if (typeof $sessionStorage.infrastructureObj !== "undefined") {
                        _.each($sessionStorage.infrastructureObj, function (infraObj, index) {
                            readDataObj("deployspec", infraObj.id).then(function (deploySpecs) {
                                infraObj.chassis = [];

                            _.each(chassisList, function (chassis) {
                                var chassisSet = false;
                                _.each(deploySpecs, function (deploySpec) {
                                    if (!chassisSet && deploySpec.id === chassis.datapathDeploySpecId) {
                                        infraObj.chassis.push(chassis);
                                        chassisSet = true;
                                    }
                                });
                            });

                            });
                        });
                        return chassisList;
                    } else {
                        this.readData("infras").then(getVChassisServerData());
                    }
            });
        };



        readVChassisData = function () {
            var vChassisList = getVChassisSessionData();

            if (vChassisList.length === 0) {
                return getVChassisServerData();
            }
            return returnCurrentObj(vChassisList);

        };


        /*
         * Stimulate a promise when data returned from sessionStorage
         */
        returnCurrentObj = function (currentInfraObj) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            deferred.resolve(currentInfraObj);
            return promise;
        };

        /*
         * Stimulate a promise when data returned from sessionStorage
         */
        this.readDataFromSession = function (routeName, isRoot, infraId) {
            return getSessionData(routeName, isRoot, infraId);
        };


    }
    angular.module('shieldxApp').service('readDataService', readDataService);
})();