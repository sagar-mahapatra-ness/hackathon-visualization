(function () {
    function ldapServerSettingsCtr(
        $scope,
        $state,
        $translate,
        ldapService,
        $q,
        $sessionStorage,
        $mdDialog) {

            "ngInject";
            
            clearAllSession($sessionStorage);
            var ldapConfigData;
            $scope.ldapConfigAvailable = false;
            $scope.editMiscState = false;

            $scope.isAdornmentPanelOpen = false;
                                    
            $scope.$emit('listenHeaderText', {headerText: $translate.instant('admin.setup.heading')});            

            var started = {
                'heading': 'Save Initiating',
                'subHeading': 'Save Initiating..',
                'type': 'progress',
                'timeout': $scope.toastTimeout
            };

            var completed = {
                'heading': 'LDAP Server Settings Saved',
                'subHeading': 'LDAP Server Settings Saved',
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

            var startedTest = {
                'heading': 'Test Connection Initiating',
                'subHeading': 'Test Connection Initiating..',
                'type': 'progress',
                'timeout': $scope.toastTimeout
            };

            var completedTest = {
                'heading': 'Test Passed',
                'subHeading': 'Test Passed',
                'type': 'success',
                'timeout': $scope.toastTimeout,
                'callback': function () {
                    $state.reload();
                }
            };

            var failedTest = {
                'heading': 'Test Failed',
                'subHeading': '&nbsp;',
                'type': 'fail',
                'timeout': $scope.toastTimeout,
                'callback': function () {
                    $state.reload();
                }
            };


            $scope.ldapserver = {};

            $scope.smbserver_ipaddress_fqdn = $translate.instant("wizardinfrastucture.placeholder.ip_address_fqdn");
            $scope.smbserver_login = "User Name";
            $scope.smbserver_password = "Password";

            ldapService.getSettings().then(function (data) {
               $scope.ldapserver=data;

            }, function (error) {
                console.log(error);
                $scope.errorMessage = "ERROR occured while getting User List!!!";
            });


            //Save SMB Configuration
            $scope.saveSettings = function () {
                var name = $scope.ldapserver.name;
                var ip = $scope.ldapserver.ip;
                var userName = $scope.ldapserver.username;
                var password = $scope.ldapserver.password;
                var port = $scope.ldapserver.port;

                var ldapServerConfigDetails = {
                    'name' : name,
                    'ip': ip,
                    'username': userName,
                    'password': password,
                    'port': port,
                    "tenantID" : 1
                };

                //showToast(backupStarted);
                console.log("ldapServerSettingsCtr : save configuration settings. server ip = "+ip+" user name  = "+userName);
                
                showToast(started); 

                ldapService.saveSettings(ldapServerConfigDetails).then(function () {
                    console.log("Save LDAP Server configuration !!!");
                    showToast(completed);

                }, function (error) {
                    console.log(error);
                    failed.subHeading = "Error: " + error.data.message;
                    showToast(failed);
                });                
                //$mdDialog.hide();
            }; 

            //Save SMB Configuration
            $scope.testConnection = function () {
                var name = $scope.ldapserver.name;
                var ip = $scope.ldapserver.ip;
                var userName = $scope.ldapserver.username;
                var password = $scope.ldapserver.password;
                var port = $scope.ldapserver.port;

                var ldapServerConfigDetails = {
                    'name' : name,
                    'ip': ip,
                    'username': userName,
                    'password': password,
                    'port': port,
                    "tenantID" : 1
                };

                //showToast(backupStarted);
                console.log("ldapServerSettingsCtr : test connection. server name = "+name+" user name  = "+userName);
                
                showToast(startedTest); 

                ldapService.testConnection(ldapServerConfigDetails).then(function () {
                    console.log("test LDAP server connection !!!");
                    showToast(completedTest);

                }, function (error) {
                    console.log(error);
                    failed.subHeading = "Error: " + error.data.message;
                    showToast(failedTest);
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
    angular.module('shieldxApp').controller('ldapServerSettingsCtr', ldapServerSettingsCtr);

})();