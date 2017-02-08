(function () {
    function pruningSchedulerCtr(
        $scope,
        $state,
        $translate,
        purgeDataService,
        $q,
        $sessionStorage,
        $mdDialog) {
            "ngInject";
            
            clearAllSession($sessionStorage);
            var schedulerConfigData;
            var deferred = $q.defer();
            $scope.promise = deferred.promise; 
            $scope.promiseCompleted = true;
            var promiseCtr = 0;
            var totalClouds = 0;
            $scope.schedulerConfigAvailable = false;
            $scope.editMiscState = false;

            $scope.isAdornmentPanelOpen = false;
            $scope.isSearchBarOpen = false;
                      
            $scope.$emit('listenHeaderText', {headerText: $translate.instant('admin.maintenance.heading')});            

            var started = {
                'heading': 'Scheduler Configuration Initiating',
                'subHeading': 'Scheduler Configuration Initiating..',
                'type': 'progress',
                'timeout': $scope.toastTimeout
            };
            var completed = {
                'heading': 'Scheduler Configuration Completed',
                'subHeading': 'Scheduler Configuration Completed',
                'type': 'success',
                'timeout': $scope.toastTimeout,
                'callback': function () {
                    $state.reload();
                }
            };

            var failed = {
                'heading': 'Scheduler Configuration Failed',
                'subHeading': '&nbsp;',
                'type': 'fail',
                'timeout': $scope.toastTimeout,
                'callback': function () {
                    $state.reload();
                }
            };


            $scope.pruning = {};

            $scope.pruning_enable='Enable';
            $scope.pruning_frequency = 'Frequency';
            $scope.pruning_starttime = 'Start Time';

            //Schedule Pruning for events
            $scope.schedulePruning = function () {
                var isEnable = $scope.pruning.enable;
                var frequency = $scope.pruning.frequency;
                var startTime = $scope.pruning.time;
                var maxdays = $scope.pruning.maxdays;
                var maxcapacity = $scope.pruning.maxcapacity;

                var pruningConfigDetails = {
                    'enable' : isEnable,
                    'frequency' : frequency,
                    'starttime': startTime,
                    'maxdays': maxdays,
                    'maxcapacity': maxcapacity
                };

                console.log(" Pruning Config Details = "+pruningConfigDetails);                   

                showToast(started);
                console.log("pruning scheduled. frequency : "+frequency+" Start Time : "+startTime+" max days : "+maxdays+ " max capacity : "+maxcapacity);                
                
                purgeDataService.schedulepruning(pruningConfigDetails).then(function () {
                    console.log("Request to schedule db purge posted successfully!!");
                    showToast(completed);

                }, function (error) {
                    console.log(error);
                    failed.subHeading = "Error: " + error.data.message;
                    showToast(failed);
                });                                
            };

            //Schedule backup for configuration and events data
            $scope.scheduleBackup = function () {
                var isEnable = $scope.pruning.enable;
                var frequency = $scope.pruning.frequency;
                var startTime = $scope.pruning.time;
                var targetDir = $scope.pruning.maxdays;
                var backupType = $scope.pruning.type;

                var backupSchedulerSettings = {
                    'enable' : isEnable,
                    'frequency' : frequency,
                    'starttime': startTime,
                    'targetDir': targetDir,
                    'backuptype' : backupType                    
                };

                console.log(" Scheduled backup config details = "+backupSchedulerSettings);                   

                showToast(started);
                console.log("Backup scheduled for type : "+backupType);                
                
                schedulerService.schedulebackup(backupSchedulerSettings).then(function () {
                    console.log("Request to schedule db backup for type = "+backupType+" posted successfully!!!");
                    showToast(completed);

                }, function (error) {
                    console.log(error);
                    backupFailed.subHeading = "Error: " + error.data.message;
                    showToast(failed);
                });                                
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
    angular.module('shieldxApp').controller('pruningSchedulerCtr', pruningSchedulerCtr);

})();