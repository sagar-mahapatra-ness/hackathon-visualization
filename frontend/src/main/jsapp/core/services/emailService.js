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

    function emailService(getDataService, Restangular, $q, readDataService,createDataService, deleteDataService, updateDataService) {
        
        "ngInject";

        this.testConnection = function (tenantId, paramObj) {
        	console.log("emailService : testConnection() called. email server config = "+paramObj);
            var callingRoute = "/manage/"+tenantId+"/smtpserver/test";
            return getDataService.makeRESTDataCall('POST', callingRoute, paramObj).then(function (response) {
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


        this.saveEmailServerSettings = function (tenantId, paramObj) {            
        	console.log("emailService : save email server settings "+paramObj);
            var callingRoute = "/manage/"+tenantId+"/smtpserver";
            return getDataService.makeRESTDataCall('PUT', callingRoute, paramObj).then(function (response) {
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

        
        this.getEmailServerSettings = function(tenantId) {
        	console.log("emailService : get email server settings.");
            var callingRoute = "/manage/"+tenantId+"/smtpserver";
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

        /////  Email notification profile  /////
        this.createEmailNotificationProfile = function (tenantId, paramObj) {

            console.log("emailService : Add email notification profile : "+paramObj);

            var emailnotificationprofile = paramObj;
            var callingRoute = "/manage/smtp/"+tenantId+"/addprofile";
            
            return  getDataService.makeRESTDataCall('POST', callingRoute, emailnotificationprofile).then(function (data) {
                console.log("Email notification profile created.");
                return data;
            });
        };

        this.getSMTPNotificationProfile = function (tenantId) {
            console.log("emailService : get email notification profile for tenant id "+tenantId);
            var callingRoute = "/manage/smtp/"+tenantId+"/profile";
            return getDataService.customGet(callingRoute).then(function(response) {
                console.log("Response = "+response);
                if (response) {
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


        this.addRecipient = function(tenantId, recipientvo) {
            console.log("emailService : Add email recipient details : "+recipientvo);
            var callingRoute = "/manage/"+tenantId+"/recipient";
            return  getDataService.makeRESTDataCall('POST', callingRoute, recipientvo).then(function (data) {
                console.log("Recipient created.");
                return data;
            });
        };

        this.getRecipients = function(tenantId) {
            console.log("emailService : get recipient emails.");
            var callingRoute = "/manage/"+tenantId+"/recipients";
            return getDataService.customGet(callingRoute).then(function(response) {
                console.log("Response = "+response);
                if (response) {
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
    
    angular.module('shieldxApp').service('emailService', emailService);

})();