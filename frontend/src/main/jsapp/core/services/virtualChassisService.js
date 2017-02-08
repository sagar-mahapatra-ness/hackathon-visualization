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
    function virtualChassisService(getDataService, coreservices, Restangular, $sessionStorage, $q, createDataService, readDataService, deleteDataService, updateDataService) {
        "ngInject";
        this.createResourceGroup = function (paramObj) {
            //POST /shieldxapi/infras/resourcegroup
            return createDataService.createData("resourcegroup", paramObj, paramObj.cloudId).then(function (data) {
                //return getDataService.makeRESTDataCall('POST', 'infras/resourcegroup',  paramObj).then(function(data) {
                return data;
            });
        };

        this.updateResourceGroup = function (paramObj) {
            //POST /shieldxapi/infras/resourcegroup
            return updateDataService.updateData('resourcegroup', paramObj, paramObj.cloudId);
            //return getDataService.makeRESTDataCall('PUT', 'infras/resourcegroup',  paramObj).then(function(data) {
            //return data;
            //});
        };
        this.createSubscription = function (paramObj) {
            //POST /shieldxapi/clouds/subscription
            /*return getDataService.makeRESTDataCall('POST', 'deployspec', paramObj).then(function(data) {
             return data;
             });*/
        };
        this.createVirtualChassis = function (paramObj) {
            //POST POST /shieldxapi/chassis
            return createDataService.createData("chassis", paramObj, paramObj.cloudId).then(function (data) {
                //return getDataService.makeRESTDataCall('POST', 'chassis', paramObj).then(function(data) {
                return data;
            });
        };
//        this.updateVirtualChassis = function(paramObj){
//            //getDataService.makeRESTDataCall('PUT', paramObj)
//        };
        this.getListOfVirtualChassis = function () {
            return readDataService.readData("chassislist").then(function (data) {
//            return getDataService.makeRESTDataCall('GET', 'chassislist').then(function(data) {
                return data;
            });
        };

        this.getListOfResourceGroups = function (cloudId) {
            return readDataService.readData("resourcegroup", cloudId).then(function (data) {
//            return getDataService.makeGetCall('infras', cloudId, 'resourcegroup').then(function (data) {
                return data;
            }, function (error) {
                console.log(error);
            });
        };

        this.deployVirtualChassis = function (vChassisId) {
            return getDataService.makeRESTDataCall('GET', 'chassis', vChassisId, 'check').then(function (data) {
                console.log("VirtualChassis with id %i checked successfully...", vChassisId);
                //console.log(data);
                return {'status': true};
            }, function (error) {
                console.log(error);
                return {'status': false, 'errorMessage': error.data.message};
            });
        };

        this.reDeployVirtualChassis = function (vChassisId) {
            return getDataService.makeRESTDataCall('GET', 'chassis', vChassisId, 'redeploy').then(function (data) {
                console.log("VirtualChassis with id %i redeployed successfully...", vChassisId);
                //console.log(data);
                return {'status': true};
            }, function (error) {
                console.log(error);
                return {'status': false, 'errorMessage': error.data.message};
            });
        };

        this.deleteResourceGroup = function (rGroupId, cloudId) {
            console.log("DELETE /shieldxapi/infras/resourcegroup/" + rGroupId);
            return deleteDataService.deleteData('resourcegroup', rGroupId, cloudId).then(function (data) {
//            return deleteDataService.deleteData("chassis", rGroupId, paramObj.cloudId).then(function(data){
//            return getDataService.makeRESTDataCall('DELETE', 'infras/resourcegroup', rGroupId).then(function(data){
                console.log("ResourceGroup with id %i deleted successfully...", rGroupId);
                //console.log(data);
                return {'status': true};
            }, function (error) {
                console.log(error);
                return {'status': false, 'errorMessage': error.data.message};
            });
        };

        this.deleteVirtualChassis = function (vChassisId, cloudId) {
            console.log("DELETE /shieldxapi/chassis/" + vChassisId);
            return deleteDataService.deleteData('chassis', vChassisId, cloudId).then(function (data) {
//            return getDataService.makeRESTDataCall('DELETE', 'chassis', vChassisId).then(function(data){
                console.log("VirtualChassis with id %i deleted successfully...", vChassisId);
                //console.log(data);
                return {'status': true};
            }, function (error) {
                console.log(error);
                return {'status': false, 'errorMessage': error.data.message};
            });
        };

        this.updateVirtualChassis = function (paramObj, cloudId) {
            //getDataService.makeRESTDataCall('PUT', paramObj)

            return updateDataService.updateData("chassis", paramObj, cloudId);
        };

        this.getListOfTenants = function (cloudId) {
            return getDataService.makeGetCall('infras', cloudId, 'tenants').then(function (data) {
                return data;
            }, function (error) {
                console.log(error);
            });
        };

        this.getCachedListOfTenants = function (callback) {
            if (!$sessionStorage.cloudData.vChassis.tenants) {
                return coreservices.getListOfTenants($sessionStorage.cloudData.cloudId).then(function (data) {
                    $sessionStorage.cloudData.vChassis.tenants = data;
                    callback.success(data);
                }, function (error) {
                    console.log(error);
                    callback.fail(error);
                });
            } else {
                return callback.success($sessionStorage.cloudData.vChassis.tenants);
            }
        };

        this.getALLResourceGroups = function (callback,
                cloudId,
                cachedNetworkObj,
                cachedResourceGroupObj,
                omitNetworksInResourceGroups,
                currentChasssisExistingGroups,workloads) {
            var that = this;
            if (!cachedResourceGroupObj) {
                coreservices.getResourceGroupsListByCloudId(
                        $sessionStorage.cloudData.cloudId).then(
                        function (data) {
//                            _.each(currentChasssisExistingGroups, function(existingGroup) {
//                                _.remove(data, function(network) {
//                                    return existingGroup.id === network.id;
//                                });
//                            });

                            cachedResourceGroupObj = data;
                            callback.success(
                                    that.mapNetworkToResourcegroup(
                                            cachedNetworkObj,
                                            cachedResourceGroupObj,
                                            omitNetworksInResourceGroups,
                                            currentChasssisExistingGroups,workloads
                                            )
                                    );
                        }, function (error) {
                    callback.fail(error);
                }
                );
            } else {

                callback.success(
                        that.mapNetworkToResourcegroup(
                                cachedNetworkObj,
                                cachedResourceGroupObj,
                                omitNetworksInResourceGroups,
                                currentChasssisExistingGroups,workloads
                                )
                        );
            }
        };

        this.mapNetworkToResourcegroup = function (networkObj, resourceGroupObj, omitNetworksInResourceGroups,currentChasssisExistingGroups,workloads) {
            var rg = resourceGroupObj;
            var nd = networkObj;
            console.log("mapNetworkToResourcegroup ");
            if (rg && nd) {
                //console.log(" resource group "+rg);
                //console.dir(rg);
                //console.log(" networks "+nd);
                // console.dir(nd);  
                return this.getAdditionalNetworkResourceGroupInfo(nd, rg, omitNetworksInResourceGroups,currentChasssisExistingGroups,workloads);
            }

            return {};
        };

        this.getAdditionalNetworkInfo = function (
                networks,
                backPlaneNetworkId,
                mgmtNetworkId) {
            _.forEach(networks, function (network, key) {
                networks[key].isBackplane =
                        (network.id === parseInt(backPlaneNetworkId)) ?
                        true : false;
                networks[key].isManagement =
                        (network.id === parseInt(mgmtNetworkId)) ?
                        true : false;
            });
            return networks;
        };

        this.createSubscriptionList = function (resourceGroup) {
            var sl = [];
            for (var i = 0; i < resourceGroup.length; i++) {
                var rg = resourceGroup[i];
                var subscriptionId = (rg.subscriptionId) ? rg.subscriptionId : null;
                sl.push({"id": subscriptionId, 
                    "resourceGroupId": rg.id, 
                    "spsId": rg.controlPolicy,
                    "inline": rg.inline});
            }
            return  sl;
        };
        getWorkloadByNetwork = function (workloadData, networkId) {
            /*return _.filter(workloadData.workloads, function (workload) {
                if (workload.ports.length) {
                    return (workload.ports[0].networkId == networkId);
                }
            });*/
            var mappedWorkloads = [];
            for (var i = 0; i < workloadData.workloads.length; i++) {
                var workload = workloadData.workloads[i];
                for (var j = 0; j < workload.ports.length; j++) {
                        if(workload.ports[j].networkId === networkId && ! _.find(mappedWorkloads,{"id":workload.id}))
                            mappedWorkloads.push(workload);
                }
            }
            return mappedWorkloads;
        };
        this.getAdditionalNetworkResourceGroupInfo = function (networks, resourceGroups, omitNetworksInResourceGroups,currentChasssisExistingGroups,workloadData) {
            console.log("these are the workloads",workloadData);
            console.log("networksnetworksnetworksnetworksnetworksnetworks");
            console.log(networks);
            var currentGroupList = [];
             _.forEach(currentChasssisExistingGroups,function(singleGroup){
                 currentGroupList.push(singleGroup.id);
             });

            var networksInResoureGroup = [];
            _.each(networks, function (network, networkKey) {
                network.workloads = [];
                network.workloads = getWorkloadByNetwork(workloadData, network.id);
            });
            _.forEach(networks, function (network, networkKey) {
                networks[networkKey].resourceGroupId = null;
                networks[networkKey].resourceGroupName = null;

                _.forEach(resourceGroups, function (resourceGroup) {
                    var obj = {};
                    obj.networkId = network.id;
                    _.forEach(resourceGroup.memberList, function (resourceGroupMember) {
                        if(resourceGroup.resourceType === "NETWORK"){
                            if (resourceGroupMember.networkId === network.id) {

                                networks[networkKey].resourceGroupId = (typeof resourceGroup.id !== "undefined") ?
                                        resourceGroup.id : null;
                                networks[networkKey].resourceGroupName = resourceGroup.name;
                                networksInResoureGroup.push(network);
                            }
                        } else if(resourceGroup.resourceType === "VM"){
                            var matchedWorkload = _.find(workloadData.workloads,{"id":resourceGroupMember.vmId});
                            if(matchedWorkload !== undefined){
                                var matchingNetwork = _.find(networks,{"id":matchedWorkload.ports[0].networkId});
                                if(matchingNetwork !== undefined){
                                    var innerWorkload = _.find(matchingNetwork.workloads,{"id":matchedWorkload.id});
                                    innerWorkload.resourceGroupId = (typeof resourceGroup.id !== "undefined") ?
                                        resourceGroup.id : null;
                                    innerWorkload.resourceGroupName = resourceGroup.name;
                                }
                            }
                            //console.log("the resourcegroup data is ",resourceGroup);
                        }
                    });
                });
            });
            if (omitNetworksInResourceGroups) {
                _.forEach(networks, function (instance) {
                    instance.hide = false;
                    if (instance.resourceGroupName !== null && instance.resourceGroupId !== "" && (currentGroupList.indexOf(instance.resourceGroupId) == -1) ) {
                        instance.hide = true;
                    }
                });
            }
            return networks;
        };

        this.getAllNetworksMappedToResource = function (callback, cloudId, cachedNetworkObj, cachedResourceGroupObj, omitNetworksInResourceGroups, existingGroups, vchassisId, tenantId,workloads) {
            console.log("cachedNetworkObjcachedNetworkObjcachedNetworkObjcachedNetworkObj");
            console.log(cachedNetworkObj);
            console.log("cachedNetworkObjcachedNetworkObjcachedNetworkObj");
            var that = this;
            if (typeof cachedNetworkObj === "undefined" || cachedNetworkObj.length === 0) {
                that.getVchassisNetworkMappingData(cloudId).then(function (networkChassisMapping) {
                    console.log(networkChassisMapping);
                    coreservices.getNetworkListByCloudId(cloudId).then(function (networkData) {
                        cachedNetworkObj = angular.copy(networkData);
                        cachedNetworkObj = _.filter(cachedNetworkObj, function (network) {
                           return (!network.tenantId || (network.tenantId === tenantId));
                        });
                        _.each(networkChassisMapping, function (networkChassisMappingObj) {
                            _.each(networkChassisMappingObj.networks, function (mappingNetwork) {
                                if (vchassisId !== null && networkChassisMappingObj.chassisId !== vchassisId) {
                                    var obj = _.find(cachedNetworkObj, {"id": mappingNetwork});
                                    _.pull(cachedNetworkObj, obj);
                                }
                            });
                        });
                        // callback.success(networkData);  $sessionStorage.cloudData.vChassis.resourceGroup
                        that.getALLResourceGroups(callback, cloudId, cachedNetworkObj, cachedResourceGroupObj, omitNetworksInResourceGroups, existingGroups,workloads);

                    }, function (error) {
                        console.log(error);
                        callback.fail(error);
                    });
                });
            } else {
                that.getVchassisNetworkMappingData(cloudId).then(function (networkChassisMapping) {
                    console.log(networkChassisMapping);
                    _.each(networkChassisMapping, function (networkChassisMappingObj) {
//                        var tempNetworkList = angular.copy(networkList);
                        _.each(networkChassisMappingObj.networks, function (mappingNetwork) {
//                            _.remove(tempNetworkList, function (network) {
                                if (vchassisId !== null && networkChassisMappingObj.chassisId !== vchassisId) {
                                    var obj = _.find(cachedNetworkObj, {"id" : mappingNetwork});
                                    _.pull(cachedNetworkObj, obj);
                                }
//                            });
                        });
//                       finalTempList =  _.union(finalTempList, tempNetworkList);
                    });
                    that.getALLResourceGroups(
                            callback,
                            cloudId,
                            cachedNetworkObj,
                            cachedResourceGroupObj,
                        omitNetworksInResourceGroups, existingGroups,workloads);
                });
            }
        };

        this.getVchassisNetworkMappingData = function (infraId) {

            console.log("getVchassisNetworkMappingData called");

            var resourceGroupChassisMapping = [];
            var networkResourceGroupMapping = [];
            var networkVchassisMapping = [];
            var deferred = $q.defer();
            var promise = deferred.promise;

            console.log("1");
            return $q.all([
                _.each($sessionStorage.infrastructureObj, function (infra) {
                    if (infra.id === infraId) {
                        _.each(infra.chassis, function (chassis) {
                            var rgrp = {};
                            rgrp.chassisId = chassis.id;
                            rgrp.resourceGroupIds = [];
                            _.each(chassis.subscriptionList, function (resourceGroup) {
                                rgrp.resourceGroupIds.push(resourceGroup.id);
                            });
                            resourceGroupChassisMapping.push(rgrp);
                        });
                    }
                }),
                _.each($sessionStorage.infrastructureObj, function (infra) {
                    if (infra.id === infraId) {
                        _.each(infra.resourcegroup, function (resourceGroup) {
                            var rgrp = {};
                            rgrp.resourceGroupId = resourceGroup.id;
                            rgrp.rgNetworks = [];
                            _.each(resourceGroup.memberList, function (networkMember) {
                                rgrp.rgNetworks.push(networkMember.networkId);
                            });
                            networkResourceGroupMapping.push(rgrp);
                        });
                    }
                })]).then(function () {

                console.log("4");
//                var cntr = 0;

                _.each(resourceGroupChassisMapping, function (rgVchassisMappingObj) {
                    var tempNwChassisObj = {};
                    tempNwChassisObj.chassisId = rgVchassisMappingObj.chassisId;
                    tempNwChassisObj.networks = [];
                    _.each(rgVchassisMappingObj.resourceGroupIds, function (resourceGroupId) {

                        _.each(networkResourceGroupMapping, function (nwRgrpMappingObj) {
                            _.each(nwRgrpMappingObj.rgNetworks, function (network) {
                                if (nwRgrpMappingObj.resourceGroupId === resourceGroupId) {
                                    tempNwChassisObj.networks.push(network);
                                }
                            });
                        });
                        networkVchassisMapping.push(tempNwChassisObj);
                    });
//                    cntr++;
                });
//                    if (cntr === resourceGroupChassisMapping.length) {
                        deferred.resolve(networkVchassisMapping);
                        console.log("getVchassisNetworkMappingData called ended");
                        return promise;
//                    }
            });
        };
    }

    angular.module('shieldxApp').service('virtualChassisService', virtualChassisService);
})();
