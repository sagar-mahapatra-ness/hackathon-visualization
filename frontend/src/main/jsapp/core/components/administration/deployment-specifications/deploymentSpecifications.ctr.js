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



    function deploymentSpecificationsCtr($scope,
        $stateParams,
        infrastructureConnectorService,
        ipPoolServices,
        deploymentSpecificationService,
        $translate, 
        $q,
        $mdDialog,
        $mdMedia,
        $sessionStorage,
        $state,vlanService,
        userSessionMenagment) {
        "ngInject";
            clearAllSession($sessionStorage);
            var deferred = $q.defer();
            $scope.promise = deferred.promise;
            $scope.promiseCompleted = true;
            var deploymentSpecData =[];
            var promiseCtr = 0;
            var totalClouds = 0;
            var viewData = [];
            
            var deploySpecIdSet = ($stateParams && $stateParams.deploySpecId) ? parseInt($stateParams.deploySpecId) : null;
            //var deploymentSpecifications = [];
            //for tables [start]
                    
            $scope.$emit('listenHeaderText', { headerText: $translate.instant('admin.toolbar.heading') });
            $scope.$emit('quickSetupEnded',{});

            /* **** for tables [start] **** */
            $scope.selected = [];
            $scope.query = {
                order: 'name',
                limit: 10,
                page: 1
            };
            $scope.isAdornmentPanelOpen = false;    
            $scope.isSearchBarOpen = false; 

            var create_id = authorities("deploymentSpecifications_create");
            var delete_id = authorities("deploymentSpecifications_delete");
            var update_id = authorities("deploymentSpecifications_update");
            $scope.is_create_dspec = userSessionMenagment.isUserAllowd(create_id);
            $scope.is_update_dspec = userSessionMenagment.isUserAllowd(update_id);
            $scope.is_delete_dspec = userSessionMenagment.isUserAllowd(delete_id);
            
            $scope.updateAdornmentPanel = function (event, rowData){
                console.log(rowData);
                $scope.toggleAdornmentPanel();
                $scope.editMgmt = false;
                $scope.editBckPlane = false;
                $scope.editMcrSer = false;
                $scope.adornmentData = rowData;
                console.log("updateAdornmentPanel");
                console.dir($scope.adornmentData);
                $scope.vlandata = null;
                vlanService.getvlanList($scope.adornmentData.cloudid).then(function(data){
                    var filteredData =  _.find(data, function(item){
                     return item.id === $scope.adornmentData.vlanPoolId;
                   });
                  console.log("filteredData >> ");
                  console.dir(filteredData);
                  var newVlan = new Vlan();
                 //console.log($scope.newVlan);
                if(filteredData){
                    newVlan.diserialize(filteredData);
                }
                  $scope.vlandata = newVlan; 
                });
                
            };

            $scope.toggleAdornmentPanel = function() {
                    $scope.isAdornmentPanelOpen = $scope.isAdornmentPanelOpen === false ? true: false;
                    //toggleGridCols($scope.isAdornmentPanelOpen);
            };      

            $scope.toggleSearchBar = function(event) {
                $scope.isSearchBarOpen = $scope.isSearchBarOpen === false ? true: false;
                if($scope.isSearchBarOpen) angular.element(event.currentTarget.firstElementChild).css('color','#4a90e2');
                else angular.element(event.currentTarget.firstElementChild).css('color','#6d6e71');
            };      
            /* **** for tables [end] **** */

            $scope.showStatus = function (status, test) {
                    return status === test;
            };
            
            $scope.deleteDeploySpec = function(deploySpecObject) {
                toastparam = {
                    'heading': 'Deployment Specification deletion in progress',
                    'subHeading': 'Deployment specification deletion initiated.',
                    'type': 'progress',
                    'timeout': 15000
                };
                showToast(toastparam);
                var deploySpecId = deploySpecObject.id;
                var list = $scope.DeploymentSpecifications;
                var toastparam = {};
                deploymentSpecificationService.deleteDeploymentSpecfication(deploySpecId, deploySpecObject.cloudid).then(function(data){
                    if(data.status) {
                    //update rows
                        for(i=0; i<list.length ; i++) {
                            if (list[i].id === deploySpecId) {
                                list.splice(i, 1);
                            }
                        }
                        
                        toastparam = {
                            'heading': 'Deployment Specification deleted successfully',
                            'subHeading': '&nbsp;',
                            'type': 'success',
                            'timeout': 5000
                        };
                        showToast(toastparam);
                        
                    } else {
                        console.log("Unable to delete deployment specification (%s) due to %s", deploySpecObject.name, data.errorMessage);
                        //TODO to show message/something else;
                        toastparam = {
                            'heading': 'Deployment Specification deletion failed',
                            'subHeading': "Error: "+data.errorMessage,
                            'type': 'fail',
                            'timeout': 5000
                        };
                        showToast(toastparam);
                    }
                }, function(error){
                    console.log("Unable to delete deployment specification - %s due to %s", deploySpecObject.name, error.message);
                    //TODO to show message/something else;
                    toastparam = {
                        'heading': 'Deployment Specification deletion failed',
                        'subHeading': "Something went wrong",
                        'type': 'fail',
                        'timeout': 5000
                    };
                    showToast(toastparam);
                });
                
            };
            console.log($sessionStorage.viewData);
            console.log($sessionStorage.infraData);
            //if(!$sessionStorage.viewData) {
                $sessionStorage.infraData = [];

                //CALL TO GET ALL INFRAS
                infrastructureConnectorService.getListOfInfrastructures().then(function (data) {
                    totalClouds = data.length;
                    if(totalClouds === 0){
                        $scope.errorMessage = "No Infrastructures!!!";                
                        $scope.DeploymentSpecifications = []; //NO DATA FOR VIEW
                        deferred.resolve();
                        $scope.promiseCompleted = false;
                    } else {
                        for(i = 0; i < data.length; i++ ) {

                            deploymentSpecData[i] = {};
                            deploymentSpecData[i].cloud_data = {};
                            deploymentSpecData[i].pool_data = {};
                            deploymentSpecData[i].deploy_spec_data = {}; 

                            //ADDING CLOUD DATA IN DEPLOYMENT SPEC
                            deploymentSpecData[i].cloud_data = data[i];

                            //GET REST DATA (IP-pool, Host, storage, network, deploymentSpec)
                            callGetRestOfData(data[i], deploymentSpecData[i]);
                            //callGetRestOfData(data[i], deploymentSpecData[i]);
                            deploymentSpecData[i].cloudId = data[i].id;
                            $sessionStorage.infraData.push(deploymentSpecData[i]);
                        }
                        //$sessionStorage.viewData = viewData;
                        console.log($scope.DeploymentSpecifications);
                        //console.log($sessionStorage.viewData);
                    }
                }, function (error) {
                    console.log(error);
                    $scope.errorMessage = "No Infrastructures!!!";                
                    $scope.DeploymentSpecifications = []; //NO DATA FOR VIEW
                    deferred.resolve();
                    $scope.promiseCompleted = false;
                });
            /* } else {
                //console.log($sessionStorage.viewData);
                viewData = $sessionStorage.viewData;
                $scope.deploySpecLength = viewData.length;
                
                $scope.DeploymentSpecifications = moveRecordToStart(viewData, "id", deploySpecIdSet);
                deferred.resolve();
        
                $scope.promiseCompleted = false;
                console.log($scope.DeploymentSpecifications);
            }*/
            //Helper function to get name of given Id from given list
            getNameOfGivenParam = function(id, list) {    
                if(list.length > 0 || typeof id !== 'undefined' ){
                    var result = {};
                    result = _.find(list, {'id': id});
                    if(typeof result !== 'undefined'){
                        return result;
                    } else {
                        return {};
                    }
                } else {
                    return {};
                }
            };
            
            getHostDataWithName = function (srcArray, FromArray){
                
                var result = [];
                for (hst= 0; hst < srcArray.length; hst++) {                    
                    result[hst] = _.find(FromArray, {'id': parseInt(srcArray[hst])});
                }
                return result;
            };
            
            callGetRestOfData = function(cloudData, obj) {
                //GET IPPOOL DATA
                ipPoolServices.getIpPoolListByCloudId(cloudData.id).then(function(ipPoolData) {
                      obj.pool_data = ipPoolData;
                      
                      //$sessionStorage.ipPoolData.cloudData.id = ipPoolData;
                //GET HOST DATA
                deploymentSpecificationService.getHosts(cloudData.id).then(function(hostData){
                    obj.host_data = hostData;
                    //$sessionStorage.hostsData.cloudData.id = hostData;
                    //GET STORAGEDATA
                    deploymentSpecificationService.getDatastore(cloudData.id).then(function(storeData){
                        obj.store_data = storeData;
                        
                        //GET NETWORK DATA
                        ipPoolServices.getNetworkListByCloudId(cloudData.id).then(function(networkData){
                            obj.network_data =  networkData;
                            //$sessionStorage.netWorkData.cloudData.id = networkData;
                            //GET TENANT DATA
                            //if(cloudData.type === 'OPENSTACK'){
                    //call to get tenants
                                deploymentSpecificationService.getTenants(cloudData.id).then(function(data){
                                    obj.tenants = data;

                                    if (cloudData.type === 'AWS') {
                                        deploymentSpecificationService.getRegions(cloudData.id).then(function (regionData) {
                                            obj.regions = regionData;
                                        }, function (error) {
                                            console.log(error);
                                            obj.regions = [];

                                        });
                                    }


                                    //GET DEPLOYMENT SPEC DATA
                                    deploymentSpecificationService.getDeploymentSpecList(cloudData.id).then(function(deployData){

                                        for(c=0; c< deployData.length; c++) { //c for counter

                                            if(!deployData[c].backPlaneIsDhcp) {
                                                deployData[c].backPlaneIpPoolName =
                                                    getNameOfGivenParam(parseInt(deployData[c].backPlaneIpPoolId),
                                                        obj.pool_data);
                                            }else {
                                                deployData[c].backPlaneIpPoolName = {'name': 'DHCP'};
                                            }
                                            //console.log("done BackplaneIPPOOLNAME");
                                            deployData[c].backPlaneNetworkName =
                                                getNameOfGivenParam(parseInt(deployData[c].backPlaneNetworkId),
                                                    obj.network_data);
                                            //console.log("done backPlaneNetworkName == "+deployData[c].name);
                                            deployData[c].cloudName = obj.cloud_data.name;
                                            deployData[c].cloudType = obj.cloud_data.type;
                                            //console.log("done cloudName");
                                            if (!deployData[c].storageIsLocal) {
                                                deployData[c].datastoreName =
                                                    getNameOfGivenParam(deployData[c].datastoreId,
                                                        obj.store_data);
                                            } else {
                                                deployData[c].datastoreName = {'name': 'Local'};
                                            }
                                            //console.log("done datastoreName");
                                            if(!deployData[c].mgmtIsDhcp) {
                                                deployData[c].mgmtIpPoolName =
                                                    getNameOfGivenParam(deployData[c].mgmtIpPoolId,
                                                        obj.pool_data);
                                            } else {
                                                deployData[c].mgmtIpPoolName = {'name': 'DHCP'};
                                            }
                                            //console.log("done mgmtIpPoolName");
                                            deployData[c].mgmtNetworkName =
                                                getNameOfGivenParam(parseInt(deployData[c].mgmtNetworkId),
                                                    angular.copy(obj.network_data));
                                            //console.log("done mgmtNetworkName");
                                            if (deployData[c].hosts !== undefined) {
                                                deployData[c].hostsWithName =
                                                    getHostDataWithName(deployData[c].hosts,
                                                        obj.host_data);
                                            }
                                            //console.log("done hostsWithName");
                                            deployData[c].tenantName =
                                                getNameOfGivenParam(deployData[c].tenantId,
                                                    angular.copy(obj.tenants));

                                            deployData[c].regionName= deployData[c].region;
                                            //    getNameOfGivenParam(deployData[c].region)

                                            viewData.push(deployData[c]); //Push data for view.
                                        }

                                        obj.deploy_spec_data = deployData;

                                        promiseCtr += 1;
                                        //console.log("PROMISE COUNTER==="+promiseCtr);
                                        if(promiseCtr >= totalClouds) {
                                            $scope.deploySpecLength = viewData.length;
                                            $sessionStorage.viewData = viewData;
                                            deferred.resolve();
                                            console.log(viewData);
                                            $scope.promiseCompleted = false;
                                            $scope.DeploymentSpecifications = moveRecordToStart(viewData, "id", deploySpecIdSet);
                                            console.log($scope.DeploymentSpecifications);
                                            console.log($sessionStorage.viewData);

                                        }

                                    }, function(error){
                                        console.log(error);
                                        obj.deploy_spec_data = [];
                                        promiseCtr += 1;
                                        if(promiseCtr === totalClouds) {
                                            $scope.deploySpecLength = viewData.length;
                                            $sessionStorage.viewData = viewData;
                                            deferred.resolve();
                                            $scope.promiseCompleted = false;
                                            console.log($scope.DeploymentSpecifications);
                                            console.log($sessionStorage.viewData);
                                        }
                                    });

                                
                                    //}

                                //////
                                }, function(error){
                                    console.log(error);
                                    obj.tenants = [];
                                });
                            
                        }, function(error){
                            console.log(error);
                            obj.network_data = [];
                        });

                    }, function(error){
                        console.log(error);
                        obj.store_data = [];
                    });
                }, function(error){
                    console.log(error);
                    obj.host_data = [];
                });
              }, function(error){
              console.log(error);
              obj.pool_data = [];
              });
                
            };
            
        //EDIT STARTS.
        $scope.editMgmt = false;
        $scope.editBckPlane = false;
        $scope.editMcrSer = false;
        $scope.editMisc = false;
        $scope.editVlan = false;
        
        var callingStorage = false;
        var callingHosts = false;
        var callingTenant = false;   
            
        $scope.discardChanges = function(calledFrom){
            $scope.editMgmt = false;
            $scope.editBckPlane = false;
            $scope.editMcrSer = false;
            $scope.editMisc = false;
            $scope.editVlan = false;
            if(calledFrom === 'Management') {
                inBetweenNetworkCall = false;
                if($sessionStorage.Management.selectedNetworkName && $sessionStorage.Management.oldSelectedNetworkValue){
                    $scope.adornmentData.mgmtNetworkName.name = $sessionStorage.Management.selectedNetworkName;
                    $scope.deployment.managementNetwork = $sessionStorage.Management.oldSelectedNetworkValue;
                }
            } else if(calledFrom === 'Backplane') {
                inBetweenNetworkCall = false;
                if($sessionStorage.Backplane.selectedNetworkName && $sessionStorage.Backplane.oldSelectedNetworkValue){
                    $scope.adornmentData.backPlaneNetworkName.name = $sessionStorage.Backplane.selectedNetworkName ;
                    $scope.deployment.backplaneNetwork = $sessionStorage.Backplane.oldSelectedNetworkValue;
                }
            } else if(calledFrom === 'StorageHost'){
                if(callingHosts){
                    inBetweenHostCall = false;
                    if(($sessionStorage.Host.oldSelectedHosts) && $sessionStorage.Host.oldSelectedHostNames) {
                        $scope.deployment.hosts = $sessionStorage.Host.oldSelectedHosts;
                        $scope.adornmentData.hostsWithName = $sessionStorage.Host.oldSelectedHostNames ;
                    }
                } 
                if(callingStorage){
                    inBetweenStorageCall = false;
                    if(($sessionStorage.Storage.oldSelectedStorageValue >= 0) && $sessionStorage.Storage.oldSelectedStorageName) {
                        $scope.deployment.storage = $sessionStorage.Storage.oldSelectedStorageValue;
                        $scope.adornmentData.datastoreName.name = $sessionStorage.Storage.oldSelectedStorageName;
                        
                    }
                }
                if(callingTenant) {
                    inBetweenTenantCall = false;
                    if(($sessionStorage.Tenant.oldSelectedTenantValue >= 0) && $sessionStorage.Tenant.oldSelectedTenantName) {
                        $scope.deployment.tenantId = $sessionStorage.Tenant.oldSelectedTenantValue;
                        if(!$scope.adornmentData.tenantName){
                             $scope.adornmentData.tenantName = {};
                        }
                        $scope.adornmentData.tenantName.name = $sessionStorage.Tenant.oldSelectedTenantName;
                        
                    }
                }
            } else if(calledFrom === 'vlan') {
                 inBetweenNetworkCall = false;
                 if($sessionStorage.Management.selectedNetworkName && $sessionStorage.Management.oldSelectedNetworkValue){
                    $scope.adornmentData.mgmtNetworkName.name = $sessionStorage.Management.selectedNetworkName;
                    $scope.deployment.managementNetwork = $sessionStorage.Management.oldSelectedNetworkValue;
                }
            }
            else{
                
            }
        };
        
        
        $scope.editMiscData = function(deploySpecObject){
            $scope.editMisc = true;
            $scope.editMgmt = false;
            $scope.editBckPlane = false;
            $scope.editMcrSer = false;
            callingTenant = false;
            $scope.editVlan = false;
            console.log("deploySpecObject==");console.log(deploySpecObject);
            $sessionStorage.deploymentSpecForEdit = deploySpecObject;
            editDeploySpecData('editMisc');
        };
        
        $scope.editManagementData = function(deploySpecObject){
            $sessionStorage.Management={};
            $scope.editMgmt = true;
            $scope.editBckPlane = false;
            $scope.editMcrSer = false;
            $scope.editMisc = false;
            $scope.editVlan = false;
            //$scope.adornmentDataForEdit = deploySpecObject;
            //console.log("adornmentDataForEdit==");console.log($scope.adornmentDataForEdit);
            $sessionStorage.deploymentSpecForEdit = deploySpecObject;
            editDeploySpecData('editMgmt');
        };
        
        $scope.editBackPlaneData = function(deploySpecObject){
            $sessionStorage.Backplane={};
            $scope.editBckPlane = true;
            $scope.editMgmt = false;
            $scope.editMcrSer = false;
            $scope.editMisc = false;
            $scope.editVlan = false;
            //console.log("deploySpecObject==");console.log(deploySpecObject);
            $sessionStorage.deploymentSpecForEdit = deploySpecObject;
            editDeploySpecData('editBckPlane');
        };
        
        $scope.editMicroServiceData = function(deploySpecObject){
            $scope.editMcrSer = true;
            $scope.editMgmt = false;
            $scope.editBckPlane = false;
            $scope.editMisc = false;
            $scope.editVlan = false;
            callingStorage = false;
            callingHosts = false;            
            //console.log("deploySpecObject==");console.log(deploySpecObject);
            $sessionStorage.deploymentSpecForEdit = deploySpecObject;
            editDeploySpecData('editMcrSer');
        };
        $scope.editVlanServiceData = function(deploySpecObject){
            $scope.editMcrSer = false;
            $scope.editMgmt = false;
            $scope.editBckPlane = false;
            $scope.editMisc = false;
            $scope.editVlan = true;
            callingStorage = false;
            callingHosts = false;            
            //console.log("deploySpecObject==");console.log(deploySpecObject);
            $sessionStorage.deploymentSpecForEdit = deploySpecObject;
            editDeploySpecData('editVlan');
        };
        $scope.$on('changeSelectedName', function(event, arg){
            if(arg.label === 'Management') {
                $scope.adornmentData.mgmtNetworkName.name = arg.name;
            } else {
               $scope.adornmentData.backPlaneNetworkName.name = arg.name; 
            }
        });
        
        $scope.$on('listenManagementNetworkEdit', function (event, args) {
            console.log('listenManagementNetworkEdit' + args);
            $scope.deployment.managementNetwork = args.id;
            $scope.adornmentData.mgmtNetworkName.name = args.name;
        });

        $scope.$on('listenBackplaneNetworkEdit', function (event, args) {
            console.log('listenBackplaneNetworkEdit' + args);
            //$scope.deployment.backplaneNetworkSelected = args;
            $scope.deployment.backplaneNetwork = args.id;
            $scope.adornmentData.backPlaneNetworkName.name = args.name;

        });
        var inBetweenNetworkCall = false;
        $scope.showNetworkDialog = function(label, networks, selectedNetworks, selectedNetworkName, ev){
                
                console.log("Calling Show Network Dialogue");
                $mdDialog.show({
                    skipHide: true,
                    controller: networkPopupController,
                    templateUrl: 'core/components/administration/deployment-specifications/networks.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {'label': label, 'networks' : networks, 'selectedNetworks': selectedNetworks, 'selectedNetworkName': selectedNetworkName}
                })
                  .then(function() {
                    
                });
            };
            
            function networkPopupController($rootScope, $scope, $sessionStorage, networks, selectedNetworks, label, selectedNetworkName){
                console.log(networks);
                $scope.label = label;
                var networkLists = [];
                $scope.networksList = networkLists = angular.copy(networks);
                console.log(selectedNetworks);
                var arg = {};
                if(label === 'Management') {
                    if(!$sessionStorage.Management) {
                        $sessionStorage.Management={};
                    }
                    if(inBetweenNetworkCall === true){
                        selectedNetworkName = $sessionStorage.Management.selectedNetworkName;
                        arg = {'label': label, 'name': $sessionStorage.Management.selectedNetworkName};
                        $rootScope.$broadcast('changeSelectedName', arg);
                        selectedNetworks = $scope.selectedNetworkValue = $sessionStorage.Management.oldSelectedNetworkValue ;
                    } else {
                        inBetweenNetworkCall = true;
                        $sessionStorage.Management.selectedNetworkName = selectedNetworkName;
                        $scope.selectedNetworkValue = $sessionStorage.Management.oldSelectedNetworkValue = (selectedNetworks)?selectedNetworks:0;
                    }
                    //$sessionStorage.Management.selectedNetworkName = selectedNetworkName;
                    //$scope.selectedNetworkValue = $sessionStorage.Management.oldSelectedNetworkValue = (selectedNetworks)?selectedNetworks:0;
                } else {
                    if(!$sessionStorage.Backplane) {
                        $sessionStorage.Backplane={};
                    }
                    if(inBetweenNetworkCall === true){
                        selectedNetworkName = $sessionStorage.Backplane.selectedNetworkName;
                        arg = {'label': label, 'name': $sessionStorage.Backplane.selectedNetworkName};
                        $rootScope.$broadcast('changeSelectedName', arg);
                        selectedNetworks = $scope.selectedNetworkValue = $sessionStorage.Backplane.oldSelectedNetworkValue;
                    } else {
                        inBetweenNetworkCall = true;
                        //$sessionStorage.Backplane={};
                        $sessionStorage.Backplane.selectedNetworkName = selectedNetworkName;
                        $scope.selectedNetworkValue = $sessionStorage.Backplane.oldSelectedNetworkValue = (selectedNetworks)?selectedNetworks:0;
                    }
                }
                console.log($scope.selectedNetworkValue);
                
                $scope.cancelDialogue = function() {
                    $mdDialog.cancel();
                };
                
                $scope.done = function(){
                    if(label === 'Management') {
                        for(i=0; i < networkLists.length; i++) {                            
                            if (networks[i].id === parseInt($scope.selectedNetworkValue)) {
                                $rootScope.$broadcast('listenManagementNetworkEdit', networks[i]);
                                $mdDialog.hide();
                            }
                        }
                    } 
                    if(label === 'Backplane') {
                        for(i=0; i < networkLists.length; i++) {                            
                            if (networks[i].id === parseInt($scope.selectedNetworkValue)) {
                                $rootScope.$broadcast('listenBackplaneNetworkEdit', networks[i]);
                                $mdDialog.hide();
                            }
                        }
                    }
                };
            }
            //Edit Host popup
            $scope.$on('listenSelectedHostsEdit', function (event, args) {
                var hostIds = [];
                var hostNames = [];
                for(i=0; i<args.length; i++) {
                    hostIds[i] = args[i].id;
                    hostNames[i] = args[i].name;
                }
                //$scope.deployment.numberOfHosts = args.length;
                //$scope.deployment.selectedHostObjects = args;
                $scope.deployment.hosts = hostIds;
                $scope.adornmentData.hostsWithName = args;
                console.log($scope.deployment.hostNames);
                
            });
            $scope.$on('changeSelectedHostsName', function (event, arg) {
                $scope.adornmentData.hostsWithName = arg;
            });
            var inBetweenHostCall = false;
                $scope.callpopuphost = function(hosts, selectedHosts, selectedHostsName, ev){
                    console.log(hosts);                    
                    $mdDialog.show({
                        controller: hostPopupController,
                        skipHide: true,
                        templateUrl: 'core/components/administration/deployment-specifications/hosts.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        locals: {'hosts': hosts, 'selectedHosts': selectedHosts, 'selectedHostsName': selectedHostsName}
                    });
                };
                /*HOST RELATED FUNCTION*/
                function hostPopupController($rootScope, $scope, $mdDialog, hosts, selectedHosts, selectedHostsName) {
                    $scope.deployment_designate_host = $translate.instant("wizardinfrastucture.button.designate_host");
                    //$scope.deployment_designate_storage = $translate.instant("wizardinfrastucture.button.designate_storage");
                    //$scope.host_activated = true;
                    if(!$sessionStorage.Host) {
                        $sessionStorage.Host={};
                    }
                    if(inBetweenHostCall === true){
                        selectedHosts = $sessionStorage.Host.oldSelectedHosts ;
                        selectedHostsName = $sessionStorage.Host.oldSelectedHostNames;
                        $rootScope.$broadcast('changeSelectedHostsName', selectedHostsName);
                    } else {
                        inBetweenHostCall = true;
                        $sessionStorage.Host.oldSelectedHosts = selectedHosts;
                        $sessionStorage.Host.oldSelectedHostNames = selectedHostsName;
                    }
                            callingHosts = true;
                            (function(){  
                                console.log(hosts);
                                //var selectedHostsList = [];
                                $scope.items = hosts ;
                                $scope.no_of_hosts = hosts.length;
                                console.log("selectedHosts");
                                console.log(selectedHosts);
                                //getselectedhosts objects
                                var selectedHostsObjects = [];
                                for(j=0;j<selectedHosts.length;j++){
                                    selectedHostsObjects.push( _.find(hosts, { 'id': selectedHosts[j] }));
                                }
                                console.log("selectedHostsObjects");
                                console.log(selectedHostsObjects);
                                $scope.selected = (selectedHostsObjects)?selectedHostsObjects:[];
                                if ($scope.selected) {
                                    $scope.no_of_selected_hosts = $scope.selected.length;
                                } else {
                                    $scope.no_of_selected_hosts = 0;
                                }
                                console.log($scope.selected);
                                $scope.cancelDialogue = function() {
                                    $mdDialog.cancel();
                                };
                                $scope.doneHosts = function() {
                                    $rootScope.$broadcast('listenSelectedHostsEdit', $scope.selected);
                                        $mdDialog.hide();
                                };
                                $scope.toggle = function (item, list) {
                                    var isDeleted = false;
                                    for (i = 0; i < list.length; i++) {
                                        if (list[i].id === item.id) {
                                        list.splice(i, 1);
                                                isDeleted = true;
                                        }
                                    }
                                    if (!isDeleted) {
                                        list.push(item);
                                    }
                                    $scope.no_of_selected_hosts = $scope.selected.length;
                                };
                                    $scope.exists = function (item, list) {
                                        for (i = 0; i < list.length; i++) {
                                            if (list[i].id === item.id) {
                                            return true;
                                            }
                                        }
                                        return false;
                                    };
                                    $scope.isIndeterminate = function () {
                                        return ($scope.selected.length !== 0 &&
                                            $scope.selected.length !== $scope.items.length);
                                    };
                                    $scope.isChecked = function () {
                                        return $scope.selected.length === $scope.items.length;
                                    };
                                    $scope.toggleAll = function () {
                                        if ($scope.selected.length === $scope.items.length) { //uncheck all
                                            $scope.selected = [];
                                        } else if ($scope.selected.length === 0 || $scope.selected.length > 0) {
                                            $scope.selected = $scope.items.slice(0); //check all
                                        }
                                        $scope.no_of_selected_hosts = $scope.selected.length;
                                    };
                                //}
                            })();
                        }
            
            //Edit Host popup Ends
            //Edit Storage popup
            var inBetweenStorageCall = false;
            $scope.$on('listenSelectedStoragesEdit', function (event, args) {
                //$scope.deployment.selectedStorage = args;
                $scope.deployment.storage = args.id;
                $scope.adornmentData.datastoreName.name = args.name;
                //$scope.deployment.storageName = args.name;
                //console.log($scope.deployment.storageName);
                
            });
            $scope.$on('changeSelectedNameOfStorage', function (event, arg) {
                $scope.adornmentData.datastoreName.name = arg;
                
            });
            
            $scope.$on('changeSelectedNameOfTenant', function (event, arg) {
                $scope.adornmentData.tenantName.name = arg;
                
            });
            
            $scope.$on('listenSelectedTenantsEdit', function (event, args) {
                $scope.deployment.selectedTenants = args;
                $scope.deployment.tenantId = args.id;
                $scope.adornmentData.tenantName.name = args.name;
                
                //$scope.checkNext();
            });
            
            $scope.callpopupstorage = function(storages, selectedStorage, selectedStorageName, ev){
                $mdDialog.show({
                        controller: storagePopupController,
                        skipHide: true,
                        templateUrl: 'core/components/administration/deployment-specifications/storages.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        locals: {'storages': storages, 'selectedStorage': selectedStorage, 'selectedStorageName': selectedStorageName}
                    });
            };
            
            function storagePopupController($rootScope, $scope, $mdDialog, storages, selectedStorage,selectedStorageName) {
                    //$scope.deployment_designate_host = $translate.instant("wizardinfrastucture.button.designate_host");
                    $scope.deployment_designate_storage = $translate.instant("wizardinfrastucture.button.designate_storage");
                    $scope.storage_activated = true;
                    callingStorage = true;
                    console.log("from main Dspec ");
                    console.dir(storages);
                    if(!$sessionStorage.Storage){
                        $sessionStorage.Storage = {};
                    }
                    
                    if(inBetweenStorageCall === true) {
                        selectedStorage = $sessionStorage.Storage.oldSelectedStorageValue;
                        selectedStorageName = $sessionStorage.Storage.oldSelectedStorageName;
                        $rootScope.$broadcast('changeSelectedNameOfStorage', selectedStorageName);
                    } else {
                        inBetweenStorageCall = true;
                        $sessionStorage.Storage.oldSelectedStorageValue = selectedStorage;
                        $sessionStorage.Storage.oldSelectedStorageName = selectedStorageName;
                    }
                    (function(){
                        $scope.dataStores = storages ;
                        $scope.selectedStoragesValue = (selectedStorage)? selectedStorage : 0;
                        $scope.cancelDialogue = function() {
                            $mdDialog.cancel();
                        };
                        $scope.done = function() {
                            console.log($scope.selectedStoragesValue);
                            var storageItems = $scope.dataStores;
                            for (i = 0; i < storageItems.length; i++) {
                                if (storageItems[i].id === parseInt($scope.selectedStoragesValue)) {
                                    console.log(storageItems[i]);
                                    $rootScope.$broadcast('listenSelectedStoragesEdit', storageItems[i]);
                                    $mdDialog.hide();
                                }
                            }
                        };
                    })();
                }


        //region popup
        var inBetweenRegionCall = false;
        $scope.$on('listenSelectedRegionEdit', function (event, args) {
            //$scope.deployment.selectedStorage = args;
            $scope.deployment.region = args.id;
            $scope.adornmentData.regionName.name = args.name;
            //$scope.deployment.storageName = args.name;
            //console.log($scope.deployment.storageName);

        });
        $scope.$on('changeSelectedNameOfRegion', function (event, arg) {
            $scope.adornmentData.regionName.name = arg;

        });
        $scope.callpopupregions = function(regions, selectedRegion, selectedRegionName, ev){
            console.log("In region popup ");
            $mdDialog.show({
                controller: regionPopupController,
                skipHide: true,
                templateUrl: 'core/components/administration/deployment-specifications/regions.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                locals: {'regions': regions, 'selectedRegion': selectedRegion, 'selectedRegionName': selectedRegionName}
            });
        };

        function regionPopupController($rootScope, $scope, $mdDialog, regions, selectedRegion, selectedRegionName) {
            console.log("In region popup controller");
            //$scope.deployment_designate_host = $translate.instant("wizardinfrastucture.button.designate_host");
            $scope.deployment_designate_region = $translate.instant("wizardinfrastucture.button.designate_region");
            $scope.region_activated = true;
            callingregion = true;
            console.log("from main Dspec ");
            console.dir(regions);
            if(!$sessionStorage.Region){
                $sessionStorage.Region = {};
            }

            if(inBetweenRegionCall === true) {
                selectedRegion = $sessionStorage.Storage.oldSelectedRegionValue;
                selectedRegionName = $sessionStorage.Storage.oldSelectedRegionName;
                $rootScope.$broadcast('changeSelectedNameOfRegion', selectedRegionName);
            } else {
                inBetweenRegionCall = true;
                $sessionStorage.Storage.oldSelectedRegionValue = selectedRegion;
                $sessionStorage.Storage.oldSelectedRegionName = selectedRegionName;
            }
            (function(){
                $scope.regions = regions ;
                $scope.selectedRegionValue = (selectedRegion)? selectedRegion : 0;
                $scope.cancelDialogue = function() {
                    $mdDialog.cancel();
                };
                $scope.done = function() {
                    console.log($scope.selectedRegionValue);
                    var regionItems = $scope.regions;
                    for (i = 0; i < regionItems.length; i++) {
                        if (regionItems[i].id === parseInt($scope.selectedRegionValue)) {
                            console.log(regionItems[i]);
                            $rootScope.$broadcast('listenSelectedStoragesEdit', regionItems[i]);
                            $mdDialog.hide();
                        }
                    }
                };
            })();
        }

            //Edit Storage Popup end
            var inBetweenTenantCall = false;
            $scope.callpopuptenants = function(tenants, selectedTenants, selectedTenantsName, ev){
                    $mdDialog.show({
                        controller: tenantPopupController,
                        skipHide: true,
                        templateUrl: 'core/components/administration/quick-setup/deployment-specification/tenants.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        locals: {'tenants': tenants, 'selectedTenants': selectedTenants, 'selectedTenantsName': selectedTenantsName}
                    })
                    .then(function() {
                        console.log($scope.selectedTenants);
                        $sessionStorage.cloudData.selectedTenants = $scope.selectedTenants;
                        console.log($sessionStorage.cloudData.selectedTenants);
                    });
                };

                function tenantPopupController($rootScope, $scope, $mdDialog, selectedTenants, tenants, selectedTenantsName) {
                    $scope.tenant_activated = true;
                    callingTenant = true;
                    if(!$sessionStorage.Tenant){
                        $sessionStorage.Tenant = {};
                    }
                    
                    if(inBetweenTenantCall === true) {
                        selectedTenants = $sessionStorage.Tenant.oldSelectedTenantValue;
                        selectedTenantsName = $sessionStorage.Tenant.oldSelectedTenantName;
                        $rootScope.$broadcast('changeSelectedNameOfTenant', selectedTenantsName);
                    } else {
                        inBetweenTenantCall = true;
                        $sessionStorage.Tenant.oldSelectedTenantValue = selectedTenants;
                        $sessionStorage.Tenant.oldSelectedTenantName = selectedTenantsName;
                    }
                    
                    (function(){
                        if(!$sessionStorage.cloudData){
                            $sessionStorage.cloudData = {};
                        }
                        $scope.items = $scope.tenants = $sessionStorage.cloudData.tenants = tenants;                        
                        console.log($scope.items);
                        $sessionStorage.cloudData.selectedTenants = {};
                        if(selectedTenants) {
                            $sessionStorage.cloudData.selectedTenants.id = selectedTenants;
                        } else {
                            $sessionStorage.cloudData.selectedTenants.id = $scope.items[0].id;
                        }
                        commonPopupfunctions();
                        $scope.tenant_activated = false;

                        function commonPopupfunctions() {
                            $scope.selectedTenantsValue = $sessionStorage.cloudData.selectedTenants.id;
                            $scope.cancelDialogue = function() {
                                $mdDialog.cancel();
                            };

                            $scope.done = function() {
                                var tenantsItems = $scope.items;
                                for(i=0; i < tenantsItems.length; i++) {                            
                                    if (tenantsItems[i].id === parseInt($scope.selectedTenantsValue)) {
                                        $rootScope.$broadcast('listenSelectedTenantsEdit', tenantsItems[i]);
                                        $mdDialog.hide();
                                    }
                                }
                            };
                        }
                    })();
                }
        
        function editDeploySpecData(calledFrom){
            //FUNCTIONALITY TO EDIT DEPLOY SPEC
            console.log("$sessionStorage.deploymentSpecForEdit==");console.log($sessionStorage.deploymentSpecForEdit);
            $scope.deployment = {};
            $scope.deployment.id = $sessionStorage.deploymentSpecForEdit.id;
            $scope.deployment.name = $sessionStorage.deploymentSpecForEdit.name;
            $scope.deployment.infrastructure = $sessionStorage.deploymentSpecForEdit.cloudid;
            $scope.deployment.hosts = $sessionStorage.deploymentSpecForEdit.hosts;
            $scope.deployment.storage = ($sessionStorage.deploymentSpecForEdit.datastoreId) ? $sessionStorage.deploymentSpecForEdit.datastoreId : 0;
            $scope.deployment.backplaneIPPool = ($sessionStorage.deploymentSpecForEdit.backPlaneIpPoolId) ? $sessionStorage.deploymentSpecForEdit.backPlaneIpPoolId : 0;
            $scope.deployment.backplaneNetwork = $sessionStorage.deploymentSpecForEdit.backPlaneNetworkId;
            $scope.deployment.managementIPPool = ($sessionStorage.deploymentSpecForEdit.mgmtIpPoolId) ? $sessionStorage.deploymentSpecForEdit.mgmtIpPoolId : 0;
            $scope.deployment.managementNetwork= $sessionStorage.deploymentSpecForEdit.mgmtNetworkId;
            $scope.deployment.region= $sessionStorage.deploymentSpecForEdit.region;
            $scope.deployment.tenantId= $sessionStorage.deploymentSpecForEdit.tenantId;
            $scope.cloudType =  $sessionStorage.deploymentSpecForEdit.cloudType;
             
            if(!$sessionStorage.Management){
               $sessionStorage.Management = {}; 
            } 
            if(!$sessionStorage.Backplane){
                $sessionStorage.Backplane = {};
            }
               
            $sessionStorage.Management.oldSelectedNetworkValue = $sessionStorage.deploymentSpecForEdit.mgmtNetworkId;
            $sessionStorage.Backplane.oldSelectedNetworkValue =  $sessionStorage.deploymentSpecForEdit.backPlaneNetworkId;

            $scope.clouds = [];
            $scope.storages = [];
            $scope.pools = [];
            $scope.networks =[];
            var defaultDatastorage = [];
            var defaultIPPool = [];
            //$scope.deployment = {};
            console.log($sessionStorage.infraData);
            for (i = 0; i < $sessionStorage.infraData.length; i++) {
                $scope.clouds[i] = angular.copy($sessionStorage.infraData[i].cloud_data);
            }
            
            $scope.selectedCloudObject = {};
            if ($scope.deployment.infrastructure) {
                console.log($scope.deployment.infrastructure);
                var localDataOfInfraData = angular.copy($sessionStorage.infraData);
                $scope.selectedCloudObject = angular.copy(_.find(localDataOfInfraData, {'cloudId': $scope.deployment.infrastructure}));
                console.log("selected object==");
                console.log($scope.selectedCloudObject);
                $scope.tenants = angular.copy($scope.selectedCloudObject.tenants);
                if(calledFrom === 'editMcrSer') {
                    $scope.hosts = $scope.selectedCloudObject.host_data;

                    defaultDatastorage = [{
                            "id": 0,
                            "name": "Local",
                            "cloudId": $scope.selectedCloudObject.cloudId
                        }];
                    $scope.storages = defaultDatastorage.concat($scope.selectedCloudObject.store_data);
                    //$scope.storages = $scope.selectedCloudObject.store_data;
                }
                if(calledFrom === 'editBckPlane' || calledFrom === 'editMgmt') {
                    defaultIPPool = [{
                            "cloudId": $scope.selectedCloudObject.cloudId,
                            "id": 0,
                            "name": "DHCP"
                        }];
                    $scope.pools = defaultIPPool.concat($scope.selectedCloudObject.pool_data);
                    $scope.networks = angular.copy($scope.selectedCloudObject.network_data);
                }

            }            
        } //EDIT ENDS.
        $scope.vlanpoolDataUpdate =  function (objectData) {
              $scope.toggleAdornmentPanel();
            $scope.editMgmt = false;
            $scope.editBckPlane = false;
            $scope.editMcrSer = false;
            $scope.editMisc = false;
            $scope.editVlan = false;
                toastparam = {
                    'heading': 'Deployment Specification update in progress',
                    'subHeading': 'Deployment specification update initiated.',
                    'type': 'progress',
                    'timeout': 25000
                };
            showToast(toastparam);
            objectData.cloudName = $scope.clouds[0].name;
            objectData.cloudid = parseInt($scope.deployment.infrastructure); 
            var isLocalStorage = false;
            var isBackPlaneDHCP = false;
            var isManagementDHCP = false;
            if (parseInt($scope.deployment.storage) === 0) {
                isLocalStorage = true;
            }
            if (parseInt($scope.deployment.backplaneIPPool) === 0) {
                isBackPlaneDHCP = true;
            }
            if (parseInt($scope.deployment.managementIPPool) === 0) {
                isManagementDHCP = true;
            }
             /*objectData.deploy_spec_data */
             objectData.deploy_spec_data = {
                    "backPlaneIpPoolId": parseInt($scope.deployment.backplaneIPPool),
                    "backPlaneIsDhcp": isBackPlaneDHCP,
                    "backPlaneNetworkId": parseInt($scope.deployment.backplaneNetwork),
                    "cloudid": parseInt($scope.deployment.infrastructure),
                    "datastoreId": parseInt($scope.deployment.storage),
                    "hosts": $scope.deployment.hosts,
                    "id": $scope.deployment.id,
                    "mgmtIpPoolId": parseInt($scope.deployment.managementIPPool),
                    "mgmtIsDhcp": isManagementDHCP,
                    "mgmtNetworkId": parseInt($scope.deployment.managementNetwork),
                    "name": $scope.deployment.name,
                    "storageIsLocal": isLocalStorage
                };
                var serializeData = new Vlan();
                serializeData.ranges = objectData.ranges;
                objectData.ranges = serializeData.serializeRanges();
               // objectData.ranges = serializeData.ranges;
                objectData.active = false;
             vlanService.updateVlanPool(objectData, objectData.cloudid).then(function(){
                
                //update rows
               /* for(i=0; i<list.length ; i++) {
                    if (list[i].id === objectData.id) {
                        //list.splice(i, 1);
                        list[i] = objectData;
                    }
                }
*/
                toastparam = {
                    'heading': 'VLAN Pool (' + objectData.name + ') updated successfully',
                    'subHeading': '&nbsp;',
                    'type': 'success',
                    'timeout': 5000
                };
                showToast(toastparam);
                $scope.promiseCompleted = false;
                
            }, function(error){
                console.log("Unable to update VLAN Pool - %s due to %s", objectData.name, error.data.message);
                //TODO to show message/something else;
                toastparam = {
                    'heading': 'VLAN Pool update failed',
                    'subHeading': "ERROR: "+error.data.message,
                    'type': 'fail',
                    'timeout': 5000
                };
                showToast(toastparam);
                $scope.promiseCompleted = false;
            });
        };
        $scope.$on('invalidRangeFormData', function (event, data) {
                $scope.invalidrangeformdata = data;
            });
          
        $scope.editDeploySpec = function (calledFrom) {
            $scope.toggleAdornmentPanel();
            $scope.editMgmt = false;
            $scope.editBckPlane = false;
            $scope.editMcrSer = false;
            $scope.editMisc = false;
            $scope.editVlan = false;
                toastparam = {
                    'heading': 'Deployment Specification update in progress',
                    'subHeading': 'Deployment specification update initiated.',
                    'type': 'progress',
                    'timeout': 25000
                };
                showToast(toastparam);
                console.log($scope.deployment);
                //CALL TO CREATE NEW DEPLOYMENT SPECIFICATION
                var isLocalStorage = false;
                var isBackPlaneDHCP = false;
                var isManagementDHCP = false;

                if (parseInt($scope.deployment.storage) === 0) {
                    isLocalStorage = true;
                }
                if (parseInt($scope.deployment.backplaneIPPool) === 0) {
                    isBackPlaneDHCP = true;
                }
                if (parseInt($scope.deployment.managementIPPool) === 0) {
                    isManagementDHCP = true;
                }
                paramObject = {
                    "backPlaneIpPoolId": parseInt($scope.deployment.backplaneIPPool),
                    "backPlaneIsDhcp": isBackPlaneDHCP,
                    "backPlaneNetworkId": parseInt($scope.deployment.backplaneNetwork),
                    "cloudid": parseInt($scope.deployment.infrastructure),
                    "datastoreId": parseInt($scope.deployment.storage),
                    "hosts": $scope.deployment.hosts,
                    "id": $scope.deployment.id,
                    "mgmtIpPoolId": parseInt($scope.deployment.managementIPPool),
                    "mgmtIsDhcp": isManagementDHCP,
                    "mgmtNetworkId": parseInt($scope.deployment.managementNetwork),
                    "name": $scope.deployment.name,
                    "storageIsLocal": isLocalStorage
                };
                 if($scope.cloudType === 'OPENSTACK'){ 
                    //SET only if cloudType is openstack
                    paramObject.region = $scope.deployment.region;
                    paramObject.tenantId = $scope.deployment.tenantId;
                    paramObject.cloudType = $scope.cloudType;
                }
                console.log(paramObject);
                var objSelected = $scope.selectedCloudObject;
                var deploySpecId = paramObject.id;
                var list = viewData;
                    
                deploymentSpecificationService.updateDeploymentSpecfication(paramObject).then(function () {
                    //UPDATE THE DATA GRID and show TOAST
                    if (isBackPlaneDHCP === false) {
                        paramObject.backPlaneIpPoolName =
                                getNameOfGivenParam(paramObject.backPlaneIpPoolId, objSelected.pool_data);
                    } else {
                        paramObject.backPlaneIpPoolName = {'name': 'DHCP'};
                    }
                    if (isManagementDHCP === false) {
                        paramObject.mgmtIpPoolName =
                                getNameOfGivenParam(paramObject.mgmtIpPoolId, objSelected.pool_data);
                    } else {
                        paramObject.mgmtIpPoolName = {'name': 'DHCP'};
                    }
                    //NETWORKNAME 
                    paramObject.backPlaneNetworkName =
                            getNameOfGivenParam(paramObject.backPlaneNetworkId, objSelected.network_data);

                    paramObject.mgmtNetworkName =
                            getNameOfGivenParam(paramObject.mgmtNetworkId, objSelected.network_data);

                    //CLOUD NAME
                    paramObject.cloudName = objSelected.cloud_data.name;

                    //STORAGE NAME
                    if (isLocalStorage === false) {
                        paramObject.datastoreName =
                                getNameOfGivenParam(paramObject.datastoreId, objSelected.store_data);
                    } else {
                        paramObject.datastoreName = {'name': 'Local'};
                    }

                    //HOST NAME
                    console.log("paramObject.hosts");
                    console.log(paramObject.hosts);
                    console.log(objSelected.host_data);
                    paramObject.hostsWithName = getHostDataWithName(paramObject.hosts,
                            objSelected.host_data);
                    
                    console.log(paramObject.hostsWithName);
                    
                    if($scope.cloudType === 'OPENSTACK'){ //Only if it is openstack.
                        paramObject.tenantName =  getNameOfGivenParam(paramObject.tenantId, objSelected.tenants);
                    }
                   
                    //update rows in Table
                    for(i=0; i<list.length ; i++) {
                        if (list[i].id === deploySpecId) {
                            list[i] = paramObject;
                        }
                    }
                    
                    toastparam = {
                        'heading': 'Deployment Specification updated successfully',
                        'subHeading': 'New Deployment specification with name <b>'+paramObject.name+ '</b> has been updated successfully.',
                        'type': 'success',
                        'timeout': 5000
                    };
                    showToast(toastparam);
                    if(calledFrom === 'Management' || calledFrom === 'Backplane' ){
                        inBetweenNetworkCall = false;
                    }
                    if(calledFrom === 'StorageHost' && callingStorage){
                        inBetweenStorageCall = false;
                    }
                    if(calledFrom === 'StorageHost' && callingHosts){
                        inBetweenHostCall = false;
                    }
                    
                    inBetweenTenantCall = false;
                    

                }, function (error) {
                    //SHOW TOAST WITH FAILURE MESSAGE
                    console.log(error);
                    toastparam = {
                        'heading': 'Deployment Specification update failed',
                        'subHeading': error.data.message,
                        'type': 'fail',
                        'timeout': 10000
                    };
                    showToast(toastparam);
                    if(calledFrom === 'Management'){
                        inBetweenNetworkCall = false;
                        $sessionStorage.deploymentSpecForEdit.mgmtNetworkId = parseInt($sessionStorage.Management.oldSelectedNetworkValue);
                        paramObject.mgmtNetworkId = parseInt($sessionStorage.Management.oldSelectedNetworkValue);
                        $scope.deployment.managementNetwork = parseInt($sessionStorage.Management.oldSelectedNetworkValue);
                        $scope.adornmentData.mgmtNetworkName.name = $sessionStorage.Management.selectedNetworkName;
                    }
                    if(calledFrom === 'Backplane'){
                        inBetweenNetworkCall = false;
                        $sessionStorage.deploymentSpecForEdit.backPlaneNetworkId = parseInt($sessionStorage.Backplane.oldSelectedNetworkValue);
                        paramObject.backPlaneNetworkId = parseInt($sessionStorage.Backplane.oldSelectedNetworkValue);
                        $scope.deployment.backplaneNetwork = parseInt($sessionStorage.Backplane.oldSelectedNetworkValue);
                        $scope.adornmentData.backPlaneNetworkName.name = $sessionStorage.Backplane.selectedNetworkName;
                    }
                    if(calledFrom === 'StorageHost' && callingStorage){
                        inBetweenStorageCall = false;
                        $sessionStorage.deploymentSpecForEdit.datastoreId = parseInt($sessionStorage.Storage.oldSelectedStorageValue);
                        paramObject.datastoreId = parseInt($sessionStorage.Storage.oldSelectedStorageValue);
                        $scope.deployment.storage = parseInt($sessionStorage.Storage.oldSelectedStorageValue);
                        $scope.adornmentData.datastoreName.name = $sessionStorage.Storage.oldSelectedStorageName;
                    }
                    
                    if(calledFrom === 'StorageHost' && callingHosts){
                        inBetweenHostCall = false;
                        $sessionStorage.deploymentSpecForEdit.hosts = $sessionStorage.Host.oldSelectedHosts;
                        paramObject.hosts = $sessionStorage.Host.oldSelectedHosts;
                        $scope.deployment.hosts = $sessionStorage.Host.oldSelectedHosts;
                        $scope.adornmentData.hostsWithName = $sessionStorage.Host.oldSelectedHostNames;
                    }
                    if(callingTenant && $scope.cloudType === 'OPENSTACK'){
                        inBetweenTenantCall = false;
                        $sessionStorage.deploymentSpecForEdit.tenantId = parseInt($sessionStorage.Tenant.oldSelectedTenantValue);
                        paramObject.tenantId = parseInt($sessionStorage.Tenant.oldSelectedTenantValue);
                        $scope.deployment.tenantId = parseInt($sessionStorage.Tenant.oldSelectedTenantValue);
                        $scope.adornmentData.tenantName.name = $sessionStorage.Tenant.oldSelectedTenantName;
                    }
                    
                    /*$scope.deployment.id = parseInt($sessionStorage.deploymentSpecForEdit.id);
                    $scope.deployment.name = $sessionStorage.deploymentSpecForEdit.name;
                    $scope.deployment.infrastructure = parseInt($sessionStorage.deploymentSpecForEdit.cloudid);
                    $scope.deployment.hosts = $sessionStorage.deploymentSpecForEdit.hosts;
                    $scope.deployment.storage = ($sessionStorage.Storage.oldSelectedStorageValue) ? parseInt($sessionStorage.Storage.oldSelectedStorageValue) : 0;
                    $scope.deployment.backplaneIPPool = ($sessionStorage.deploymentSpecForEdit.backPlaneIpPoolId) ? parseInt($sessionStorage.deploymentSpecForEdit.backPlaneIpPoolId) : 0;
                    $scope.deployment.backplaneNetwork = parseInt($sessionStorage.Backplane.oldSelectedNetworkValue);
                    $scope.deployment.managementIPPool = ($sessionStorage.deploymentSpecForEdit.mgmtIpPoolId) ? parseInt($sessionStorage.deploymentSpecForEdit.mgmtIpPoolId) : 0;
                    $scope.deployment.managementNetwork= parseInt($sessionStorage.Management.oldSelectedNetworkValue);*/
                
                    $scope.deployment.id = $sessionStorage.deploymentSpecForEdit.id;
                    $scope.deployment.name = $sessionStorage.deploymentSpecForEdit.name;
                    $scope.deployment.infrastructure = $sessionStorage.deploymentSpecForEdit.cloudid;
                    $scope.deployment.hosts = $sessionStorage.deploymentSpecForEdit.hosts;
                    $scope.deployment.storage = ($sessionStorage.deploymentSpecForEdit.datastoreId) ? $sessionStorage.deploymentSpecForEdit.datastoreId : 0;
                    $scope.deployment.backplaneIPPool = ($sessionStorage.deploymentSpecForEdit.backPlaneIpPoolId) ? $sessionStorage.deploymentSpecForEdit.backPlaneIpPoolId : 0;
                    $scope.deployment.backplaneNetwork = $sessionStorage.deploymentSpecForEdit.backPlaneNetworkId;
                    $scope.deployment.managementIPPool = ($sessionStorage.deploymentSpecForEdit.mgmtIpPoolId) ? $sessionStorage.deploymentSpecForEdit.mgmtIpPoolId : 0;
                    $scope.deployment.managementNetwork= $sessionStorage.deploymentSpecForEdit.mgmtNetworkId;
                    if($scope.cloudType === 'OPENSTACK'){
                        $scope.deployment.region =$sessionStorage.deploymentSpecForEdit.region;
                        $scope.deployment.tenantId = $sessionStorage.deploymentSpecForEdit.tenantId;
                    }
                    //NETWORKNAME 
                    
                    
                    paramObject.backPlaneNetworkName = 
                            getNameOfGivenParam($scope.deployment.backplaneNetwork, objSelected.network_data);

                    paramObject.mgmtNetworkName =
                            getNameOfGivenParam($scope.deployment.managementNetwork, objSelected.network_data);

                    var deploySpecId = paramObject.id;
                    var list = viewData;
                    
                    paramObject.mgmtIpPoolId = $sessionStorage.deploymentSpecForEdit.mgmtIpPoolId;
                    paramObject.backPlaneIpPoolId = $sessionStorage.deploymentSpecForEdit.backPlaneIpPoolId;
                
                    if ($sessionStorage.deploymentSpecForEdit.backPlaneIpPoolId>0) {
                        paramObject.backPlaneIpPoolName =
                                getNameOfGivenParam($sessionStorage.deploymentSpecForEdit.backPlaneIpPoolId, objSelected.pool_data);
                    } else {
                        paramObject.backPlaneIpPoolName = {'name': 'DHCP'};
                    }
                    if ($sessionStorage.deploymentSpecForEdit.mgmtIpPoolId > 0) {
                        paramObject.mgmtIpPoolName =
                                getNameOfGivenParam($sessionStorage.deploymentSpecForEdit.mgmtIpPoolId, objSelected.pool_data);
                    } else {
                        paramObject.mgmtIpPoolName = {'name': 'DHCP'};
                    }
                    //NETWORKNAME 
                    paramObject.backPlaneNetworkName =
                            getNameOfGivenParam($sessionStorage.deploymentSpecForEdit.backPlaneNetworkId, objSelected.network_data);

                    paramObject.mgmtNetworkName =
                            getNameOfGivenParam($sessionStorage.deploymentSpecForEdit.mgmtNetworkId, objSelected.network_data);

                    //CLOUD NAME
                    paramObject.cloudName = objSelected.cloud_data.name;

                    //STORAGE NAME
                    
                    if ($scope.deployment.storage>0) {
                        paramObject.storageIsLocal = false;
                        paramObject.datastoreName =
                                getNameOfGivenParam($scope.deployment.storage, objSelected.store_data);
                    } else {
                        paramObject.storageIsLocal = true;
                        paramObject.datastoreName = {'name': 'Local'};
                    }

                    //HOST NAME
                    paramObject.hostsWithName = getHostDataWithName($sessionStorage.deploymentSpecForEdit.hosts,
                            objSelected.host_data);
                            
                    if($scope.cloudType === 'OPENSTACK'){
                        paramObject.tenantName =  getNameOfGivenParam(paramObject.tenantId, objSelected.tenants);
                    }
                    //update rows
                    for(i=0; i<list.length ; i++) {
                        if (list[i].id === deploySpecId) {
                            list[i] = paramObject;
                        }
                    }
                });                
            };
        //EDIT ENDS. 
        
        //ADD STARTS
        $scope.callpopupToAddDeploySpec = function(ev){
            $mdDialog.show({
                controller: addDeploySpecPopupCtr,
                templateUrl: 'core/components/administration/deployment-specifications/addDeploySpec.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                fullscreen: true, 
                openFrom : {top: 1100, height: 0 },
                closeTo : {left: 1500}
            }).then(function() {

            });            
        };
        
        function addDeploySpecPopupCtr($rootScope, $scope, $sessionStorage,vlanService){
            //FUNCTIONALITY TO ADD DEPLOY SPEC
            $scope.enableRestButtons = false;
            $scope.showMainAddDeployForm = true;
            $scope.showMgmtNetworkForm = false; 
            $scope.showBckplnNetworkForm = false; 
            $scope.showMicroServForm = false;
            $scope.BackplaneFormDone = false;
            $scope.ManagementFormDone = false;
            
            $scope.deployment = {};
            $scope.deployment.backplaneIPPool = -1;
            $scope.deployment.managementIPPool = -1;
            $scope.deployment.storage = 0; //Default Local selected
            $scope.deployment.storageName = "Local";
            $scope.deployment.numberOfHosts = 0;        
            $scope.formInProgress = true;

            $scope.rangesParent = [];
            $scope.newVlan = new Vlan();
            $scope.selectedVlan = null;
            $scope.selectOption = null;

            $scope.hideRightPanel = false;

             $scope.active_help_id = "deploy_spec_title_help_wizard";

            $scope.helpButtonClicked = function(id){
                $scope.active_help_id = id;
                console.log("  helpButtonClicked ");
                $scope.bordcastEventHelpButtonClicked($scope.active_help_id);
            }; 
            $scope.bordcastEventHelpButtonClicked = function(helpId){
                $scope.$broadcast('onHelpButtonClicked', {
                   helpIDString: helpId 
                });
             };  

            $scope.toggleHelpPanel = function () {
                $scope.hideRightPanel = !($scope.hideRightPanel);
            };

            $scope.onOptionChanged = function(value){
              $scope.selectOption = value;
               $scope.newVlan = new Vlan();
              if(value === "new"){
                $scope.selectedVlan = -1;      
              }

              if(value === "existing" || value === "new"){
                   $scope.formInProgress = true;
                 }else if(value ===  "novlan"){
                    $scope.checkFormCompleted();
                }
            }; 


             $scope.$on('newRangeValueChanged', function (event, data) {
             if($scope.newVlan.isPopulated()){
                $scope.checkFormCompleted();
             }
            });

            $scope.onVlanSelected = function(value){
                 $scope.selectedVlan = value;
                 console.log(" onVlanSelected "+$scope.selectedVlan);
                 $scope.selectOption = "existing";
                 $scope.checkFormCompleted();
                 
            };


            $scope.hide = function() {
                $mdDialog.hide();
            };
            $scope.cancel = function() {
                $mdDialog.cancel();
            };
            
            $scope.saveManagementForm = function() {
                console.log($scope.deployment);
                if($scope.deployment.mgmtselectedData === 'existing') {
                    $scope.deployment.managementIPPool = JSON.parse($scope.deployment.managementIPPoolData).id;
                    $scope.deployment.managementIPPoolName = JSON.parse($scope.deployment.managementIPPoolData).name;
                } else {
                    $scope.deployment.managementIPPool = 0;
                    $scope.deployment.managementIPPoolName = 'DHCP';
                }
                $scope.ManagementFormDone = true;
                $scope.showMainAddDeploymentForm();
            };
            
            $scope.saveBackplaneForm = function() {
                console.log($scope.deployment);
                if($scope.deployment.bkplnselectedData === 'existing') {
                    $scope.deployment.backplaneIPPool = JSON.parse($scope.deployment.backplaneIPPoolData).id;
                    $scope.deployment.backplaneIPPoolName = JSON.parse($scope.deployment.backplaneIPPoolData).name;
                } else {
                    $scope.deployment.backplaneIPPool = 0;
                    $scope.deployment.backplaneIPPoolName = 'DHCP';
                }
                $scope.BackplaneFormDone = true;
                $scope.showMainAddDeploymentForm();
            };
            
            
            $scope.showMainAddDeploymentForm = function(){
                $scope.showMainAddDeployForm = true;
                $scope.showMgmtNetworkForm = false;
                $scope.showBckplnNetworkForm = false;
                $scope.showMicroServForm = false;
            };
            
            $scope.showManagmentNetworkDialogForm = function(){
                $scope.showMainAddDeployForm = false;
                $scope.showMgmtNetworkForm = true;
                $scope.showBckplnNetworkForm = false;
                $scope.showMicroServForm = false;
            };
            
            $scope.showBackplaneNetworkDialogForm = function(){
                $scope.showMainAddDeployForm = false;
                $scope.showMgmtNetworkForm = false;
                $scope.showBckplnNetworkForm = true;
                $scope.showMicroServForm = false;
            };
            
            $scope.showMicroserviceHostsDialogForm = function(){
                $scope.showMainAddDeployForm = false;
                $scope.showMgmtNetworkForm = false;
                $scope.showBckplnNetworkForm = false;
                $scope.showMicroServForm = true;
            };
            
            $scope.$on('listenManagementNetwork', function (event, args) {
                console.log('listenManagementNetwork' + args);
                $scope.deployment.managementNetworkSelected = args;
                $scope.deployment.managementNetwork = args.id;
                $scope.deployment.managementNetworkSelectedName = args.name;
                console.log($scope.deployment.managementNetwork);
               
            });
            
            $scope.$on('listenBackplaneNetwork', function (event, args) {
                console.log('listenBackplaneNetwork' + args);
                $scope.deployment.backplaneNetworkSelected = args;
                $scope.deployment.backplaneNetwork = args.id;
                $scope.deployment.backplaneNetworkSelectedName = args.name;
                console.log($scope.deployment.backplaneNetworkSelectedName);
                
            });
            $scope.$on('listenSelectedHosts', function (event, args) {
                var hostIds = [];
                var hostNames = [];
                for(i=0; i<args.length; i++) {
                    hostIds[i] = args[i].id;
                    hostNames[i] = args[i].name;
                }
                $scope.deployment.numberOfHosts = args.length;
                $scope.deployment.selectedHostObjects = args;
                $scope.deployment.hosts = hostIds;
                $scope.deployment.hostNames = hostNames;
                console.log($scope.deployment.hostNames);
                
            });
            $scope.$on('listenSelectedStorages', function (event, args) {
                $scope.deployment.selectedStorage = args;
                $scope.deployment.storage = args.id;
                $scope.deployment.storageName = args.name;
                console.log($scope.deployment.storageName);
                
            });
            $scope.$on('listenSelectedTenants', function (event, args) {
                $scope.deployment.selectedTenants = args;
                $scope.selectedTenants = args;
                $sessionStorage.cloudData.selectedTenants = $scope.selectedTenants;
                $scope.deployment.tenant = args.id;
            });
            $scope.$on('listenSelectedRegion', function (event, args) {
                $scope.deployment.selectedRegion = args;
                $scope.deployment.region = args.id;
                $scope.deployment.regionName = args.name;
                console.log($scope.deployment.storageName);

            });

            
            $scope.showNetworkDialog = function(label, networks, selectedNetworks, ev){
                console.log("Calling Show Network Dialogue");
                $mdDialog.show({
                    skipHide: true,
                    controller: networkPopupController,
                    templateUrl: 'core/components/administration/deployment-specifications/networks.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {'label': label, 'networks' : networks, 'selectedNetworks': selectedNetworks}
                })
                  .then(function() {
                    
                });
            };
            
            function networkPopupController($rootScope, $scope, $sessionStorage, networks, selectedNetworks, label){
                console.log(networks);
                $scope.label = label;
                $scope.networksList = networks;
                $scope.networks = networks;
                console.log(selectedNetworks);
                $scope.selectedNetworkValue = (selectedNetworks)?selectedNetworks.id:0;
                console.log($scope.selectedNetworkValue);
                
                $scope.cancelDialogue = function() {
                    $mdDialog.cancel();
                };
                
                $scope.done = function(){
                    if(label === 'Management') {
                        for(i=0; i < networks.length; i++) {                            
                            if (networks[i].id === parseInt($scope.selectedNetworkValue)) {
                                $rootScope.$broadcast('listenManagementNetwork', networks[i]);
                                $mdDialog.hide();
                            }
                        }
                    } 
                    if(label === 'Backplane') {
                        for(i=0; i < networks.length; i++) {                            
                            if (networks[i].id === parseInt($scope.selectedNetworkValue)) {
                                $rootScope.$broadcast('listenBackplaneNetwork', networks[i]);
                                $mdDialog.hide();
                            }
                        }
                    }
                };
            }
            $scope.startedAddDeploySpec = function(){
                console.log(" startedAddDeploySpec ");
               if($scope.cloudType === 'VMWARE'){
                 if($scope.selectOption){
                     switch($scope.selectOption){
                      case "new":
                       // console.dir($scope.newVlan); 
                       // console.log(" startCreatingDeploymentspec new  1"+$scope.newVlan.isPopulated());

                       if($scope.newVlan && $scope.newVlan.isPopulated())
                       {
                         var data = {
                            "cloudid": parseInt($scope.deployment.infrastructure),
                            "id": 0,
                            "name": $scope.newVlan.name,
                            "ranges": $scope.newVlan.serializeRanges()
                         };
                         // console.log(" startCreatingDeploymentspec new  2"+ $scope.newVlan.serializeRanges()); 
                         vlanService.createVlanPool(data, parseInt($scope.deployment.infrastructure)).then(function(data){
                         // console.log(" startCreatingDeploymentspec new  3"+ data); 
                            $scope.addDeploySpec(parseInt(data));
                         },function(error){
                            console.log("failed to create vlan ");
                         }); 
                       }else{
                         console.log("no new vlan info found");
                       }
                      break;
                      case "existing":
                          console.log(" $scope.selectedVlan "+$scope.selectedVlan); 
                          if($scope.selectedVlan){
                            $scope.addDeploySpec(parseInt($scope.selectedVlan));
                          }else{
                             $scope.addDeploySpec(0);
                          }
                      break;
                       case "novlan":
                         $scope.addDeploySpec(0);
                       break;  
                     }
                  }else{  
                    $scope.addDeploySpec(0);
                  }
               } else {
                $scope.addDeploySpec(0);
               } 
               
            };
            $scope.addDeploySpec = function (vlanId) {
                toastparam = {
                    'heading': 'Deployment Specification creation in progress',
                    'subHeading': 'New Deployment specification creation initiated.',
                    'type': 'progress',
                    'timeout': 25000
                };
                showToast(toastparam);
                    
                console.log($scope.deployment);
                //CALL TO CREATE NEW DEPLOYMENT SPECIFICATION
                var isLocalStorage = false;
                var isBackPlaneDHCP = false;
                var isManagementDHCP = false;

                if (parseInt($scope.deployment.storage) === 0) {
                    isLocalStorage = true;
                }
                if (parseInt($scope.deployment.backplaneIPPool) === 0) {
                    isBackPlaneDHCP = true;
                }
                if (parseInt($scope.deployment.managementIPPool) === 0) {
                    isManagementDHCP = true;
                }

                paramObject = {
                    "backPlaneIpPoolId": parseInt($scope.deployment.backplaneIPPool),
                    "backPlaneIsDhcp": isBackPlaneDHCP,
                    "backPlaneNetworkId": parseInt($scope.deployment.backplaneNetwork),
                    "cloudid": parseInt($scope.deployment.infrastructure),
                    "datastoreId": parseInt($scope.deployment.storage),
                    "hosts": $scope.deployment.hosts,
                    "id": 0,
                    "mgmtIpPoolId": parseInt($scope.deployment.managementIPPool),
                    "mgmtIsDhcp": isManagementDHCP,
                    "mgmtNetworkId": parseInt($scope.deployment.managementNetwork),
                    "name": $scope.deployment.name,
                    "vlanPoolId" : vlanId,
                    // "region": "", //Empty for VMWARE and value will come for OPENSTACK
                    "storageIsLocal": isLocalStorage
                            // "tenantId": 0 //Empty for VMWARE and value will come for OPENSTACK
                };
                console.log("paramObject ");
                console.dir(paramObject);
                if($scope.cloudType === 'OPENSTACK'){
                    paramObject.region = $scope.deployment.region;
                    paramObject.tenantId = $scope.deployment.tenant;
                    paramObject.cloudType = $scope.cloudType;
                }
                if($scope.cloudType === 'AWS') {
                    //paramObject.region = $scope.deployment.region;
                    paramObject.tenantId = $scope.deployment.tenant;
                    paramObject.cloudType = $scope.cloudType;
                    //remove fields not applicable to AWS
                    delete paramObject.backPlaneIpPoolId;
                    delete paramObject.mgmtIpPoolId;
                    delete paramObject.hosts;
                    delete paramObject.storageIsLocal;
                }
                console.log(paramObject);
                var objSelected = $scope.selectedCloudObject;
                $mdDialog.hide();
                deploymentSpecificationService.createDeploymentSpecfication(paramObject).then(function (data) {
                    //UPDATE THE DATA GRID and show TOAST
                    if (isBackPlaneDHCP === false) {
                        paramObject.backPlaneIpPoolName =
                                getNameOfGivenParam(paramObject.backPlaneIpPoolId, objSelected.pool_data);
                    } else {
                        paramObject.backPlaneIpPoolName = {'name': 'DHCP'};
                    }
                    if (isManagementDHCP === false) {
                        paramObject.mgmtIpPoolName =
                                getNameOfGivenParam(paramObject.mgmtIpPoolId, objSelected.pool_data);
                    } else {
                        paramObject.mgmtIpPoolName = {'name': 'DHCP'};
                    }
                    //NETWORKNAME 
                    paramObject.backPlaneNetworkName =
                            getNameOfGivenParam(paramObject.backPlaneNetworkId, objSelected.network_data);

                    paramObject.mgmtNetworkName =
                            getNameOfGivenParam(paramObject.mgmtNetworkId, objSelected.network_data);

                    //CLOUD NAME
                    paramObject.cloudName = objSelected.cloud_data.name;

                    //STORAGE NAME
                    if (isLocalStorage === false) {
                        paramObject.datastoreName =
                                getNameOfGivenParam(paramObject.datastoreId, objSelected.store_data);
                    } else {
                        paramObject.datastoreName = {'name': 'Local'};
                    }

                    //HOST NAME
                    if($scope.cloudType !== 'AWS') {
                        paramObject.hostsWithName = getHostDataWithName(paramObject.hosts,
                            objSelected.host_data);
                    }
                    
                    paramObject.id = data; //Newly created Id
                    
                    if($scope.cloudType !== 'VMWARE'){
                        paramObject.tenantName =  getNameOfGivenParam(paramObject.tenantId, objSelected.tenants);
                    }
                    
                    //ADD IT AT TOP OF TABLE
                    viewData.unshift(paramObject);
                    $rootScope.$broadcast('newDPCreated',{});
                    toastparam = {
                        'heading': 'Deployment Specification created successfully',
                        'subHeading': 'New Deployment specification with name <b>'+paramObject.name+ '</b> has been created successfully. You can see it on the top of table.',
                        'type': 'success',
                        'timeout': 5000
                    };
                    showToast(toastparam);
                    
                    $mdDialog.hide();

                }, function (error) {
                    //SHOW TOAST WITH FAILURE MESSAGE
                    toastparam = {
                        'heading': 'Deployment Specification creation failed',
                        'subHeading': error.data.message,
                        'type': 'fail',
                        'timeout': 5000
                    };
                    showToast(toastparam);
                    //$mdDialog.hide();
                });
            };

            $scope.clouds = [];
            console.log($sessionStorage.infraData);
            for (i = 0; i < $sessionStorage.infraData.length; i++) {
                $scope.clouds[i] = $sessionStorage.infraData[i].cloud_data;
            }
            $scope.checkFormCompleted = function(){
                if($scope.cloudType === 'VMWARE'){
                    if($scope.deployment.infrastructure  && $scope.deployment.name && $scope.deployment.hosts && $scope.deployment.hosts.length > 0 && $scope.deployment.storage >= 0 && ($scope.deployment.backplaneIPPool >=0) && $scope.deployment.backplaneNetwork && ($scope.deployment.managementIPPool >=0) && $scope.deployment.managementNetwork){
                        $scope.formInProgress = false;
                    } else {
                        $scope.formInProgress = true;
                    }
                } else if ( $scope.cloudType === 'OPENSTACK') {
                    if($scope.deployment.infrastructure  && $scope.deployment.name && $scope.deployment.hosts && $scope.deployment.hosts.length > 0 && $scope.deployment.storage >= 0 && ($scope.deployment.backplaneIPPool >=0) && $scope.deployment.backplaneNetwork && ($scope.deployment.managementIPPool >=0) && $scope.deployment.managementNetwork && $scope.deployment.tenant && $scope.deployment.region && $scope.deployment.region.length <= 40){
                        $scope.formInProgress = false;
                    } else {
                        $scope.formInProgress = true;
                    }
                } else if ( $scope.cloudType === 'AWS') {
                    if($scope.deployment.infrastructure  && $scope.deployment.name  && $scope.deployment.backplaneNetwork && $scope.deployment.managementNetwork && $scope.deployment.tenant && $scope.deployment.region) {
                        $scope.formInProgress = false;
                    } else {
                        $scope.formInProgress = true;
                    }
                }

                console.log("called checkFormCompleted, value of formInProgress == "+ $scope.formInProgress);
            };
            $scope.$watch('deployment.name', function() { $scope.checkFormCompleted();});
            $scope.$watch('deployment.storage', function() { $scope.checkFormCompleted();});
            $scope.$watch('deployment.hosts', function() { $scope.checkFormCompleted();});
            $scope.$watch('deployment.backplaneIPPool', function() { $scope.checkFormCompleted();});
            $scope.$watch('deployment.backplaneNetwork', function() { $scope.checkFormCompleted();});
            $scope.$watch('deployment.managementIPPool', function() { $scope.checkFormCompleted();});
            $scope.$watch('deployment.managementNetwork', function() { $scope.checkFormCompleted();});
            $scope.$watch('deployment.region', function() {
                $scope.checkFormCompleted();
                if ($scope.selectedCloudObject !== undefined) {
                    console.log($scope.selectedCloudObject.tenants);
                    console.log($scope.deployment.region);
                    $scope.tenants = _.filter($scope.selectedCloudObject.tenants, {'regionId': $scope.deployment.region});
                    console.log($scope.tenants);
                    $scope.deployment.selectedTenants = $scope.tenants[0];
                    console.log($scope.deployment.selectedTenants);
                    $scope.deployment.tenant = $scope.deployment.selectedTenants.id;
                }
            });

            $scope.$watch('deployment.tenant', function () {
                if ($scope.selectedCloudObject !== undefined && $scope.selectedCloudObject.cloud_data.type === 'AWS') {
                    $scope.networks = _.filter($scope.selectedCloudObject.network_data, {'tenantId': $scope.deployment.tenant});
                }
            });

            
            $scope.$watch('deployment.infrastructure', function () {                
                $scope.deployment.storage = 0;
                $scope.deployment.numberOfHosts = 0;
                $scope.deployment.selectedHostObjects = [];
                $scope.deployment.hosts = [];
                $scope.deployment.hostNames = '';
                $scope.deployment.tenants = [];
                $scope.deployment.regions = [];
                $scope.deployment.selectedTenants = {};
                $scope.deployment.backplaneNetwork = 0;
                $scope.deployment.managementNetwork = 0;
                $scope.deployment.backplaneIPPool = -1;
                $scope.deployment.managementIPPool = -1;
                $scope.BackplaneFormDone = false;
                $scope.ManagementFormDone = false;
                
                $scope.selectedCloudObject = {};
                if ($scope.deployment.infrastructure) {
                    console.log($scope.deployment.infrastructure);
                    //var selectedCloudId = $scope.deployment.infrastructure;
                    for (j = 0; j < $sessionStorage.infraData.length; j++) {
                        if (parseInt($sessionStorage.infraData[j].cloudId) === parseInt($scope.deployment.infrastructure)) {
                            $scope.selectedCloudObject = $sessionStorage.infraData[j];
                        }
                    }
                    $scope.cloudType = $scope.selectedCloudObject.cloud_data.type;
                    if($scope.selectedCloudObject.cloud_data.type === 'OPENSTACK' ){
                            //FOR TESTING NEED TO REMOVE THIS HARDCODED VALUE.
                            if($scope.selectedCloudObject.tenants.length <=0){
                               $scope.selectedCloudObject.tenants = [
                                                                        {
                                                                          "cloudId": $scope.selectedCloudObject.cloudId,
                                                                          "id": $scope.selectedCloudObject.cloudId,
                                                                          "name": "Hardcoded Default For Testing"
                                                                        }
                                                                    ]; 
                            }
                        $scope.tenants = $scope.selectedCloudObject.tenants;
                        $scope.deployment.selectedTenants = $scope.tenants[0];
                        $scope.deployment.tenant = $scope.deployment.selectedTenants.id;
                    }
                    if( $scope.selectedCloudObject.cloud_data.type === 'AWS'){
                        //FOR TESTING NEED TO REMOVE THIS HARDCODED VALUE.
                        $scope.regions = $scope.selectedCloudObject.regions;
                        //$scope.deployment.selectedRegion = $scope.regions[0];
                        //$scope.deployment.region = $scope.deployment.selectedRegion.id;
                    }
                    //$scope.selectedCloudObject = _.find($sessionStorage.infraData, {'cloudId': $scope.deployment.infrastructure});
                    console.log("selected object==");
                    console.log($scope.selectedCloudObject);
                    $scope.hosts = $scope.selectedCloudObject.host_data;
                    var defaultDatastorage = [{
                            "cloudId": $scope.selectedCloudObject.cloudId,
                            "id": 0,
                            "name": "Local"
                        }];
                    $scope.storages = defaultDatastorage.concat($scope.selectedCloudObject.store_data);
                    $scope.deployment.storage = 0; //Default Local selected
                    $scope.deployment.storageName = "Local";
                    /*var defaultIPPool = [{
                            "cloudId": $scope.selectedCloudObject.cloudId,
                            "id": 0,
                            "name": "DHCP"
                        }];
                    $scope.pools = defaultIPPool.concat($scope.selectedCloudObject.pool_data);*/
                    $scope.pools = $scope.selectedCloudObject.pool_data;
                    $scope.networks = $scope.selectedCloudObject.network_data;
                    if($scope.selectedCloudObject.cloud_data.type === 'OPENSTACK') {
                        $scope.deployment.mgmtselectedData = 'dhcp';
                        $scope.deployment.bkplnselectedData = 'dhcp';
                    } else {
                         $scope.deployment.mgmtselectedData = '';
                        $scope.deployment.bkplnselectedData = '';
                    }
                    $scope.checkFormCompleted();
                    $scope.enableRestButtons = true;
                }
            });           
            //$scope.storages = _.find($sessionStorage.hostData, {}) //result = _.find(list, {'id': id});
                $scope.callpopuphost = function(hosts, selectedHosts, ev){
                    console.log(hosts);
                    $mdDialog.show({
                        controller: hostPopupController,
                        skipHide: true,
                        templateUrl: 'core/components/administration/deployment-specifications/hosts.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        locals: {'hosts': hosts, 'selectedHosts': selectedHosts}
                    });
                };
                $scope.callpopupstorage = function(storages, selectedStorage, ev){
                    $mdDialog.show({
                            controller: storagePopupController,
                            skipHide: true,
                            templateUrl: 'core/components/administration/deployment-specifications/storages.tmpl.html',
                            parent: angular.element(document.body),
                            targetEvent: ev,
                            locals: {'storages': storages, 'selectedStorage': selectedStorage}
                        });
                };
            $scope.callpopupregions = function(regions, selectedRegion, ev){
                console.log("In region popup ");
                $mdDialog.show({
                    controller: regionPopupController,
                    skipHide: true,
                    templateUrl: 'core/components/administration/deployment-specifications/regions.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {'regions': regions, 'selectedRegion': selectedRegion}
                });
            };
                /*HOST RELATED FUNCTION*/
                function hostPopupController($rootScope, $scope, $mdDialog, hosts, selectedHosts) {
                        $scope.deployment_designate_host = $translate.instant("wizardinfrastucture.button.designate_host");
                                //$scope.deployment_designate_storage = $translate.instant("wizardinfrastucture.button.designate_storage");
                                //$scope.host_activated = true;
                            (function(){  
                                console.log(hosts);
                                //var selectedHostsList = [];
                                $scope.items = hosts ;
                                $scope.no_of_hosts = hosts.length;
                                
                                $scope.selected = (selectedHosts)?selectedHosts:[];
                                if ($scope.selected) {
                                    $scope.no_of_selected_hosts = $scope.selected.length;
                                } else {
                                    $scope.no_of_selected_hosts = 0;
                                }
                                console.log($scope.selected);
                                $scope.cancelDialogue = function() {
                                    $mdDialog.cancel();
                                };
                                $scope.doneHosts = function() {
                                    $rootScope.$broadcast('listenSelectedHosts', $scope.selected);
                                        $mdDialog.hide();
                                };
                                $scope.toggle = function (item, list) {
                                    var isDeleted = false;
                                    for (i = 0; i < list.length; i++) {
                                        if (list[i].id === item.id) {
                                        list.splice(i, 1);
                                                isDeleted = true;
                                        }
                                    }
                                    if (!isDeleted) {
                                        list.push(item);
                                    }
                                    $scope.no_of_selected_hosts = $scope.selected.length;
                                };
                                    $scope.exists = function (item, list) {
                                        for (i = 0; i < list.length; i++) {
                                            if (list[i].id === item.id) {
                                            return true;
                                            }
                                        }
                                        return false;
                                    };
                                    $scope.isIndeterminate = function () {
                                        return ($scope.selected.length !== 0 &&
                                            $scope.selected.length !== $scope.items.length);
                                    };
                                    $scope.isChecked = function () {
                                        return $scope.selected.length === $scope.items.length;
                                    };
                                    $scope.toggleAll = function () {
                                        if ($scope.selected.length === $scope.items.length) { //uncheck all
                                            $scope.selected = [];
                                        } else if ($scope.selected.length === 0 || $scope.selected.length > 0) {
                                            $scope.selected = $scope.items.slice(0); //check all
                                        }
                                        $scope.no_of_selected_hosts = $scope.selected.length;
                                    };
                                //}
                            })();
                        }

                function storagePopupController($rootScope, $scope, $mdDialog, storages, selectedStorage) {
                    //$scope.deployment_designate_host = $translate.instant("wizardinfrastucture.button.designate_host");
                    $scope.deployment_designate_storage = $translate.instant("wizardinfrastucture.button.designate_storage");
                    $scope.storage_activated = true;
                    (function(){
                        $scope.dataStores = storages;
                        $scope.selectedStoragesValue = (selectedStorage)? selectedStorage.id : 0;
                        $scope.cancelDialogue = function() {
                            $mdDialog.cancel();
                        };
                        $scope.done = function() {
                            console.log($scope.selectedStoragesValue);
                            var storageItems = $scope.dataStores;
                            for (i = 0; i < storageItems.length; i++) {
                                if (storageItems[i].id === parseInt($scope.selectedStoragesValue)) {
                                    console.log(storageItems[i]);
                                    $rootScope.$broadcast('listenSelectedStorages', storageItems[i]);
                                    $mdDialog.hide();
                                }
                            }
                        };
                    })();
                }
            function regionPopupController($rootScope, $scope, $mdDialog, regions, selectedRegion) {
                //$scope.deployment_designate_host = $translate.instant("wizardinfrastucture.button.designate_host");
                $scope.deployment_designate_region = $translate.instant("wizardinfrastucture.button.designate_region");
                $scope.region_activated = true;
                (function(){
                    console.log("Regions: "+regions);
                    $scope.regions = regions;
                    $scope.selectedRegionValue = (selectedRegion)? selectedRegion.id : 0;
                    $scope.cancelDialogue = function() {
                        $mdDialog.cancel();
                    };
                    $scope.done = function() {
                        console.log($scope.selectedRegionValue);
                        var regionItems = $scope.regions;
                        for (i = 0; i < regionItems.length; i++) {
                            if (regionItems[i].id === parseInt($scope.selectedRegionValue)) {
                                console.log(regionItems[i]);
                                $rootScope.$broadcast('listenSelectedRegion', regionItems[i]);
                                $mdDialog.hide();
                            }
                        }
                    };
                })();
            }
                
                $scope.callpopuptenants = function(tenants, selectedTenants, ev){
                    $mdDialog.show({
                        controller: tenantPopupController,
                        skipHide: true,
                        templateUrl: 'core/components/administration/deployment-specifications/tenants.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        locals: {'tenants': tenants, 'selectedTenants': selectedTenants}
                    });
                };

                function tenantPopupController($rootScope, $scope, $mdDialog, selectedTenants, tenants) {

                    $scope.tenant_activated = true;
                    if(!$sessionStorage.cloudData){
                        $sessionStorage.cloudData = {};
                    }
                    console.log(selectedTenants);
                    $sessionStorage.cloudData.selectedTenants = selectedTenants;
                    (function(){
                        $scope.items = $scope.tenants = $sessionStorage.cloudData.tenants = angular.copy(tenants);

                        if(!$sessionStorage.cloudData.selectedTenants.id) {
                            $sessionStorage.cloudData.selectedTenants.id = $scope.items[0].id;
                        }
                        commonPopupfunctions();
                        $scope.tenant_activated = false;

                        function commonPopupfunctions() {
                            $scope.selectedTenantsValue = $sessionStorage.cloudData.selectedTenants.id;
                            $scope.cancelDialogue = function() {
                                $mdDialog.cancel();
                            };

                            $scope.done = function() {
                                var tenantsItems = tenants;
                                for(i=0; i < tenantsItems.length; i++) {                            
                                    if (tenantsItems[i].id === parseInt($scope.selectedTenantsValue)) {
                                        $rootScope.$broadcast('listenSelectedTenants', tenantsItems[i]);
                                        $mdDialog.hide();
                                    }
                                }
                            };
                        }
                    })();
                }
                
            }
        $scope.callCacheBurst = function () {
            console.log('Bursting cache data and reloading from server');
            //$sessionStorage.viewData = false;
            clearMasterSession($sessionStorage, $state);
            
        };
        
        $scope.$on('newDPCreated', function(event){ 
            console.log($scope.query);
            $scope.query.page = 1;
        });
        
        $scope.$on('$viewContentLoaded', function(event){ 
            console.log(event);
            fixContainerHeight(1);
        });
    }
    
    angular.module('shieldxApp').controller('deploymentSpecificationsCtr', deploymentSpecificationsCtr);


})();