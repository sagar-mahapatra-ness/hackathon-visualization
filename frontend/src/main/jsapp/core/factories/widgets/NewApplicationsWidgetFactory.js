(function() {
    var NewApplicationsWidget = function() {
        return {
            getDrillDownQueryData: function(intervalRef) {
                var presentEpoch = Math.round(new Date().getTime());
                var pastEpoch = presentEpoch - (60 * intervalRef * 1000);
                var queryHeader = {
                    "index": "shieldxevents",
                    "ignore_unavailable": true,
                    "preference": 1481583229034
                };
                var queryBody = {
                    "size": 50,
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
                                    "query": "_type:DPI and event.applicationName:*",
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
                var query = JSON.stringify(queryHeader) + "\n" + JSON.stringify(queryBody);
                return query;
            },
            getQueryData: function(intervalRef) {
                var presentEpoch = Math.round(new Date().getTime());
                var pastEpoch = presentEpoch - (60 * intervalRef * 1000);
                var queryHeader = {
                    "index": "shieldxevents",
                    "ignore_unavailable": true,
                    "preference": 1481235097198
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
                            "significant_terms": {
                                "field": "event.applicationName",
                                "size": 10
                            },
                            "aggs": {
                                "3": {
                                    "terms": {
                                        "field": "aggregate",
                                        "size": 5,
                                        "order": { "_count": "desc" }
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
                return {
                    getBarChartData: function() {
                        return "";
                    },
                    getTablesData: function() {
                        console.log("from table new applicationName");
                        var rowData = [];
                        //var tableData = [];
                        var buckets = data.aggregations["2"].buckets;
                        //var headers = {"title1":"BG Count","title2":"Doc Count","title3":"Key","title4":"Score"};
                        for (var i = 0; i < buckets.length; i++) {
                            rowData.push({ "bgCount": buckets[i].bg_count, "docCount": buckets[i].doc_count, "key": buckets[i].key, "score": buckets[i].score });
                        }
                        /*tableData.push(headers);
                        tableData.push(rowData);*/
                        // console.log(tableData);
                        return rowData;
                    },
                };

            },
            massageDrillDowndata: function(data) {
                var rowData = [];
                var tableData = [];
                var hits = data.responses[0].hits.hits;
                /*var headers = {"title1":"appId","title2":"dstIpAddress","title3":"dstPort","title4":"eventType",
                "title5":"pmId","title6":"protocol","title7":"protocolName","title8":"srcIpAddress",
                "title9":"srcPort","title10":"threatName"};*/
                for (var i = 0; i < hits.length; i++) {
                    var sourceData = hits[i]._source;
                    sourceData = sourceData.event;
                    rowData.push({
                        "appId": sourceData.appId,
                        "applicationName": sourceData.applicationName,
                        "dstIpAddress": sourceData.dstIpAddress,
                        "dstPort": sourceData.dstPort,
                        "protocol": sourceData.protocol,
                        "protocolName": sourceData.protocolName,
                        "srcIpAddress": sourceData.srcIpAddress,
                        "srcPort": sourceData.srcPort
                    });
                }
                /* tableData.push(headers);
                 tableData.push(rowData);*/
                return rowData;
            }
        };
    };
    angular.module('shieldxApp').factory(WidgetName.NewApplications + "Factory", NewApplicationsWidget);
})();
