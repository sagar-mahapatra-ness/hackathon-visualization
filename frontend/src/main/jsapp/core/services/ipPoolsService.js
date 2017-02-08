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
    function ipPoolServices(getDataService, $sessionStorage, $q, readDataService, createDataService, deleteDataService, updateDataService) {

        "ngInject";
        this.cloudData = {};
        this.getInfrastructureData = function () {
            this.cloudData.cloudId = "1";
            if (typeof $sessionStorage.cloudData == 'undefined') {
                $sessionStorage.cloudData = {};
                $sessionStorage.cloudData.cloudId = "1";
                this.cloudData.cloudId = "1";
            } else {
                this.cloudData.cloudId = $sessionStorage.cloudData.cloudId;
                if (!$sessionStorage.cloudData.cloudId) {
                    $sessionStorage.cloudData.cloudId = "1";
                }
                //console.dir($sessionStorage.cloudData);
            }

            if (typeof this.cloudData.ipPool == 'undefined' && typeof $sessionStorage.cloudData.ipPool != 'undefined') {
                this.cloudData.ipPool = new IPPoolData();
                this.cloudData.ipPool.copy($sessionStorage.cloudData.ipPool);
            }
            if (typeof $sessionStorage.cloudData.ipPool == 'undefined') {
                this.cloudData.ipPool = new IPPoolData();
                $sessionStorage.cloudData.ipPool = {};

            }

            return this.cloudData;
        };


        this.getSessionData = function () {
            console.log(" $sessionStorage.cloudData " + $sessionStorage.cloudData);

            if (typeof $sessionStorage.cloudData == 'undefined') {
                $sessionStorage.cloudData = {};
            }
            if (!$sessionStorage.cloudData.infrastructure) {
                $sessionStorage.cloudData.infrastructure = {};
                $sessionStorage.cloudData.infrastructure.name = "";
                $sessionStorage.cloudData.infrastructure.ip = "";
            }
            return $sessionStorage.cloudData;
        };
        this.getIPPoolData = function () {
            return this.getInfrastructureData().ipPool;
        };

        this.getNetworkListByCloudId = function (cloudId) {
            return readDataService.readData("networks", cloudId).then(function (data) {
//          return getDataService.makeGetCall('infras', cloudId, 'networks').then(function (data) {
                return data;
            }, function (error) {
                console.log(error);
                return [];
            });
        };

        this.getWorkloadsByCloudId = function (cloudId) {
            return getDataService.customGet("infras/" + cloudId + "/workloads").then(function (data) {
                return data;
            }, function (error) {
                console.log(error);
                return [];
            });
        };


        this.getNetworksFromCache = function (callBack) {

            var cloudData = this.getInfrastructureData();
            //console.log(" cloud id "+cloudData.cloudId);
            //console.dir(cloudData.ipPool);
            if (typeof cloudData.ipPool.networks == 'undefined' || cloudData.ipPool.networks.length === 0) {
                console.log(" getNetworksFromCache get Data from server");
                this.getNetworkListByCloudId(cloudData.cloudId).then(function (data) {
                    console.log(" network data");
                    cloudData.ipPool.networks = data;
                    callBack.success(cloudData.ipPool.networks);
                    // console.dir(networkData);
                    return data;
                });
            } else
            {
                callBack.success(cloudData.ipPool.networks);
            }

            return cloudData.ipPool.networks;
        };


        this.getIpPoolListByCloudId = function (cloudId) {
            return readDataService.readData("ippool", cloudId);
//             return getDataService.makeGetCallWithoutRootResource(cloudId, "ippool");
        };

        /*
         Delete a ipPool console.dir
         @param poolId ipPool id
         
         /shieldxapi/ippool/{poolId}
         */
        this.deleteIPPool = function (ipPoolId) {
            console.info(" deleteIPPool ");
            return deleteDataService.deleteData("ippool", ipPoolId);
        };

        this.getExistingIPPoolListFromCache = function (forceUpdate, callBack) {

            var cloudData = this.getInfrastructureData();
            console.info(" getExistingIPPoolList called  ");
            var retPromise = null;
            //console.dir(cloudData);
            if (forceUpdate || (cloudData.cloudId && !cloudData.ipPool.existingipPool)) {
                retPromise = this.getIpPoolListByCloudId(cloudData.cloudId, "ippool").then(function (data) {
                    console.info(" data recived from server for ip list");
                    // console.dir(data.plain());
                    if (data) {
                        cloudData.ipPool.existingipPool = data;
                        // console.dir(cloudData.ipPool.existingipPool); 
                        if (callBack) {
                            callBack.success(cloudData.ipPool.existingipPool);
                        }
                    }
                });


            } else if (cloudData.ipPool.existingipPool) {
                if (callBack) {
                    callBack.success(cloudData.ipPool.existingipPool);
                }
            }
            return retPromise;
        };



        this.getIpPollInfoFromID = function (cloudid, ipPoolID) {
            console.log(" getIpPollInfoFromID cloudid ");
            return this.getIpPoolListByCloudId(cloudid).then(function (result) {
                var ipPoolList = result;
                var i;
                var tempRef;
                for (i in ipPoolList) {
                    tempRef = ipPoolList[i];
                    if (tempRef.id == ipPoolID) {
                        console.log(" getIpPollInfoFromID cloudid " + tempRef);
                        // console.dir(tempRef);
                        return tempRef;
                    }
                }
                return null;
            });
        };
        this.updateIPPool = function (cloudId, id, discription, gateway, name, prefix, ranges) {
            var data = {
                "cloudid": parseInt(cloudId),
                "descr": discription,
                "gateway": gateway,
                "id": parseInt(id),
                "name": name,
                "prefix": parseInt(prefix),
                "ranges": ranges
            };

            return updateDataService.updateData("ippool", data, cloudId);
        };
        this.createNewIPPool = function (cloudId, discription, gateway, name, prefix, ranges) {
            var data = {
                "cloudid": parseInt(cloudId),
                "descr": discription,
                "gateway": gateway,
                "id": 0,
                "name": name,
                "prefix": parseInt(prefix),
                "ranges": ranges
            };
            console.info(" createNewIPPool called");
            //console.dir(data); 
            return createDataService.createData("ippool", data, cloudId).then(function (dataVal) {
                return dataVal;
            });
        };


        this.getExistingIPPoolNameFromID = function (id) {
            var cloudData = this.getInfrastructureData();
            var ipPoolName = "";
            var ip = null;
            var tempRef = null;
            //console.dir(cloudData);   
            var data = cloudData.ipPool.existingipPool;
            for (ip in data) {
                tempRef = data[ip];
                if (tempRef.id == id) {
                    ipPoolName = tempRef.name;
                    break;
                }
            }

            // console.log(" getIPPoolNameFromIDFromCache  ipPoolName "+ipPoolName);
            return ipPoolName;
        };



        this.checkManageMentIPPoolDataPopulated = function () {
            var ipPoolData = this.getIPPoolData().getManagmentIPData();
            return ipPoolData.isPopulated();
        };

        this.checkBackPlaneIPPoolDataPopulated = function () {
            var ipPoolData = this.getIPPoolData().getBackPaneIPData();
            return ipPoolData.isPopulated();
        };

        this.createManagmentNewIPPool = function(ipPoolManagmentData){
                var returnValue = {result: true, promise: null}; 
                var startRange = ipPoolManagmentData.newIPData.startRange;
                var endRange = ipPoolManagmentData.newIPData.endRange;
                var mask = ipPoolManagmentData.newIPData.mask;
                var cloudId = this.getSessionData().cloudId;
                var discription = ipPoolManagmentData.newIPData.discription;
                var gateway = ipPoolManagmentData.newIPData.gateway;
                var id = 0;
                var name = ipPoolManagmentData.newIPData.name;
                var prefix = ipPoolManagmentData.newIPData.mask;
                var ranges = "";
                var rangesValues = ipPoolManagmentData.newIPData.ranges;
                if (rangesValues !== null) {
                    for (var i = 0; i < rangesValues.length; i++) {
                        var rangesValuesTemp = rangesValues[i];
                        if (rangesValuesTemp.rangeCIDREnableState) {
                            if (ranges !== "") {
                                ranges = ranges + "," + rangesValuesTemp.cidrValue;
                            } else {
                                ranges = ranges + rangesValuesTemp.cidrValue;
                            }

                        } else {
                            if (ranges !== "") {
                                ranges = ranges + "," + rangesValuesTemp.rangeStartValue + "-" + rangesValuesTemp.rangeEndtValue;
                            } else {
                                ranges = ranges + rangesValuesTemp.rangeStartValue + "-" + rangesValuesTemp.rangeEndtValue;
                            }
                        }
                    }
                }
                var that = this;
                returnValue.result = false; 
                returnValue.promise = this.getIpPoolListByCloudId(cloudId).then(function(ippools){
                    var ipExit = _.find(ippools,function(item){
                        return item.name === name; 
                    });
                   
                   if(!ipExit) {
                        
                       return that.createPanelIP(cloudId, discription, gateway, id, name, prefix, ranges).then(function (newIPPoll) {
                                console.log(" createPanelIP success ");
                                var serverdata = that.getIPPoolData().getServerData();
                                serverdata.mgmtIpPoolId = newIPPoll.id;
                                serverdata.managmentIPPoolHeaderValue = newIPPoll.name;
                                serverdata.mgmtIsDhcp = false;
                                $sessionStorage.cloudData.ipPool = that.getIPPoolData();
                                console.dir($sessionStorage.cloudData.ipPool);
                                return newIPPoll;
                        },function(error){
                         return $q.reject(error);
                      });
                    
                  } else {
                    var serverdata = that.getIPPoolData().getServerData();
                    serverdata.mgmtIpPoolId = ipExit.id;
                    serverdata.managmentIPPoolHeaderValue = ipExit.name;
                    serverdata.mgmtIsDhcp = false;
                    $sessionStorage.cloudData.ipPool = that.getIPPoolData();
                   
                  }
                },function(error){
                     return $q.reject(error);
                });

                return returnValue;
        };

        this.commitManagmentIPPoolData = function (callBack) {
            var ipPoolManagmentData = this.getIPPoolData().getManagmentIPData();
             var serverdata = this.getIPPoolData().getServerData();
            var returnValue = {result: true, promise: null};

            if (ipPoolManagmentData.typeOfIPSelected == "new") {
              returnValue = this.createManagmentNewIPPool(ipPoolManagmentData);
            } else if (ipPoolManagmentData.typeOfIPSelected == "existing") {
                serverdata.mgmtIpPoolId = parseInt(ipPoolManagmentData.existingIP);
                serverdata.managmentIPPoolHeaderValue = this.getExistingIPPoolNameFromID(serverdata.mgmtIpPoolId);
                serverdata.mgmtIsDhcp = false;
            } else if (ipPoolManagmentData.typeOfIPSelected == "dhcp")
            {
                serverdata.mgmtIsDhcp = true;
                serverdata.managmentIPPoolHeaderValue = "DHCP";
            }
            serverdata.mgmtNetworkId = ipPoolManagmentData.networkSelected.id;
            serverdata.managmentNetworkHeaderValue = ipPoolManagmentData.networkSelected.name;
            $sessionStorage.cloudData.ipPool = this.getIPPoolData();
            return returnValue;
        };

         this.createPanelIP = function(cloudId, discription, gateway, id, name, prefix, ranges){
            var data = {
                "cloudid": parseInt(cloudId),
                "descr": "discription",
                "gateway": gateway,
                "id": 0,
                "name": name,
                "prefix": parseInt(prefix),
                "ranges": ranges
            };

            var that = this;

            return createDataService.createData("ippool", data, cloudId).then(function (dataVal) {
                  return that.getIpPollInfoFromID(cloudId, dataVal).then(
                        function (newIPPoll) {
                           console.log(" newIPPoll info");
                           console.dir(newIPPoll); 
                           return newIPPoll;
                        }, function (error) {
                            return error;
                });
            }, function (error) {
                console.log(" createManagmentNewIPPool  failed >>> ");
                console.dir(error);
                return $q.reject(error);
            });
       }; 


        this.createBacklPlaneNewIPPool = function(ipPoolBackPaneData){
                var returnValue = {result: true, promise: null}; 
                var startRangeBackpane = ipPoolBackPaneData.newIPData.startRange;
                var endRangeBackpane = ipPoolBackPaneData.newIPData.endRange;
                var maskBackpane = ipPoolBackPaneData.newIPData.mask;


                var cloudeIdBackpane = this.getSessionData().cloudId;
                var discriptionBackpane = ipPoolBackPaneData.newIPData.discription;
                var gatewayBackpane = ipPoolBackPaneData.newIPData.gateway;
                var idBackpane = "0";
                var nameBackpane = ipPoolBackPaneData.newIPData.name;
                var prefixBackpane = ipPoolBackPaneData.newIPData.mask;
                var rangesBackpane = "";
                var rangesBackpaneValues = ipPoolBackPaneData.newIPData.ranges;
                if (rangesBackpaneValues !== null) {
                    for (var i = 0; i < rangesBackpaneValues.length; i++) {
                        var rangesValuesTemp = rangesBackpaneValues[i];
                        if (rangesValuesTemp.rangeCIDREnableState) {
                            if (rangesBackpane !== "") {
                                rangesBackpane = rangesBackpane + "," + rangesValuesTemp.cidrValue;
                            } else {
                                rangesBackpane = rangesBackpane + rangesValuesTemp.cidrValue;
                            }

                        } else {
                            if (rangesBackpane !== "") {
                                rangesBackpane = rangesBackpane + "," + rangesValuesTemp.rangeStartValue + "-" + rangesValuesTemp.rangeEndtValue;
                            } else {
                                rangesBackpane = rangesBackpane + rangesValuesTemp.rangeStartValue + "-" + rangesValuesTemp.rangeEndtValue;
                            }
                        }
                    }
                }
                 var that = this;
                returnValue.result = false; 
                returnValue.promise = this.getIpPoolListByCloudId(cloudeIdBackpane).then(function(ippools){
                    var ipExit = _.find(ippools,function(item){
                        return item.name === nameBackpane; 
                    });
                   
                   if(!ipExit) {
                        
                       return that.createPanelIP(cloudeIdBackpane, discriptionBackpane, gatewayBackpane, idBackpane, nameBackpane, prefixBackpane, rangesBackpane).then(function (newIPPoll) {
                                console.log(" createPanelIP success ");
                                var serverdata = that.getIPPoolData().getServerData();
                                serverdata.backPlaneIpPoolId = parseInt(newIPPoll.id);
                                serverdata.backpaneIPPoolHeaderValue = newIPPoll.name;
                                $sessionStorage.cloudData.ipPool = that.getIPPoolData();
                                return newIPPoll;
                        },function(error){
                         return $q.reject(error);
                      });
                    
                  } else {
                    var serverdata = that.getIPPoolData().getServerData();
                     serverdata.backPlaneIpPoolId = parseInt(ipExit.id);
                     serverdata.backpaneIPPoolHeaderValue = ipExit.name;
                     $sessionStorage.cloudData.ipPool = that.getIPPoolData();
                   
                  }
                },function(error){
                     return $q.reject(error);
                });

              return  returnValue; 
        };

        this.commitBacklPlaneIpPoolData = function () {

            var serverdata = this.getIPPoolData().getServerData();
            var ipPoolBackPaneData = this.getIPPoolData().getBackPaneIPData();
            // console.log(" ipPoolManagmentData "+ipPoolBackPaneData.typeOfIPSelected);
            var returnValue = {result: true, promise: null};
            if (ipPoolBackPaneData.typeOfIPSelected == "new") {
                returnValue = this.createBacklPlaneNewIPPool(ipPoolBackPaneData); 
            } else if (ipPoolBackPaneData.typeOfIPSelected == "existing") {
                serverdata.backPlaneIpPoolId = ipPoolBackPaneData.existingIP;
                serverdata.backpaneIPPoolHeaderValue = this.getExistingIPPoolNameFromID(serverdata.backPlaneIpPoolId);
                serverdata.backPlaneIsDhcp = false;
            } else if (ipPoolBackPaneData.typeOfIPSelected == "dhcp") {
                serverdata.backPlaneIsDhcp = true;
                serverdata.backpaneIPPoolHeaderValue = "DHCP";
            }


            serverdata.backPlaneNetworkId = ipPoolBackPaneData.networkSelected.id;
            serverdata.backpaneNetworkHeaderValue = ipPoolBackPaneData.networkSelected.name;

            $sessionStorage.cloudData.ipPool = this.getIPPoolData();
            console.log(" should go to next page ");
            //console.dir(ipPoolBackPaneData.networkSelected);
            // console.dir($sessionStorage.cloudData.ipPool.serverData); 
            return returnValue;
        };
    }
    angular.module('shieldxApp').service('ipPoolServices', ipPoolServices);
})();