(function () {
    function backupRestoreCtr(
        $scope,
        $state,
        $translate,
        backupRestoreService,
        $q,
        $sessionStorage,
        $mdDialog,
        userSessionMenagment) {
            "ngInject";
            
            clearAllSession($sessionStorage);
            var backupConfigData = [];
            var deferred = $q.defer();
            $scope.promise = deferred.promise; 
            $scope.promiseCompleted = true;
            var promiseCtr = 0;
            var totalClouds = 0;
            $scope.backupConfigAvailable = false;
            $scope.editMiscState = false;

            $scope.isAdornmentPanelOpen = false;
            $scope.isSearchBarOpen = false;

            var bcCtr = 0;
            $scope.backupConfigurations = [];
            
            var update_id = authorities("maintenance_update");
            $scope.is_update_maintenance = userSessionMenagment.isUserAllowd(update_id);

            $scope.$emit('listenHeaderText', {headerText: $translate.instant('admin.maintenance.heading')});            

            /* **** for tables [start] **** */
            $scope.selected = [];
            $scope.query = {
                order: 'name',
                limit: 5,
                page: 1
            };

            var backupStarted = {
                'heading': 'Backup Initiating',
                'subHeading': 'Backup Initiating..',
                'type': 'progress',
                'timeout': $scope.toastTimeout
            };
            var backupCompleted = {
                'heading': 'Backup Completed',
                'subHeading': 'Backup Completed',
                'type': 'success',
                'timeout': $scope.toastTimeout,
                'callback': function () {
                    $state.reload();
                }
            };

            var backupFailed = {
                'heading': 'Backup Failed',
                'subHeading': '&nbsp;',
                'type': 'fail',
                'timeout': $scope.toastTimeout,
                'callback': function () {
                    $state.reload();
                }
            };

            $scope.backuptypes = {
                'types': [
                    {'name': 'Configuration', 'value': 'Configuration'},
                    {'name': 'Events', 'value': 'Events'}
                ]
            };
            $scope.backuprestore = {};

            $scope.backuprestore.type='Configuration';

            $scope.backuprestore_filename='File Name';

            $scope.backuprestore_defdirloc='Default Target Backup Directory';
            $scope.backuprestore.defdirloc = '/usr/local/shieldx/config/';   // Get this from SMB Config settings

            $scope.backuprestore_altdirloc='Target Backup Directory';

            $scope.backuprestore_desc='Description';

            $scope.backuprestore_filepath='Relative file path to restore';

            $scope.backuprestore_enable='Enable';
            $scope.backuprestore_frequency = 'Frequency';
            $scope.backuprestore_starttime = 'Start Time';

            //Backup data
            $scope.backup = function () {
                var type = $scope.backuprestore.type;
                var fileName = $scope.backuprestore.filename;
                var desc = $scope.backuprestore.desc;
                var def_location = $scope.backuprestore.defdirloc;
                var alt_location = $scope.backuprestore.altdirloc;
                var location = (!alt_location)?def_location:alt_location;                

                var backupConfigDetails = {
                    'type' : type,
                    'fileName': fileName,
                    'description': desc,
                    'targetDirectory': location
                };

                showToast(backupStarted);
                console.log("backupRestoreCtr : backup was called. File Name = "+fileName+" description = "+desc);
                
                backupRestoreService.backupData(backupConfigDetails).then(function () {
                    console.log("Request to backup data posted successfully!!!");
                    showToast(backupCompleted);

                }, function (error) {
                    console.log(error);
                    backupFailed.subHeading = "Error: " + error.data.message;
                    showToast(backupFailed);
                });
                //$mdDialog.hide();
            };

            //Restore data
            $scope.restore = function() {

                //var file = $scope.backupFile;
                //var fileName = file.name;
                //var path = (window.URL || window.webkitURL).createObjectURL(file);
                //var filePath = file.webkitRelativePath;

                var filePath = $scope.backuprestore.relativepath;
                console.log(" File Path  : "+filePath);

                var res = filePath.split("/");
                var fileName = res[res.length-1];
                var restorefile = {
                    'fileName' : fileName,
                    'filePath' : filePath
                };

                var restoreStarted = {
                    'heading': 'Restore started',
                    'subHeading': 'Restore of backup data has started.',
                    'type': 'progress',
                    'timeout': 3000
                };

                var restoreCompleted = {
                    'heading': 'Restore completed',
                    'subHeading': 'Restore completed for backup file '+fileName,
                    'type': 'success',
                    'timeout': 3000,
                    'callback': function () {
                        $state.reload();
                    }
                };

                showToast(restoreStarted);

                backupRestoreService.restoreData(restorefile).then(function() {
                    console.log("Request to restore data posted successfully!!!");
                    showToast(restoreCompleted);
                }, function error(err) {
                    console.log("Restore Failed due to "+err.data.message);
                    var restoreFailed = {
                        'heading': 'Restore failed.',
                        'subHeading': '&nbsp;',
                        'type': 'fail',
                        'timeout': 3000,
                    };
                    restoreFailed.subHeading = "Error: " + err.data.message;
                    showToast(restoreFailed);
                });
            };


            //Get Config Backups
            $sessionStorage.backupList = [];
            backupRestoreService.getBackupConfigList().then(function (data) {
                console.log("Config backups len = "+data);
                totalConfigs = data.length;
                console.log("Total configs = "+totalConfigs);
                if (totalConfigs === 0) {

                    deferred.resolve();
                    $scope.promiseCompleted = false;
                    $scope.backupConfigAvailable = false;

                } else {
                    console.log("Config backups available = "+data);
                    $scope.backupConfigAvailable = true;
                    
                    //$scope.backupConfigurations = data;

                    for (var i = 0; i < data.length; i++) {
                        console.log(" data -> "+data[i]);
                        backupConfigData[i] = {};
                        backupConfigData[i] = data[i];
                    }
                    
                    deferred.resolve();                    
                    $scope.promiseCompleted = false;                                        
                    $scope.backupConfigurations = backupConfigData;

                    console.log(backupConfigData);
                }

            }, function (error) {
                console.log(error);
                $scope.errorMessage = "ERROR occured while getting backup config list!!!";
                backupConfigData = [];
                $scope.backupConfigurations = [];
                deferred.resolve();
                $scope.promiseCompleted = false;
                $scope.backupConfigAvailable = false;
            });


            //Configure Backup 
            $scope.configureBackup = function(ev){
                console.log("Launch configure backup dialog.");                             
                $mdDialog.show({
                    controller: backupRestoreCtr,
                    skipHide: true,
                    templateUrl: 'core/components/administration/backup-and-restore/addbackupconfig.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    fullscreen: true,
                    openFrom: {top: 1100, height: 0},
                    closeTo: {left: 1500}
                    //locals: {'cloudData': cloudData}
                }).then(function () {

                });
            };


            $scope.fileInputText = "No File Chosen";

            $scope.fileNameChanged =  function(element){
                $scope.fileInputText = element.files[0].name;
            };

            $scope.toggleSearchBar = function (event) {
                $scope.isSearchBarOpen = $scope.isSearchBarOpen === false ? true : false;
                if ($scope.isSearchBarOpen)
                    angular.element(event.currentTarget.firstElementChild).css('color', '#4a90e2');
                else
                    angular.element(event.currentTarget.firstElementChild).css('color', '#6d6e71');
            };
            /* **** for tables [end] **** */

            $scope.showStatus = function (status, test) {
                return status === test;
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

        $scope.$on('newInfracreated', function (event) {
            console.log($scope.query);
            $scope.query.page = 1;
        });
        $scope.$on('$viewContentLoaded', function (event) {
            console.log(event);
            fixContainerHeight(1);
        });

    }
    angular.module('shieldxApp').controller('backupRestoreCtr', backupRestoreCtr);

})();