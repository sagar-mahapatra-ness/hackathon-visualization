
(function () {

    function syslogForwardingService(getDataService, Restangular, $q, readDataService,createDataService, deleteDataService, updateDataService) {
        "ngInject";


        /////  Syslog forwarding config Profiles  /////
        this.createSyslogProfile = function (tenantId, paramObj) {
            console.log(paramObj);

            var syslogprofile = paramObj;

            var callingRoute = "/syslog/"+tenantId+"/addprofile";

            return  getDataService.makeRESTDataCall('POST', callingRoute, syslogprofile).then(function (data) {
                console.log("Syslog profile created.");
                return data;
            });
        };

        this.getSyslogProfiles = function (tenantId) {

        	var callingRoute = "/syslog/"+tenantId+"/profiles";

            return getDataService.customGet(callingRoute).then(function (response) {
                return response;
            });
        };

        this.deleteSyslogProfile = function(tenantId) {
            //var callingRoute = "/syslog/profiles/"+tenantId;
            return getDataService.makeRESTDataCall('DELETE', 'syslog/profiles', tenantId).then(function(data) {
                return data;
            }, function(error) {
                return $q.reject(error);
            });
        };

        ////  Syslog Server Profile  /////
        this.createSyslogServerProfile = function (tenantId, paramObj) {
            console.log(paramObj);

            var serverProfile = paramObj;

            var callingRoute = "/syslog/"+tenantId+"/addserver";

            return  getDataService.makeRESTDataCall('POST', callingRoute, serverProfile).then(function (data) {
                console.log("Syslog profile created.");
                return data;
            });
        };

        this.getSyslogServerProfiles = function (tenantId) {

        	var callingRoute = "/syslog/"+tenantId+"/serverprofiles";

            return getDataService.customGet(callingRoute).then(function (response) {
                return response;
            });
        };

        this.deleteSyslogServerProfile = function (serverProfileId) {

            //var callingRoute = "/syslog/serverprofile/"+serverProfileId;

            return getDataService.makeRESTDataCall('DELETE', '/syslog/serverprofile/', serverProfileId).then(function(data) {
                return data;
            }, function(error) {
                return $q.reject(error);
            });
        };

    }
    angular.module('shieldxApp').service('syslogForwardingService', syslogForwardingService);
})();    