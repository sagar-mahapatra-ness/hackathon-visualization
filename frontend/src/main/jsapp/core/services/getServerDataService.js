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
    function getDataService(dataServerPath, $http, $q, Restangular,authRestangular, userSessionMenagment) {
        "ngInject";



        // TODO following function needs to be removed later
        this.makePostDataCall = function (dataObj) {

            return $http({
                url: dataServerPath + dataObj.postURL,
                method: "GET",
                data: serializeData(dataObj.postData),
                config: {headers: {'Content-Type': 'application/json'}}
            });

        };

        /*

           <api end point>/resource/{id}/childResource
        */
        this.makeGetCall = function (resource, id, childResource){
          return Restangular.stripRestangular(authRestangular.init().one(resource, id).getList(childResource)).then(function(result){
                          //console.dir(result.plain()); 
              return result;
            },function(error){
               console.log(" makeGetCall  failed ");
               console.dir(error); 
               userSessionMenagment.invalidateUserSession();
              return $q.reject(error);
            });
        };

        /*
            <api end point>/{id}/childResource
        */
        this.makeGetCallWithoutRootResource = function (id, childResource){
           return authRestangular.init().one(id.toString(), childResource).get().then(function(result){
                          //console.dir(result.plain()); 
              return result;
            },function(error){
               console.log(" makeGetCallWithoutRootResource  failed ");
               console.dir(error); 
               if(error && error.status == 401){
                  userSessionMenagment.invalidateUserSession();
               }
              return $q.reject(error);
            });
        };

        /* 

           makeDeleteCall
           
           <api end point>/resourceName/{resourceID}
           @param resourceName  name of the resource to delete
           @param resourceID    id of the resource
        */
        this.makeDeleteCall =  function(resourceName, resourceID){
             return authRestangular.init().one(resourceName, resourceID).remove().then(function(result){
                          //console.dir(result.plain()); 
              return result;
            },function(error){
               console.log(" makeDeleteCall  failed ");
               console.dir(error); 
               if(error && error.status == 401){
               userSessionMenagment.invalidateUserSession();
               }
              return $q.reject(error);
            });
        };

        this.makePutCall = function(resourceName, data){
             return authRestangular.init().all(resourceName).customPUT(data).then(function(result){
                          //console.dir(result.plain()); 
              return result;
            },function(error){
               console.log(" makePutCall  failed ");
               console.dir(error); 
               if(error && error.status == 401){
               userSessionMenagment.invalidateUserSession();
               }
              return $q.reject(error);
            });
        };
        
        this.makePostCall = function(resourceName, data){
            console.debug(" makePostCall "+resourceName+"  ");
            return authRestangular.init().all(resourceName).post(data).then(function(result){
              console.debug(" makePostCall  success  "+result);
              //console.dir(result.plain()); 
              return result;
            },function(error){
               console.log(" makePostCall  failed ");
               console.dir(error); 
               if(error && error.status == 401){
               userSessionMenagment.invalidateUserSession();
               }
              return $q.reject(error);
            });
        };

        this.authenticateAndCreateUserSession = function(userName, password){
           return authRestangular.signIn(userName, password).then(function(data){
			   console.log(" authenticateAndCreateUserSession success ");
             return data;
            },function(error){
				
				return $q.reject(error);
            });
        };

        this.invalidUserSession = function(userName, password){
           return authRestangular.signOut().then(function(data){
                   return data;
            },function(error){
                
				return $q.reject(error);
            });
        };

       this.makeRESTDataCallImpl = function (method, callingObject, dataObj, subObj){
               if(method === "GET") {
                if(typeof dataObj === "undefined" && typeof subObj === "undefined") {
                    return authRestangular.init().all(callingObject).getList().then(function(result){
                       return Restangular.stripRestangular(result);

                    });

                } else if (dataObj && subObj) {

                    return authRestangular.init().one(callingObject, dataObj).getList(subObj).then(function(result){
                       return Restangular.stripRestangular(result);
                    });
                } else {
                    return authRestangular.init().all(dataObj).getList(subObj).then(function(result){
                       return Restangular.stripRestangular(result);
                    });
                }
            }
            if(method ==="POST") {
                return authRestangular.init().all(callingObject).post(dataObj).then(function(result){

                    return result;
                });
            }

            if(method ==="PUT") {
                return authRestangular.init().all(callingObject).customPUT(dataObj);
            }
            if(method ==="DELETE") {
                return authRestangular.init().one(callingObject, dataObj).remove().then(function(result){

                    return result;
                });
            }
        };
        this.makeRESTDataCall = function (method, callingObject, dataObj, subObj) {
           return  this.makeRESTDataCallImpl(method, callingObject, dataObj, subObj).then(function(data){
              //console.log(" makeRESTDataCall success");
                return data;
            },function(error){
                console.log(" makeRESTDataCall error ");
                console.dir(error);
                if(error && error.status == 401){
                    userSessionMenagment.invalidateUserSession();
                }
                return $q.reject(error);
            });
        };

        /*this.customGet = function (callingObj, subObject) {

            return authRestangular.init().all(callingObj).customGET(subObject).then( function(response) {

                return Restangular.stripRestangular(response);
            },function(error){
                console.log(" customGet error >> 1");
                console.dir(error);
                if(error && error.status == 401){
                  userSessionMenagment.invalidateUserSession();
                }
                return $q.reject(error);
            });
        };*/


        this.customGet = function (callingObj, subObject) {

            return authRestangular.init().all(callingObj).customGET(subObject).then( function(response) {

                return Restangular.stripRestangular(response);
            },function(error){
                console.log(" customGet error >> 1");
                console.dir(error);
                if(error && error.status == 401){
                  userSessionMenagment.invalidateUserSession();
                }
                return $q.reject(error);
            });
        };


        this.uploadFile = function (callingObj, file) {
            var fd = new FormData();
            fd.append('file', file);

            return authRestangular.init().one(callingObj).withHttpConfig({transformRequest: angular.identity})
                    .customPOST(fd, '', undefined, {'Content-Type': undefined});
        };


        this.downloadFile = function(callingObj,subObject) {
            
            console.log("Download file started..");
            
            return authRestangular.init().one(callingObj).withHttpConfig({responseType: 'blob'})
                                  .customGET(subObject).then( function(response) {
                //return Restangular.one(callingObj).withHttpConfig({responseType: 'blob'}).response;
                return response;
            },function(error){
                console.log(" customGet error >> 1");
                console.dir(error);
                if(error && error.status == 401){
                  userSessionMenagment.invalidateUserSession();
                }
                return $q.reject(error);
            });
        };

    }

    angular.module('shieldxApp').service('getDataService', getDataService);
})();

function serializeData(data) {
    // If this is not an object, defer to native stringification.
    if (!angular.isObject(data)) {
        return((data === null) ? "" : data.toString());
    }
    var buffer = [];
    // Serialize each key in the object.
    for (var name in data) {
        if (!data.hasOwnProperty(name)) {
            continue;
        }
        var value = data[ name ];
        buffer.push(
                encodeURIComponent(name) +
                "=" +
                encodeURIComponent((value === null) ? "" : value)
                );
    }
    // Serialize the buffer and clean it up for transportation.
    var source = buffer
            .join("&")
            .replace(/%20/g, "+")
            ;
    return(source);
}