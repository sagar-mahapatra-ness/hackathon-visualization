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
function IPPoolsManagementCtr($scope, $translate, $mdDialog, ipPoolServices, $state, $sessionStorage, $location, $anchorScroll, userSessionMenagment,screenMenagment) {
       
       
        screenMenagment.setCurrentScreen(screenMenagment.screens.WIZARD_SCREEN);
        userSessionMenagment.validateUserSession();
        if(!$sessionStorage.cloudData) {
            console.log('cloud Id not set');
            $state.go('landingpage');
        }else{
            if (!$sessionStorage.cloudData.cloudId) {
            console.log('cloud Id not set');
            $state.go('home.quickSetup.quickSetup-begin');
            }
            if (!$sessionStorage.cloudData.infrastructure) {
                console.log('cloud Id not set');
                $state.go('home.quickSetup.quickSetup-begin');
            }
            if (!$sessionStorage.cloudData.infrastructure.id) {
                console.log('cloud Id not set');
                $state.go('home.quickSetup.quickSetup-begin');
            }    
        }
        
        $scope.$emit('quickSetupBegun', {});
        $scope.activLink = 'Specify IP Addressing';
        $scope.active_help_id = "management_netw_help_wizard";
        var cloudData = ipPoolServices.getSessionData();
        console.log(cloudData);
        if (cloudData.infrastructure.type === 'OPENSTACK') {
            $scope.cloudType = 'OPENSTACK';
            $scope.selectedData = 'dhcp';

        }
        $scope.headerValues = [{
                label: 'Connector', value: cloudData.infrastructure.name
            }, {
                label: 'Infrastructure', value: cloudData.infrastructure.ip
            }];

        $scope.quicksetup_heading = $translate.instant('quicksetup.heading.create_detect_protect');
        $scope.quicksetup_subheading = $translate.instant('quicksetup.subheading.our_wizard_will_get_you_setup_started_as_quick_as_flash');
        $scope.setLastQuickSetupPage();
        $scope.invalidMask = false;
        console.log(" invalidMask " + $scope.invalidMask);

        if (ipPoolServices.checkManageMentIPPoolDataPopulated()) {
            $scope.enableNextButton();
        }
        $scope.datValueChanged = function (value) {
            console.log(" datValueChanged ");
            if (ipPoolServices.checkManageMentIPPoolDataPopulated())
            {
                $scope.enableNextButton();
            }
        };

        $scope.gotoBottom = function () {

            setTimeout(function () {

                console.log('gotoBottom() fires');
                // set the location.hash to the id of
                // the element you wish to scroll to.
                $location.hash('bottom');

                // call $anchorScroll()
                $anchorScroll();
            }, 0);

        };

        $scope.$on('nextClicked', function (event, data) {
            console.debug(" click next notified " + $scope.activeScreenName);
            if ($scope.activeScreenName == "ip-pools-management") {
                data.stopNextClick = true;
                var validationResult = $scope.validateAndSendDataToServer();
                var shouldGoNext = validationResult.result;
                console.debug(" nextClicked after validation value of shouldGoNext : " + shouldGoNext);
                if (shouldGoNext) {
                    $sessionStorage.cloudData.savedState = $state.current.name;
                    $scope.getNextPage();
                } else
                {
                    validationResult.promise.then($scope.onIPPollCreatedSuccessFully, $scope.onIPPollCreationFailed);
                }
            }
        });

        $scope.onIPPollCreatedSuccessFully = function (data) {
            console.debug(" onIPPollCreatedSuccessFully go to next page : ");
            if ($scope.ipPoolData.typeOfIPSelected == "new")
            {
                toastparam = {
                    'heading': ' New IP Pool  has been created successfully ',
                    'subHeading': "New IP Pool creation process is complete",
                    'type': 'success',
                    'timeout': 5000,
                    'callback': function () {
                        $scope.getNextPage();
                    }
                };
                showToast(toastparam);
            }

        };

        $scope.onIPPollCreationFailed = function (error) {
            //console.debug(" onIPPollCreationFailed show tost ");
            // console.dir(error);

            toastparam = {
                'heading': 'New IP Pool creation failed',
                'subHeading': "Error: " + error.data.message,
                'type': 'fail',
                'timeout': 5000
            };
            showToast(toastparam);
        };

        $scope.validateAndSendDataToServer = function () {

            if (parseInt($scope.ipPoolData.newIPData.mask) > 32) {
                $scope.invalidMask = true;
                var validationResult = {result: false};
                return validationResult;
            } else {
                $scope.invalidMask = false;
            }

            if ($scope.ipPoolData.typeOfIPSelected == "new")
            {
                toastparam = {
                    'heading': ' New IP Pool Creation Started...',
                    'subHeading': "Calling Server API For IP Pool Creation",
                    'type': 'progress',
                    'timeout': 7000
                };
                showToast(toastparam);
            }
            return ipPoolServices.commitManagmentIPPoolData();
        };

        fixContainerHeight(4);
        $scope.ipPoolData = ipPoolServices.getIPPoolData().getManagmentIPData();

        if (typeof $scope.ipPoolData.networkSelected == "undefined") {
            $scope.ipPoolData.networkSelected = {id: -1, name: ""};
        }




        if (cloudData.infrastructure.type === 'OPENSTACK') {
            $scope.ipPoolData.typeOfIPSelected = $scope.selectedData;
        }


        //console.log(" network selected "+$scope.ipPoolData.networkSelected.name);
        $scope.managmentNetworks = null;
        $scope.getNetworkNameFromID = function (id) {
            function findItem(item) {
                return item.id == id;
            }
            console.log("latest code base");
            return _.find($scope.managmentNetworks, findItem);
        };



        $scope.showManagmentNetworkDialog = function (ev) {
            $mdDialog.show({
                controller: 'managmentNetworkDialogCtr', templateUrl: 'core/components/administration/quick-setup/ip-pools/network-dialog/network-dialog.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true,
                locals: {
                    selectedNetworkID: $scope.ipPoolData.networkSelected.id,
                    title: $translate.instant("wizard.ippool.select_management_network.lower")
                }
            }).then(function (answerVal) {
                console.log(" answerVal >>> ");
                console.dir(answerVal);
                $scope.managmentNetworks = answerVal.newtworks;
                var networkSelected = $scope.getNetworkNameFromID(answerVal.selectedVal);
                $scope.ipPoolData.networkSelected = {id: answerVal.selectedVal, name: networkSelected.label};
            }, function () {
                $scope.status = 'You cancelled the dialog.';
            });
        };
    }

    angular.module('shieldxApp').controller('ipPoolsManagementCtr', IPPoolsManagementCtr);

    function managmentDhcpPageCtr() {}
    angular.module('shieldxApp').controller('managmentDhcpPageCtr', managmentDhcpPageCtr);

    function managmentNewPageCtr() {}
    angular.module('shieldxApp').controller('managmentNewPageCtr', managmentNewPageCtr);

    function managmentExistingPageCtr($scope, ipPoolServices) {
        $scope.existingIPFetched = false;
        $scope.forceRetriveIPPool = true;
        ipPoolServices.getExistingIPPoolListFromCache($scope.forceRetriveIPPool, {success: function (data) {
                $scope.forceRetriveIPPool = false;
                $scope.existingIPFetched = true;
                $scope.ipPools = [];
                for (var i in data) {
                    $scope.ipPools.push({id: data[i].id, name: data[i].name, description: data[i].descr, extdata: {raw: data}});
                }
                console.log(" managmentExistingPageCtr getIpPoolList >>>>  " + $scope.ipPools);
            }}).then(function () {
            console.log("get ip pool data >>>>>>>>>>>>>>>>>> ");
        });
    }
    angular.module('shieldxApp').controller('managmentExistingPageCtr', managmentExistingPageCtr);

    function managmentIPAddressPanelCtr($scope, $state, ipPoolServices) {
        $scope.forceRetriveIPPool = false;
        $scope.ipPanelManagmentData = {name: "managment", states: {"new": "home.quickSetup.ip-pools.managment-tab.new-ip-page", "existing": "home.quickSetup.ip-pools.managment-tab.existing-ip-page", "dhcp": "home.quickSetup.ip-pools.managment-tab.dhcp-page"}};
        console.log(" $scope.ipPoolData.typeOfIPSelected " + $scope.ipPoolData.typeOfIPSelected);
        if ($scope.cloudType !== 'OPENSTACK') {
            if (typeof $scope.ipPoolData.typeOfIPSelected == "undefined" || $scope.ipPoolData.typeOfIPSelected === "") {
                $scope.selectedData = "existing";
                $scope.ipPoolData.typeOfIPSelected = $scope.selectedData;
            } else {
                $scope.selectedData = $scope.ipPoolData.typeOfIPSelected;
            }
        }


        // console.log("$scope.ipPoolData.typeOfIPSelected  backPaneIPAddressPanelCtr "+$scope.ipPoolData.typeOfIPSelected );
        $scope.radioClicked = function () {
            //console.log($scope.selectedData + " radio button clicked " + $scope.ipPanelManagmentData.states["new"]);

            $scope.ipPoolData.typeOfIPSelected = $scope.selectedData;
            //console.log("$scope.ipPoolData.typeOfIPSelected  backPaneIPAddressPanelCtr "+$scope.ipPoolData.typeOfIPSelected );
            if ($scope.selectedData == "new") {
                $scope.disableNextButton();
                newSelected = true;
            } else if ($scope.selectedData == "existing") {
                $scope.forceRetriveIPPool = true;
                $scope.disableNextButton();
                existingSelected = true;
            } else if ($scope.selectedData == "dhcp") {
                dhcpSelected = true;
            }

            //$state.go($scope.ipPanelManagmentData.states[$scope.selectedData]);
        };

        $scope.$watch('ipPoolData.newIPData.name', function () {
            $scope.datValueChanged($scope.ipPoolData.newIPData.name);
        });

        $scope.$watch('ipPoolData.newIPData.discription', function () {
            $scope.datValueChanged($scope.ipPoolData.newIPData.discription);
        });

        $scope.$watch('ipPoolData.newIPData.gateway', function () {

            $scope.datValueChanged($scope.ipPoolData.newIPData.gateway);
        });

        $scope.$watch('ipPoolData.newIPData.mask', function () {
            console.log(" ipPoolData.newIPData.mask ");
            $scope.datValueChanged($scope.ipPoolData.newIPData.mask);
        });

        $scope.$watch('ipPoolData.typeOfIPSelected', function () {
            $scope.datValueChanged($scope.ipPoolData.typeOfIPSelected);
        });

        $scope.$watch('ipPoolData.networkSelected.id', function () {
            $scope.datValueChanged($scope.ipPoolData.networkSelected.id);
        });
        $scope.$watch('ipPoolData.existingIP', function () {
            $scope.datValueChanged($scope.ipPoolData.existingIP);
        });

    }
    angular.module('shieldxApp').controller('managmentIPAddressPanelCtr', managmentIPAddressPanelCtr);

    function managmentIPRangeCtr($scope, ipPoolServices) {

        var newIPData = ipPoolServices.getIPPoolData().getManagmentIPData().newIPData;
        $scope.ipRangeRows = newIPData.getIPRangeRows();

        console.log(" managmentIPRangeCtr ");
        console.dir($scope.ipRangeRows);

        $scope.addNewIPRangeRow = function (event) {
            console.log(" addNewIPRangeRow clicked");
            $scope.gotoBottom();
            newIPData.addNewIPRangeRow();

        };

        $scope.createRangeStartMessage = function (projectForm, index) {
            return   projectForm["rangeStart" + index].$error;
        };

        $scope.createRangeEndtMessage = function (projectForm, index) {
            return   projectForm["rangeEnd" + index].$error;
        };

        $scope.createCIDRMessage = function (projectForm, index) {
            return   projectForm["cidr" + index].$error;
        };

        $scope.startIpRangeKeyDown = function ($event, ipRangeRowData) {
            console.log(" startIpRangeKeyDown ");
            console.dir(ipRangeRowData);

            if (ipRangeRowData.rangeStartValue || ipRangeRowData.rangeEndtValue) {
                ipRangeRowData.cidrValue = "";
                ipRangeRowData.rangeCIDREnableState = false;
            } else
            {
                ipRangeRowData.rangeCIDREnableState = true;
            }


            $scope.datValueChanged($scope.ipPoolData.newIPData.ranges);
        };

        $scope.endIPRangeKeyDown = function ($event, ipRangeRowData) {
            console.log(" endIPRangeKeyDown ");
            console.dir(ipRangeRowData);

            if (ipRangeRowData.rangeStartValue || ipRangeRowData.rangeEndtValue) {
                ipRangeRowData.cidrValue = "";
                ipRangeRowData.rangeCIDREnableState = false;
            } else
            {
                ipRangeRowData.rangeCIDREnableState = true;
            }


            $scope.datValueChanged($scope.ipPoolData.newIPData.ranges);
        };

        $scope.cidrIPRangeKeyDown = function ($event, ipRangeRowData) {
            console.log(" cidrIPRangeKeyDown ");
            console.dir(ipRangeRowData);

            if (ipRangeRowData.cidrValue) {
                ipRangeRowData.rangeStartValue = "";
                ipRangeRowData.rangeEndtValue = "";
                ipRangeRowData.rangeStartEnableState = false;
                ipRangeRowData.rangeEndEnableState = false;
            } else {
                ipRangeRowData.rangeStartEnableState = true;
                ipRangeRowData.rangeEndEnableState = true;
            }

            $scope.datValueChanged($scope.ipPoolData.newIPData.ranges);
        };

        $scope.deleteIPPool = function (event, ipRangeRowData, key) {
            newIPData.deleteIPRangeRow(key);
        };
    }
    angular.module('shieldxApp').controller('managmentIPRangeCtr', managmentIPRangeCtr);

    function validateInteger() {

        var REGEX = /^\-?\d+$/;

        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                console.log(" ctrl ");
                console.dir(ctrl);

                ctrl.$validators.integer = function (modelValue, viewValue) {

                    if (REGEX.test(viewValue)) {
                        return true;
                    }
                    return false;
                };
            }
        };
    }
    angular.module('shieldxApp').directive('validateInteger', validateInteger);

})();