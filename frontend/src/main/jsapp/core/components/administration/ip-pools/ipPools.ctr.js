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
    function ipPoolsCtr($scope, $state, infrastructureConnectorService, ipPoolServices, deploymentSpecificationService, $translate, $q, $mdDialog, $stateParams, $sessionStorage,userSessionMenagment) {

        "ngInject";
        clearAllSession($sessionStorage);
        $scope.$emit('listenHeaderText', {
            headerText: $translate.instant('admin.toolbar.heading')
        });
        $scope.$emit('quickSetupEnded', {});
        //console.info(" ipPoolsCtr admin initialized ");

        /* **** for tables [start] **** */
        $scope.deferred = $q.defer();
        $scope.promise = $scope.deferred.promise;
        $scope.deploySpecFetched = false;
        $scope.selected = [];
        $scope.query = {
            order: 'name',
            limit: 10,
            page: 1
        };
        $scope.isAdornmentPanelOpen = false;
        $scope.isSearchBarOpen = false;

        $scope.toggleSearchBar = function (event) {
            $scope.isSearchBarOpen = $scope.isSearchBarOpen === false ? true : false;
            if ($scope.isSearchBarOpen)
                angular.element(event.currentTarget.firstElementChild).css('color', '#4a90e2');
            else
                angular.element(event.currentTarget.firstElementChild).css('color', '#6d6e71');
        };

        var poolId = ($stateParams && $stateParams.poolId) ? parseInt($stateParams.poolId) : null;
        //$scope.ipPoolsRows = [];


        $scope.freshData = (!$sessionStorage.ipPoolList || ($sessionStorage.ipPoolList && $sessionStorage.ipPoolList.length === 0));


        /* **** for tables [end] **** */

        var cloudData = null;
        var cloudFetched = -1;
        var ipoolData = [];
        var activeCloudData = null;
        var selectedIPRowData = null;
        var rowPoolData = [];
        $scope.promiseCompleted = true;

        var create_id = authorities("ipPools_create");
        var delete_id = authorities("ipPools_delete");
        var update_id = authorities("ipPools_update");
        $scope.is_create_ippool = userSessionMenagment.isUserAllowd(create_id);
        $scope.is_update_ippool = userSessionMenagment.isUserAllowd(update_id);
        $scope.is_delete_ippool = userSessionMenagment.isUserAllowd(delete_id);


        var onDeploymentSpecInfoFetched = function (data) {
            //console.debug("onDeploymentSpecInfoFetched  " + data);
            //console.dir(data);
            //console.dir($scope.adornmentData);
            selectedIPRowData.dpoySpec = data;
            var IpPoolToDeploySpec = mapIPToDeploySpec(selectedIPRowData.ipPool, selectedIPRowData.dpoySpec);
            //console.debug("ipoool id   " + $scope.adornmentData.ipdata.ipPoolData.id);
            $scope.adornmentData.deploySpecData = IpPoolToDeploySpec[$scope.adornmentData.ipdata.ipPoolData.id.toString()];
            $scope.deploySpecFetched = true;
            console.debug(" $scope.deploySpecFetched   " + $scope.deploySpecFetched);

        };

        var fetchDeploymentSpecInfo = function (rowData) {
            // console.debug(" fetchDeploymentSpecInfo ");
            // console.dir(rowData);
            deploymentSpecificationService.getDeploymentSpecList(rowData.ipPoolData.cloudid).then(onDeploymentSpecInfoFetched);
        };


        $scope.updateAdornmentPanel = function (event, rowData) {
            $scope.deploySpecFetched = false;
            $scope.adornmentData = {};
            $scope.adornmentData.readOnlyranges = [];
            $scope.adornmentData.ipdata = rowData;
            $scope.adornmentData.ipoolData = new NewIPDate();
            $scope.adornmentData.ipoolData.initializeFromIPData(rowData.ipPoolData);
            $scope.adornmentData.editIPoolData = $scope.adornmentData.ipoolData.clone();
            var rangeArrary = [];
            //console.log("rowData.ipPoolData.ranges $$$$$  ");
            selectedIPRowData = {};
            selectedIPRowData.ipPool = rowData.ipPoolData;
            //console.log(" $scope.adornmentData.ipdata ");
            //console.dir($scope.adornmentData.ipdata);
            //console.log("selectedIPRowData.ipoolData >>>>>>>>>>>>>>> ");
            //console.dir($scope.adornmentData.ipoolData);   
            //console.log("$scope.adornmentData.editIPoolData");
            //console.dir($scope.adornmentData.editIPoolData);         
            $scope.updateIPRangeReadOnlyArray();

            //console.dir(rangeArrary);    
            $scope.toggleAdornmentPanel();
            //console.log(" rowData "+rowData);
            //console.dir(rowData);  
            fetchDeploymentSpecInfo(rowData);
        };

        $scope.updateIPRangeReadOnlyArray = function () {
            var ranges = $scope.adornmentData.editIPoolData.ranges;
            var rangeArrary = [];
            for (var i = 0; i < ranges.length; i++) {
                var rangeRef = ranges[i];
                if (!rangeRef.rangeCIDREnableState) {
                    rangeArrary.push({type: "range", start: rangeRef.rangeStartValue, end: rangeRef.rangeEndtValue});
                } else {
                    rangeArrary.push({type: "cidr", value: rangeRef.cidrValue});
                }

            }
            $scope.adornmentData.readOnlyranges = rangeArrary;
        };
        $scope.updateIPPoolRow = function (updatedData) {
            /*  update row data */
            $scope.adornmentData.ipdata.name = $scope.adornmentData.editIPoolData.name;

            var rangeRef = $scope.adornmentData.editIPoolData.convertIPRangeToString();
            console.log(" updateIPPoolRow  >>>>>>>>>> " + rangeRef);
            var rangeValues = rangeRef.split(",");
            //console.dir(rangeRef);
            //console.dir(rangeValues);
            var ranges = "";
            var showMore = false;
            if (rangeValues.length > 1) {
                ranges = rangeValues[0];
                moreRange = " +" + (rangeValues.length - 1) + "more";
                showMore = true;
            } else {
                ranges = rangeValues[0];
                moreRange = "";
            }
            //console.log(" updateIPPoolRow  before update ");        
            //console.dir($scope.adornmentData);
            //
            //
            console.log(" moreRange  " + moreRange);
            $scope.adornmentData.ipdata.ranges = ranges;
            $scope.adornmentData.ipdata.moreRange = moreRange;
            $scope.adornmentData.ipdata.gateway = $scope.adornmentData.editIPoolData.gateway;
            $scope.adornmentData.ipdata.mask = $scope.adornmentData.editIPoolData.mask;
            /* update row data */
            $scope.adornmentData.ipdata.ipPoolData.gateway = $scope.adornmentData.editIPoolData.gateway;
            $scope.adornmentData.ipdata.ipPoolData.name = $scope.adornmentData.editIPoolData.name;
            $scope.adornmentData.ipdata.ipPoolData.prefix = $scope.adornmentData.editIPoolData.mask;
            $scope.adornmentData.ipdata.ipPoolData.ranges = rangeRef;

            $scope.adornmentData.ipoolData = new NewIPDate();
            $scope.adornmentData.ipoolData.initializeFromIPData($scope.adornmentData.ipdata.ipPoolData);
            $scope.adornmentData.editIPoolData = $scope.adornmentData.ipoolData.clone();

            //console.log(" updateIPPoolRow  after update ");        
            //console.dir($scope.adornmentData);

            $scope.updateIPRangeReadOnlyArray();
        };

        $scope.toggleAdornmentPanel = function () {
            $scope.isAdornmentPanelOpen = $scope.isAdornmentPanelOpen === false ? true : false;
        };


        $scope.showStatus = function (status, test) {
            return status === test;
        };

        $scope.deleteIPPool = function (event, rowData) {
            toastparam = {
                'heading': 'IP Pool deletion in progress',
                'subHeading': 'IP Pool deletion initiated.',
                'type': 'progress',
                'timeout': 15000
            };
            showToast(toastparam);
            //console.info(" deleteIPPool called" + rowData.ipPoolData.id);
            ipPoolServices.deleteIPPool(rowData.ipPoolData.id, rowData.ipPoolData.cloudid).then(function (data) {
                //console.debug(" ip pool deleted " + data);
                $scope.removeRowFromTable(rowData);
                toastparam = {
                    'heading': 'IP Pool deleted successfully.',
                    'subHeading': '',
                    'type': 'success',
                    'timeout': 5000
                };
                showToast(toastparam);
            }, function (error) {
                //console.debug(error);

                toastparam = {
                    'heading': 'IP Pool deletion failed',
                    'subHeading': "Error: " + error.data.message,
                    'type': 'fail',
                    'timeout': 5000
                };
                showToast(toastparam);
            });
        };


        $scope.removeRowFromTable = function (rowData) {
            //console.log(" removeRowFromTable activeCloudData " + rowData);
            //console.dir(rowData);
            var index = -1;
            index = _.findIndex($scope.ipPoolsRows, function (o) {
                // console.info(" findIndex o.ipPoolData.id ");
                //console.dir(o);
                //console.info(" findIndex rowData.ipPoolData.id ");
                //console.dir(rowData);
                return o.ipPoolData.id == rowData.ipPoolData.id;
            });
            if (index != -1) {
                $scope.ipPoolsRows.splice(index, 1);
            }
            //console.debug(" removeRowFromTable >> result " + index);
        };

        $scope.createNewIPPool = function (infraRefID, infraName, discription, gateway, name, mask, ranges) {
            toastparam = {
                'heading': 'IP Pool creation in progress',
                'subHeading': 'IP Pool creation initiated.',
                'type': 'progress',
                'timeout': 15000
            };
            showToast(toastparam);
            var rangeRef = ranges;

            ipPoolServices.createNewIPPool(infraRefID, discription, gateway, name, mask, ranges).then(function (data) {
                var id = data;


                var rangeValues = rangeRef.split(",");
                var ranges = "";
                var showMore = false;
                if (rangeValues.length > 1) {
                    ranges = rangeValues[0];
                    moreRange = " +" + (rangeValues.length - 1) + "more";
                    showMore = true;
                } else {
                    ranges = rangeValues[0];
                    moreRange = "";
                }

                console.log(" moreRange " + moreRange);
                var tempIPPoolData = {
                    cloudid: infraRefID, descr: discription, gateway: gateway, id: id, name: name, prefix: mask, ranges: rangeRef
                };
                $scope.ipPoolsRows.unshift({
                    infraName: infraName, name: name, descrition: discription, ranges: ranges, moreRange: moreRange, showMore: showMore, gateway: gateway, mask: mask, deploySpecData: {}, ipPoolData: tempIPPoolData
                });


                toastparam = {
                    'heading': 'IP Pool created successfully',
                    'subHeading': '',
                    'type': 'success',
                    'timeout': 5000
                };
                showToast(toastparam);
            }, function (error) {

                toastparam = {
                    'heading': 'IP Pool creation failed',
                    'subHeading': "Error: " + error.data.message,
                    'type': 'fail',
                    'timeout': 5000
                };
                showToast(toastparam);
            });
        };
        $scope.showNewIPPoolDialogbox = function (ev) {
            //console.info(" showNewIPPoolDialogbox ");
            $mdDialog.show({
                controller: 'newIPPoolsDialogboxCtr', templateUrl: 'core/components/administration/ip-pools/new-ip-pools-dialogbox.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true
            }).then(function (answer) {
                //console.debug(" answer " + answer);
                //console.dir(answer);infraRefID,infraName,discription,gateway, name, mask,ranges
                $scope.createNewIPPool(answer.infrastructureInfo.id, answer.infrastructureInfo.name, answer.newIPDate.discription, answer.newIPDate.gateway, answer.newIPDate.name, answer.newIPDate.mask, answer.newIPDate.convertIPRangeToString());

            }, function () {});
        };



        /**
         This method map depoyment specification to the IP pool that it uses
         **/
        var mapIPToDeploySpec = function (ipPoolData, deploySpecData) {
            //console.log(" mapIPToDeploySpec  ");
            //console.dir(deploySpecData);
            var ipPoolToSpecMap = {};
            var tempdeploySpecData = null;
            for (var j = 0; j < deploySpecData.length; j++) {
                tempdeploySpecData = deploySpecData[j];
                //console.info(" tempdeploySpecData  ");
                //console.dir(tempdeploySpecData);
                if (!tempdeploySpecData.backPlaneIsDhcp) {
                    var tempBackDS = ipPoolToSpecMap[tempdeploySpecData.backPlaneIpPoolId.toString()];
                    //console.debug(" backpanel id found    " + tempBackDS + " tempdeploySpecData.backPlaneIpPoolId " + tempdeploySpecData.backPlaneIpPoolId.toString());
                    if (tempBackDS === undefined || tempBackDS === null) {
                        ipPoolToSpecMap[tempdeploySpecData.backPlaneIpPoolId.toString()] = [];
                        tempBackDS = ipPoolToSpecMap[tempdeploySpecData.backPlaneIpPoolId.toString()];
                    }
                    //console.debug(" backpanel id data pused     " + j);
                    tempBackDS.push(tempdeploySpecData);
                }
                if (!tempdeploySpecData.mgmtIsDhcp) {
                    // console.log( " tempdeploySpecData.mgmtIpPoolId "+tempdeploySpecData.mgmtIpPoolId);
                    var tempMgmtDS = ipPoolToSpecMap[tempdeploySpecData.mgmtIpPoolId.toString()];
                    //console.log(" manmagment id found    "+tempMgmtDS+" mgmtNetworkId "+tempdeploySpecData.mgmtNetworkId);
                    if (tempMgmtDS === undefined || tempMgmtDS === null) {
                        ipPoolToSpecMap[tempdeploySpecData.mgmtIpPoolId.toString()] = [];
                        tempMgmtDS = ipPoolToSpecMap[tempdeploySpecData.mgmtIpPoolId.toString()];
                    }
                    //console.debug(" manmagment id data pused     " + j);
                    tempMgmtDS.push(tempdeploySpecData);
                }
            }
            return ipPoolToSpecMap;
        };

        /**
         This method is called when all infrastructure data available for further processing
         **/
        var completCloudResourceFetched = function () {
            //console.info(" completCloudeResourceFetched  ");
            if (activeCloudData.ipPool !== null) {
                //console.info(" cloude fetched  ");
                //console.dir(activeCloudData);
                for (var i = 0; i < activeCloudData.ipPool.length; i++) {
                    //console.debug("**** name:activeCloudData.ipPool[i].id ******** " + activeCloudData.ipPool[i].id);
                    var rangeValues = activeCloudData.ipPool[i].ranges.split(",");
                    //console.dir(activeCloudData.ipPool[i].ranges);
                    /// console.dir(rangeValues);
                    var ranges = "";
                    var showMore = false;
                    if (rangeValues.length > 1) {
                        ranges = rangeValues[0];
                        moreRange = " + " + (rangeValues.length - 1) + " more";
                        showMore = true;
                    } else {
                        ranges = rangeValues[0];
                        moreRange = "";
                    }
                    var dataToSave = {
                        infraName: activeCloudData.cloudRef.name, name: activeCloudData.ipPool[i].name, descrition: activeCloudData.ipPool[i].descr, ranges: ranges, moreRange: moreRange, showMore: showMore, gateway: activeCloudData.ipPool[i].gateway, mask: activeCloudData.ipPool[i].prefix, ipPoolData: activeCloudData.ipPool[i], ipPoolId: activeCloudData.ipPool[i].id
                    };
                    rowPoolData.push(dataToSave);
                }
                fetchNextCloudData();
            }
        };

        /**
         this is a call back method , It is called when all ip Pool data
         has been fetched for a infrastructure
         **/

        var onIpPoolDataFetched = function (result) {
            activeCloudData.ipPool = result;
            completCloudResourceFetched();
        };


        /**
         fetch next infrastructure data present in the sequence in from cloudData araray
         **/
        var fetchNextCloudData = function () {
            cloudFetched++;
            if (cloudFetched < cloudData.length) {
                activeCloudData = {
                    cloudRef: cloudData[cloudFetched], ipPool: null, dpoySpec: null
                };
                fetchIPPoolInformation(cloudData[cloudFetched]);
            } else {
                $scope.ipPoolsRows = moveRecordToStart(rowPoolData, 'ipPoolId', poolId);
                $sessionStorage.ipPoolList = $scope.ipPoolsRows;
                $scope.deferred.resolve();
                $scope.promiseCompleted = false;
            }
        };

        /**
         fetch all ipp pool information related to one infrastructure 
         
         **/
        var fetchIPPoolInformation = function (data) {
            // console.debug(" getCloudResource cloud name   " + data.name);
            ipPoolServices.getIpPoolListByCloudId(data.id).then(onIpPoolDataFetched);
        };

        /**
         call back method for getListOfInfrastructures() service method
         **/
        var onGettingAllInfraData = function (data) {
            // console.info("getAllInfraData ");
            // console.dir(data);
            cloudData = data;
            fetchNextCloudData();
        };

        $scope.clearIpPoolListFromSession = function () {
            clearMasterSession($sessionStorage, $state);
            /*$sessionStorage.ipPoolList = [];
             $state.reload();*/
        };

        if ($scope.freshData) {
            $sessionStorage.ipPoolList = [];
            infrastructureConnectorService.getListOfInfrastructures().then(onGettingAllInfraData);
        } else {
            $scope.ipPoolsRows = moveRecordToStart($sessionStorage.ipPoolList, 'ipPoolId', poolId);
            $scope.deferred.resolve();
            $scope.promiseCompleted = false;

        }

        $scope.$on('$viewContentLoaded', function (event) {
            console.log(event);
            fixContainerHeight(1);
        });
    }
    angular.module('shieldxApp').controller('ipPoolsCtr', ipPoolsCtr);
})();