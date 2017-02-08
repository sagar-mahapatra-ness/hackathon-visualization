(function () {
    function smbServerSettingsCtr(
        $scope,
        $state,
        $translate,
        smbService,
        $q,
        $sessionStorage,
        $mdDialog,
        userSessionMenagment) {

            "ngInject";
            
            clearAllSession($sessionStorage);
            var smbConfigData;
            $scope.smbConfigAvailable = false;
            $scope.editMiscState = false;

            $scope.isAdornmentPanelOpen = false;

            $scope.smbServerConfigDetails ={};

            $scope.$emit('listenHeaderText', {headerText: $translate.instant('admin.setup.heading')});

            var started = {
                'heading': 'Save Initiating',
                'subHeading': 'Save Initiating..',
                'type': 'progress',
                'timeout': $scope.toastTimeout
            };

            var completed = {
                'heading': 'SMB Server Settings Saved',
                'subHeading': 'SMB Server Settings Saved',
                'type': 'success',
                'timeout': $scope.toastTimeout,
                'callback': function () {
                    $state.reload();
                }
            };

            var failed = {
                'heading': 'Save Failed',
                'subHeading': '&nbsp;',
                'type': 'fail',
                'timeout': $scope.toastTimeout,
                'callback': function () {
                    $state.reload();
                }
            };


            $scope.smbserver = {};

            $scope.smbserver_ipaddress_fqdn = $translate.instant("wizardinfrastucture.placeholder.ip_address_fqdn");
            $scope.smbserver_login = "User Name";
            $scope.smbserver_password = "Password";
            $scope.smbserver_sharename = "Share Name";

            //var read_id = authorities("setup_read");
            var update_id = authorities("setup_update");
           //$scope.is_read_smb = userSessionMenagment.isUserAllowd(read_id);
            $scope.is_update_smb = userSessionMenagment.isUserAllowd(update_id);


            smbService.getSmbServerSettings().then(function (data) {

                console.log("Get SMB server config details for tenant id 1");

                if (!data) {
                    $scope.smbConfigAvailable = false;
                } else {
                    $scope.smbConfigAvailable = true;
                    //$scope.smbserver = data;
                    console.log(" Server IP = "+data.serverIp+" Share Name = "+data.shareName+"  Last Modified Time = "+data.lastModifiedTime);
                    $scope.smbserver.ip = data.serverIp;
                    $scope.smbserver.username = data.userName;
                    $scope.smbserver.password = data.password;
                    $scope.smbserver.sharename = data.shareName;
                    console.log($scope.smbserver);
                }

            }, function (error) {
                console.log(error);
                $scope.errorMessage = "ERROR occured while getting smb server config details!!!";
                $scope.smbConfigAvailable = false;
            });


            //Save SMB Configuration
            $scope.smbserverSettings = function () {
                var serverName = $scope.smbserver.name;
                var ip = $scope.smbserver.ip;
                var userName = $scope.smbserver.username;
                var password = $scope.smbserver.password;
                var shareName = $scope.smbserver.sharename;

                var smbServerConfigDetails = {
                    'servername' : serverName,
                    'serverIp': ip,
                    'userName': userName,
                    'password': password,
                    'shareName': shareName
                };

                //showToast(backupStarted);
                console.log("smbServerSettingsCtr : save configuration settings. server ip = "+ip+" user name  = "+userName);
                
                showToast(started); 

                smbService.saveSmbServerSettings(smbServerConfigDetails).then(function () {
                    showToast(completed);
                    console.log("SMB server settings saved.");
                }, function (error) {
                    console.log(error);
                    failed.subHeading = "Error: " + error.data.message;
                    showToast(failed);
                });                
                //$mdDialog.hide();
            };


            //Test SMB server connection
            $scope.testConnection = function () {
                var ip = $scope.smbserver.ip;
                var smbServerConfigDetails = {
                    'servername' : $scope.smbserver.name,
                    'serverIp': $scope.smbserver.ip,
                    'userName': $scope.smbserver.username,
                    'password': $scope.smbserver.password,
                    'shareName': $scope.smbserver.sharename
                };

                var startTestConnection = {
                    'heading': 'Test connection',
                    'subHeading': 'Test connection initiating..',
                    'type': 'progress',
                    'timeout': $scope.toastTimeout
                };

                var testConnectionDone = {
                    'heading': 'Test connection successful',
                    'subHeading': 'Test connection to SMB was successful',
                    'type': 'success',
                    'timeout': $scope.toastTimeout
                    //'callback': function () {
                    //    $state.reload();
                    //}
                };

                //showToast(backupStarted);
                console.log("smbServerSettingsCtr : test connection settings for smb server ip = "+ip);
                
                showToast(startTestConnection); 

                smbService.testConnection(smbServerConfigDetails).then(function () {
                    showToast(testConnectionDone);
                    console.log("test SMB server connection successful!!!");

                }, function (error) {
                    console.log(error);
                    var testConnectionFailed = {
                        'heading': 'Smb server test connection failed',
                        'subHeading': "Error: Test connection failed!",
                        'type': 'fail',
                        'timeout': 10000
                    };                    
                    showToast(testConnectionFailed);
                });                
                //$mdDialog.hide();
            };

            $scope.pwdType = 'password';
            $scope.togglePasswordType = function () {
                $scope.pwdType = $scope.pwdType === 'password' ? 'text' : 'password';
            };

            $scope.showStatus = function (status, test) {
                return status === test;
            };

            $scope.hide = function () {
                $mdDialog.hide();
            };

            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.$on('$viewContentLoaded', function (event) {
                console.log(event);
                fixContainerHeight(1);
            });
    }
    angular.module('shieldxApp').controller('smbServerSettingsCtr', smbServerSettingsCtr);

})();