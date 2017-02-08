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
    function shieldxUpdatesCtr(
            $scope,
            $state,
            $translate,
            managementService,
            infrastructureConnectorService,
            deploymentSpecificationService,
            userSessionMenagment,
            $mdDialog) {

        $scope.$emit('listenHeaderText', {headerText: $translate.instant('admin.toolbar.heading')});

        var softwareUpgradeStarted = {
            'heading': 'Software Upgrade Initiating',
            'subHeading': '&nbsp;',
            'type': 'progress',
            'timeout': $scope.toastTimeout
        };
        var softwareUpgraded = {
            'heading': 'Software Upgrade Initiated',
            'subHeading': '&nbsp;',
            'type': 'success',
            'timeout': $scope.toastTimeout,
            'callback': function () {
                $state.reload();
            }
        };

        var softwareUpgradeFailed = {
            'heading': 'Software Upgrade Failed',
            'type': 'fail',
            'timeout': $scope.toastTimeout
        };

        var contentUpgradeStarted = {
            'heading': 'Content Update Initiating',
            'subHeading': '&nbsp;',
            'type': 'progress',
            'timeout': $scope.toastTimeout
        };
        var contentUpgraded = {
            'heading': 'Content Update Initiated',
            'subHeading': '&nbsp;',
            'type': 'success',
            'timeout': $scope.toastTimeout,
            'callback': function () {
                $state.reload();
            }
        };

        var contentUpgradeFailed = {
            'heading': 'Content Update Failed',
            'subHeading': '&nbsp;',
            'type': 'fail',
            'timeout': $scope.toastTimeout
        };

        var shieldx_upgrade = authorities("shieldxUpdates_update");
        var content_update = authorities("shieldxUpdates_content_update");

        $scope.is_shieldx_upgrade = userSessionMenagment.isUserAllowd(shieldx_upgrade);
        $scope.is_content_update = userSessionMenagment.isUserAllowd(content_update);

        $scope.disableUpgradeSoftware = (parseInt($scope.currentTime) - $scope.callout.upgradeSoftware < $scope.disableTimeout);
        $scope.disableDeployPatch = (parseInt($scope.currentTime) - $scope.callout.deployHotfixBuild < $scope.disableTimeout);
        $scope.disableUpgradeContent = (parseInt($scope.currentTime) - $scope.callout.upgradeContent < $scope.disableTimeout);

        $scope.swVersionsAvailable = false;
        $scope.swversions = [];
        $scope.latetsswversions = [];
        var swVersionData = [];
        var latestswVersionData = [];
        $scope.swupgrade = {};
        $scope.swupgrade.deployhotfix ='';
        $scope.swupgrade.hotfix = '';

        $scope.active_help_id = "admin_system_sx_updates_help";
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
        //Get Software Versions
        //$sessionStorage.swVersionList = [];

        var getswversionsstarted = {
            'heading': 'Get deployed software versions from registry sync..',
            'subHeading': '&nbsp;',
            'type': 'progress',
            'timeout': 3000
        };
        var getswversionscompleted = {
            'heading': 'Received deloyed software versions from registry sync',
            'subHeading': '&nbsp;',
            'type': 'success',
            'timeout': 2000,
        };
        var failedtogetswversions = {
            'heading': 'Failed to get software versions from registry sync',
            'subHeading': '&nbsp;',
            'type': 'fail',
            'timeout': 3000
        };

        showToast(getswversionsstarted);
        managementService.listDeployedSoftwarePackage().then(function (data) {

            console.log("SW versions length = "+data.length);

            if (data === 0) {

                $scope.swVersionsAvailable = false;

            } else {
                //showToast(getswversionscompleted);
                console.log("SW Versions available = "+data);
                $scope.swVersionsAvailable = true;

                for (var i = 0; i < data.length; i++) {
                    console.log(" data -> "+data[i]);
                    swVersionData[i] = {};
                    console.log("MicroService : "+data[i].microservice+" version : "+data[i].swversion);
                    swVersionData[i] = data[i];
                }
                console.log(swVersionData);
                $scope.swversions = swVersionData;
            }
        }, function (error) {
            console.log(error);
            $scope.errorMessage = "ERROR occured while getting SW version list!!!";
            $scope.swversions = [];
            failedtogetswversions.subHeading = "Error: " + error.data.message;
            showToast(failedtogetswversions);

        });

        managementService.checkForSoftwareUpdates().then(function (data) {

            console.log("Latest sw updates length = "+data.length);

            if (data.length === 0) {
                console.log("No latest available software versions");
                $scope.swVersionsAvailable = false;
                $scope.latetsswversions = [];

            } else {
                //showToast(getswversionscompleted);
                console.log("Latets SW Versions available = "+data);
                $scope.swVersionsAvailable = true;

                for (var i = 0; i < data.length; i++) {
                    console.log(" data -> "+data[i]);
                    latestswVersionData[i] = {};
                    console.log("MicroService : "+data[i].microservice+" version : "+data[i].swversion);
                    latestswVersionData[i] = data[i];
                }
                console.log(latestswVersionData);
                $scope.latetsswversions = latestswVersionData;
            }
        }, function (error) {
            console.log(error);
            $scope.errorMessage = "ERROR occured while checking for latest SW updates !!!";
            $scope.latetsswversions = [];
            failedtogetswversions.subHeading = "Error: " + error.data.message;
            showToast(failedtogetswversions);
        });


        $scope.deployHotfixBuild = function () {

            //$scope.disableCallout('upgradeSoftware');
            showToast(softwareUpgradeStarted);

            var hfbuild = $scope.swupgrade.hotfix;

            console.log("Deploy hot fix build : "+hfbuild);

            managementService.upgradeSoftwarePatch(hfbuild).then(function (data) {

                showToast(softwareUpgraded);

            }, function (error) {
                console.log(error.data.message);
                $scope.disableDeployPatch=false;
                var hotfixdeploymentfailed = {
                    'heading': 'Software Upgrade Failed',
                    'subHeading': '&nbsp;',
                    'type': 'fail',
                    'timeout': 3000,
                    'callback': function () {
                        $state.reload();
                    }
                };

                hotfixdeploymentfailed.subHeading = "Error: " + error.data.message;
                showToast(hotfixdeploymentfailed);
            });
        };


        $scope.callUpgradeSoftware = function () {

            //$scope.disableCallout('upgradeSoftware');
            console.log("Upgrade Software to latest version.");
            showToast(softwareUpgradeStarted);

            managementService.upgradeSoftware().then(function (data) {
                console.log("Software has been upgrade to latest");
                showToast(softwareUpgraded);

            }, function (error) {
                console.log(error);
                softwareUpgradeFailed.subHeading = "Error: " + error.data.message;
                showToast(softwareUpgradeFailed);

            });
        };

        /*
        $scope.callUpgradeSoftware = function () {

            $scope.disableCallout('upgradeSoftware');

            showToast(softwareUpgradeStarted);

            managementService.callUpgradeSoftware().then(function () {

                showToast(softwareUpgraded);

            }, function (error) {
                console.log(error);
                softwareUpgradeFailed.subHeading = "Error: " + error.data.message;
                showToast(softwareUpgradeFailed);

            });
        };
        */

        $scope.callUpgradeContent = function () {

            console.log("Content update started..");

            //$scope.disableCallout('upgradeContent'); //Call out is not working as expected. Commnted for beta - QTAD-2570

            showToast(contentUpgradeStarted);

            managementService.callUpgradeContent().then(function () {

                showToast(contentUpgraded);

            }, function (error) {
                console.log(error);
                contentUpgradeFailed.subHeading = "Error: " + error.data.message;
                showToast(contentUpgradeFailed);
            });
        };
      
        fixContainerHeight(1);

        $scope.callpopupToUploadUrlFilteringContent = function(ev){
            console.log("Launch upload url filtering content upload dialog.");             
            $mdDialog.show({
                controller: urlFilteringCtr,
                templateUrl: 'core/components/administration/shieldx-updates/urlfiltering-content.html',                
                parent: angular.element(document.body),
                targetEvent: ev,
                fullscreen: true,
                openFrom: {top: 1100, height: 0},
                closeTo: {left: 1500}
                //locals: {'cloudData': cloudData}
            }).then(function () {

            });
        };

        //Export URL Filtering Data
        $scope.exportUrlContent = function () {
            console.log("Export URL Content");

            var exportUrlContentCompleted = {
                'heading': 'Export Url filtering content completed',
                'subHeading': 'URL filtering content has been exported successfully.',
                'type': 'success',
                'timeout': 5000
            };

            managementService.exportUrlFilteringData(1).then(function (data) {

                console.log("url filtering content exported.");
                console.log(data);
                showToast(exportUrlContentCompleted);

                var linkElement = document.createElement('a');
                try {
                    var blob = new Blob([data], { type: 'application/octet-stream' });
                    var url = window.URL.createObjectURL(blob);

                    linkElement.setAttribute('href', url);
                    linkElement.setAttribute("download", 'emit-url-data.csv');

                    var clickEvent = new MouseEvent("click", {
                        "view": window,
                        "bubbles": true,
                        "cancelable": false
                    });
                    linkElement.dispatchEvent(clickEvent);
                } catch (ex) {
                    console.log(" Failed to export url filtering content key "+ex.getMessage());
                    console.log(ex);
                }

            }, function error(err) {
                console.log(err);
                var exportUrlDataFailed = {
                    'heading': 'Export url filtering content request failed.',
                    'subHeading': '&nbsp;',
                    'type': 'fail',
                    'timeout': 10000,
                };
                exportUrlDataFailed.subHeading = "Error: " + err.data.message;

                showToast(exportUrlDataFailed);
            });
        };

        // control Plane Setting controller

        $scope.clouds = [];

        infrastructureConnectorService.getListOfInfrastructures().then(function (data) {

            $scope.infraAvailable = (data.length > 0) ? true : false;

            $scope.clouds = data;

        });

        $scope.deploymentSpecDataNotAvailable = true;

        $scope.showDeploymentSpecOptions = function (infraId) {
            $scope.enableNext = false;
            $scope.deploymentSpecList = [];
            $scope.selectedDspec= parseInt(infraId);
            deploymentSpecificationService.getDeploymentSpecList(parseInt(infraId)).then(
                    function (delpoymentSpecList) {
                        $scope.deploymentSpecList = delpoymentSpecList;
                        if (delpoymentSpecList.length !== 0) {
                            $scope.deploymentSpecDataNotAvailable = false;
                        }
                    }
            );
        };

        function urlFilteringCtr($rootScope, $scope, $sessionStorage){
            
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

            $scope.urlfiltering = {};

            $scope.urlfiltering.tenantId = 1;
            
            $scope.urlfiltering.tenants = [];

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
            

            $scope.getTenantDataForCloud = function (cloudObj) {
                deploymentSpecificationService.getTenants(cloudObj.id).then(function (tenants) {
                    _.each(tenants, function (tenant) {
                        tenant.cloudName = cloudObj.name;
                        $scope.urlfiltering.tenants.push(tenant);
                    });
                });
            };

            $scope.getTenants = function () {
                infrastructureConnectorService.getListOfInfrastructures().then(function (clouds) {
                    _.each(clouds, function (cloud) {
                        $scope.getTenantDataForCloud(cloud);
                    });
                });
            };

            $scope.uploadUrlfilteringContent = function () {
                                
                var tenantId = $scope.urlfiltering.tenantId;
                console.log("Upload CSV File for tenantId "+tenantId);
                var csvfile = $scope.urlfilteringcsvfile;
                
                var startcsvFileUploadMessage = {
                    'heading': 'URL Filtering CSV File Upload',
                    'subHeading': 'URL filtering csv file upload started..',
                    'type': 'progress',
                    'timeout': 2000
                };
                var csvFileUploadedMessage = {
                    'heading': 'URL Filtering CSV File Upload',
                    'subHeading': 'URL filtering csv file uploaded successfully.',
                    'type': 'success',
                    'timeout': 2000
                };

                var csvFileUploadFailedMessage = {
                    'heading': 'URL Filtering CSV File Upload',
                    'subHeading': 'URL Filtering csv file upload failed',
                    'type': 'fail',
                    'timeout': 3000
                };

                showToast(startcsvFileUploadMessage);

                managementService.uploadFile(tenantId, csvfile).then(function (data) {
                    showToast(csvFileUploadedMessage);
                    console.log("URL Filtering CSV file has been imported successfully.");
                    if (data) {
                        console.log(data);
                    }
                }, function error(err) {
                    console.log("URL Filtering CSV file upload failed.");
                    csvFileUploadFailedMessage.subHeading = "Error: " + err.data.message;
                    showToast(csvFileUploadFailedMessage);
                });

                $mdDialog.hide();
            };

            $scope.getTenants();

            $scope.fileInputText = "No File Chosen";

            $scope.fileNameChanged =  function(element){
                $scope.fileInputText = element.files[0].name;
            };

        }
        $scope.$on('$viewContentLoaded', function (event) {
            console.log(event);
            fixContainerHeight(1);
        });

    }

    angular.module('shieldxApp').controller('shieldxUpdatesCtr', shieldxUpdatesCtr);
})();
