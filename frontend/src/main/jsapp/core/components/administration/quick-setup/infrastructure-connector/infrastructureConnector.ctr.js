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
    function infrastructureConnectorCtr($scope,
            $translate,
            infrastructureConnectorService,
            $mdToast,
            $sessionStorage,
            $state) {
        "ngInject";

        $scope.$emit('quickSetupBegun', {});
        $scope.infrastructure_heading = $translate.instant('wizardinfrastucture.heading.provide_infrastructure_access');
        $scope.infrastructure_subheading = $translate.instant('wizardinfrastucture.subheading.message');

        $scope.infrastucture_type = $translate.instant('wizardinfrastucture.label.infrastructure_type');

        $scope.infrastucture_name = $translate.instant("wizardinfrastucture.placeholder.name");
        $scope.infrastucture_ipaddress_fqdn = $translate.instant("wizardinfrastucture.placeholder.ip_address_fqdn");
        $scope.infrastucture_login = $translate.instant("wizardinfrastucture.placeholder.infrastructure_login");
        $scope.infrastucture_password = $translate.instant("wizardinfrastucture.placeholder.infrastructure_password");
        $scope.create_infrastructure = $translate.instant("wizardinfrastucture.button.create_infrastructure");

        $scope.activLink = 'Infrastructure Access';

        $scope.active_help_id = "infra_header_help_wizard";

       
        $scope.infra = {
            'types': [
                {'name': 'VMWARE ESXi', 'value': 'VMWARE'},
                {'name': 'Amazon AWS', 'value': 'Amazon AWS'},
                {'name': 'OpenStack', 'value': 'OPENSTACK'},
                {'name': 'MS Azure', 'value': 'MS Azure'}
            ]
        };
        $scope.infrastructure = {};
       
        $scope.infrastructure.type = 'VMWARE';
        $scope.toastPosition = {
            'bottom': true,
            'top': false,
            'left': false,
            'right': false,
            'center': true
        };
        $scope.getToastPosition = function () {
            return Object.keys($scope.toastPosition)
                    .filter(function (pos) {
                        return $scope.toastPosition[pos];
                    })
                    .join(' ');
        };

        $scope.callCreateInfrastructure = function () {
            if (typeof ($sessionStorage.cloudData) !== 'undefined') {
                $sessionStorage.cloudData.savedState = $state.current.name;
            }
            var startInfraCreationMessage = {
                'heading': 'Create Infrastructure Connector',
                'subHeading': 'This should take only a few minutes max.',
                'type': 'progress',
                'timeout': 5000
            };
            var successfulInfraCreationMessage = {
                'heading': 'Infrastructure Connector Created',
                'subHeading': 'Click NEXT to proceed with the Quick Setup',
                'type': 'success',
                'timeout': 5000
            };
            var startInfraDiscoveryMessage = {
                'heading': 'Discovery Started',
                'subHeading': 'Discovery Started',
                'type': 'progress',
                'timeout': 5000
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

            //Call toast to show meesage
            var pinTo = $scope.getToastPosition();
            /*$mdToast.show(
             $mdToast.simple()
             .textContent('Please wait while we discove the network.')
             .position(pinTo )
             );*/

            $scope.changedData = false;

            showToast(startInfraCreationMessage);
            var infrastructureObject = angular.copy($scope.infrastructure);
            //md - auto complete sets the infra name 
            infrastructureObject.name = $scope.searchText;
            $scope.hideNextButton();
            console.log(infrastructureObject);
            infrastructureConnectorService.createInfrastructure(infrastructureObject).then(function (data) {
                if (data) {

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
                        return data;
                    }, function (error) {
                        failedInfraDiscoveryMessage.subHeading = "Error: " + error.data.message;
                        showToast(failedInfraDiscoveryMessage);
                        console.log(error);
                        //showError
                    }).finally(function(){
                        $scope.showNextButton();
                        $scope.enableNextButton();   
                    });
                    $scope.setPreExistingInfra = true;
                    

                }
            }, function (error) {
                var failureInfraCreation = {
                    'heading': 'Infrastructure creation failed',
                    'type': 'fail',
                    'timeout': 10000
                };
                failureInfraCreation.subHeading = "Error: " + error.data.message;
                showToast(failureInfraCreation);
                $scope.showNextButton();
                $sessionStorage.cloudData = {};
            });
        };

        $scope.hideNextButton = function () {
            angular.element(document.querySelector('.qs-progress')).css('display', 'block');
            angular.element(document.querySelector('.qs-next')).css('display', 'none');
        };

        $scope.showNextButton = function () {
            angular.element(document.querySelector('.qs-progress')).css('display', 'none');
            angular.element(document.querySelector('.qs-next')).css('display', 'block');
        };
        discoverInfrastructure = function (infrastructureObject) {
            var infrastructureId = infrastructureObject.id;
            var completedInfraDiscoveryMessage = {
                'heading': 'Discovery Completed',
                'subHeading': 'Discovery Completed',
                'type': 'success'
            };

            var failedInfraDiscoveryMessage = {
                'heading': 'Discovery Failed',
                'subHeading': 'Discovery Failed',
                'type': 'fail'
            };

            return infrastructureConnectorService.discoverInfrastructure(infrastructureId).then(function (data) {
                return data;
            }, function (error) {
                console.log(error);
                //showError
            });
        };

        $scope.getCloudData = function () {
            if (typeof $sessionStorage.clouds === 'undefined' || $sessionStorage.clouds.length === 0) {
                infrastructureConnectorService.getListOfInfrastructures().then(function (data) {
                    $scope.cloudData = data;
                });
            } else {
                $sessionStorage.clouds = $scope.cloudData;
            }
        };

        $scope.totalFilteredResults = 0;
        // $scope.disablefields = false;

        $scope.querySearch = function (query) {
            return $scope.getFilteredResults(query);
        };

        /**
         * Create filter function for a query string
         */
        $scope.getFilteredResults = function (query) {
            var FilteredResults = [];
            for (var k in $scope.cloudData) {
                if ($scope.cloudData[k].name.indexOf(query) > -1) {
                    FilteredResults.push($scope.cloudData[k]);
                }
            }
            $scope.totalFilteredResults = FilteredResults.length;
            return FilteredResults;
        };

        $scope.setPreExistingInfra = false;

        $scope.selectedItemChange = function (item) {

            if (item !== undefined) {
                $scope.setPreExistingInfra = true;
                $scope.infrastructure.ip = item.ip;
                $scope.infrastructure.type = item.type;
                $scope.infrastructure.username = item.username;
                $scope.infrastructure.password = "******";
                if ($scope.infrastructure.type === 'OPENSTACK') {
                    $scope.infrastructure.domain = item.domain;
                    $scope.infrastructure.https = item.https;
                }

                //reset $sessionStorage cloud data with data selected
                $sessionStorage.cloudData = {};
                $sessionStorage.cloudData.cloudId = item.id;
                $sessionStorage.cloudData.infrastructure = item;
                $scope.enableNextButton();
            } else {
                $scope.setPreExistingInfra = false;
                $scope.searchTextChange();
            }
        };

        $scope.searchTextChange = function () {
            $scope.changedData = true;
            $scope.clearForm();
            $scope.infrastructureForm.infraIpFqdn.isDisabled = $scope.setPreExistingInfra;
            $scope.infrastructureForm.infraLogin.isDisabled = $scope.setPreExistingInfra;
            $scope.infrastructureForm.infraPassword.isDisabled = $scope.setPreExistingInfra;
            $scope.disableNextButton();
        };


        $scope.clearForm = function () {
            $scope.infrastructure.ip = "";
            $scope.infrastructure.username = "";
            $scope.infrastructure.password = "";
            $scope.infrastructure.domain = "";
            $scope.infrastructure.https = false;
        };

        $scope.changedData = false;


        if ($sessionStorage.cloudData && $sessionStorage.cloudData.infrastructure) {
            $scope.infrastructure = {};
            console.log($sessionStorage.cloudData.infrastructure);
            $scope.infrastructure.name = $sessionStorage.cloudData.infrastructure.name;
            $scope.infrastructure.type = $sessionStorage.cloudData.infrastructure.type;
            $scope.infrastructure.ip = $sessionStorage.cloudData.infrastructure.ip;
            $scope.infrastructure.username = $sessionStorage.cloudData.infrastructure.username;
            $scope.infrastructure.password = "******";
            if ($scope.infrastructure.type === 'OPENSTACK') {
                $scope.infrastructure.domain = $sessionStorage.cloudData.infrastructure.domain;
                $scope.infrastructure.https = $sessionStorage.cloudData.infrastructure.https;
            }
            $scope.infrastructureForm = {};
            $scope.enableNextButton();
            $scope.infrastructureForm.$invalid = true;

        }

        $scope.pwdType = 'password';
        $scope.togglePasswordType = function () {
            $scope.pwdType = $scope.pwdType === 'password' ? 'text' : 'password';
        };

        $scope.$watch('infrastructure', function (newObj, oldObj) {
            console.log(newObj);
            if (newObj.type === 'VMWARE') {
                if (newObj.ip && ($scope.searchText || newObj.name) && newObj.password && newObj.type && newObj.username)
                    $scope.enableNextButton();
                else
                    $scope.disableNextButton();
            }
            if (newObj.type === 'OPENSTACK') {
                if (newObj.ip && ($scope.searchText || newObj.name) && newObj.password && newObj.type && newObj.username && newObj.domain)
                    $scope.enableNextButton();
                else
                    $scope.disableNextButton();
            }
        }, true);

        $scope.$on('nextClicked', function (event, data) {
            if (!$scope.setPreExistingInfra) {
                data.stopNextClick = true;
                $scope.callCreateInfrastructure();
            }
        });

        $scope.$on('$viewContentLoaded', function (event) {
            if ($scope.infrastructure.ip && $scope.infrastructure.name && $scope.infrastructure.password && $scope.infrastructure.type && $scope.infrastructure.username)
                $scope.setPreExistingInfra = true;
            else
                $scope.disableNextButton();
        });

              
        fixContainerHeight(3);
 
    }

    angular.module('shieldxApp').controller('infrastructureConnectorCtr', infrastructureConnectorCtr);
})();

