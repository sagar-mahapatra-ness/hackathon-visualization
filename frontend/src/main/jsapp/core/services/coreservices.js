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
function coreservices(getDataService, createDataService ,  $sessionStorage, $q, readDataService,deleteDataService,userSessionMenagment) {


        this.getNetworkListByCloudId = function (cloudId) {
            return readDataService.readData("networks", cloudId).then(function (data) {
//            return getDataService.makeGetCall('infras', cloudId, 'networks').then(function (data) {
                return data;
            }, function (error) {
                console.log(error);
                return $q.reject(error);
            });
        };

        /*
         GET /shieldxapi/infras/{infraId}/resourcegroup
         */
        this.getResourceGroupsListByCloudId = function (cloudId) {
            return readDataService.readData("resourcegroup", cloudId).then(function (data) {
//            return getDataService.makeGetCall('infras', cloudId, 'resourcegroup').then(function (data) {
                return data;
            }, function (error) {
                console.log(error);
                return $q.reject(error);
            });
        };

         this.getResourceGroupsListByCloudIdFromServer = function (cloudId) {
            return getDataService.makeGetCall('infras', cloudId, 'resourcegroup').then(function (data) {
                return data;
            }, function (error) {
                console.log(error);
                return $q.reject(error);
            });
         };

        this.getListOfTenants = function (cloudId) {
            return readDataService.readData("tenants", cloudId).then(function (data) {
//            return getDataService.makeGetCall('infras', cloudId, 'tenants').then(function (data) {
                return data;
            }, function (error) {
                console.log(error);
                return $q.reject(error);
            });
        };

        this.getSecurityPolicySet = function () {
            return getDataService.makeRESTDataCall('GET', 'policy/securitypolicyset').then(function (data) {
                return data;
            });
        };
        this.getListOfAuthorities = function () {
            return getDataService.makeRESTDataCall('GET', 'user/authorities').then(function (data) {
                  userSessionMenagment.saveListOfAuthorities(data);
                  return data;
            });
        };
        this.signin = function(userName,password){
            var self = this;
            return getDataService.authenticateAndCreateUserSession(userName, password).then(function(data){
              userSessionMenagment.saveToUserSession();
            //  self.getListOfAuthorities();
              return data;
            },function(error){
                userSessionMenagment.invalidateUserSession();
               return $q.reject(error);
            });
        };

        this.signout = function(){
             var that = this;
            return getDataService.invalidUserSession().then(function(data){
                userSessionMenagment.invalidateUserSession();
              return data;
            },function(error){
                 userSessionMenagment.invalidateUserSession();
                return $q.reject(error);
            });
        };

        this.getListOfInfrastructures = function () {
            return readDataService.readData('infras').then(function (response) {
                return response;
            });
        };

       this.getListOfWorkloades = function(){
          var self = this; 
          var count = 0;
          var worloadArray = [];
         return  this.getListOfInfrastructures().then(function(clouds){
               console.log("getAllWorkloades clouds ");
               console.dir(clouds);
               return self.loadWorkload(clouds,count, worloadArray);              
          });
       };

       this.getWorkloadesByCloudId = function(cloudId){
           return getDataService.customGet('infras', cloudId+'/workloads').then(function (data) {
                return data;
            }, function (error) {
                console.log(error);
                return $q.reject(error);
            });
       };

       this.loadWorkload = function(clouds, count, workloadArray){
         var self = this; 
        return  this.getWorkloadesByCloudId(clouds[count].id).then(
             function(workload){
                for(var i =0; i < workload.workloads.length; i++){
                   workloadArray.push(workload.workloads[i]);
                }
               
                if(count < (clouds.length-1)){
                   return self.loadWorkload(clouds,count+1, workloadArray);
                } else{
                  return workloadArray;
                }
             }, function(error){
                console.log(count+"  error "+clouds.length);
                if(count < (clouds.length-1)){
                   return self.loadWorkload(clouds,count+1, workloadArray);
                } else{
                  return workloadArray;
                }
             }
          );
        }; 

        this.loadResourceGroup = function(clouds, count, rgArray){
         var self = this; 
        return  this.getResourceGroupsListByCloudIdFromServer(clouds[count].id).then(
             function(resourceGr){
                for(var i =0; i < resourceGr.length; i++){
                   rgArray.push(resourceGr[i]);
                }
               
                if(count < (clouds.length-1)){
                   return self.loadResourceGroup(clouds,count+1, rgArray);
                } else{
                  return rgArray;
                }
             }, function(error){
                console.log(count+"  error "+clouds.length);
                if(count < (clouds.length-1)){
                   return self.loadResourceGroup(clouds,count+1, rgArray);
                } else{
                  return rgArray;
                }
             }
          );
        };

        this.getListOfResourceGroup = function(){
          var self = this; 
          var count = 0;
          var rgArray = [];
         return  this.getListOfInfrastructures().then(function(clouds){
               console.log("getListOfResourceGroup clouds ");
               console.dir(clouds);
               return self.loadResourceGroup(clouds,count, rgArray);              
          });
        };
      this.getTenantForVMWare = function(){
             var self = this; 
             return this.getListOfInfrastructures().then(function(clouds){
                console.log(" getTenantForVMWare cloud ");
                var cloudID = -1;
                for(var i=0; i < clouds.length; i++ ){
                    var cloudInf = clouds[i];
                    if(cloudInf.type === "VMWARE"){
                       cloudID = cloudInf.id;
                       break;
                    }
                }
                if(cloudID !== -1){
                   return self.getListOfTenants(cloudID).then(function(tenentinfo){
                          console.log(" tenentinfo "+tenentinfo);
                          console.dir(tenentinfo);
                          return tenentinfo[0].id;
                   });  
                }
             });
          }; 
             
        this.getSubscriptionListBelongToAGroup = function (groupId) {
            return readDataService.readData("chassislist").then(function (data) {
                /* jshint ignore:start */
                for(var i=0 ; i <data.length; i++ ){
                   subscriptionList = data[i].subscriptionList;
                    var sub =  _.find(subscriptionList, function (sl){
                        return sl.resourceGroupId === groupId;
                    });
                    if(sub){
                        console.log(" getVirtualChassisBelongToAGroup subscriptionList "+groupId);
                        console.dir(sub);
                        return sub;
                    }

                }
                /* jshint ignore:end */
                return null;
            });
        };


        this.deletSubscriptionByID = function(id, cloudId){

           return deleteDataService.deleteData('subscription', id, cloudId).then(function (data) {
                 console.log("Subscription deleted", id);
                 return {'status': true};
            }, function (error) {
                console.log(error);
                return {'status': false, 'errorMessage': error.data.message};
            });

        };

        this.getmemberListofResourceGroup = function(id,cloudId){
          return getDataService.customGet('infras/resourcegroup/'+id).then(function (data) {
            var matchedInfraIndex = _.findIndex($sessionStorage.infrastructureObj,{"id":cloudId});
            var matchedResourcegroupIndex = _.findIndex($sessionStorage.infrastructureObj[matchedInfraIndex].resourcegroup,{"id":id});
            $sessionStorage.infrastructureObj[matchedInfraIndex].resourcegroup[matchedResourcegroupIndex].memberList = data.memberList;
            console.log("made the call");
              return data;
          });
        };
   
}
    angular.module('shieldxApp').service('coreservices', coreservices);
  

})();