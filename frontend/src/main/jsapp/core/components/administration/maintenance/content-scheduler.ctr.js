(function () {
    function contentDownloadSchedulerCtr(
        $scope,
        $state,
        $translate,
        contentDownloadService,
        $q,
        $sessionStorage,
        $mdpTimePicker,
        $mdDialog) {
            "ngInject";
            
            clearAllSession($sessionStorage);
            $scope.schedulerConfigAvailable = false;
            $scope.editMiscState = false;

            $scope.schedulerConfigDetails ={}; 

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

            //var currentDate = new Date();
            $scope.contentdownload = {};
            $scope.contentdownload.starttime = '';
            var schedulertype = 3;
            $scope.contentdownload.dayoftheweek = 1;
            $scope.daysInWeek =   [{ "id": 1, "day": "Sunday"}, 
                                    { "id": 2, "day": "Monday"}, 
                                    { "id": 3, "day": "Tuesday"},
                                    { "id": 4, "day": "Wednesday"},
                                    { "id": 5, "day": "Thursday"},
                                    { "id": 6, "day": "Friday"},
                                    { "id": 7, "day": "Saturday"}];

            ///////////     Get scheduler config details ////////////////
            //$sessionStorage.schedulerConfigData;
            var tenantId = 1;
            contentDownloadService.getContentDownloadSchedulerDetails(tenantId).then(function (data) {

                console.log("Get scheduler config details for tenant id "+tenantId);

                if (!data) {
                    $scope.schedulerConfigAvailable = false;
                } else {
                    $scope.schedulerConfigAvailable = true;
                    schedulerConfigDetails = data;
                    console.log(" Enabled = "+data.enable+" Frequency = "+data.frequency+"  Start Time = "+data.starttime);
                    $scope.contentdownload.enable = (data.enable)?1:0;
                    $scope.contentdownload.frequency = data.frequency;
                    var time = data.starttime.split(":");
                    var dateTime = new Date();
                    dateTime.setHours(time[0]);
                    dateTime.setMinutes(time[1]);
                    $scope.contentdownload.starttime = dateTime;
                    $scope.contentdownload.dayoftheweek = data.dayoftheweek;
                    console.log($scope.contentdownload);
                }
            }, function (error) {
                console.log(error);
                $scope.errorMessage = "ERROR occured while getting scheduler config details!!!";
                $scope.schedulerConfigAvailable = false;
            });


            //Schedule Content Download
            $scope.scheduleContentDownload = function () {
                var isEnable = ($scope.contentdownload.enable == 1)?true:false;
                var frequency = $scope.contentdownload.frequency;
                var datetime = $scope.contentdownload.starttime;
                console.log("Start Time --->> "+datetime);
                var dt = new Date(datetime);
                var hours = dt.getHours(); // Will be local time
                var minutes = dt.getMinutes(); // Will be local time
                var startTime = (hours <= 9? "0"+hours : hours)+":"+(minutes <= 9? "0"+minutes : minutes);
                //var recurrencefreq = $scope.contentdownload.recurfreq;
                var weekDay = $scope.contentdownload.dayoftheweek;

                var contentSchedulerConfig = {
                    'enable' : isEnable,
                    'frequency' : frequency,
                    'starttime': startTime,
                    //'recurrenceFrequency': recurrencefreq,
                    'dayoftheweek': weekDay
                };

                console.log(" Content download config details = "+contentSchedulerConfig);

                showToast(started);
                console.log("Content Download scheduled. frequency : "+frequency+
                    " Start Time : "+startTime+" day of the week : "+contentSchedulerConfig.dayoftheweek);
                
                contentDownloadService.autodownloadcontent(contentSchedulerConfig).then(function () {
                    console.log("Request to schedule content download and deployment was successful!!");
                    showToast(completed);

                }, function (error) {
                    console.log(error);
                    failed.subHeading = "Error: " + error.data.message;
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
    angular.module('shieldxApp').controller('contentDownloadSchedulerCtr', contentDownloadSchedulerCtr);

})();