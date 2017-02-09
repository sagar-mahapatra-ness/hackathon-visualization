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

(function() {
    function dataVisualizationService(getDataService, chartDataLoader, $injector, $q, authRestangular, userSessionMenagment,websocketfectory) {
        "ngInject";

        this.getDataForWidget = function(dataWidgetConfig) {
            if (dataWidgetConfig.getProxyData()) {
                return this.loadDataFromProxySource(dataWidgetConfig.getProxyData());
            }
            var factory = $injector.get(dataWidgetConfig.getWidgetName() + "Factory");
            if (factory) {
                var quaryFunction = factory.getQueryData;
                var query = quaryFunction.apply(factory, [dataWidgetConfig.interval, dataWidgetConfig.nValue]);
                if (dataWidgetConfig.value === 'SystemInformation') {
                    return this.getSystemInfoData(query).then(function(serverResponse) {
                        var dataMassageObject = factory.getDataMassageObject(serverResponse);
                        var converter = dataMassageObject["get" + dataWidgetConfig.getChartType() + "Data"];
                        if (converter) {
                            var result = converter(serverResponse);
                            return result;
                        }
                    });
                } else {
                    return this.sendQueryToServer(query).then(function(serverResponse) {
                        var dataMassageObject = factory.getDataMassageObject(serverResponse);
                        var converter = dataMassageObject["get" + dataWidgetConfig.getChartType() + "Data"];
                        if (converter) {
                            var result = converter(serverResponse);
                            return result;
                        }
                    });
                }
            }
        };

        this.getFilteredDataForWidgets = function(dataWidgetConfigArray) {
            var query = "";
            if (dataWidgetConfigArray) {
                for (var i = 0; i < dataWidgetConfigArray.length; i++) {
                    var dataWidgetConfig = dataWidgetConfigArray[i];
                    var factory = $injector.get(dataWidgetConfig.getWidgetName() + "Factory");
                    var quaryFunction = factory.getQueryData;
                    var queryRef = quaryFunction.apply(factory, [dataWidgetConfig.interval, dataWidgetConfig.nValue]);
                    if (factory) {
                        query += queryRef + "\n";
                    }
                }

                return this.sendQueryToServer(query).then(function(serverResponse) {
                    console.log(" getDataForWidgets  latest data serverResponse");
                    console.dir(serverResponse);
                    console.log("serverResponse.responses " + serverResponse.responses.length);
                    var obj = {};
                    if (serverResponse.responses.length === dataWidgetConfigArray.length) {
                        console.log("data recived for each widget");
                        for (var j = 0; j < dataWidgetConfigArray.length; j++) {
                            var dataWidgetConfigRef = dataWidgetConfigArray[j];
                            var factory = $injector.get(dataWidgetConfigRef.getWidgetName() + "Factory");
                            var dataMassageObject = factory.getDataMassageObject(serverResponse.responses[j], dataWidgetConfig.nValue);
                            var converter = dataMassageObject["get" + dataWidgetConfigRef.getChartType() + "Data"];
                            obj[dataWidgetConfigRef.getWidgetName()] = converter(dataWidgetConfig.otheroption);
                        }
                    }
                    return obj;
                });
            }
        };

        this.getSystemData = function(sysitm) {
            var factory = $injector.get(sysitm.getWidgetName() + "Factory");
            var quaryFunction = factory.getQueryData;
            var query = quaryFunction.apply(factory, [sysitm.interval, sysitm.nValue]);
            return this.getSystemInfoData(query).then(function(serverResponse) {
                var dataMassageObject = factory.getDataMassageObject(serverResponse);
                var converter = dataMassageObject["get" + sysitm.getChartType() + "Data"];
                if (converter) {
                    var result = converter(serverResponse);
                    return result;
                }
            });
        };

        this.getDataForWidgets = function(dataWidgetConfigArray) {
            var sysitm = _.find(dataWidgetConfigArray, function(item) {
                return item.widgetName === "SystemInformation";
            });
            var self = this;
            if (sysitm) {
                if (dataWidgetConfigArray.length > 1) {
                    var newArray = [];
                    for (var i = 0; i < dataWidgetConfigArray.length; i++) {
                        if (dataWidgetConfigArray[i].widgetName !== "SystemInformation") {
                            newArray.push(dataWidgetConfigArray[i]);
                        }
                    }
                    return this.getFilteredDataForWidgets(newArray).then(function(data) {
                        return self.getSystemData(sysitm).then(function(systemData) {
                            data[sysitm.getWidgetName()] = systemData;
                            return data;
                        });
                    });
                } else {
                    return this.getSystemData(sysitm).then(function(data) {
                        var obj = {};
                        obj[sysitm.getWidgetName()] = data;
                        return obj;
                    });
                }
            } else {
                return this.getFilteredDataForWidgets(dataWidgetConfigArray);
            }
        };

        this.getSystemInfoData = function(data) {
            return getDataService.customGet(data).then(function(response) {
                return response;
            }, function(error) {
                console.dir(error);
                if (error && error.status == 401) {
                    userSessionMenagment.invalidateUserSession();
                }
                return $q.reject(error);
            });
        };

        this.getNextWidgetData = function(dataWidgetConfigArray, index, obj) {
            var dataWidgetConfig = dataWidgetConfigArray[index];
            var self = this;
            return this.getDataForWidget(dataWidgetConfig).then(function(widgetData) {
                obj[dataWidgetConfig.getWidgetName()] = widgetData;
                if ((index + 1) >= dataWidgetConfigArray.length) {
                    return obj;
                } else {
                    return self.getNextWidgetData(dataWidgetConfigArray, index + 1, obj);
                }
            });
        };

        this.getWidgetDrillDownFilteredData = function(widgetName) {
            var factory = $injector.get(widgetName + "Factory");
            var interval = 30;
            var nValue = 5;
            var quaryFunction = factory.getQueryData;
            var query = quaryFunction.apply(factory, [interval, nValue]);
            return this.sendQueryToServer(query).then(function(serverResponse) {
                var dataMassageObject = factory.getDataMassageObject(serverResponse);
                var filterData = dataMassageObject.getFiltterData();
                return filterData;
            });
        };

        this.getDrillDownDataForWidget = function(dataWidgetConfig) {
            var factory = $injector.get(dataWidgetConfig.getWidgetName() + "Factory");
            if (factory) {
                var quaryFunction = factory.getDrillDownQueryData;
                var args = [dataWidgetConfig.interval];
                if (dataWidgetConfig.queryArguments.length > 0) {
                    args = args.concat(dataWidgetConfig.queryArguments);
                }
                var query = quaryFunction.apply(factory, args);
                return this.sendQueryToServer(query).then(function(serverResponse) {
                    var dataMassageObject = factory.massageDrillDowndata(serverResponse);
                    return dataMassageObject;
                });
            }
        };

        this.sendQueryToServer = function(query) {
            return this.postQueryToServer(query).then(function(data) {
                return data.plain();
            }, function(error) {

            });
        };


        this.postQueryToServer = function(data) {
            return authRestangular.initSxquery().all("_msearch").post(data).then(function(result) {
                console.debug(" makePostCall  success  " + result);
                return result;
            }, function(error) {
                console.log(" makePostCall  failed ");
                console.dir(error);
                if (error && error.status == 401) {
                    userSessionMenagment.invalidateUserSession();
                }
                return $q.reject(error);
            });
        };

        this.loadDataFromProxySource = function(proxyData) {
            if (proxyData.sourceType == "txt") {
                return this.loadDataFromFile(proxyData.sourceName);
            }
        };

        this.loadDataFromFile = function(fileName) {
            var userInfo = {
                'id': 1, // unnecessary
                'datasetFileName': fileName //set the name of the file to fetch
            };
            return chartDataLoader.getChartData(userInfo).then(function(chartData) {
                return chartData;
            });
        };

        this.getEventDataFor2DRendering = function(filterdata,simulate) {
            filterdata.queryType = "TWO_DIMENSIONAL";
            var payload = filterdata.getJSON();
            var self = this;
            return authRestangular.init().all("queryBuilder").post(payload).then(function(queryRecived) {
                console.log(" this.getEventDataFor2DRendering query recived from query builder");
                queryRecived = queryRecived.plain();
                console.dir(queryRecived);
                var query = JSON.stringify(queryRecived.index) + "\n" + JSON.stringify(queryRecived.query);
                return self.sendQueryToServer(query).then(function(queryResult) {
                    console.log("  getEventDataFor2DRendering from m serarch " + queryResult);
                    var ed = new EventVisualizationData(filterdata, queryResult,simulate);
                    return ed.createJSONFor2D();
                });
            }, function(error) {
                console.log(" makePostCall  failed ");
                console.dir(error);
                if (error && error.status == 401) {
                    userSessionMenagment.invalidateUserSession();
                }
                return $q.reject(error);
            });
        };

        this.getEventDataFor3DRendering = function(filterdata, simulate) {
            filterdata.queryType = "THREE_DIMENSIONAL";
            var payload = filterdata.getJSON();
            var self = this;
            return authRestangular.init().all("queryBuilder").post(payload).then(function(queryRecived) {
                console.log(" getEventDataFor3DRendering query recived from query builder");
                queryRecived = queryRecived.plain();
                console.dir(queryRecived);
                var query = JSON.stringify(queryRecived.index) + "\n" + JSON.stringify(queryRecived.query);
                return self.sendQueryToServer(query).then(function(queryResult) {
                    console.log("  getEventDataFor3DRendering from m serarch " + queryResult);
                    var ed = new EventVisualizationData(filterdata, queryResult,simulate);
                    return ed.createJSONFor3D();
                });
            }, function(error) {
                console.log(" makePostCall  failed ");
                console.dir(error);
                if (error && error.status == 401) {
                    userSessionMenagment.invalidateUserSession();
                }
                return $q.reject(error);
            });

        };

        this.getEventDataFor3DGridData = function(filterdata) {
            filterdata.queryType = "THREE_DIMENSIONAL";
            var payload = filterdata.getJSON();
            var self = this;
            return authRestangular.init().all("queryBuilder").post(payload).then(function(queryRecived) {
                 queryRecived = queryRecived.plain();
                 var query = JSON.stringify(queryRecived.index) + "\n" + JSON.stringify(queryRecived.query);
                 return self.sendQueryToServer(query).then(function(queryResult) {
                    var eventdata = queryResult.responses["0"].hits.hits;
                    var data = [];
                    for(var i=0; i < eventdata.length ; i++){
                        data.push(eventdata[i]._source.event);
                    }
                    return data;
                 });
            });
        };

        this.conectToWebSocket = function(){
           return websocketfectory.connect().then(function(data){
             console.log(" conected To WebSocket ");
           });
        };

        this.sendDataToWebSocketTopic = function(topic,data){
            websocketfectory.sendData(topic,data);
        };

        this.subscribToTheTopic = function(topic, callback){
          return websocketfectory.subscribToTheTopic(topic,callback);
        };



    }
    angular.module('shieldxApp').service('dataVisualizationService', dataVisualizationService);
})();
