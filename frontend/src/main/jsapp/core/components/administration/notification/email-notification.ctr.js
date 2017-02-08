(function() {
    function emailnotificationCtr(
        $scope,
        $rootScope,
        $http,
        $state,
        $translate,
        $sessionStorage,
        infrastructureConnectorService, 
		policyService,
        emailService,
        $timeout,
        $q,
        $mdDialog
    ) {
        "ngInject";

        clearAllSession($sessionStorage);

        $scope.recipientemails = [];
        $scope.recipientsAvailable = false;
        $scope.emailNotificationProfileAvailable = false;
        var totalRecipients = 0;
        //////////////////     Start Email notification Configuration  //////////////////
        //FUNCTIONALITY TO ADD email notifcation
        
        $scope.active_help_id = "user_type_help_wizard";
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

        $scope.emailnotification = {};
        $scope.emailnotification.enable = 0;
        $scope.emailnotification.isEnabledForThreat = 0;
        $scope.emailnotification.isMatchingSeverity = 0;
        $scope.emailnotification.suppressionTime = 10;
        $scope.emailnotification.severityRange=2;
        $scope.severityRanges = [{ "id": 0, "name": "Severity Low and Above"},
                                    { "id": 1, "name": "Severity Medium and Above"},
                                    { "id": 2, "name": "Severity High and Above"},
                                    { "id": 3, "name": "Severity Critical"}];
       
        //$scope.emailnotification.messagepref=$translate.instant("admin.setup.syslog.default.message");

        $scope.recipientemails = [];

        $scope.emailnotification.subject = $translate.instant("admin.setup.email.message.subject");

        $scope.emailnotification.body = $translate.instant("admin.setup.email.message.body");

        var messagetoken = $translate.instant("admin.setup.syslog.message.tokens");                                     
        //$scope.syslogMsgTokens = messagetoken.split(",");
        $scope.emailMsgTokens = [
                    {"tokenkey":"$TIMESTAMP$","value":"TIMESTAMP"},
                    {"tokenkey":"$EVENT_TYPE$","value":"EVENT_TYPE"},
                    {"tokenkey":"$THREAT_NAME$","value":"THREAT_NAME"},
                    {"tokenkey":"$SEVERITY$","value":"SEVERITY"},
                    {"tokenkey":"$DESTINATION_IP$","value":"DESTINATION_IP"},
                    {"tokenkey":"$DESTINTATION_PORT$","value":"DESTINTATION_PORT"},
                    {"tokenkey":"$DESTINATION_VM_NAME$","value":"DESTINATION_VM_NAME"},
                    {"tokenkey":"$DESTINATION_RESOURCE_GROUP$","value":"DESTINATION_RESOURCE_GROUP"},
                    {"tokenkey":"$SOURCE_IP$","value":"SOURCE_IP"},
                    {"tokenkey":"$SOURCE_PORT$","value":"SOURCE_PORT"},
                    {"tokenkey":"$SOURCE_RESOURCE_GROUP$","value":"SOURCE_RESOURCE_GROUP"},
                    {"tokenkey":"$SOURCE_VM_NAME$","value":"SOURCE_VM_NAME"},
                    {"tokenkey":"$PROTOCOL$","value":"PROTOCOL"},
                    {"tokenkey":"$APPLICATION_NAME$","value":"APPLICATION_NAME"},
                    {"tokenkey":"$POLICY_TYPE$","value":"POLICY_TYPE"},
                    {"tokenkey":"$POLICY_NAME$","value":"POLICY_NAME"},
                    {"tokenkey":"$SECURITY_POLICY_SET$","value":"SECURITY_POLICY_SET"},
                    {"tokenkey":"$RESULT_STATUS$","value":"RESULT_STATUS"},
                    {"tokenkey":"$ACTION_TAKEN$","value":"ACTION_TAKEN"},
                    {"tokenkey":"$ATTACKER_RESOURCE_GROUP$","value":"ATTACKER_RESOURCE_GROUP"},
                    {"tokenkey":"$VICTIM_RESOURCE_GROUP$","value":"VICTIM_RESOURCE_GROUP"},
                    {"tokenkey":"$DOMAIN$","value":"DOMAIN"},
                    {"tokenkey":"$DOMAIN_TAG$","value":"DOMAIN_TAG"},
                    {"tokenkey":"$CERTIFICATE_TAG$","value":"CERTIFICATE_TAG"},
                    {"tokenkey":"$FILE_SIGNATURE$","value":"FILE_SIGNATURE"},
                    {"tokenkey":"$FILE_HASH$","value":"FILE_HASH"},
                    {"tokenkey":"$START_TIME$","value":"START_TIME"},
                    {"tokenkey":"$END_TIME$","value":"END_TIME"},
                    {"tokenkey":"$TCP_SESSION_START_EVENT$","value":"TCP_SESSION_START_EVENT"},
                    {"tokenkey":"$TCP_SESSION_END_EVENT$","value":"TCP_SESSION_END_EVENT"},
                    {"tokenkey":"$TCP_RECV_FLAGS$","value":"TCP_RECV_FLAGS"},
                    {"tokenkey":"$TCP_SENT_FLAGS$","value":"TCP_SENT_FLAGS"},
                    {"tokenkey":"$BYTES_RECEIVED$","value":"BYTES_RECEIVED"},
                    {"tokenkey":"$BYTES_SENT$","value":"BYTES_SENT"},
                    {"tokenkey":"$EVENTS_SENT_COUNT$","value":"EVENTS_SENT_COUNT"},
                    {"tokenkey":"$EVENTS_RECV_COUNT$","value":"EVENTS_RECV_COUNT"},
                    {"tokenkey":"$IOP_THREAT_NAME$","value":"IOP_THREAT_NAME"},
                    {"tokenkey":"$IOP_THREAT_TIMESTAMP$","value":"IOP_THREAT_TIMESTAMP"},
                    {"tokenkey":"$IOP_RULE_ID$","value":"IOP_RULE_ID"},
                    {"tokenkey":"$IOP_DETECTION_ID$","value":"IOP_DETECTION_ID"},
                    {"tokenkey":"$CHASSIS_ID$","value":"CHASSIS_ID"},
                    {"tokenkey":"$MICROSERVICE_TYPE$","value":"MICROSERVICE_TYPE"},
                    {"tokenkey":"$MICROSERVICE_INSTANCE_ID$","value":"MICROSERVICE_INSTANCE_ID"}
        ];


        emailService.getSMTPNotificationProfile(1).then(function (data) {

            console.log("Get SMTP notification profile for tenant id 1 ");

            if (!data) {
                console.log("No data available");
                $scope.emailNotificationProfileAvailable = false;
            } else {
                if(!data.enable) {
                    console.log("SMTP notification profile is not enabled.");
                    $scope.emailNotificationProfileAvailable = false;
                    $scope.emailnotification.subject = $translate.instant("admin.setup.email.message.subject");
                    $scope.emailnotification.body = $translate.instant("admin.setup.email.message.body");
                    $scope.emailnotification.suppressionTime = 10;
                    $scope.emailnotification.severityRange=2;
                }else {
                    $scope.emailNotificationProfileAvailable = true;
                    $scope.emailnotification = data;
                    console.log("**Enabled = " + data.enable + " Suppression Time = " + data.suppressionTime + "  email subject = " + data.subject);
                    console.log($scope.emailnotification);
                }
            }
        }, function (error) {
            $scope.errorMessage = "ERROR occured while getting SMTP notification profile details!!!";
            $scope.emailNotificationProfileAvailable = false;
            console.log(error);
        });


        $scope.addEmailNotificationProfile = function () {

            console.log(" Add email notification -->> "+$scope.emailnotification);

            var emailNotificationProfile = $scope.emailnotification;

            //var tenantId = $scope.selectedTenantObj.id;
            var tenantId = 1;
            console.log("Tenant Id = "+tenantId);

            emailNotificationProfile.tenantId = tenantId;

            var startAddEmailNotificationMessage = {
                'heading': 'Create Email Notification Profile',
                'subHeading': 'This should take only a few minutes max.',
                'type': 'progress',
                'timeout': 5000
            };
            var successfulEmailNotificationMessage = {
                'heading': 'Email Notification Created',
                'subHeading': 'Email notification created successfully.',
                'type': 'success',
                'timeout': 5000
            };
            showToast(startAddEmailNotificationMessage);
            emailService.createEmailNotificationProfile(tenantId, emailNotificationProfile).then(function (data) {
                console.log(" Email Notification Profile has been saved.");
                if (data) {
                    var newData = emailNotificationProfile;
                    console.log(emailNotificationProfile);
                    showToast(successfulEmailNotificationMessage);

                    //syslogProfilesData.unshift(newData);
                    //console.log(syslogProfilesData);
                    //$sessionStorage.syslogProfilesList = syslogProfilesData;
                    //$scope.syslogProfiles=syslogProfilesData;
                    //$rootScope.$broadcast('newSyslogForwarderCreated', {});
                }
            }, function (error) {
                var failureEmailNotificationCreation = {
                    'heading': 'Email notification creation failed',
                    'subHeading': "Error: " + error.data.message,
                    'type': 'fail',
                    'timeout': 10000
                };
                showToast(failureEmailNotificationCreation);
            });
            //$mdDialog.hide();
        };


        $scope.msgTokensPerRow = 6;

        function messageTokensCtr($rootScope, $scope) {
            $scope.getMessageTokens = function() {

                $http.get('message-tokens.json').success(function(data) {

                    $scope.emailMsgTokens = data;

                });

                console.log("Message Tokens = "+$scope.emailMsgTokens);
            };
        }

        $scope.customMessageBuilder = function(customMsg){
            console.log("Message Token -->> "+customMsg);                             
            //$scope.messagepref=customMsg;
            $rootScope.$broadcast('customMessageBuilder', customMsg);
        };

        emailService.getRecipients(1).then(function (data) {
            console.log("Get recipient emails.");
            $scope.recipientemails = data;
            console.log("Recipients length = "+$scope.recipientemails.length);
            console.log("Recipients length = "+$scope.recipientemails[0].emailaddress);
        }, function (error) {
            console.log(error);
            $scope.errorMessage = "ERROR occured while getting recipeints data!!!";
            $scope.recipientemails = [];
        });


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

        $scope.callpopupTenats = function(event) {
            $mdDialog.show({
                skipHide: true,
                preserveScope: true,
                controller: tenantListCtr,
                bindToController: true,
                templateUrl: 'core/components/administration/policy/tenants.html',
                parent: angular.element(document.body),
                targetEvent: event,
                fullscreen: false,
                scope: $scope,
                openFrom: { top: 1100, height: 0 },
                closeTo: { left: 1500 }
            }).then(function() {

            });
        };


        function tenantListCtr($scope, $mdDialog, policyService) {
             $scope.tenantselected = false;
             $scope.selectedTenantsValue = '';
            $scope.canceltenantDialogue = function() {
                //tenantSelection();
                $mdDialog.cancel();
            };
            $scope.tenantSelected = false;
            $scope.tenants = $scope.tenantsList;
            $scope.onSelectTenantChanged = function() {
                console.log(" onSelectionChanged >> ");
                $scope.tenantSelected = true;
            };
            $scope.tenantdone = function(value) {
                $scope.tenantselected = true;
                $scope.selectedTenantObj = JSON.parse(value);
                $mdDialog.hide();
            };
        }

        $scope.getTenantDataForCloud = function(cloudObj) {
            
            console.log("getTenantDataForCloud called for cloud "+cloudObj);
            
            $scope.tenantsList = [];
            policyService.getDataBasedOnId("infras", cloudObj.id + "/tenants", "").then(function(tenants) {
                
                _.each(tenants, function(tenant) {
                    console.log("getTenantDataForCloud : Cloud Name = "+cloudObj.name);
                    tenant.cloudName = cloudObj.name;
                    $scope.tenantsList.push(tenant);
                });
                $scope.cloudsLength = $scope.cloudsLength -1;
                if($scope.cloudsLength === 0){
                    $scope.tennatsListCompleted = false;    
                }
            });
            
            console.log("tenantsList contains "+$scope.tenantsList);
        };

        $scope.getTenants = function() {
            console.log("getTenants() called ...");
            infrastructureConnectorService.getListOfInfrastructures().then(function(clouds) {
                $scope.cloudsLength = clouds.length;
                _.each(clouds, function(cloud) {
                    $scope.getTenantDataForCloud(cloud);
                });
            });
        };
        $scope.getTenants();
        
        $scope.callpopupAddRecipients = function(event) {
            $mdDialog.show({
                skipHide: true,
                preserveScope: true,
                controller: addRecipientsCtr,
                bindToController: true,
                templateUrl: 'core/components/administration/notification/add-recipient.html',
                parent: angular.element(document.body),
                targetEvent: event,
                fullscreen: false,
                scope: $scope,
                openFrom: { top: 1100, height: 0 },
                closeTo: { left: 1500 }
            }).then(function() {

            });
        };


        //////////////////     Start Add Recipients   //////////////////
        function addRecipientsCtr($rootScope, $scope) {
                      
            $scope.recipient = {};

            $scope.recipient.name='';
            $scope.recipient.emailaddress='';

            $scope.recipient.recipeintEmails = 'addRecipientsCtr';

            $scope.addRecipientEmail = function () {

                console.log(" Add recipient email -->> "+$scope.recipient);

                var recipientvo = $scope.recipient;

                //var tenantId = $scope.selectedTenantObj.id;
                var tenantId = 1;
                console.log("Tenant Id = "+tenantId);

                recipientvo.tenantId = tenantId;

                var recipientCreated = {
                    'heading': 'Add Recipient Email',
                    'subHeading': 'Recipient email has been saved successfully.',
                    'type': 'success',
                    'timeout': 2000,
                    'callback': function () {
                        $state.reload();
                    }
                };

                emailService.addRecipient(tenantId, recipientvo).then(function (data) {
                    console.log(" Recipient details has been saved.");
                    showToast(recipientCreated);
                    if (data) {
                        var newData = recipientvo;
                        console.log(newData);
                    }
                }, function (error) {
                    var failed = {
                        'heading': 'Failed to add email recipient.',
                        'subHeading': "Error: " + error.data.message,
                        'type': 'fail',
                        'timeout': 3000
                    };
                    showToast(failed);
                });
                $mdDialog.hide();
            };


            $scope.cancelAddRecipientDialog = function() {
                $mdDialog.cancel();
            };
        }

        //////////////////     End email notification configuration   //////////////////

    }

    angular.module('shieldxApp').controller('emailnotificationCtr', emailnotificationCtr);
})();        