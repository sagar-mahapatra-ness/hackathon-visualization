(function () {
    function sslkeysCtr(
            $scope,
            $state,
            $translate,
            $sessionStorage,
            $q,
            sslDecryptionService,
            infrastructureConnectorService,
            deploymentSpecificationService,
            $mdDialog
            ) {



        clearAllSession($sessionStorage);
        var inboundCertData = [];
        var deferred = $q.defer();
        $scope.promise = deferred.promise; 
        $scope.promiseCompleted = true;
        var promiseCtr = 0;
        var totalClouds = 0;
        $scope.inboundKeysAvailable = false;
        $scope.editMiscState = false;

        $scope.isAdornmentPanelOpen = false;
        $scope.isSearchBarOpen = false;

        var resignKeysCtr = 0;
        $scope.inboundKeys = [];
        $scope.tenantId = 1;
        
        //$scope.$emit('listenHeaderText', {headerText: $translate.instant('admin.toolbar.heading')});
        $scope.$emit('listenHeaderText', {headerText: $translate.instant('admin.ssldecryption.heading')});

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

        var tenantUpdateStarted = {
            'heading': 'Upload SSL Key Initiating',
            'subHeading': 'Upload SSL Key for Tenant Initiating',
            'type': 'progress',
            'timeout': $scope.toastTimeout
        };
        var tenantUpdated = {
            'heading': 'Upload SSL Key Completed',
            'subHeading': 'Upload SSL Key for Tenant Completed',
            'type': 'success',
            'timeout': $scope.toastTimeout,
            'callback': function () {
                $state.reload();
            }
        };

        var tenantUpdateFailed = {
            'heading': 'Upload SSL Key Failed',
            'subHeading': '&nbsp;',
            'type': 'fail',
            'timeout': $scope.toastTimeout,
            'callback': function () {
                $state.reload();
            }
        };

        $scope.inboundkeys = {};
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

        $scope.uploadSSLKeys = function () {
            var file = $scope.sslKeyFile;
            var tenantId = $scope.tenantId;
            tenantId = 1;
            showToast(tenantUpdateStarted);

            infrastructureConnectorService.uploadSslKeys(tenantId, file).then(function (data) {
                    showToast(tenantUpdated);
            }, function error(err) {
                tenantUpdateFailed.subHeading = "Error: " + err.data.message;
                showToast(tenantUpdateFailed);
            });
            $mdDialog.hide();

        };


        //Get resigning keys
        $sessionStorage.certificatesList = [];            
        sslDecryptionService.getInboundKeys($scope.tenantId).then(function (data) {
            console.log("Get inbound keys for given tenant id "+data);
            totalCerts = data.length;
            console.log("Total certs = "+totalCerts);
            if (totalCerts === 0) {

                deferred.resolve();
                $scope.promiseCompleted = false;
                $scope.inboundKeysAvailable = false;

            } else {
                console.log("Inbound Cert available = "+data);
                $scope.inboundKeysAvailable = true;
                
                for (var i = 0; i < data.length; i++) {
                    console.log(" data -> "+data[i]);
                    inboundCertData[i] = {};
                    inboundCertData[i] = data[i];
                }
                
                deferred.resolve();                    
                $scope.promiseCompleted = false;                                        
                $scope.inboundKeys = inboundCertData;

                console.log(inboundCertData);
            }

        }, function (error) {
            console.log(error);
            $scope.errorMessage = "ERROR occured while getting inbound web server certificates";
            inboundCertData = [];
            $scope.inboundKeys = [];
            deferred.resolve();
            $scope.promiseCompleted = false;
            $scope.inboundKeysAvailable = false;
        });

        $scope.getTenants();

        fixContainerHeight(0);

        $scope.fileInputText = "No File Chosen";

        //Configure Resigning Keys 
        $scope.import = function(ev){
            console.log("Launch inbound keys import dialog.");                             
            $mdDialog.show({
                controller: sslkeysCtr,
                skipHide: true,
                templateUrl: 'core/components/administration/sslkeys/importinboundkeys.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                fullscreen: true,
                openFrom: {top: 1100, height: 0},
                closeTo: {left: 1500}
                //locals: {'cloudData': cloudData}
            }).then(function () {

            });
        };


        $scope.pwdType = 'password';
        $scope.togglePasswordType = function () {
            $scope.pwdType = $scope.pwdType === 'password' ? 'text' : 'password';
        };

        $scope.fileNameChanged =  function(element){
            $scope.fileInputText = element.files[0].name;
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

    angular.module('shieldxApp').controller('sslkeysCtr', sslkeysCtr);
})();
