(function () {
    function emailServerSettingsCtr(
        $scope,
        $state,
        $translate,
        emailService,
        $q,
        $sessionStorage,
        $mdDialog) {

            "ngInject";
            
            clearAllSession($sessionStorage);
            $scope.emailConfigAvailable = false;
            $scope.editMiscState = false;

            $scope.emailConfigDetails ={}; 

            $scope.isAdornmentPanelOpen = false;
                                    
            $scope.$emit('listenHeaderText', {headerText: $translate.instant('admin.setup.heading')});            

            var started = {
                'heading': 'Save Initiating',
                'subHeading': 'Save Initiating..',
                'type': 'progress',
                'timeout': $scope.toastTimeout
            };

            var completed = {
                'heading': 'Email Server Settings Saved',
                'subHeading': 'Email Server Settings Saved',
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


            $scope.emailserver = {};

            $scope.emailserver_ipaddress_fqdn = $translate.instant("wizardinfrastucture.placeholder.ip_address_fqdn");
            $scope.emailserver_login = "User Name";
            $scope.emailserver_password = "Password";
            $scope.emailserver_port = "Port";
            $scope.emailserver_auth_reqd = "Server authentication required?";
            $scope.emailserver_use_ssl = "Use SSL/TLS";

            $scope.emailserver.port = 25;

            //Save email server configuration
            $scope.saveEmailServerSettings = function () {

                var emailServerConfigDetails = $scope.emailserver;
                var tenantId = 1;
                emailServerConfigDetails.tenantId = tenantId;

                var startAddSmtpServerMessage = {
                    'heading': 'Add SMTP Server',
                    'subHeading': 'This should take only a few minutes max.',
                    'type': 'progress',
                    'timeout': 3000
                };
                var successfulSmtpServerMessage = {
                    'heading': 'SMTP Server Created',
                    'subHeading': 'SMTP Server created successfully.',
                    'type': 'success',
                    'timeout':3000
                };

                //showToast(backupStarted);
                console.log("emailServerSettingsCtr : save configuration settings"+emailServerConfigDetails);
                showToast(startAddSmtpServerMessage);

                emailService.saveEmailServerSettings(tenantId,emailServerConfigDetails).then(function () {
                    showToast(successfulSmtpServerMessage);
                    console.log("Email server settings saved.");
                }, function (error) {
                    console.log(error);
                    failed.subHeading = "Error: " + error.data.message;
                    showToast(failed);
                });                
                //$mdDialog.hide();
            };


            emailService.getEmailServerSettings(1).then(function (data) {

                console.log("Get SMTP server config details for tenant id 1 ");

                if (!data) {
                    $scope.emailConfigAvailable = false;
                } else {
                    $scope.emailConfigAvailable = true;
                    $scope.emailserver = data;
                    console.log(" Sender = "+data.senderaddress+" Server IP = "+data.ip+"  use auth = "+data.usessl);
                    console.log($scope.emailserver);
                }
            }, function (error) {
                $scope.errorMessage = "ERROR occured while getting SMTP server details!!!";
                $scope.emailConfigAvailable = false;
                console.log(error);
            });


            //Test email server connection
            $scope.testConnection = function () {
                var ip = $scope.emailserver.ip;
                var emailServerConfigDetails = {
                    'senderAddress' : $scope.emailserver.sender,
                    'serverIp': $scope.emailserver.ip,
                    'userName': $scope.emailserver.username,
                    'password': $scope.emailserver.password,
                    'useAuth': ($scope.emailserver.useauth == 1)?true:false
                };

                var startTestConnection = {
                    'heading': 'Test connection',
                    'subHeading': 'Test connection initiating..',
                    'type': 'progress',
                    'timeout': $scope.toastTimeout
                };

                var testConnectionDone = {
                    'heading': 'Test connection successful',
                    'subHeading': 'Test connection to email server was successful',
                    'type': 'success',
                    'timeout': $scope.toastTimeout
                    //'callback': function () {
                    //    $state.reload();
                    //}
                };

                //showToast(backupStarted);
                console.log("emailServerSettingsCtr : test connection settings for email server ip = "+ip);
                
                showToast(startTestConnection); 

                emailService.testConnection(emailServerConfigDetails).then(function () {
                    showToast(testConnectionDone);
                    console.log("test connection to email server is successful!!!");

                }, function (error) {
                    console.log(error);
                    var testConnectionFailed = {
                        'heading': 'Email server test connection failed',
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
    angular.module('shieldxApp').controller('emailServerSettingsCtr', emailServerSettingsCtr);

})();