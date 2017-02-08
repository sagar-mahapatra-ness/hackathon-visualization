(function() {
    var InventoryofMicroServicesWidget = function() {


        return {
            getDrillDownQueryData: function(intervalRef) {
                var presentEpoch = Math.round(new Date().getTime());
                var pastEpoch = presentEpoch - (60 * intervalRef * 1000);
                var timezone = jstz.determine().name();
                var queryHeader = {
                    "index": "shieldxstats",
                    "ignore_unavailable": true,
                    "preference": 1482180275502
                };
                var queryBody = {
                    "query": {
                        "bool": {
                            "must": [{
                                "query_string": {
                                    "analyze_wildcard": true,
                                    "query": "*"
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
                            "date_histogram": {
                                "field": "aggregate",
                                "interval": "1m",
                                "time_zone": timezone,
                                "min_doc_count": 1
                            },
                            "aggs": {
                                "1": {
                                    "cardinality": {
                                        "field": "microServiceInstanceId"
                                    }
                                },
                                "3": {
                                    "terms": {
                                        "field": "microServiceTypeString",
                                        "size": 10,
                                        "order": { "1": "desc" }
                                    },
                                    "aggs": {
                                        "1": {
                                            "cardinality": {
                                                "field": "microServiceInstanceId"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                };
                var query = JSON.stringify(queryHeader) + "\n" + JSON.stringify(queryBody);
                return query;
            },
            getQueryData: function(intervalRef) {
                var presentEpoch = Math.round(new Date().getTime());
                var pastEpoch = presentEpoch - (60 * intervalRef * 1000);
                var timezone = jstz.determine().name();
                var queryHeader = {
                    "index": "shieldxstats",
                    "ignore_unavailable": true,
                    "preference": 1481590535466
                };

                var queryBody = {
                    "query": {
                        "bool": {
                            "must": [{
                                "query_string": {
                                    "query": "*",
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
                                "field": "microServiceTypeString",
                                "size": 5,
                                "order": { "1": "desc" }
                            },
                            "aggs": {
                                "1": {
                                    "cardinality": {
                                        "field": "microServiceInstanceId"
                                    }
                                }
                            }
                        }
                    }
                };

                var query = JSON.stringify(queryHeader) + "\n" + JSON.stringify(queryBody);
                return query;
            },
            getDataMassageObject: function(data) {
                console.log("from getDataMassageObject");
                return {
                    getBarChartData: function() {
                        console.log("from bar chart data");
                        return "";
                    },
                    getAlertData: function() {
                        console.log("from  Table data");
                        var tableData = [];
                        var rowData = data.aggregations["2"].buckets;
                        // var tableData = [];
                        for (var i = 0; i < rowData.length; i++) {

                            tableData.push({ "count": rowData[i].doc_count, "name": rowData[i].key });
                        }

                        return tableData;

                    },

                };
            },
            massageDrillDowndata: function(data) {
                console.log("from bar Drill Down  Bar data");
                //var chartData  =[];
                var buckets = data.responses[0].aggregations["2"].buckets;
                var allSubBucket = [];
                var bucketData = '';
                for (var i = 0; i < buckets.length; i++) {
                    bucketData = buckets[i];
                    bucketData = bucketData[3].buckets;
                    for (var j = 0; j < bucketData.length; j++) {
                        allSubBucket.push({ "count": bucketData[j].doc_count, "name": bucketData[j].key });
                    }
                }
                return allSubBucket;
            }
        };
    };
    angular.module('shieldxApp').factory(WidgetName.InventoryofMicroServices + "Factory", InventoryofMicroServicesWidget);
})();
