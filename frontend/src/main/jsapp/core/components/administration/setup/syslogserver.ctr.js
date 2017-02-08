(function() {
    function syslogServerSettingsCtr(
        $scope,
        $state,
        $http,
        $q,
        $translate,
        $sessionStorage,
        deploymentSpecificationService,
        infrastructureConnectorService,
        syslogForwardingService,
        $mdDialog
    ) {
        "ngInject";

        clearAllSession($sessionStorage);
        var serverProfiles = [];
        var deferred = $q.defer();
        $scope.promise = deferred.promise;
        $scope.promiseCompleted = true;
        var promiseCtr = 0;
        var totalClouds = 0;
        $scope.serverProfilesAvailable = false;
        $scope.editMiscState = false;

        $scope.isAdornmentPanelOpen = false;
        $scope.isSearchBarOpen = false;

        var serverProfilesCtr = 0;
        $scope.profiles = [];

        $scope.serverProfileSelected = false;

        /* **** for tables [start] **** */
        $scope.selected = [];
        $scope.query = {
            order: 'name',
            limit: 10,
            page: 1
        };

        $scope.isAdornmentPanelOpen = false;
        $scope.isSearchBarOpen = false;

        $scope.updateAdornmentPanel = function (event, rowData) {
            $scope.toggleAdornmentPanel();
            $scope.adornmentData = rowData;
            console.log($scope.adornmentData);
            console.log("Server Profile Name : "+$scope.adornmentData.serverProfileName);
            console.log("Server Profile Id : "+$scope.adornmentData.serverProfileId);
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


        $scope.serverprofile = {};

        $scope.serverprofile.protocol='2';
        $scope.protocoltypes = {
            'protocols': [
                {'name': 'TCP', 'value': '1'},
                {'name': 'UDP', 'value': '2'}
            ]
        };

        $scope.serverprofile.serverProfileName = "";
        $scope.serverprofile.serverFqdnOrIp = "";
        $scope.serverprofile.port = 514;
        $scope.serverprofile.usessl = "";
        $scope.serverprofile.certFile = "";

        $scope.serverprofile.targetServerProfile='serverProfilesListCtr';

        $scope.serverprofile.tenantId = 1;

        $scope.fileInputText = "No File Chosen";

        $scope.tenants = [];

        $scope.getTenantDataForCloud = function (cloudObj) {
            deploymentSpecificationService.getTenants(cloudObj.id).then(function (tenants) {
                _.each(tenants, function (tenant) {
                    tenant.cloudName = cloudObj.name;
                    $scope.tenants.push(tenant);
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

        $scope.getTenants();

        /*
        $scope.fileChanged = function (elem) {
            $scope.files = elem.files;
            $scope.$appply();
        };
        */

        //Configure Resigning Keys
        $scope.addProfile = function(ev){
            console.log("Open add syslog server profile dialog.");
            $mdDialog.show({
                controller: syslogServerSettingsCtr,
                skipHide: true,
                templateUrl: 'core/components/administration/setup/syslogserver-settings.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                fullscreen: true,
                openFrom: {top: 1100, height: 0},
                closeTo: {left: 1500}
                //locals: {'cloudData': cloudData}
            }).then(function () {

            });
        };


        // Get Server Profiles if exist any
        var tenantId = $scope.serverprofile.tenantId;
        console.log("Get Server Profiles for Tenant Id : "+tenantId);
        syslogForwardingService.getSyslogServerProfiles(tenantId).then(function (data) {
            console.log("Server Profiles = "+data);
            //$scope.serverprofile = angular.fromJson(data);
            //console.log("Server Profile Name = "+$scope.serverprofile.serverProfileName);
            totalprofiles = data.length;
            console.log("Total certs = "+totalprofiles);
            if (totalprofiles === 0) {
                deferred.resolve();
                $scope.promiseCompleted = false;
                $scope.serverProfilesAvailable = false;

            } else {
                console.log("Server profiles available = "+data);
                $scope.serverProfilesAvailable = true;

                for (var i = 0; i < data.length; i++) {
                    console.log(" data -> "+data[i]);
                    serverProfiles[i] = {};
                    serverProfiles[i] = data[i];
                }

                deferred.resolve();
                $scope.promiseCompleted = false;
                $scope.profiles = serverProfiles;

                console.log(serverProfiles);
            }
        }, function (error) {
            console.log("Failed to get syslog server profiles");
            $scope.errorMessage = "ERROR occured while getting syslog server profiles.";
            serverProfiles = [];
            $scope.profiles = [];
            deferred.resolve();
            $scope.promiseCompleted = false;
            $scope.serverProfilesAvailable = false;
            console.log(error);
        });


        $scope.addSyslogServerProfile = function () {

            console.log(" Add Syslog Server Profile -->> "+$scope.serverprofile);

            var syslogServerProfile = $scope.serverprofile;

            var tenantId = 1;
            syslogServerProfile.tenantId = tenantId;

            var startAddSyslogServerMessage = {
                'heading': 'Create Syslog Server Profile',
                'subHeading': 'This should take only a few minutes max.',
                'type': 'progress',
                'timeout': 3000
            };
            var successfulSyslogServerMessage = {
                'heading': 'Syslog Server Created',
                'subHeading': 'Syslog Server created successfully.',
                'type': 'success',
                'timeout': 2000
            };
            showToast(startAddSyslogServerMessage);
            syslogForwardingService.createSyslogServerProfile(tenantId, syslogServerProfile).then(function (data) {
                console.log(" Add Syslog Server profile.");
                if (data) {
                    var newData = syslogServerProfile;
                    console.log(syslogServersData);
                    showToast(successfulSyslogServerMessage);

                    syslogServersData.unshift(newData);
                    console.log(syslogServersData);
                    $sessionStorage.syslogServersList = syslogServersData;
                    $scope.syslogServerProfiles=syslogServersData;
                    //$rootScope.$broadcast('newSyslogServerCreated', {});
                }
            }, function (error) {
                var failureSyslogServerCreation = {
                    'heading': 'Syslog Server creation failed',
                    'subHeading': "Error: " + error.data.message,
                    'type': 'fail',
                    'timeout': 3000
                };
                showToast(failureSyslogServerCreation);
            });
            $mdDialog.hide();
        };

        $scope.deleteSyslogServerProfile = function (event, rowData) {

            $scope.adornmentData = rowData;
            console.log(" Delete syslog server profile for server profile id : "+$scope.adornmentData.serverProfileId);
            var startDeleteSyslogServerProfile = {
                'heading': 'Delete Syslog Server Profile',
                'subHeading': '',
                'type': 'progress',
                'timeout': 3000
            };
            var successfulDeletedSyslogServerProfile = {
                'heading': 'Syslog server deleted',
                'subHeading': 'Syslog server deleted successfully.',
                'type': 'success',
                'timeout': 2000,
                'callback': function () {
                    $state.reload();
                }
            };
            showToast(startDeleteSyslogServerProfile);
            syslogForwardingService.deleteSyslogServerProfile($scope.adornmentData.serverProfileId).then(function (data) {
                console.log(" Syslog server profile deleted for profile id "+$scope.adornmentData.serverProfileId);
                if (data) {
                    showToast(successfulDeletedSyslogServerProfile);
                }
            }, function (error) {
                var failureSyslogServerProfileDeletion = {
                    'heading': 'Syslog server deletion failed',
                    'subHeading': "Error: " + error.data.message,
                    'type': 'fail',
                    'timeout': 3000
                };
                showToast(failureSyslogServerProfileDeletion);
            });
        };


        $scope.fileNameChanged =  function(element){
            $scope.fileInputText = element.files[0].name;
        };

        $scope.$on('$viewContentLoaded', function (event) {
            console.log(event);
            fixContainerHeight(1);
        });

        $scope.clearServerProfilesFromSession = function () {
            clearMasterSession($sessionStorage, $state);
            //$sessionStorage.profileList = false;
            $state.reload();
        };

        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.cancelDialog = function() {
            $mdDialog.cancel();
        };
    }
    angular.module('shieldxApp').controller('syslogServerSettingsCtr', syslogServerSettingsCtr);
})();