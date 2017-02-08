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
    function chartDataLoader(dataServerPath, $http, $q, getDataService) {
        "ngInject";

        this.getChartData = function (paramObj) {
            var deferred = $q.defer();
            var dataObj = {
                'userId': paramObj.id
            };

            var postObj = {
                'postData': dataObj,
                'postURL': 'chartsdata/'+ paramObj.datasetFileName
            };

            getDataService.makePostDataCall(postObj).then(function (response) {
                deferred.resolve(response.data);
            },
                    function (data) {
                        deferred.reject('no data found');
                    });

            return deferred.promise;

        };

    }

//        function chartDataLoader (Restangular) {
//
//            this.getChartData = function (paramObj) {
//                //var deferred = $q.defer();
//                //var userId = paramObj.id;
//
//                 return Restangular.all('posts').getList();
//
//                //return deferred.promise;
//
//            };
//
//        }
    angular.module('shieldxApp').service('chartDataLoader', chartDataLoader);
})();




