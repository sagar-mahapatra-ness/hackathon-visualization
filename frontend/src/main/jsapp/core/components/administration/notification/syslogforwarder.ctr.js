(function() {
    function syslogforwarderCtr(
        $scope,
        $rootScope,
        $http,
        $state,
        $translate,
        $sessionStorage,
        infrastructureConnectorService, 
		policyService,
        syslogForwardingService,      
        $timeout,
        $q,
        $mdDialog
    ) {
        "ngInject";

        clearAllSession($sessionStorage);
        
        var deferred = $q.defer();
        $scope.promise = deferred.promise; 
        $scope.promiseCompleted = true;
        
        var promiseCtr = 0;
        var totalClouds = 0;
        var totalSyslogProfiles = 0;
        var syslogProfilesData = [];
        $scope.syslogProfilesAvailable = false;
        var syslogServersData = [];
        $scope.editMiscState = false;

        var syslogKeysCtr = 0;
        $scope.syslogProfiles = [];

        $scope.syslogServerProfiles= [];        

        $scope.$emit('listenHeaderText', { headerText: "Notification" });    


        ///////////// Tables Start  //////////////
        $scope.selected = [];
        $scope.query = {
            order: 'profilename',
            limit: 5,
            page: 1
        };

        $scope.isAdornmentPanelOpen = false;
        $scope.isSearchBarOpen = false;

        $scope.updateAdornmentPanel = function (event, rowData) {
            $scope.toggleAdornmentPanel();
            $scope.adornmentData = rowData;
            console.log($scope.adornmentData);
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
        ////////// Tables end /////////
        

        
        ///////////     Get All Syslog Forwarder config Profiles ////////////////
        $sessionStorage.syslogProfilesList = [];

        syslogForwardingService.getSyslogProfiles(1).then(function (data) {
            console.log("Get Syslog forwarder config profiles for tenant id 1.");
            totalSyslogProfiles = data.length;
            if (totalSyslogProfiles === 0) {
                deferred.resolve();
                $scope.promiseCompleted = false;
                $scope.syslogProfilesAvailable = false;
            } else {
                $scope.syslogProfilesAvailable = true;
                $scope.promiseCompleted = false;
                deferred.resolve();
                var profileName = "";
                for (var i = 0; i < data.length; i++) {

                    profileName = data[i].profilename;
                    console.log(" Syslog Profile Name = "+profileName);
                    syslogProfilesData[i] = data[i];

                }
                $scope.syslogProfiles = syslogProfilesData;
                console.log(syslogProfilesData);
            }

        }, function (error) {
            console.log(error);
            $scope.errorMessage = "ERROR occured while getting Syslog Profiles List!!!";
            syslogProfilesData = [];
            $scope.syslogProfiles = [];
            deferred.resolve();
            $scope.promiseCompleted = false;
            $scope.syslogProfilesAvailable = false;
        });


        $scope.deleteSyslogProfile = function (data) {

            var startDeleteSyslogForwarderProfile = {
                'heading': 'Delete Syslog Forwarder Profile',
                'subHeading': 'This should take only a few minutes max.',
                'type': 'progress',
                'timeout': 5000
            };
            var successfulDeletedSyslogForwarderProfile = {
                'heading': 'Syslog forwarder deleted',
                'subHeading': 'Syslog forwarder deleted successfully.',
                'type': 'success',
                'timeout': 5000,
                'callback': function () {
                    $state.reload();
                }
            };
            showToast(startDeleteSyslogForwarderProfile);
            syslogForwardingService.deleteSyslogProfile(1).then(function (data) {
                console.log(" Delete Syslog forwarder profile.");
                if (data) {
                    showToast(successfulDeletedSyslogForwarderProfile);
                }
            }, function (error) {
                var failureSyslogForwarderDeletion = {
                    'heading': 'Syslog forwarder deletion failed',
                    'subHeading': "Error: " + error.data.message,
                    'type': 'fail',
                    'timeout': 10000
                };
                showToast(failureSyslogForwarderDeletion);
            });
        };


        $scope.clearSyslogProfilesListFromSession = function () {
            clearMasterSession($sessionStorage, $state);
        };

            	
        $scope.callpopupToAddNewSyslogForwarder = function(ev) {

            console.log(" callpopupToAddNewSyslogForwarder called.."+ev);

            $mdDialog.show({
                //skipHide: true,
                controller: addSyslogForwarderCtr,
                //bindToController: true,
                templateUrl: 'core/components/administration/notification/add-syslog-profile.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                fullscreen: true,
                //scope: $scope,
                openFrom: { top: 1100, height: 0 },
                closeTo: { left: 1500 }
            }).then(function() {
                console.log("**** failed to open popup");
            });
        };


        //////////////////     Start Syslog Forwarder Profile  Configuration  //////////////////
        //FUNCTIONALITY TO ADD Syslog Forwarder
        function addSyslogForwarderCtr($rootScope, $scope, $sessionStorage){            
            
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

            $scope.syslogprofile = {};
            $scope.syslogprofile.profilename = "";
            $scope.syslogprofile.serverProfileName ="";
            $scope.syslogprofile.messagepref=$translate.instant("admin.setup.syslog.default.message");

            $scope.syslogprofile.serverProfileId=0;
            /*$scope.syslogServerProfiles = {'profiles': [{ "serverProfileId": 1, "name": "Server-Profile-1", "tagetserver": "172.16.33.43", "port":"514", "protocol":"UDP" }, 
                                                    { "serverProfileId": 2, "name": "Test-Profile-2", "tagetserver": "172.16.35.144", "port":"514", "protocol":"UDP" }]};
            */
            $scope.syslogprofile.facility = 0;
            $scope.facilityList = {'facilities': [{ "id": 0, "name": "kernel messages"}, 
                                                    { "id": 1, "name": "user-level messages"}, 
                                                    { "id": 2, "name": "mail system"}, 
                                                    { "id": 3, "name": "System daemons"}, 
                                                    { "id": 4, "name": "security/authorization messages"}, 
                                                    { "id": 6, "name": "line printer subsystem"},
                                                    { "id": 7, "name": "network news subsystem"},
                                                    { "id": 8, "name": "UUCP subsystem"},
                                                    { "id": 9, "name": "clock daemon"},
                                                    { "id": 10, "name": "security authorization messages"}
                                                    ]};

            $scope.syslogprofile.logtype = 0;
            $scope.logtypeList = {'logtypes': [{ "id": 0, "name": "ShieldX Alerts"}, 
                                                    { "id": 1, "name": "ShieldX Events"}, 
                                                    { "id": 2, "name": "ShieldX Logs"} ]};

            $scope.syslogprofile.severityLevelLow = 6;
            $scope.syslogprofile.severityLevelMedium = 5;
            $scope.syslogprofile.severityLevelHigh = 4;
            $scope.syslogprofile.severityLevelCritical = 2;
            $scope.severityLevels = {'severities': [{ "id": 0, "name": "Emergency: system is unusable"}, 
                                                    { "id": 1, "name": "Alert: action must be taken immediately"}, 
                                                    { "id": 2, "name": "Critical: critical conditions"}, 
                                                    { "id": 3, "name": "Error: error conditions"}, 
                                                    { "id": 4, "name": "Warning: warning conditions"}, 
                                                    { "id": 5, "name": "Notice: normal but significant condition"}, 
                                                    { "id": 6, "name": "Informational: informational messages"},
                                                    { "id": 7, "name": "Debug: debug messages"}]};

            var messagetoken = $translate.instant("admin.setup.syslog.message.tokens");                                     
            //$scope.syslogMsgTokens = messagetoken.split(",");
            $scope.syslogMsgTokens = [
                            {"tokenkey":"$TIMESTAMP$","value":"TIMESTAMP"},
                            {"tokenkey":"$EVENT_TYPE$","value":"EVENT_TYPE"},
                            {"tokenkey":"$THREAT_NAME$","value":"THREAT_NAME"},
                            {"tokenkey":"$SEVERITY$","value":"SEVERITY"},
                            {"tokenkey":"$DESTINATION_IP$","value":"DESTINATION_IP"},
                            {"tokenkey":"$DESTINTATION_PORT$","value":"DESTINTATION_PORT"},
                            {"tokenkey":"$DESTINATION_VM_NAME$","value":"DESTINATION_VM_NAME"},
                            {"tokenkey":"$DESTINATION_OS$","value":"DESTINATION_OS"},
                            {"tokenkey":"$DESTINATION_MAC_ADDRESS$","value":"DESTINATION_MAC_ADDRESS"},
                            {"tokenkey":"$DESTINATION_RESOURCE_GROUP$","value":"DESTINATION_RESOURCE_GROUP"},
                            {"tokenkey":"$SOURCE_IP$","value":"SOURCE_IP"},
                            {"tokenkey":"$SOURCE_PORT$","value":"SOURCE_PORT"},
                            {"tokenkey":"$SOURCE_MAC_ADDRESS$","value":"SOURCE_MAC_ADDRESS"},
                            {"tokenkey":"$SOURCE_OS$","value":"SOURCE_OS"},
                            {"tokenkey":"$SOURCE_RESOURCE_GROUP$","value":"SOURCE_RESOURCE_GROUP"},
                            {"tokenkey":"$SOURCE_VM_NAME$","value":"SOURCE_VM_NAME"},
                            {"tokenkey":"$PROTOCOL_NAME$","value":"PROTOCOL_NAME"},
                            {"tokenkey":"$APPLICATION_NAME$","value":"APPLICATION_NAME"},
                            {"tokenkey":"$POLICY_TYPE$","value":"POLICY_TYPE"},
                            {"tokenkey":"$POLICY_NAME$","value":"POLICY_NAME"},
                            {"tokenkey":"$SECURITY_POLICY_SET$","value":"SECURITY_POLICY_SET"},
                            {"tokenkey":"$RESULT_STATUS$","value":"RESULT_STATUS"},
                            {"tokenkey":"$ACTION_TAKEN$","value":"ACTION_TAKEN"},
                            {"tokenkey":"$PACKET_ID$","value":"PACKET_ID"},
                            {"tokenkey":"$ATTACKER_IP$","value":"ATTACKER_IP"},
                            {"tokenkey":"$ATTACKER_RESOURCE_GROUP$","value":"ATTACKER_RESOURCE_GROUP"},
                            {"tokenkey":"$VICTIM_IP$","value":"VICTIM_IP"},
                            {"tokenkey":"$VICTIM_RESOURCE_GROUP$","value":"VICTIM_RESOURCE_GROUP"},
                            {"tokenkey":"$MANAGEMENT_RESPONSE$","value":"MANAGEMENT_RESPONSE"},
                            {"tokenkey":"$SENSOR_RESPONSE$","value":"SENSOR_RESPONSE"},
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

            $scope.msgTokensPerRow = 6;     

            function messageTokensCtr($rootScope, $scope) {
                $scope.getMessageTokens = function() {

                    $http.get('message-tokens.json').success(function(data) {

                        $scope.syslogMsgTokens = data;

                    });

                    console.log("Message Tokens = "+$scope.syslogMsgTokens);
                };
            }

            $scope.customMessageBuilder = function(customMsg){
                console.log("Message Token -->> "+customMsg);                             
                //$scope.messagepref=customMsg;
                $rootScope.$broadcast('customMessageBuilder', customMsg);
            }; 

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


            ///////////     Get All Syslog Server Profiles ////////////////
            $sessionStorage.syslogServersList = [];
            syslogForwardingService.getSyslogServerProfiles(1).then(function (data) {
                console.log("!!!!!!Get Syslog Server profiles for tenant id 1.");

                $scope.syslogServerProfiles = data;

                /*_.each($scope.syslogServerProfiles, function(value, key) {
                    console.log("!!!!!! Server profile Name -->> "+value.serverProfileName);
                    console.log("!!!!!! Server profile Id -->> "+value.serverProfileId);
                    console.log("!!!!!! Server port -->> "+value.port);
                });
                */
            }, function (error) {
                console.log(error);
                $scope.errorMessage = "ERROR occured while getting Syslog Server Profiles List!!!";
                $scope.serverprofiles = [];
            });

            $scope.addSyslogForwarderProfile = function () {
                
                console.log(" Add Syslog Forwader -->> "+$scope.syslogprofile);
                
                var syslogFwdProfile = $scope.syslogprofile;

                var sevLevelLow = syslogFwdProfile.severityLevelLow;
                var sevLevelMed = syslogFwdProfile.severityLevelMedium;
                var sevLevelHigh = syslogFwdProfile.severityLevelHigh;
                var sevLevelCritical = syslogFwdProfile.severityLevelCritical;
                var sevLevels = sevLevelLow+","+sevLevelMed+","+sevLevelHigh+","+sevLevelCritical;
                syslogFwdProfile.severityLevels = sevLevels;
                console.log("Server Profile Id = "+syslogFwdProfile.serverProfileId);
                var serverprofile = syslogFwdProfile.serverProfileId.split(":");
                console.log("Syslog Server Profile Id = "+serverprofile[0]+" , Profile Name = "+serverprofile[1]);
                syslogFwdProfile.serverProfileId = parseInt(serverprofile[0]);
                syslogFwdProfile.serverProfileName = serverprofile[1];
                var tenantId = 1;
                syslogFwdProfile.tenantId = tenantId;

                var startAddSyslogForwarderMessage = {
                    'heading': 'Add Syslog Forwarding Profile',
                    'subHeading': 'Add syslog forwarding profile in progess.',
                    'type': 'progress',
                    'timeout': 2000
                };

                var successfulSyslogForwarderMessage = {
                    'heading': 'Syslog Forwarding Profile Created',
                    'subHeading': 'Syslog forwarding profile created successfully.Reloading the page please wait...',
                    'type': 'success',
                    'timeout': 2000,
                    'callback': function () {
                        $state.reload();
                    }
                };
                showToast(startAddSyslogForwarderMessage);
                syslogForwardingService.createSyslogProfile(tenantId, syslogFwdProfile).then(function (data) {
                    console.log(" Add Syslog forwarder profile.");
                    if (data) {
                        var newData = syslogFwdProfile;
                        console.log(syslogProfilesData);
                        showToast(successfulSyslogForwarderMessage);
                    
                        syslogProfilesData.unshift(newData);
                        console.log(syslogProfilesData);
                        $sessionStorage.syslogProfilesList = syslogProfilesData;
                        $scope.syslogProfiles=syslogProfilesData;
                        $rootScope.$broadcast('newSyslogForwarderCreated', {});
                    }
                }, function (error) {
                    console.log("Failed to create syslog forwarding profile, "+error.data.message);
                    var failureSyslogForwarderCreation = {
                        'heading': 'Syslog forwarding profile creation failed',
                        'subHeading': "Error: " + error.data.message,
                        'type': 'fail',
                        'timeout': 3000
                    };
                    showToast(failureSyslogForwarderCreation);
                });
                $mdDialog.hide();
            };

            $scope.isFormValid = function () {
                //validate form data
                //console.log($scope.syslogprofile);
                //console.log($scope.syslogprofile.profilename);
                //console.log($scope.syslogprofile.messagepref);
                if ($scope.syslogprofile.profilename && $scope.syslogprofile.serverProfileId && $scope.syslogprofile.messagepref) {
                    return true;
                } else {
                    return false;
                }            
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

            /*function tenantListCtr($scope, $mdDialog, policyService) {
                $scope.canceltenantDialogue = function() {
                    //tenantSelection();
                    $mdDialog.cancel();
                };
                $scope.tenantSelected = false;
                policyService.getTenantsBasedonId("infras/1/tenants").then(function(res) {
                    $scope.tenants = res;
                }, function(err) {
                    $scope.tenants = [{ "cloudId": 1, "id": 1, "name": "default-tenant" }, { "cloudId": 1, "id": 2, "name": "tenant-2" }];
                    console.log("to get list of tenants failed");
                });
                $scope.$watch("selectedTenantsValue", function(newvalue, oldvalue) {
                    if (newvalue) {
                        $scope.tenantSelected = true;
                        $scope.selectedTenantObj = _.each($scope.tenants, function(value, key) {
                            if (value.id === parseInt($scope.selectedTenantsValue)) {
                                return value;
                            }
                        });
                        $scope.selectedTenantObj = $scope.selectedTenantObj[0];
                    }

                });
                $scope.tenantdone = function() {
                    //tenantSelection();
                    $mdDialog.cancel();
                };

            }*/

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
			
            $scope.callpopupAddServerProfile = function(event) {
                $mdDialog.show({
                    skipHide: true,
                    preserveScope: true,
                    controller: serverProfilesListCtr,
                    bindToController: true,
                    templateUrl: 'core/components/administration/notification/add-server-profile.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    fullscreen: false,
                    scope: $scope,
                    openFrom: { top: 1100, height: 0 },
                    closeTo: { left: 1500 }
                }).then(function() {

                });
            };

            //////////////////     Start Syslog Server Profile   //////////////////
            function serverProfilesListCtr($rootScope, $scope) {
                
                $scope.serverProfileSelected = false;
                
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
                $scope.serverprofile.port = "";
                $scope.serverprofile.usessl = "";
                $scope.serverprofile.certFile = "";

                $scope.serverprofile.targetServerProfile='serverProfilesListCtr';

                $scope.cancelServerProfileDialog = function() {
                    //tenantSelection();
                    $mdDialog.cancel();
                };
                

                $scope.addSyslogServerProfile = function () {
                    
                    console.log(" Add Syslog Server Profile -->> "+$scope.serverprofile);
                    
                    var syslogServerProfile = $scope.serverprofile;

                    var tenantId = 1;
                    syslogServerProfile.tenantId = tenantId;

                    var startAddSyslogServerMessage = {
                        'heading': 'Create Syslog Server Profile',
                        'subHeading': 'This should take only a few minutes max.',
                        'type': 'progress',
                        'timeout': 5000
                    };
                    var successfulSyslogServerMessage = {
                        'heading': 'Syslog Server Created',
                        'subHeading': 'Syslog Server created successfully.',
                        'type': 'success',
                        'timeout': 5000
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
                            'timeout': 10000
                        };
                        showToast(failureSyslogServerCreation);
                    });
                    $mdDialog.hide();
                };
               
                $scope.serverprofileCreated = function() {
                    //tenantSelection();
                    $mdDialog.cancel();
                };

                $scope.fileNameChanged =  function(element){
                    $scope.fileInputText = element.files[0].name;
                };                
            }
            //////////////////     End Syslog Server Profile   //////////////////


        } //End addSyslogForwarderCtr
        //////////////////     End Syslog Fowarder Configuration   //////////////////

        		
        $scope.$on('newSyslogForwarderCreated', function (event) {
            console.log($scope.query);
            $scope.query.page = 1;
        });
        $scope.$on('$viewContentLoaded', function (event) {
            console.log(event);
            fixContainerHeight(1);
        });        
    }

    angular.module('shieldxApp').controller('syslogforwarderCtr', syslogforwarderCtr);
})();
