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
    function infrastructureConnectorsCtr($scope,
        $translate,
        infrastructureConnectorService,
        ipPoolServices,
        deploymentSpecificationService,
        resourceGroupService,
        vlanService,
        $q,
        $sessionStorage,
        $state,
        $mdDialog,
        userSessionMenagment) {
            "ngInject";
            
            clearAllSession($sessionStorage);
            var InfraListData = [];
            var deferred = $q.defer();
            $scope.promise = deferred.promise; 
            $scope.promiseCompleted = true;
            var promiseCtr = 0;
            var totalClouds = 0;
            $scope.infrasAvailable = false;
            $scope.editMiscState = false;
            //$scope.loadingRelatedData = false;
            /*$scope.freshData = (!$sessionStorage.hasOwnProperty('InfraList') || 
                    typeof $sessionStorage.InfraList === "undefined" || 
                    $sessionStorage.InfraList === false || 
                    $sessionStorage.InfraList.length === 0);*/
            
            var infraCtr = 0;
            $scope.infrastructureConnections = [];

            
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
       
        var create_id = authorities("infrastructureConnectors_create");
        var delete_id = authorities("infrastructureConnectors_delete");
        var update_id = authorities("infrastructureConnectors_update");
        var read_vlanPool = authorities("vlanPools_read");
        var read_deploy = authorities("deploymentSpecifications_read");
        var read_groups = authorities("resourceGroups_read");
        var read_ippool = authorities("ipPools_read");
        $scope.is_read_vlanpool = userSessionMenagment.isUserAllowd(read_vlanPool);
        $scope.is_read_groups = userSessionMenagment.isUserAllowd(read_groups); 
        $scope.is_read_deployspec = userSessionMenagment.isUserAllowd(read_deploy);
        $scope.is_read_ippools = userSessionMenagment.isUserAllowd(read_ippool); 
        $scope.is_create_infra = userSessionMenagment.isUserAllowd(create_id);
        $scope.is_update_infra = userSessionMenagment.isUserAllowd(update_id);
        $scope.is_delete_infra = userSessionMenagment.isUserAllowd(delete_id);


        $scope.updateAdornmentPanel = function (event, rowData, index) {
            $scope.toggleAdornmentPanel();
            $scope.adornmentData = rowData;
            console.log($scope.adornmentData);
            cloudId = rowData.cloud_data.id;
            if($scope.isAdornmentPanelOpen){
                InfraListData[index] = {};
                InfraListData[index].cloud_data = {};
                InfraListData[index].pool_data = {};
                InfraListData[index].deploy_spec_data = [];
                InfraListData[index].group_data = [];
                InfraListData[index].vlan_data = [];
                InfraListData[index].cloud_data = rowData.cloud_data;
                InfraListData[index].status = 'Online';
                $scope.initialadorementDataForObj = InfraListData[index];
                if($scope.is_read_vlanpool)
                    getVlanPoolData(cloudId, InfraListData[index], index);
                if($scope.is_read_groups)
                    getResGroupData(cloudId, InfraListData[index], index);
                if($scope.is_read_deployspec)
                    getDeploymentSpecData(cloudId, InfraListData[index], index);
                if($scope.is_read_ippools)
                    getIpoolData(cloudId, InfraListData[index], index);
            }   
        };

        $scope.toggleAdornmentPanel = function () {
            $scope.isAdornmentPanelOpen = $scope.isAdornmentPanelOpen === false ? true : false;
        };

        $scope.toggleSearchBar = function (event) {
            $scope.isSearchBarOpen = $scope.isSearchBarOpen === false ? true : false;
            if ($scope.isSearchBarOpen)
                angular.element(event.currentTarget.firstElementChild).css('color', '#4a90e2');
            else
                angular.element(event.currentTarget.firstElementChild).css('color', '#6d6e71');
        };
        /* **** for tables [end] **** */

        $scope.showStatus = function (status, test) {
            return status === test;
        };

        //if ($scope.freshData) {
        $sessionStorage.InfraList = [];

        infrastructureConnectorService.getListOfInfrastructures().then(function (data) {
            totalClouds = data.length;
            $scope.infraIntialData = data;
            $scope.promiseCompleted = false;
            deferred.resolve();
            if (totalClouds === 0) {
                $scope.infrasAvailable = false;
            } else {
                $scope.infrasAvailable = true;
                var cloudId = "";
                
                 for (var i = 0; i < $scope.infraIntialData.length; i++) {

                    cloudId = data[i].id;

                    InfraListData[i] = {};
                    InfraListData[i].cloud_data = {};
                    InfraListData[i].pool_data = {};
                    InfraListData[i].deploy_spec_data = [];
                    InfraListData[i].group_data = [];
                    InfraListData[i].vlan_data = [];

                    InfraListData[i].cloud_data = data[i];
                    InfraListData[i].status = 'Online';


                    //GET REST DATA
                    //getRestData(cloudId, InfraListData[i], i);

                }
                $scope.infrastructureConnections = InfraListData;
            }

        }, function (error) {
            console.log(error);
            $scope.errorMessage = "ERROR occured while getting Infrastructure List!!!";
            InfraListData = [];
            $scope.infrastructureConnections = [];
            deferred.resolve();
            $scope.promiseCompleted = false;
            $scope.infrasAvailable = false;
        });
        /*} else {
         $scope.infrastructureConnections = InfraListData = $sessionStorage.InfraList;
         if($sessionStorage.InfraList.length > 0){
         $scope.infrasAvailable = true;
         } else {
         $scope.infrasAvailable = false;
         }
         deferred.resolve();
         $scope.promiseCompleted = false;
         }*/

        getVlanPoolData = function (cloudId, obj, index) {
            $scope.isvlanPoolDataPresent = false;
            $scope.initialadorementDataForObj = obj;
            vlanService.getvlanList(cloudId).then(function (vlanData) {
                obj.vlan_data = vlanData;
                $scope.isvlanPoolDataPresent = true;
                    
               // }
            }, function (error) {
                console.log(error);
                obj.vlan_data = [];
            });
        };
        getResGroupData = function(cloudId, obj, index){
            $scope.isresgroupDataPresent = false;
            $scope.initialadorementDataForObj = obj;
            resourceGroupService.getGroupList(cloudId).then(function (groupData) {
                $scope.isresgroupDataPresent = true;
                obj.group_data = groupData;
            }, function (error) {
                obj.group_data = [];
            });
        };
        getIpoolData = function(cloudId, obj, index){
            $scope.isippoolsDataPresent = false;
            $scope.initialadorementDataForObj = obj;
            ipPoolServices.getIpPoolListByCloudId(cloudId).then(function (ipPoolData) {
                obj.pool_data = ipPoolData;
                $scope.isippoolsDataPresent = true;
            }, function (error) {
                obj.pool_data = [];
            });
        };
        
        getDeploymentSpecData = function(cloudId, obj, index){
            $scope.isdeploymentDataPresent = false;
            $scope.initialadorementDataForObj = obj;
            deploymentSpecificationService.getDeploymentSpecList(cloudId).then(function (deployData) {
                    $scope.isdeploymentDataPresent = true;
                    obj.deploy_spec_data = deployData;
                    $sessionStorage.InfraList[index] = obj;
               }, function (error) {
                    console.log(error);
                    obj.deploy_spec_data = [];

                });
        };
                

                

        $scope.discoverInfraStructure = function (infraObj) {
            var toastparam = {};
            infrastructureConnectorService.discoverInfrastructure(infraObj.cloud_data.id).then(function (data) {
                if (data.status) {
                    toastparam = {
                        'heading': 'Infrastructure connector discovered successfully',
                        'subHeading': '',
                        'type': 'success',
                        'timeout': 5000
                    };
                    showToast(toastparam);

                } else {
                    //TODO to show message/something else;
                    toastparam = {
                        'heading': 'Infrastructure connector discovery failed',
                        'subHeading': "Error:" + data.errorMessage,
                        'type': 'fail',
                        'timeout': 5000
                    };
                    showToast(toastparam);
                }
            }, function (error) {
                console.log(error);
                toastparam = {
                    'heading': 'Infrastructure connector discovery failed',
                    'subHeading': "Something went wrong",
                    'type': 'fail',
                    'timeout': 5000
                };
                showToast(toastparam);
            });
        };

        $scope.deleteInfraStructure = function (infraObj) {
            toastparam = {
                'heading': 'Infrastructure connector deletion in progress',
                'subHeading': 'Infrastructure connector deletion initiated.',
                'type': 'progress',
                'timeout': 15000
            };
            showToast(toastparam);
            console.log(infraObj);
            var toastparam = {};
            infrastructureConnectorService.deleteInfrastructure(infraObj.cloud_data.id).then(function (data) {
                if (data.status) {
                    //update rows
                    for (i = 0; i < InfraListData.length; i++) {
                        if (InfraListData[i].cloud_data.id === infraObj.cloud_data.id) {
                            InfraListData.splice(i, 1);
                        }
                    }
                    $sessionStorage.InfraList = InfraListData;
                    toastparam = {
                        'heading': 'Infrastructure connector deleted successfully',
                        'subHeading': '',
                        'type': 'success',
                        'timeout': 5000
                    };
                    showToast(toastparam);

                } else {
                    //TODO to show message/something else;
                    toastparam = {
                        'heading': 'Infrastructure connector deletion failed',
                        'subHeading': "Error: " + data.errorMessage,
                        'type': 'fail',
                        'timeout': 5000
                    };
                    showToast(toastparam);
                }
            }, function (error) {
                console.log(error);
                toastparam = {
                    'heading': 'Infrastructure connector deletion failed',
                    'subHeading': "Error: " + error.data.errorMessage,
                    'type': 'fail'
                };
                showToast(toastparam);
            });
        };

        $scope.callpopupToAddInfra = function (ev) {
            $mdDialog.show({
                controller: addInfraPopupCtr,
                templateUrl: 'core/components/administration/infrastructure-connectors/addInfra.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                fullscreen: true,
                openFrom: {top: 1100, height: 0},
                closeTo: {left: 1500}
            }).then(function () {

            });
        };

        $scope.clearInfraListFromSession = function () {
            clearMasterSession($sessionStorage, $state);
            /*$sessionStorage.InfraList = false;
             $state.reload();*/
        };


        $scope.editMiscInfraData = function () {
            if(typeof $scope.adornmentData.cloud_data.password !== "undefined") {
                $scope.adornmentData.cloud_data.password = null;
            }
            $scope.tempInfraData = angular.copy($scope.adornmentData.cloud_data);
            $scope.infraFormValid = false;
            $scope.editMiscState = true;
        };

        $scope.discardMiscChanges = function(){
            if (typeof $scope.adornmentData.cloud_data.password !== "undefined") {
                $scope.adornmentData.cloud_data.password = null;
            }
            $scope.editMiscState = false;
        };
        
        var updateInfraStarted = {
            'heading': 'Infrastructure connector update started',
            'subHeading': '&nbsp;',
            'type': 'progress',
            'timeout': 5000
        };

        var infraUpdated = {
            'heading': 'Infrastructure connector updated successfully',
            'subHeading': '&nbsp;',
            'type': 'success',
            'timeout': 5000,
            'callback': function () {
                $state.reload();
            }
        };

        var infraUpdateFailed = {
            'heading': 'Infrastructure connector Update failed',
            'subHeading': '&nbsp;',
            'type': 'fail',
            'timeout': 5000,
            'callback': function () {
                $state.reload();
            }
        };
        
        $scope.updateInfraData = function () {
            if ($scope.editMiscState && $scope.tempInfraData.password) {
                $scope.editMiscState = false;
                var infrastructureObject = {
                    "id": $scope.tempInfraData.id,
                    "ip": $scope.tempInfraData.ip,
                    "name": $scope.tempInfraData.name,
                    "password": $scope.tempInfraData.password,
                    "type": $scope.tempInfraData.type,
                    "username": $scope.tempInfraData.username,
                    "https": $scope.tempInfraData.https,
                    "domain": $scope.tempInfraData.domain
                };
                console.log(infrastructureObject);
                showToast(updateInfraStarted);
                infrastructureConnectorService.updateInfrastructure(infrastructureObject).then(function (response) {
                    showToast(infraUpdated);
                }, function (error) {
                    infraUpdateFailed.subHeading = error.data.message;
                    showToast(infraUpdateFailed);
                });
            }
        };
        
        $scope.pwdType = 'password';
        
        $scope.togglePasswordType = function () {
            $scope.pwdType = $scope.pwdType === 'password' ? 'text' : 'password';
        };

        $scope.infraFormValid = false;
        
        $scope.validateInfraForm =  function () {
            var cloudData = $scope.tempInfraData;
            if (cloudData.type === 'OPENSTACK') {
                if (
                        cloudData.domain &&
                        cloudData.type &&
                        cloudData.name &&
                        cloudData.ip &&
                        cloudData.username &&
                        cloudData.username.length <= 50 && 
                        cloudData.password) {
                    $scope.infraFormValid = true;
                } else {
                    $scope.infraFormValid = false;
                }
            } else if (cloudData.type === 'VMWARE') {
                if (
                        cloudData.type &&
                        cloudData.name &&
                        cloudData.ip &&
                        cloudData.username &&
                        cloudData.username.length <= 50 &&
                        cloudData.password
                        ) {
                    $scope.infraFormValid = true;
                } else {
                    $scope.infraFormValid = false;
                }
            } else if (cloudData.type === 'AWS') {
                if (
                    cloudData.type &&
                    cloudData.name &&
                    cloudData.accessKeyId &&
                    cloudData.secretAccessKey
                ) {
                    $scope.infraFormValid = true;
                } else {
                    $scope.infraFormValid = false;
                }
            }
        };

        function addInfraPopupCtr($rootScope, $scope, $sessionStorage){
            
            //FUNCTIONALITY TO ADD INFRA
            $scope.active_help_id = "infra_type_help_wizard";
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

            $scope.pwdType = 'password';
            $scope.togglePasswordType = function () {
                $scope.pwdType = $scope.pwdType === 'password' ? 'text' : 'password';
            };

            $scope.infrastructure_heading = $translate.instant('wizardinfrastucture.heading.provide_infrastructure_access');
            $scope.infrastructure_subheading = $translate.instant('wizardinfrastucture.subheading.message');

            $scope.infrastucture_type = $translate.instant('wizardinfrastucture.label.infrastructure_type');

            $scope.infrastucture_name = $translate.instant("wizardinfrastucture.placeholder.name");
            $scope.infrastucture_ipaddress_fqdn = $translate.instant("wizardinfrastucture.placeholder.ip_address_fqdn");
            $scope.infrastucture_login = $translate.instant("wizardinfrastucture.placeholder.infrastructure_login");
            $scope.infrastucture_password = $translate.instant("wizardinfrastucture.placeholder.infrastructure_password");
            $scope.create_infrastructure = $translate.instant("wizardinfrastucture.button.create_infrastructure");

            $scope.activLink = 'Infrastructure Access';

            $scope.infra = {
                'types': [
                    {'name': 'VMWARE ESXi', 'value': 'VMWARE'},
                    {'name': 'Amazon AWS', 'value': 'AWS'},
                    {'name': 'OpenStack', 'value': 'OPENSTACK'},
                    {'name': 'MS Azure', 'value': 'MS Azure'}
                ]
            };
            $scope.infrastructure = {};

            $scope.infrastructure.type = 'VMWARE';

            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            
            $scope.hideRightPanel = false;

            $scope.toggleHelpPanel = function () {
                $scope.hideRightPanel = !($scope.hideRightPanel);
            };


            $scope.addInfra = function () {
                console.log($scope.infrastructure);
                var infrastructureObject = $scope.infrastructure;
                var startInfraCreationMessage = {
                    'heading': 'Create Infrastructure Connector',
                    'subHeading': 'This should take only a few minutes max.',
                    'type': 'progress',
                    'timeout': 5000
                };
                var successfulInfraCreationMessage = {
                    'heading': 'Infrastructure Connector Created',
                    'subHeading': 'Infrastructure connector created successfully.',
                    'type': 'success',
                    'timeout': 5000
                };
                var startInfraDiscoveryMessage = {
                    'heading': 'Discovery Started',
                    'subHeading': 'Discovery Started',
                    'type': 'progress',
                    'timeout': 10000
                };

                var completedInfraDiscoveryMessage = {
                    'heading': 'Discovery Completed',
                    'subHeading': 'Discovery Completed',
                    'type': 'success',
                    'timeout': 5000
                };

                var failedInfraDiscoveryMessage = {
                    'heading': 'Discovery Failed',
                    'type': 'fail',
                    'timeout': 5000
                };
                showToast(startInfraCreationMessage);
                infrastructureConnectorService.createInfrastructure(infrastructureObject).then(function (data) {
                    if (data) {
                        var newData = {};
                        newData.cloud_data = infrastructureObject;

                        console.log(InfraListData);
                        showToast(successfulInfraCreationMessage);

                        $sessionStorage.cloudData = {}; //Need new cloudData object and then need new data of this cloud

                        $sessionStorage.cloudData.cloudId = data;
                        infrastructureObject.id = data;
                        $sessionStorage.cloudData.infrastructure = infrastructureObject;
                        $sessionStorage.infrastructure = $sessionStorage.cloudData.infrastructure;
                        $sessionStorage.cloudData.infrastructure.id = data;

                        showToast(startInfraDiscoveryMessage);

                        discoverInfrastructure(infrastructureObject).then(function (data) {
                            showToast(completedInfraDiscoveryMessage);
                            ipPoolServices.getIpPoolListByCloudId(infrastructureObject.id).then(function (ipPoolData) {
                                newData.pool_data = ipPoolData;
                            }, function (error) {
                                console.log(error);
                                newData.pool_data = [];
                            });
                            return data;
                        }, function (error) {
                            failedInfraDiscoveryMessage.subHeading = "Error: " + error.data.message;
                            showToast(failedInfraDiscoveryMessage);
                            console.log(error);
                            //showError
                        });
                        InfraListData.unshift(newData);
                        console.log(InfraListData);
                        $sessionStorage.InfraList = InfraListData;
                        $rootScope.$broadcast('newInfracreated', {});
                    }
                }, function (error) {
                    var failureInfraCreation = {
                        'heading': 'Infrastructure creation failed',
                        'subHeading': "Error: " + error.data.message,
                        'type': 'fail',
                        'timeout': 10000
                    };
                    showToast(failureInfraCreation);
                    $sessionStorage.cloudData = {};
                });
                $mdDialog.hide();
            };

            function discoverInfrastructure(infrastructureObject) {
                var infrastructureId = infrastructureObject.id;
                return infrastructureConnectorService.discoverInfrastructure(infrastructureId).then(function (data) {
                    return data;
                }, function (error) {
                    console.log(error);
                    //showError
                });
            }

            $scope.isFormValid = function () {
                if ($scope.infrastructure.type === 'VMWARE') {
                    //validate form data
                    console.log($scope.infrastructure);
                    if ($scope.infrastructure.type && $scope.infrastructure.name && $scope.infrastructure.ip && $scope.infrastructure.username && $scope.infrastructure.username.length <= 50 && $scope.infrastructure.password) {
                        return true;
                    } else {
                        return false;
                    }
                } else if ($scope.infrastructure.type === 'OPENSTACK'){
                    //OPEN STACK
                    if ($scope.infrastructure.domain && $scope.infrastructure.type && $scope.infrastructure.name && $scope.infrastructure.ip && $scope.infrastructure.username && $scope.infrastructure.username.length <= 50 && $scope.infrastructure.password) {
                        return true;
                    } else {
                        return false;
                    }
                } else if ($scope.infrastructure.type === 'AWS'){
                    //AWS
                    if ($scope.infrastructure.type && $scope.infrastructure.name && $scope.infrastructure.accessKeyId && $scope.infrastructure.secretAccessKey) {
                        return true;
                    } else {
                        return false;
                    }
                }
            };
        }
        $scope.$on('newInfracreated', function (event) {
            console.log($scope.query);
            $scope.query.page = 1;
        });
        $scope.$on('$viewContentLoaded', function (event) {
            console.log(event);
            fixContainerHeight(1);
        });
    }

    angular.module('shieldxApp').controller('infrastructureConnectorsCtr', infrastructureConnectorsCtr);
})();
