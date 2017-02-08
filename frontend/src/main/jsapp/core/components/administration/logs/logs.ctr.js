/*
 ShieldX Networks Inc. CONFIDENTIAL
 ----------------------------------
 *
 Copyright (c) 2016 ShieldX Networks Inc.
 All Rights Reserved.
 *
 NOTICE: All information contained herein is, and remains
 the property of ShieldX Networks Incorporated and its suppliers,
 if any. The intellectual and technical concepts contained
 herein are proprietary to ShieldX Networks Incorporated
 and its suppliers and may be covered by U.S. and Foreign Patents,
 patents in process, and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from ShieldX Networks Incorporated.
 */

(function () {
    function logsCtr(
            $scope,
            $state,
            $translate,
            managementService,
            userSessionMenagment) {

        var logsUploadStarted = {
            'heading': 'Logs upload initiating',
            'subHeading': '&nbsp;',
            'type': 'progress',
            'timeout': $scope.toastTimeout
        };
        var logsUploaded = {
            'heading': 'Logs uploaded successfully',
            'subHeading': '&nbsp;',
            'type': 'success',
            'timeout': $scope.toastTimeout,
            'callback': function () {
                $state.reload();
            }
        };

        var logsUploadFailed = {
            'heading': 'Logs upload Failed',
            'type': 'failure',
            'timeout': $scope.toastTimeout,
            'callback': function () {
                $state.reload();
            }
        };

        $scope.active_help_id = "admin_system_logs_help";
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
        $scope.$emit('listenHeaderText', {headerText: $translate.instant('admin.toolbar.heading')});
        var log_id = authorities("logs_upload");
        $scope.is_log_update = userSessionMenagment.isUserAllowd(log_id);

        $scope.disablelogsUpload = (parseInt($scope.currentTime) - $scope.callout.uploadLogs < $scope.disableTimeout);
        $scope.disableSaveLogs = (parseInt($scope.currentTime) - $scope.callout.downloadEventLogs < $scope.disableTimeout);

        $scope.callUploadLogs = function () {

            $scope.disableCallout('uploadLogs');

            showToast(logsUploadStarted);

            managementService.callUploadLogs().then(function () {

                showToast(logsUploaded);

            }, function (error) {
                console.log(error);
                logsUploadFailed.subHeading = "Error: " + error.data.message;
                showToast(logsUploadFailed);

            });
        };

        $scope.callDownloadEventLogs = function () {

//            $scope.disableCallout('downloadEventLogs');

//            managementService.callDownloadEventLogs();

            var url = '/shieldxapi/manage/downloadcsv';

            document.getElementById('my_iframe').src = url;

        };

        fixContainerHeight(1);
    }

    angular.module('shieldxApp').controller('logsCtr', logsCtr);
})();
