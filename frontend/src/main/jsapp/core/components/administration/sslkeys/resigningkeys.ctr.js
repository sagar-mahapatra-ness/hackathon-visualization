(function () {
    function resigningkeysCtr(
        $scope,
        $state,
        $translate,
        $sessionStorage,
        $q,
        $http,
        sslDecryptionService,
        infrastructureConnectorService,
        deploymentSpecificationService,
        $mdDialog) {

            "ngInject";

            clearAllSession($sessionStorage);
            var resigningCertData = [];
            var deferred = $q.defer();
            $scope.promise = deferred.promise; 
            $scope.promiseCompleted = true;
            var promiseCtr = 0;
            var totalClouds = 0;
            $scope.resigningKeysAvailable = false;
            $scope.editMiscState = false;

            $scope.isAdornmentPanelOpen = false;
            $scope.isSearchBarOpen = false;

            var resignKeysCtr = 0;
            $scope.resigningKeys = [];

            $scope.$emit('listenHeaderText', {headerText: $translate.instant('admin.ssldecryption.heading')});

            /* **** for tables [start] **** */
            $scope.selected = [];
            $scope.query = {
                order: 'name',
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
            /* **** for tables [end] **** */


            $scope.connectionType = {
                'connections': [
                    {'name': 'Trusted', 'value': '1'},
                    {'name': 'Untrusted', 'value': '2'}                
                ]
            };
            
            $scope.resingingkeys = {};

            $scope.resingingkeys.tenantId = 1;   // <<<<<<<<<<<<<<<<< Added for Testing. Should be removed

            $scope.resingingkeys.connectionType='Trusted';

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

            $scope.fileChanged = function (elem) {
                $scope.files = elem.files;
                $scope.$appply();
            };


            $scope.importResigningKeys = function () {
                console.log("import resigning keys");
                var file = $scope.resigningCertFile;
                var tenantId = $scope.resingingkeys.tenantId;
                var importStarted = {
                    'heading': 'Import Re-Signing Keys Initiating',
                    'subHeading': 'Import of Re-Sigining Keys for Tenant Initiating',
                    'type': 'progress',
                    'timeout': 5000
                };

                var importCompleted = {
                    'heading': 'Import Re-Signing Keys Completed',
                    'subHeading': 'Import of Re-Signing Keys for Tenant Completed',
                    'type': 'success',
                    'timeout': 5000,
                    'callback': function () {
                        $state.reload();
                    }
                };

                showToast(importStarted);                
                console.log("resigningKeysCtr : import resigning key "+file);

                sslDecryptionService.importResigningKeys(tenantId, file).then(function (data) {
                    console.log("Import Completed.");
                    var status = data;
                    console.log(" Import status ---->>> "+status);
                    showToast(importCompleted);
                    sslDecryptionService.useImportedCert(tenantId, true).then(function (data) {
                        
                        console.log("Use imported cert flag has been sent to keyserver.");   

                    }, function error(err) {
                        console.log("Failed to set use imported cert flag to key server.");
                        console.log(err.data.message);    
                    });

                    $rootScope.$broadcast('newCertImported', {});
                }, function error(err) {
                    console.log(err.data.message);
                    var importFailed = {
                        'heading': 'Import of Re-Signing Keys Failed',
                        //'subHeading': '&nbsp;',
                        'subHeading': "Error: " + err.data.message,
                        'type': 'fail',
                        'timeout': 10000,
                        'callback': function () {
                            $state.reload();
                        }
                    };                    
                    //importFailed.subHeading = "Error: " + err.data.message;
                    showToast(importFailed);
                });
                $mdDialog.hide();
            };


            $scope.restoreDefaultKey = function () {

                var tenantId = $scope.resingingkeys.tenantId;

                var restoreCompleted = {
                    'heading': 'Restore default certificate',
                    'subHeading': 'Restore default certificate completed',
                    'type': 'success',
                    'timeout': 5000,
                    'callback': function () {
                        $state.reload();
                    }
                };

                console.log("Restore default re-signing keys.");

                sslDecryptionService.useImportedCert(tenantId, false).then(function (data) {

                    console.log("Restored default certificate.");   
                    showToast(restoreCompleted);

                }, function error(err) {
                        console.log("Failed to restore default re-signing keys.");
                        console.log(err.data.message);    
                });
            };


            $scope.generateDefaultResigningKey = function () {
                console.log("Generate default resigning key");
               
                var startGenDefaultCert = {
                    'heading': 'Generation of default Re-Signing Keys initiating',
                    'subHeading': 'Generation of default Re-Sigining keys for Tenant initiating',
                    'type': 'progress',
                    'timeout': 5000
                };

                var genDefaultCertCompleted = {
                    'heading': 'Generation of default Re-Signing Keys completed',
                    'subHeading': 'Generation of default Re-Signing Keys for Tenant completed',
                    'type': 'success',
                    'timeout': 5000,
                    'callback': function () {
                        $state.reload();
                    }
                };

                sslDecryptionService.generateDefaultResigningKey(1).then(function (data) {
                    console.log("Default certificate generated.");  
                    showToast(genDefaultCertCompleted);
                    $mdDialog.hide();
                }, function error(err) {
                    console.log(err.data.message);
                    var genDefaultCertFailed = {
                        'heading': 'Generation of default Re-Signing Keys failed',
                        'subHeading': '&nbsp;',
                        'type': 'fail',
                        'timeout': 10000,
                        'callback': function () {
                            $state.reload();
                        }
                    }; 
                    genDefaultCertFailed.subHeading = "Error: " + err.data.message;

                    showToast(genDefaultCertFailed);
                    $mdDialog.hide();
                });                
            };            
            

            $scope.export = function (tenantId) {
                $http({
                    method: 'GET',
                    url: 'shieldxapi/tls/exportkey',
                    //url: 'api/values/download',
                    //params: { name: name },
                    responseType: 'arraybuffer'
                }).success(function (data, status, headers) {
                    headers = headers();
             
                    //var filename = headers['x-filename'];
                    var contentType = headers['content-type'];
                    console.log("Content Type = "+contentType);
             
                    var linkElement = document.createElement('a');
                    try {
                        var blob = new Blob([data], { type: 'application/octet-stream' });
                        var url = window.URL.createObjectURL(blob);
             
                        linkElement.setAttribute('href', url);
                        linkElement.setAttribute("download", 'ShieldX-Cert.pem');
             
                        var clickEvent = new MouseEvent("click", {
                            "view": window,
                            "bubbles": true,
                            "cancelable": false
                        });
                        linkElement.dispatchEvent(clickEvent);
                    } catch (ex) {
                        console.log(ex);
                    }
                }).error(function (data) {
                    console.log("Failed to export key");
                    console.log(data);
                });
            };


            $scope.exportPublicKey = function () {
                console.log("Export public key");
                              
                var exportKeyCompleted = {
                    'heading': 'Export public key completed',
                    'subHeading': 'Public key has been exported successfully.',
                    'type': 'success',
                    'timeout': 5000
                };

                sslDecryptionService.exportPublicKey(1).then(function (data) {
                    
                    console.log("public key exported.");
                    console.log(data);
                    showToast(exportKeyCompleted);

                    var linkElement = document.createElement('a');
                    try {
                        var blob = new Blob([data], { type: 'application/octet-stream' });
                        var url = window.URL.createObjectURL(blob);
             
                        linkElement.setAttribute('href', url);
                        linkElement.setAttribute("download", 'ShieldX-cert.pem');
             
                        var clickEvent = new MouseEvent("click", {
                            "view": window,
                            "bubbles": true,
                            "cancelable": false
                        });
                        linkElement.dispatchEvent(clickEvent);
                    } catch (ex) {
                        console.log(" Failed to export public key "+ex.getMessage());
                        console.log(ex);
                    }

                }, function error(err) {
                    console.log(err);
                    var exportKeyFailed = {
                        'heading': 'Export public key request failed.',
                        'subHeading': '&nbsp;',
                        'type': 'fail',
                        'timeout': 10000,
                    }; 
                    exportKeyFailed.subHeading = "Error: " + err.data.message;

                    showToast(exportKeyFailed);
                });                
            };            


            //Get resigning keys
            $sessionStorage.certificatesList = [];            
            sslDecryptionService.getResigningKeys($scope.resingingkeys.tenantId).then(function (data) {
                console.log("Get resigning keys for given tenant id "+data);
                totalCerts = data.length;
                console.log("Total certs = "+totalCerts);
                if (totalCerts === 0) {

                    deferred.resolve();
                    $scope.promiseCompleted = false;
                    $scope.resigningKeysAvailable = false;

                } else {
                    console.log("Resigning Cert available = "+data);
                    $scope.resigningKeysAvailable = true;
                    
                    for (var i = 0; i < data.length; i++) {
                        console.log(" data -> "+data[i]);
                        resigningCertData[i] = {};
                        resigningCertData[i] = data[i];
                        $sessionStorage.certificatesList.push(resigningCertData[i]);
                    }
                    
                    deferred.resolve();                    
                    $scope.promiseCompleted = false;                                        
                    $scope.resigningKeys = resigningCertData;

                    console.log(resigningCertData);
                }

            }, function (error) {
                console.log(error);
                $scope.errorMessage = "ERROR occured while getting backup config list!!!";
                backupConfigData = [];
                $scope.resigningKeys = [];
                deferred.resolve();
                $scope.promiseCompleted = false;
                $scope.resigningKeysAvailable = false;
            });

            $scope.getTenants();

            fixContainerHeight(0);

            //Configure Resigning Keys 
            $scope.import = function(ev){
                console.log("Launch resigning keys import dialog.");                             
                $mdDialog.show({
                    controller: resigningkeysCtr,
                    skipHide: true,
                    templateUrl: 'core/components/administration/sslkeys/importresigningkey.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    fullscreen: true,
                    openFrom: {top: 1100, height: 0},
                    closeTo: {left: 1500}
                    //locals: {'cloudData': cloudData}
                }).then(function () {

                });
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
              
            $scope.callCacheBurst = function () {
                console.log('Bursting cache data and reloading from server');
                //$sessionStorage.viewData = false;
                clearMasterSession($sessionStorage, $state);
                
            };

            $scope.fileInputText = "No File Chosen";

            $scope.$on('newCertImported', function (event) {
                console.log($scope.query);
                $scope.query.page = 1;
            });

            $scope.fileNameChanged =  function(element){
                $scope.fileInputText = element.files[0].name;
            };
        }
    angular.module('shieldxApp').controller('resigningkeysCtr', resigningkeysCtr);
})();
