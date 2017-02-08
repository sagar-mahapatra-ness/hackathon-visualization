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
    function IPPoolsBackPlaneCtr($scope, $translate, $mdDialog, ipPoolServices, $state, $sessionStorage, $location, $anchorScroll) {

        if (!$sessionStorage.cloudData) {
            console.log('cloud Id not set');
            $state.go('landingpage');
        }else {
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
            if (!$sessionStorage.cloudData.ipPool || !($sessionStorage.cloudData.ipPool.serverData)) {
                console.log('data not set in ipPool');
                $state.go('home.quickSetup.ip-pools-management');
            }
            if (!($sessionStorage.cloudData.ipPool.serverData.managmentNetworkHeaderValue) || !($sessionStorage.cloudData.ipPool.serverData.managmentIPPoolHeaderValue)) {
                console.log('data not set in ipPool');
                $state.go('home.quickSetup.ip-pools-management');
            }    
        }
        
        $scope.$emit('quickSetupBegun', {});
        $scope.activLink = 'Specify IP Addressing';
        var cloudData = ipPoolServices.getSessionData();
        if (cloudData.infrastructure.type === 'OPENSTACK') {
            $scope.cloudType = 'OPENSTACK';
            $scope.selectedData = 'dhcp';
        }
        $scope.active_help_id = "backplane_netw_help_wizard";
        $scope.headerValues = [{
                label: 'Connector', value: cloudData.infrastructure.name
            }, {
                label: 'Infrastructure', value: cloudData.infrastructure.ip
            }, {
                label: 'Management Network', value: cloudData.ipPool.serverData.managmentNetworkHeaderValue
            }, {
                label: 'Management IP Pool', value: cloudData.ipPool.serverData.managmentIPPoolHeaderValue
            }];

        $scope.quicksetup_heading = $translate.instant('quicksetup.heading.create_detect_protect');
        $scope.quicksetup_subheading = $translate.instant('quicksetup.subheading.our_wizard_will_get_you_setup_started_as_quick_as_flash');
        $scope.setLastQuickSetupPage();


        if (ipPoolServices.checkBackPlaneIPPoolDataPopulated()) {
            $scope.enableNextButton();
        }

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

        $scope.datValueChanged = function (value) {

            if (ipPoolServices.checkBackPlaneIPPoolDataPopulated())
            {

                $scope.enableNextButton();
            } else {

            }
        };

        $scope.$on('nextClicked', function (event, data) {

            if ($scope.activeScreenName == "ip-pools-backplane") {
                data.stopNextClick = true;
                var validationResult = $scope.validateAndSendDataToServer();
                var shouldGoNext = validationResult.result;
                console.log(" nextClicked >>>>>>>>>>>> " + validationResult.result);
                console.dir(validationResult.result);
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
            if ($scope.ipPoolData.typeOfIPSelected == "new")
            {
                toastparam = {
                    'heading': ' New IP Pool has been created successfully ',
                    'subHeading': "New IP Pool has been created",
                    'type': 'success',
                    'timeout': 5000,
                    'callback': function () {
                        $scope.getNextPage();
                    }
                };
                showToast(toastparam);
            }
            // $scope.getNextPage();
        };

        $scope.onIPPollCreationFailed = function (error) {
            //console.debug(" onIPPollCreationFailed show tost ");
            //console.dir(error);

            toastparam = {
                'heading': 'New IP Pool creation failed',
                'subHeading': "Error: " + error.data.message,
                'type': 'fail',
                'timeout': 5000
            };
            showToast(toastparam);
        };

        $scope.validateAndSendDataToServer = function () {
            if ($scope.ipPoolData.typeOfIPSelected == "new")
            {
                toastparam = {
                    'heading': ' New IP Pool Creation Started...',
                    'subHeading': "Calling Server API For IP Pool Creation",
                    'type': 'progress',
                    'timeout': 5000
                };
                showToast(toastparam);
            }
            return  ipPoolServices.commitBacklPlaneIpPoolData();
        };

        fixContainerHeight(4);

        $scope.ipPoolData = ipPoolServices.getIPPoolData().getBackPaneIPData();

        if (typeof $scope.ipPoolData.networkSelected == "undefined") {
            $scope.ipPoolData.networkSelected = {id: -1, name: ""};
        }


        if (cloudData.infrastructure.type === 'OPENSTACK') {
            $scope.ipPoolData.typeOfIPSelected = $scope.selectedData;
        }

        $scope.getNetworkNameFromID = function (id) {
            function findItem(item) {
                return item.id == id;
            }
            return _.find($scope.backPaneNetworks, findItem);
        };

        $scope.showBackPaneNetworkDialog = function (ev) {
            console.log(" showBackPaneNetworkDialog ");

            $mdDialog.show({
                controller: 'backPaneNetworkDialogCtr', templateUrl: 'core/components/administration/quick-setup/ip-pools/network-dialog/network-dialog.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true,
                locals: {
                    selectedNetworkID: $scope.ipPoolData.networkSelected.id,
                    title: $translate.instant("wizard.ippool.select_backpane_network.lower")

                }
            }).then(function (answerVal) {
                $scope.backPaneNetworks = answerVal.newtworks;
                var networkSelected = $scope.getNetworkNameFromID(answerVal.selectedVal);
                $scope.ipPoolData.networkSelected = {id: answerVal.selectedVal, name: networkSelected.label};
            }, function () {
                $scope.status = 'You cancelled the dialog.';
            });
        };


        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        $scope.answer = function (answer) {
            $mdDialog.hide(answer);
        };
    }
    angular.module('shieldxApp').controller('ipPoolsBackPlaneCtr', IPPoolsBackPlaneCtr);

    function backPlaneIPAddressPanelCtr($scope, $state, ipPoolServices) {
        $scope.forceRetriveIPPool = false;
        if ($scope.cloudType !== 'OPENSTACK') {
            if (typeof $scope.ipPoolData.typeOfIPSelected == "undefined" || $scope.ipPoolData.typeOfIPSelected === "") {
                $scope.selectedData = "existing";
                $scope.ipPoolData.typeOfIPSelected = $scope.selectedData;
            } else {
                $scope.selectedData = $scope.ipPoolData.typeOfIPSelected;
            }
        }



        $scope.radioClicked = function () {
            $scope.ipPoolData.typeOfIPSelected = $scope.selectedData;

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

        };

        $scope.$watch('ipPoolData.newIPData.name', function () {
            $scope.datValueChanged($scope.ipPoolData.newIPData.name);
        });

        $scope.$watch('ipPoolData.newIPData.discription', function () {
            $scope.datValueChanged($scope.ipPoolData.newIPData.discription);
        });


        $scope.$watch('ipPoolData.newIPData.startRange', function () {
            $scope.datValueChanged($scope.ipPoolData.newIPData.startRange);
        });

        $scope.$watch('ipPoolData.newIPData.endRange', function () {
            $scope.datValueChanged($scope.ipPoolData.newIPData.endRange);
        });

        $scope.$watch('ipPoolData.newIPData.gateway', function () {
            $scope.datValueChanged($scope.ipPoolData.newIPData.gateway);
        });

        $scope.$watch('ipPoolData.newIPData.mask', function () {
            $scope.datValueChanged($scope.ipPoolData.newIPData.mask);
        });

        $scope.$watch('ipPoolData.typeOfIPSelected', function () {
            $scope.datValueChanged($scope.ipPoolData.typeOfIPSelected);
        });

        $scope.$watch('ipPoolData.existingIP', function () {
            $scope.datValueChanged($scope.ipPoolData.existingIP);
        });

        $scope.$watch('ipPoolData.networkSelected.id', function () {
            $scope.datValueChanged($scope.ipPoolData.networkSelected.id);
        });
    }

    angular.module('shieldxApp').controller('backPlaneIPAddressPanelCtr', backPlaneIPAddressPanelCtr);

    function backPlaneDhcpPageCtr() {}
    angular.module('shieldxApp').controller('backPlaneDhcpPageCtr', backPlaneDhcpPageCtr);

    function backPlaneNewPageCtr() {}
    angular.module('shieldxApp').controller('backPlaneNewPageCtr', backPlaneNewPageCtr);

    function  backPlaneExistingPageCtr($scope, ipPoolServices) {
        $scope.existingIPFetched = false;
        $scope.forceRetriveIPPool = true;
        ipPoolServices.getExistingIPPoolListFromCache($scope.forceRetriveIPPool, {success: function (data) {
                $scope.ipPools = [];
                $scope.existingIPFetched = true;
                $scope.forceRetriveIPPool = false;
                for (var i in data) {
                    $scope.ipPools.push({id: data[i].id, name: data[i].name, description: data[i].descr, extdata: {raw: data}});
                }
                console.log("  getIpPoolList >>>>  " + $scope.ipPools);
            }});
    }
    angular.module('shieldxApp').controller('backPlaneExistingPageCtr', backPlaneExistingPageCtr);

    function backPlaneIPRangeCtr($scope, ipPoolServices) {

        var newIPData = ipPoolServices.getIPPoolData().getBackPaneIPData().newIPData;
        $scope.ipRangeRows = newIPData.getIPRangeRows();

        console.log(" managmentIPRangeCtr ");
        console.dir($scope.ipRangeRows);

        $scope.createRangeStartMessage = function (projectForm, index) {
            return   projectForm["rangeStart" + index].$error;
        };

        $scope.createRangeEndtMessage = function (projectForm, index) {
            return   projectForm["rangeEnd" + index].$error;
        };

        $scope.createCIDRMessage = function (projectForm, index) {
            return   projectForm["cidr" + index].$error;
        };

        $scope.addNewIPRangeRow = function (event) {
            console.log(" addNewIPRangeRow clicked");
            $scope.gotoBottom();
            newIPData.addNewIPRangeRow();

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
    angular.module('shieldxApp').controller('backPlaneIPRangeCtr', backPlaneIPRangeCtr);

})();