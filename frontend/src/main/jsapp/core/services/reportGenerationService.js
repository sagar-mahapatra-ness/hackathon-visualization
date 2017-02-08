(function () {
    
    function reportGenerationService(getDataService, Restangular, $q, readDataService,
                                     createDataService, deleteDataService, updateDataService) {

        "ngInject";

        this.generateReport = function(reportConfig) {
            
            console.log("reportGenerationService : Generate report ");
            
            //var callingRoute = "/reports/"+tenantId+"/generatesummaryreport";
            var callingRoute = "/reports/generatesummaryreport";

            return getDataService.makePostCall(callingRoute, reportConfig).then(function (response) {
                if (response) {
                    return {
                        'status': true,
                        'response': response
                    };
                } else {
                    return {
                        'status': false,
                        'response': response
                    };
                }
            }, function (error) {
                throw (error);
            });
        }; 

        this.downloadReport = function() {
            console.log("reportGenerationService : Download Report.");
            var callingRoute = "/reports/downloadreport";
            return getDataService.downloadFile(callingRoute).then(function(response) {
                console.log("download file Response = "+response);
                if (response) {
                    console.log(" reportGenerationService : downloadReport : response = "+response);
                    return response;
                } else {
                    return {
                        'status': false,
                        'response': response
                    };
                }
            }, function(error) {
                throw (error);
            });

        };
    }

    angular.module('shieldxApp').service('reportGenerationService', reportGenerationService);

})();