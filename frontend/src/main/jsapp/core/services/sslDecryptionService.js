(function () {
    
    function sslDecryptionService(getDataService, Restangular, $q, readDataService,createDataService, deleteDataService, updateDataService) {
        "ngInject";

        this.importResigningKeys = function(tenantId, file) {
            
            var callingRoute = "/tls/"+tenantId+"/importresigningkeys";
            
            return getDataService.uploadFile(callingRoute, file).then(function (response) {
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

        
        this.generateDefaultResigningKey = function(tenantId) {
            
            console.log("Generate Default Certficiate for tenantId : "+tenantId);
            
            var callingRoute = "/tls/"+tenantId+"/generateresigningkey";
            
            return getDataService.makePostCall(callingRoute, tenantId).then(function (response) {
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


        this.getResigningKeys = function(tenantId) {
            console.log("sslDecryptionService : get resigning keys for tenant id "+tenantId);

            var callingRoute = "/tls/"+tenantId+"/resigningkeys";

            return getDataService.customGet(callingRoute).then(function(response) {
                console.log("Response = "+response);
                if (response) {
                    return response;
                    /*return {
                        'status': true,
                        'response': response
                    };*/
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

        this.exportPublicKey = function(tenantId) {
            console.log("sslDecryptionService : Export public key ");

            var callingRoute = "/tls/"+tenantId+"/exportkey";

            return getDataService.downloadFile(callingRoute).then(function(response) {
                console.log("download file Response = "+response);
                if (response) {
                    console.log(" sslDecryptionService : exportpulbickey : response = "+response);
                    return response;
                    /*return {
                        'status': true,
                        'response': response
                    };*/
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


        this.export = function (tenantId) {
            console.log("sslDecryptionService : Export public key ");
            var callingRoute = "/tls/"+tenantId+"/exportkey";
            return getDataService.makeRESTDataCall('GET', callingRoute).then(function (response) {
                return response;
            }, function(error) {
                console.log("Error when exporting key "+error);
                throw (error);
            });
        };


        this.useImportedCert = function(tenantId,useimported) {
            console.log("sslDecryptionService : Use imported cert.");

            var callingRoute = "/tls/"+tenantId+"/useimportedcert/"+useimported;

            return getDataService.customGet(callingRoute).then(function(response) {
                console.log("Response = "+response);
                if (response) {
                    return response;
                    /*return {
                        'status': true,
                        'response': response
                    };*/
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

        this.getInboundKeys = function(tenantId) {
            console.log("sslDecryptionService : get inbound keys for tenant id : "+tenantId);

            var callingRoute = "/tls/"+tenantId+"/inboundkeys";

            return getDataService.customGet(callingRoute).then(function(response) {
                console.log("Response = "+response);
                if (response) {
                    return response;
                    /*return {
                        'status': true,
                        'response': response
                    };*/
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
    angular.module('shieldxApp').service('sslDecryptionService', sslDecryptionService);

})();