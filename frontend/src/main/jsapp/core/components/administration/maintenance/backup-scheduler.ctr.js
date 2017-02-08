(function () {
    function backupSchedulerCtr(
        $scope,
        $state,
        $translate,
        schedulerService,
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
            var saved = {
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


            $scope.backuptypes = {
                'types': [
                    //{'name': 'Configuration', 'value': 1},  //QTAD-2532
                    {'name': 'Events', 'value': 2}
                ]
            };
            $scope.backupscheduler = {};

            $scope.backupscheduler.type='Configuration';
            $scope.backupscheduler_defdirloc='Default Target Backup Directory';
            $scope.backupscheduler.defdirloc = '/usr/local/shieldx/config/';   // Get this from SMB Config settings

            $scope.backupscheduler_targetdirloc='Target Backup Directory';

            $scope.backupscheduler_enable='Enable';
            $scope.backupscheduler_frequency = 'Frequency';
            $scope.backupscheduler_starttime = 'Start Time';

            //Schedule backup for configuration and events data
            $scope.scheduleBackup = function () {

                var backupSchedulerSettings = $scope.backupscheduler;
                console.log(" Scheduled backup config details = "+backupSchedulerSettings);
                var enable = ($scope.backupscheduler.enable == 1)?true:false;
                var datetime = $scope.backupscheduler.time;
                console.log("Start Time --->> "+datetime);
                var dt = new Date(datetime);
                var hours = dt.getHours(); // Will be local time
                var minutes = dt.getMinutes(); // Will be local time
                var startTime = (hours <= 9? "0"+hours : hours)+":"+(minutes <= 9? "0"+minutes : minutes);
                backupSchedulerSettings.enable = enable;
                backupSchedulerSettings.time = startTime;
                showToast(started);
                console.log("Backup scheduled for type : "+backupSchedulerSettings.type+" Frequency Daily = "+backupSchedulerSettings.frequencydaily);
                
                schedulerService.scheduleBackup(backupSchedulerSettings).then(function () {
                    console.log("Request to schedule db backup for type = "+backupSchedulerSettings.type+" posted successfully!!!");
                    showToast(saved);

                }, function (error) {
                    console.log(error);
                    failed.subHeading = "Error: " + error.data.message;
                    showToast(failed);
                });                                
            };


            schedulerService.getSchedulerConfig().then(function (data) {

                console.log("Get Scheduler configuration details");

                if (!data) {
                    $scope.schedulerConfigAvailable = false;
                } else {
                    console.log(" Enable = "+data.enable+" Frequency is daily = "+data.daily+"  Start Time = "+data.time);

                    $scope.schedulerConfigAvailable = true;
                    $scope.backupscheduler = data;
                    $scope.backupscheduler.enable = (data.enable)?1:0;
                    var time = data.time.split(":");
                    var dateTime = new Date();
                    dateTime.setHours(time[0]);
                    dateTime.setMinutes(time[1]);
                    $scope.backupscheduler.time = dateTime;

                    console.log($scope.backupscheduler);
                }
            }, function (error) {
                $scope.schedulerConfigAvailable = false;
                console.log(error);
                var getschedulerfailed = {
                    'heading': 'Failed to get scheduler configuration',
                    'subHeading': '&nbsp;',
                    'type': 'fail',
                    'timeout': 3000
                };
                getschedulerfailed.subHeading = "Failed to get scheduler configuration details."+error.data.message;
                showToast(getschedulerfailed);
            });


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
    angular.module('shieldxApp').controller('backupSchedulerCtr', backupSchedulerCtr);

})();