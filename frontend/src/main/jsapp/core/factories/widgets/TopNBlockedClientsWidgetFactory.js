(function() {
    var TopNBlockedClientsWidget = function() {
        return {
            getDrillDownQueryData: function(intervalRef) {
                console.log(" TopNBlockedClientsWidget getDrillDownQueryData  ");
                console.log("intervalRef  " + intervalRef);
                var query = "_type:TCP AND event.sensorResponse:Blocked AND event.srcMachineName:(";
                console.dir(arguments);
                var addFirst = true;
                for (i = 1; i < arguments.length; i++) {
                    if (!addFirst) {
                        query += " OR " + arguments[i];
                    } else if (addFirst) {
                        addFirst = false;
                        query += "  " + arguments[i];
                    }
                }
                query += ")";
                console.log("query  " + query);
                console.dir(arguments);
                var presentEpoch = Math.round(new Date().getTime());
                var pastEpoch = presentEpoch - (60 * intervalRef * 1000);

                var queryHeader = {
                    "index": "shieldxevents",
                    "ignore_unavailable": true,
                    "preference": 1482180275502
                };
                var queryBody = {
                    "size": 500,
                    "sort": [{
                        "aggregate": {
                            "order": "desc",
                            "unmapped_type": "boolean"
                        }
                    }],
                    "query": {
                        "bool": {
                            "must": [{
                                "query_string": {
                                    "query": query,
                                    "analyze_wildcard": true
                                }
                            }, {
                                "range": {
                                    "aggregate": {
                                        "gte": pastEpoch,
                                        "lte": presentEpoch,
                                        "format": "epoch_millis"
                                    }
                                }
                            }],
                            "must_not": []
                        }
                    }
                };
                return JSON.stringify(queryHeader) + "\n" + JSON.stringify(queryBody);
            },
            getQueryData: function(intervalRef, sizevalue) {
                if (!sizevalue) {
                    sizevalue = 5;
                }
                var presentEpoch = Math.round(new Date().getTime());
                var pastEpoch = presentEpoch - (60 * intervalRef * 1000);
                var queryHeader = {
                    "index": "shieldxevents",
                    "ignore_unavailable": true,
                    "preference": 1482180275502
                };

                var queryBody = {
                    "query": {
                        "bool": {
                            "must": [{
                                "query_string": {
                                    "query": "_type:TCP AND event.sensorResponse:Blocked",
                                    "analyze_wildcard": true
                                }
                            }, {
                                "range": {
                                    "aggregate": {
                                        "gte": pastEpoch,
                                        "lte": presentEpoch,
                                        "format": "epoch_millis"
                                    }
                                }
                            }],
                            "must_not": []
                        }
                    },
                    "aggs": {
                        "2": {
                            "terms": {
                                "field": "event.srcMachineName",
                                "size": sizevalue,
                                "order": { "_count": "desc" }
                            }
                        }
                    }
                };
                return JSON.stringify(queryHeader) + "\n" + JSON.stringify(queryBody);
            },
            getDataMassageObject: function(data) {
                return {
                    getBarChartData: function() {
                        var buckets = data.aggregations["2"].buckets;
                        var piChatData = WidgetDataUtil.parseBarChartData(buckets);
                        console.log("TopNDetectedAppsWidget getBarChartData");
                        console.dir(piChatData);
                        return piChatData;
                    },
                    getStackedAreaData: function() {

                        return chartData;
                    },
                    massageDrillDowndata: function(data) {
                        return "";
                    }
                };
            },
            massageDrillDowndata: function(data) {
                var tabularView = {};
                tabularView.headers = [];
                tabularView.headers.push({ title: 'Machine Name' });
                tabularView.headers.push({ title: 'Destination Name' });
                tabularView.headers.push({ title: 'Source IP' });
                tabularView.headers.push({ title: 'Source Port' });
                tabularView.headers.push({ title: 'Destination IP' });
                tabularView.headers.push({ title: 'Destination Port' });
                tabularView.rowData = [];

                console.log("massageDrillDowndata ");
                var events = data.responses[0].hits.hits;
                for (var i = 0; i < events.length; i++) {
                    var source = events[i]._source;
                    tabularView.rowData.push({ val1: source.event.srcMachineName, val2: source.event.dstMachineName, val3: source.event.srcIpAddress, val4: source.event.srcPort, val5: source.event.dstIpAddress, val6: source.event.dstPort });
                }
                console.dir(tabularView);
                return tabularView;
            }
        };
    };
    angular.module('shieldxApp').factory(WidgetName.TopNBlockedClients + "Factory", TopNBlockedClientsWidget);
})();
