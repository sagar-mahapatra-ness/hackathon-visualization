(function () {
    function reportsCtr(
            $scope,
            $state,
            $translate,
            $sessionStorage,
            $q,
            reportGenerationService,
            infrastructureConnectorService,
            deploymentSpecificationService,
            $mdDialog
            ) {



        clearAllSession($sessionStorage);
        var reportSummaryData = [];

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
        $scope.$emit('listenHeaderText', {headerText: $translate.instant('admin.shieldx.reports.heading')});

        /* **** for tables [start] **** */
        $scope.selected = [];
        $scope.query = {
            order: 'name',
            limit: 10,
            page: 1
        };

        $scope.isAdornmentPanelOpen = false;
        $scope.isSearchBarOpen = false;

        $scope.active_help_id = "admin_reports_help";
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

        var reportGenerationStarted = {
            'heading': 'Initiating ShiledX System Summary Report',
            'subHeading': 'Initiating ShiledX System Summary Report',
            'type': 'progress',
            'timeout': $scope.toastTimeout
        };

        var reportGenerationCompleted = {
            'heading': 'ShiledX Executive Summary Report',
            'subHeading': 'ShiledX executive summary report generation completed, downloading the report...',
            'type': 'success',
            'timeout': $scope.toastTimeout,
            'callback': function () {
                $state.reload();
            }
        };

        var reportDownloadCompleted = {
            'heading': 'Download Report',
            'subHeading': 'Report download completed.',
            'type': 'success',
            'timeout': $scope.toastTimeout,
            'callback': function () {
                $state.reload();
            }
        };

        var reportGenerationFailed = {
            'heading': 'ShiledX executive summary report generation failed',
            'subHeading': '&nbsp;',
            'type': 'fail',
            'timeout': $scope.toastTimeout,
            'callback': function () {
                $state.reload();
            }
        };

        $scope.report = {};

        $scope.report.format='2';
        $scope.formatTypes = [
                {'name': 'PDF', 'value': '1'},
                {'name': 'HTML', 'value': '2'}
            ];

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

        $scope.generateReport = function () {

            var tenantId = $scope.tenantId;
            var topn = $scope.report.top_n;
            var nDays = $scope.report.no_of_days;
            var reportConfig = $scope.report;
            console.log(" Top N = "+topn+" No of Days = "+nDays);
            tenantId = 1;

            showToast(reportGenerationStarted);

            reportGenerationService.generateReport(reportConfig).then(function (data) {

                console.log("Report generated successfully.");
                showToast(reportGenerationCompleted);

                console.log("Download report.");
                reportGenerationService.downloadReport().then(function (data) {

                    console.log("Download completed.");
                    showToast(reportDownloadCompleted);
                    var linkElement = document.createElement('a');
                    try {
                        var blob = new Blob([data], { type: 'application/pdf' });
                        var url = window.URL.createObjectURL(blob);

                        linkElement.setAttribute('href', url);
                        linkElement.setAttribute("download", 'ExecutiveSummaryReport.pdf');

                        var clickEvent = new MouseEvent("click", {
                            "view": window,
                            "bubbles": true,
                            "cancelable": false
                        });
                        linkElement.dispatchEvent(clickEvent);
                    } catch (ex) {
                        console.log(" Failed to download pdf report "+ex.getMessage());
                        console.log(ex);
                    }
                });

            }, function error(err) {
                reportGenerationFailed.subHeading = "Error: " + err.data.message;
                showToast(reportGenerationFailed);
            });
            $mdDialog.hide();

        };


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

    angular.module('shieldxApp').controller('reportsCtr', reportsCtr);
})();
