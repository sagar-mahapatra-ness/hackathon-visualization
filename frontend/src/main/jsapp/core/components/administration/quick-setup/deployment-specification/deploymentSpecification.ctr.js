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
    function deploymentSpecificationCtr($rootScope, $scope,
        $translate,
        deploymentSpecificationService,
        vlanService,
        $mdDialog, 
        $sessionStorage, 
        $state) {
        "ngInject";        
        
        console.log($sessionStorage.cloudData);
        if(!$sessionStorage.cloudData){
            $sessionStorage.cloudData = {};
            $state.go('landingpage');
        }else{
          if(!$sessionStorage.cloudData.cloudId) {
            console.log('cloud Id not set');
            $state.go('home.quickSetup.quickSetup-begin');
          }
          
          if(!$sessionStorage.cloudData.infrastructure){
              console.log('cloud Id not set');
              $state.go('home.quickSetup.quickSetup-begin');
          }
          if(!$sessionStorage.cloudData.infrastructure.id){
              console.log('cloud Id not set');
              $state.go('home.quickSetup.quickSetup-begin');
          }
          
          if(!$sessionStorage.cloudData.ipPool || !($sessionStorage.cloudData.ipPool.serverData) ){
              console.log('data not set in ipPool');
              $state.go('home.quickSetup.ip-pools-management');
          }
          if(!($sessionStorage.cloudData.ipPool.serverData.managmentNetworkHeaderValue) || !($sessionStorage.cloudData.ipPool.serverData.managmentIPPoolHeaderValue)){
              console.log('data not set in ipPool');
              $state.go('home.quickSetup.ip-pools-management');
          }
          if(!($sessionStorage.cloudData.ipPool.serverData.backpaneIPPoolHeaderValue) || !($sessionStorage.cloudData.ipPool.serverData.backpaneNetworkHeaderValue)){
              console.log('data not set in ipPool');
              $state.go('home.quickSetup.ip-pools-backplane');
          } 
        }
        
        

        $scope.$emit('quickSetupBegun',{});
        
        $scope.active_help_id = "deploy_spec_title_help_wizard";

        $scope.deployment_description = $translate.instant("wizardinfrastucture.placeholder.description");
        $scope.deployment_name = $translate.instant("wizardinfrastucture.placeholder.name");
        
        $scope.deployment_where_host = $translate.instant("wizardinfrastucture.placeholder.where_host_label");
        $scope.deployment_where_host_desc = $translate.instant("wizardinfrastucture.placeholder.where_host_desc");
        
        $scope.deployment_designate_host = $translate.instant("wizardinfrastucture.button.designate_host");
        $scope.deployment_designate_storage = $translate.instant("wizardinfrastucture.button.designate_storage");
       
        $scope.headerValues = [{
            label: 'Connector', value: $sessionStorage.cloudData.infrastructure.name
        }, {
            label: 'Infrastructure', value: $sessionStorage.cloudData.infrastructure.ip
        },{
            label: 'Management Network', value: $sessionStorage.cloudData.ipPool.serverData.managmentNetworkHeaderValue
        },{
            label: 'Management IP Pool', value:$sessionStorage.cloudData.ipPool.serverData.managmentIPPoolHeaderValue 
        },{
            label: 'Backplane Network', value: $sessionStorage.cloudData.ipPool.serverData.backpaneNetworkHeaderValue
        },{
            label: 'Backplane IP Pool', value: $sessionStorage.cloudData.ipPool.serverData.backpaneIPPoolHeaderValue
        }];
        
        var cloudId = $sessionStorage.cloudData.cloudId;
        $scope.cloudId = cloudId;
        $scope.cloudType = $sessionStorage.cloudData.infrastructure.type;
        //$scope.cloudType = 'OPENSTACK';        
        $scope.deployment = {};
        if(!$sessionStorage.cloudData.deploySpec){
            $sessionStorage.cloudData.deploySpec ={};
        }
        if(!$sessionStorage.cloudData.deploySpec.serverData){
            $sessionStorage.cloudData.deploySpec.serverData ={};
        }
        if($sessionStorage.cloudData.selectedHosts) {
            $scope.selectedHosts = $sessionStorage.cloudData.selectedHosts; 
        } else {
            $scope.selectedHosts = [];
        }
        
        if($sessionStorage.cloudData.selectedStorages) {
            $scope.selectedStorages = $sessionStorage.cloudData.selectedStorages; 
        } else {
            $sessionStorage.cloudData.selectedStorages = {
                    "cloudId": cloudId,
                    "id": 0,
                    "name": "Local"
                };
            $scope.selectedStorages = $sessionStorage.cloudData.selectedStorages; 
        }
        
        if($sessionStorage.cloudData.deploySpec.serverData.name) {
            $scope.deployment.name = $sessionStorage.cloudData.deploySpec.serverData.name;
            $scope.deployment.region = $sessionStorage.cloudData.deploySpec.serverData.region;
        } else {
            $scope.deployment.name = '';
            $scope.deployment.region = '';
        }
        
        if($sessionStorage.cloudData.deploySpec.serverData.descr) {
           $scope.deployment.description = $sessionStorage.cloudData.deploySpec.serverData.descr;
        }  else {
            $scope.deployment.description = '';
        }

        $scope.checkNext = function(){
            if($scope.cloudType !== 'OPENSTACK'){
                if(($scope.deployment.name) && ($scope.deployment.name.length > 0) && ($scope.selectedHosts.length > 0) && ($scope.selectedStorages))
                {
                    console.log("enable next ");
                    $scope.enableNextButton();
                } else {
                    $scope.disableNextButton();
                }
            } else {
                if(($scope.deployment.name) && ($scope.deployment.name.length > 0) && ($scope.selectedHosts.length > 0) && ($scope.selectedStorages) && ($scope.deployment.tenant) && ($scope.deployment.region) && ($scope.deployment.region.length <= 40))
                {
                    console.log("enable next ");
                    $scope.enableNextButton();
                } else {
                    $scope.disableNextButton();
                }
            }
        };

        /// vlane specific logic
        $scope.rangesParent = [];
        $scope.newVlan = new Vlan();
        $scope.selectedVlan = null;
        $scope.selectOption = null;

        $scope.onOptionChanged = function(value){
          $scope.selectOption = value;
          $sessionStorage.cloudData.deploySpec.vlan.selectOption =  $scope.selectOption;
           $scope.newVlan = new Vlan();
           $sessionStorage.cloudData.deploySpec.vlan.newVlan = $scope.newVlan;

          if(value === "new"){
            $scope.selectedVlan = -1;
            $sessionStorage.cloudData.deploySpec.vlan.selectedVlan = $scope.selectedVlan;
          }

          if(value === "existing" || value === "new"){
            $scope.disableNextButton();
          }else if(value ===  "novlan"){
             $scope.checkNext();
          }
          
        }; 

        $scope.onVlanSelected = function(value){
             $scope.selectedVlan = value;
             console.log(" onVlanSelected "+$scope.selectedVlan);
             $scope.selectOption = "existing";
             $sessionStorage.cloudData.deploySpec.vlan.selectOption =  $scope.selectOption;
              $sessionStorage.cloudData.deploySpec.vlan.selectedVlan = $scope.selectedVlan;
              $scope.checkNext();
        };

        $scope.$on('newRangeValueChanged', function (event, data) {
             if($scope.newVlan.isPopulated()){
                $scope.checkNext();
             }
        });
        
        if($sessionStorage.cloudData.deploySpec.vlan){

          if($sessionStorage.cloudData.deploySpec.vlan.selectOption){
            $scope.selectOption  = $sessionStorage.cloudData.deploySpec.vlan.selectOption;
            console.log("vlan selectOption "+$scope.selectOption);
            console.dir("vlan selectedVlan "+$scope.selectedVlan);
          }

          if($sessionStorage.cloudData.deploySpec.vlan.selectedVlan){   
            $scope.selectedVlan = $sessionStorage.cloudData.deploySpec.vlan.selectedVlan;
          }

          if($sessionStorage.cloudData.deploySpec.vlan.newVlan){
            if(!$sessionStorage.cloudData.deploySpec.vlan.newVlan.id){
              var nvlan = new Vlan();
              nvlan.diserialize($sessionStorage.cloudData.deploySpec.vlan.newVlan);
              $scope.selectedVlan  = $sessionStorage.cloudData.deploySpec.vlan.selectedVlan;
              $scope.newVlan = nvlan;
              $sessionStorage.cloudData.deploySpec.vlan.newVlan = $scope.newVlan;

             if($scope.newVlan.isPopulated()){
                $scope.checkNext();
              } else{
                $scope.disableNextButton();
              }
            } else
            {
              $scope.selectOption = "existing";
              $sessionStorage.cloudData.deploySpec.vlan.selectOption = $scope.selectOption; 
              $scope.selectedVlan = $sessionStorage.cloudData.deploySpec.vlan.newVlan.id;
              $sessionStorage.cloudData.deploySpec.vlan.selectedVlan = $scope.selectedVlan;
              if($scope.selectedVlan){
                $scope.checkNext();
              } else{
                $scope.disableNextButton();
              }
            }
            
          }
          
        }else {
           $sessionStorage.cloudData.deploySpec.vlan = {}; 
        }   


        //$scope.cloudType = 'OPENSTACK'; //NEED TO REMOVE AFTERWARD
        if($scope.cloudType === 'OPENSTACK'){
            //call to get all available tenant for cloudId
            if(!$sessionStorage.cloudData.tenants){
                deploymentSpecificationService.getTenants(cloudId).then(function(data){
                    $scope.tenants = data;
                    $sessionStorage.cloudData.tenants = data;
                    $scope.deployment.tenant = $scope.tenants[0].id;
                    $scope.selectedTenants = $scope.tenants[0];
                }, function(error){
                    console.log(error);
                    $scope.tenants = [];
                });
            } else {
                $scope.tenants = $sessionStorage.cloudData.tenants;
                if($sessionStorage.cloudData.deploySpec.serverData.selectedTenant){
                    $scope.deployment.tenant = $sessionStorage.cloudData.deploySpec.serverData.selectedTenant;
                    $scope.selectedTenants = _.find($scope.tenants, function(o) { return o.id === $scope.deployment.tenant; });
                } else {
                    $scope.deployment.tenant = $scope.tenants[0].id;
                    $scope.selectedTenants = $scope.tenants[0];
                }
            }
            
        }
        
        $scope.numberOfHosts = ($sessionStorage.cloudData.selectedHostsCount)?$sessionStorage.cloudData.selectedHostsCount:0;    
        $scope.$on('listenSelectedHosts', function (event, args) {
            $scope.selectedHosts = args;
            $scope.numberOfHosts = args.length;
            $scope.checkNext();
        });
        
        $scope.$on('listenSelectedStorages', function (event, args) {
            $scope.selectedStorages = args;
            $scope.checkNext();
        });
        
        $scope.$on('listenSelectedTenants', function (event, args) {
            $scope.selectedTenants = args;
            $scope.deployment.tenant = args.id;
            $scope.checkNext();
        });
        
        
        $scope.$watch('deployment.name',function(){
             $scope.checkNext();
        });
        if($scope.cloudType === 'OPENSTACK'){
            $scope.$watch('deployment.region',function(){
                 $scope.checkNext();
            });
        }

     
         
        
        
        $scope.$on('nextClicked', function(event, data){
            data.stopNextClick = true;
//            if($scope.cloudType !== 'OPENSTACK'){
//                if( $scope.deployment.name !== $sessionStorage.cloudData.deploySpec.serverData.name) {
                    $scope.startCreatingDeploymentspec();
//                } else {
//                    $sessionStorage.cloudData.savedState = $state.current.name;
//                    $state.go('home.quickSetup.virtual-chassis');
//                }
//            } else {
//                if( $scope.deployment.name !== $sessionStorage.cloudData.deploySpec.serverData.name || $scope.deployment.tenant !== $sessionStorage.cloudData.deploySpec.serverData.selectedTenant || $sessionStorage.cloudData.deploySpec.serverData.region !== $scope.deployment.region) {
                    //$scope.startCreatingDeploymentspec();
//                } else {
//                    $sessionStorage.cloudData.savedState = $state.current.name;
//                    $state.go('home.quickSetup.virtual-chassis');
//                }
//            }
        });
        $scope.startCreatingDeploymentspec = function(){
           $scope.hideNextButton();
           console.log(" startCreatingDeploymentspec "+$scope.selectOption); 
           if($scope.cloudType === 'VMWARE'){
              if($scope.selectOption){
                 switch($scope.selectOption){
                  case "new":
                   // console.dir($scope.newVlan); 
                   // console.log(" startCreatingDeploymentspec new  1"+$scope.newVlan.isPopulated());

                   if($scope.newVlan && $scope.newVlan.isPopulated())
                   {
                     var data = {
                        "cloudid": parseInt($sessionStorage.cloudData.cloudId),
                        "id": 0,
                        "name": $scope.newVlan.name,
                        "ranges": $scope.newVlan.serializeRanges()
                     };
                    if (typeof $sessionStorage.qSdeploySpecvlanData === "undefined" ||
                            !$sessionStorage.qSdeploySpecvlanDataId) {
                        $sessionStorage.qSdeploySpecvlanData = angular.copy(data);

                        // console.log(" startCreatingDeploymentspec new  2"+ $scope.newVlan.serializeRanges()); 
                        vlanService.createVlanPool(data, $sessionStorage.cloudData.cloudId).then(function(data){
                        // console.log(" startCreatingDeploymentspec new  3"+ data);
                           $scope.newVlan.id =  parseInt(data);
                           $sessionStorage.qSdeploySpecvlanDataId = parseInt(data);
                           $scope.createdeploymentspecification(parseInt(data));
                        },function(error){
                          console.log("failed to create vlan ");
                          toastparam = {
                              'heading': 'VLAN pool creation failed',
                              'subHeading': "Error: " + error.data.message,
                              'type': 'fail',
                              'timeout': 5000
                          };
                          showToast(toastparam);
                          $scope.showNextButton();
                          $scope.enableNextButton();
                        }); 
                    } else if (!_.isEqual($sessionStorage.qSdeploySpecvlanData, data)) {
                        data.id = $sessionStorage.qSdeploySpecvlanDataId;
                        vlanService.updateVlanPool(data).then(function(data){
                        // console.log(" startCreatingDeploymentspec new  3"+ data);
                           $scope.newVlan.id =  parseInt(data);
                           $sessionStorage.qSdeploySpecvlanDataId = parseInt(data);
                           $scope.createdeploymentspecification(parseInt(data));
                        },function(error){
                          console.log("failed to create vlan ");
                          toastparam = {
                              'heading': 'VLAN pool creation failed',
                              'subHeading': "Error: " + error.data.message,
                              'type': 'fail',
                              'timeout': 5000
                          };
                          showToast(toastparam);
                          $scope.showNextButton();
                          $scope.enableNextButton();  
                        }); 
                    } else if (_.isEqual($sessionStorage.qSdeploySpecvlanData, data)) {
                        $scope.createdeploymentspecification(parseInt($sessionStorage.qSdeploySpecvlanData.id));
                    }
                   }else{
                     console.log("no new vlan info found");
                   }
//               }
                  break;
                  case "existing":
                       //console.log(" $scope.selectedVlan "+$scope.selectedVlan); 
                      if($scope.selectedVlan){
                        $scope.createdeploymentspecification(parseInt($scope.selectedVlan));
                      }else{
                         $scope.createdeploymentspecification(0);
                      }
                  break; 
                  case "novlan":
                    $scope.createdeploymentspecification(0);
                  break; 

                 }
              }else{  
                $scope.createdeploymentspecification(0);
              }
           }else {
            $scope.createdeploymentspecification(0);
           } 
           
        };
        $scope.createdeploymentspecification = function(vlanId){
            $sessionStorage.cloudData.savedState = $state.current.name;
            var selected_host_ids = [];
            var selected_storage_ids = [];
            for(i=0; i < $sessionStorage.cloudData.selectedHosts.length; i++) {
                selected_host_ids[i] = $sessionStorage.cloudData.selectedHosts[i].id;
            }
            
            if ($sessionStorage.cloudData.selectedStorages.id !== 0) {
                selected_storage_ids = $sessionStorage.cloudData.selectedStorages.id;            
                $sessionStorage.cloudData.deploySpec.serverData.storageIsLocal = false;
            } else {
                selected_storage_ids = 0;            
                $sessionStorage.cloudData.deploySpec.serverData.storageIsLocal = true;
            }
            $sessionStorage.cloudData.deploySpec.serverData.name = $scope.deployment.name;
            $sessionStorage.cloudData.deploySpec.serverData.descr = $scope.deployment.description;
            /*
             {
  "backPlaneIpPoolId": 0,
  "backPlaneIsDhcp": true,
  "backPlaneNetworkId": 0,
  "cloudid": 0,
  "datastoreId": 0,
  "descr": "string",
  "hosts": [
    0
  ],
  "id": 0,
  "mgmtIpPoolId": 0,
  "mgmtIsDhcp": true,
  "mgmtNetworkId": 0,
  "name": "string",
  "region": "string",
  "storageIsLocal": true,
  "tenantId": 1
}
             */
            var paramObject = {
                "backPlaneIpPoolId": $sessionStorage.cloudData.ipPool.serverData.backPlaneIpPoolId,
                "backPlaneIsDhcp": $sessionStorage.cloudData.ipPool.serverData.backPlaneIsDhcp,
                "backPlaneNetworkId": parseInt($sessionStorage.cloudData.ipPool.serverData.backPlaneNetworkId),
                "cloudid": $sessionStorage.cloudData.cloudId,
                "datastoreId": selected_storage_ids,
                "descr": $sessionStorage.cloudData.deploySpec.serverData.descr,
                "hosts": selected_host_ids,
                "id": 0,
                "mgmtIpPoolId": parseInt($sessionStorage.cloudData.ipPool.serverData.mgmtIpPoolId),
                "mgmtIsDhcp": $sessionStorage.cloudData.ipPool.serverData.mgmtIsDhcp,
                "mgmtNetworkId": parseInt($sessionStorage.cloudData.ipPool.serverData.mgmtNetworkId),
                "name": $sessionStorage.cloudData.deploySpec.serverData.name,
               // "region": "", //Empty for VMWARE and value will come for OPENSTACK
                "storageIsLocal": $sessionStorage.cloudData.deploySpec.serverData.storageIsLocal,
                "vlanPoolId" : vlanId
               // "tenantId": 0 //Empty for VMWARE and value will come for OPENSTACK
            };
            if($scope.cloudType === 'OPENSTACK'){
                $sessionStorage.cloudData.deploySpec.serverData.region = $scope.deployment.region;
                $sessionStorage.cloudData.deploySpec.serverData.selectedTenant = $scope.deployment.tenant;
                if($sessionStorage.cloudData.deploySpec.serverData.region){
                    paramObject.region = $sessionStorage.cloudData.deploySpec.serverData.region;
                }
                paramObject.tenantId = $sessionStorage.cloudData.deploySpec.serverData.selectedTenant;
            }
            if (!$sessionStorage.qSdeploySpecvData) {
                $sessionStorage.qSdeploySpecvData = angular.copy(paramObject);
            }
            $sessionStorage.qSdeploySpecvData.id = 0;
            if (!$sessionStorage.qSdeploySpecvDataId) {
                var toastparam = {
                    'heading': 'Deployment Specification creation started',
                    'subHeading': "This should take only a few minutes max.",
                    'type': 'progress',
                    'timeout': 5000
                };            
                showToast(toastparam);

                deploymentSpecificationService.createDeploymentSpecfication(paramObject).then(function (data) {
                    if (data) {
                        toastparam = {
                            'heading': 'Deployment Specification created successfully',
                            'subHeading': "",
                            'type': 'success',
                            'timeout': 2000,
                            'callback': function () {
                                $state.go('home.quickSetup.virtual-chassis');
                                $scope.showNextButton();
                                $scope.enableNextButton();
                            }
                        };
                        showToast(toastparam);
                        $sessionStorage.qSdeploySpecvDataId = data;
                        $sessionStorage.cloudData.deploySpec.serverData.deploymentSpecId = data;
                        //$state.go('home.quickSetup.virtual-chassis');
                    }
                }, function (error) {
                    console.log(error);
                    toastparam = {
                        'heading': 'Deployment Specification creation failed',
                        'subHeading': "Error: " + error.data.message,
                        'type': 'fail',
                        'timeout': 5000
                    };
                    showToast(toastparam);
                    $scope.showNextButton();
                    $scope.enableNextButton();
                });
            } else if (!_.isEqual($sessionStorage.qSdeploySpecvData, paramObject)) {
                console.log(" update deployspec >>>>>>>>>>>>>>>>>>");
                $sessionStorage.qSdeploySpecvData.id = $sessionStorage.qSdeploySpecvDataId;
                paramObject.id = $sessionStorage.qSdeploySpecvDataId;
                $sessionStorage.qSdeploySpecvlanData = angular.copy(paramObject);
                deploymentSpecificationService.updateDeploymentSpecfication(paramObject).then(function (data) {
                    $sessionStorage.qSdeploySpecvDataIdId = data;
                    $sessionStorage.qSdeploySpecvData = angular.copy(paramObject);
                    $sessionStorage.cloudData.deploySpec.serverData.deploymentSpecId = $sessionStorage.qSdeploySpecvDataId;
                    toastparam = {
                        'heading': 'Deployment Specification updated successfully',
                        'subHeading': "",
                        'type': 'success',
                        'timeout': 2000,
                        'callback': function () {
                            $state.go('home.quickSetup.virtual-chassis');
                            $scope.showNextButton();
                            $scope.enableNextButton();
                        }
                    };
                    showToast(toastparam);
                    //$state.go('home.quickSetup.virtual-chassis');
                }, function (error) {
                    console.log(error);
                    toastparam = {
                        'heading': 'Deployment Specification update failed',
                        'subHeading': "Error: " + error.data.message,
                        'type': 'fail',
                        'timeout': 5000
                    };
                    showToast(toastparam);
                    $scope.showNextButton();
                    $scope.enableNextButton();
                });
            } else  {
                $state.go('home.quickSetup.virtual-chassis');
                $scope.showNextButton();
                $scope.enableNextButton();
            }
        };
        
        $scope.hideNextButton = function () {
            angular.element(document.querySelector('.qs-progress')).css('display', 'block');
            angular.element(document.querySelector('.qs-next')).css('display', 'none');
        };

        $scope.showNextButton = function () {
            angular.element(document.querySelector('.qs-progress')).css('display', 'none');
            angular.element(document.querySelector('.qs-next')).css('display', 'block');
        };

        $scope.callpopuphost = function(ev){
            $mdDialog.show({
            controller: hostPopupController,
            templateUrl: 'core/components/administration/quick-setup/deployment-specification/hosts.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev
          })
          .then(function() {
             $sessionStorage.cloudData.selectedHosts = $scope.selectedHosts;
             $sessionStorage.cloudData.selectedHostsCount = $scope.selectedHosts.length;
          });
        };
        
        $scope.callpopupstorage = function(ev){
            $mdDialog.show({
            controller: storagePopupController,
            templateUrl: 'core/components/administration/quick-setup/deployment-specification/storages.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev
          })
          .then(function() {
             console.log($scope.selectedStorages);
             $sessionStorage.cloudData.selectedStorages = $scope.selectedStorages;
             console.log($sessionStorage.cloudData.selectedStorages);
          });
        };
        
        
        /*HOST RELATED FUNCTION*/
        function hostPopupController($rootScope, $scope, $mdDialog) {
            $scope.deployment_designate_host = $translate.instant("wizardinfrastucture.button.designate_host");
            //$scope.deployment_designate_storage = $translate.instant("wizardinfrastucture.button.designate_storage");
              $scope.host_activated = true;
              $scope.selectHostBridge = new MethodBridge();
                if (!$sessionStorage.cloudData.hosts) {
                    deploymentSpecificationService.getHosts(cloudId).then(function(data){
                        $sessionStorage.cloudData.hosts = data;
                        $scope.items = $scope.hosts = data;
                        $scope.selectHostBridge.call($scope.items);
                        $scope.no_of_hosts = $scope.hosts.length;
                        commonPopupfunctions();
                        $scope.host_activated = false;
                    }, function(error) {
                        var data = [];
                        console.log(error) ;
                        $sessionStorage.cloudData.hosts = data;
                        $scope.items = $scope.hosts = data;
                        $scope.no_of_hosts = $scope.hosts.length;
                        commonPopupfunctions();
                        $scope.host_activated = false;
                    });
                } else {
                    $scope.items = $scope.hosts = $sessionStorage.cloudData.hosts;
                    $scope.no_of_hosts = $scope.hosts.length;
                    commonPopupfunctions();
                    $scope.host_activated = false;
                }
                
                function commonPopupfunctions() {
                    $scope.selected = ($sessionStorage.cloudData.selectedHosts) ? angular.copy($sessionStorage.cloudData.selectedHosts) : [];
                    if($scope.selected) {
                        $scope.no_of_selected_hosts = $scope.selected.length;
                    } else {
                       $scope.no_of_selected_hosts = 0; 
                    }
                    console.log($scope.selected);
                    $scope.cancelDialogue = function() {
                        $mdDialog.cancel();
                    };

                    $scope.done = function() {
                        $rootScope.$broadcast('listenSelectedHosts', $scope.selected);
                        $mdDialog.hide();
                    };

                    $scope.toggle = function (item, list) {
                        
                        var isDeleted = false;
                        
                        for(i=0; i<list.length ; i++) {
                            if (list[i].id === item.id) {
                                list.splice(i, 1);
                                isDeleted = true;
                            }
                        }
                        if(!isDeleted) {
                            list.push(item);
                        }
                        $scope.no_of_selected_hosts = $scope.selected.length;
                    };
                    $scope.exists = function (item, list) {
                        for(i=0; i<list.length ; i++) {
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
                }
            
        }
            
        function storagePopupController($rootScope, $scope, $mdDialog) {
            //$scope.deployment_designate_host = $translate.instant("wizardinfrastucture.button.designate_host");
            $scope.deployment_designate_storage = $translate.instant("wizardinfrastucture.button.designate_storage");
            $scope.storage_activated = true;
            $scope.selectStorageBridge = new MethodBridge();
            (function(){   
                var defaultDatastorage = [{
                        "cloudId": cloudId,
                        "id": 0,
                        "name": "Local"
                }];
                if (!$sessionStorage.cloudData.datastores) {
                    deploymentSpecificationService.getDatastore(cloudId).then(function(data){
                        $sessionStorage.cloudData.datastores = defaultDatastorage.concat(data);
                        $scope.items = $scope.dataStores = $sessionStorage.cloudData.datastores;  
                        $scope.selectStorageBridge.call($scope.items);                   
                        $sessionStorage.cloudData.selectedStorages.id = 0;
                        commonPopupfunctions();
                        $scope.storage_activated = false;
                    }, function(error) {
                        console.log(error);
                        var data = [];
                        $sessionStorage.cloudData.datastores = defaultDatastorage.concat(data);
                        $scope.items = $scope.dataStores = $sessionStorage.cloudData.datastores;
                        $sessionStorage.cloudData.selectedStorages.id = 0;
                        commonPopupfunctions();
                        $scope.storage_activated = false;
                    });
                } else {
                    $scope.items = $scope.dataStores = $sessionStorage.cloudData.datastores;
                    commonPopupfunctions();
                    $scope.storage_activated = false;
                }
                
                function commonPopupfunctions() {
                    $scope.selectedStoragesValue = $sessionStorage.cloudData.selectedStorages.id;
                    $scope.cancelDialogue = function() {
                        $mdDialog.cancel();
                    };

                    $scope.done = function() {
                        var storageItems = $scope.items;
                        for(i=0; i < storageItems.length; i++) {                            
                            if (storageItems[i].id === parseInt($scope.selectedStoragesValue)) {
                                $rootScope.$broadcast('listenSelectedStorages', storageItems[i]);
                                $mdDialog.hide();
                            }
                        }
                    };
                }
            })();
        }
        
        $scope.callpopuptenants = function(ev){
            $mdDialog.show({
            controller: tenantPopupController,
            templateUrl: 'core/components/administration/quick-setup/deployment-specification/tenants.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev
          })
          .then(function() {
             console.log($scope.selectedTenants);
             $sessionStorage.cloudData.selectedTenants = $scope.selectedTenants;
             console.log($sessionStorage.cloudData.selectedTenants);
          });
        };
        
        function tenantPopupController($rootScope, $scope, $mdDialog) {
            //$scope.deployment_designate_host = $translate.instant("wizardinfrastucture.button.designate_host");
            //$scope.deployment_designate_storage = $translate.instant("wizardinfrastucture.button.designate_storage");
            $scope.tenant_activated = true;
            if(!$sessionStorage.cloudData.selectedTenants) {
                $sessionStorage.cloudData.selectedTenants = {};
            }
            (function(){
                if (!$sessionStorage.cloudData.tenants) {
                    deploymentSpecificationService.getTenants(cloudId).then(function(data){
                        //$sessionStorage.cloudData.datastores = defaultDatastorage.concat(data);
                        $scope.items = $scope.tenants = $sessionStorage.cloudData.tenants = data;                        
                        console.log($scope.items);
                        if(!$sessionStorage.cloudData.selectedTenants.id) {
                            $sessionStorage.cloudData.selectedTenants.id = $scope.items[0].id;
                        }
                        console.log($sessionStorage.cloudData);
                        commonPopupfunctions();
                        $scope.tenant_activated = false;
                    }, function(error) {
                        console.log(error);
                        var data = [];

                        $scope.items = $scope.tenants = $sessionStorage.cloudData.tenants;
                        $sessionStorage.cloudData.selectedTenants.id = $scope.items[0].id;
                        commonPopupfunctions();
                        $scope.tenant_activated = false;
                    });
                } else {
                    $scope.items = $scope.tenants = $sessionStorage.cloudData.tenants;
                    console.log($scope.items);
                    if(!$sessionStorage.cloudData.selectedTenants.id) {
                        $sessionStorage.cloudData.selectedTenants.id = $scope.items[0].id;
                    }
                    commonPopupfunctions();
                    $scope.tenant_activated = false;
                }
                
                function commonPopupfunctions() {
                    $scope.selectedTenantsValue = $sessionStorage.cloudData.selectedTenants.id;
                    $scope.cancelDialogue = function() {
                        $mdDialog.cancel();
                    };

                    $scope.done = function() {
                        var tenantsItems = $scope.items;
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
        fixContainerHeight(4);
        $scope.setFocusOnElem('#deploymentNameID');
    }
    angular.module('shieldxApp').controller('deploymentSpecificationCtr', deploymentSpecificationCtr);
})();