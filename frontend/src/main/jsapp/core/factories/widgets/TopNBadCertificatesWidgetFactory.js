(function() {
    var TopNBadCertificatesWidget = function() {
        return {
            getDrillDownQueryData: function(intervalRef) {
                console.log(" TopNBadCertificatesWidget getDrillDownQueryData  ");
                console.log("intervalRef  " + intervalRef);
                var startStr = "_type:DPI AND event.certTag:(";
                var endStr = ")";
                var query = WidgetDataUtil.drillDownParamsWithOutSpace(startStr, arguments, endStr);
                // console.dir(arguments);
                console.dir(query);
                var presentEpoch = Math.round(new Date().getTime());
                var pastEpoch = presentEpoch - (60 * intervalRef * 1000);

                var queryHeader = {
                    "index": "shieldxdetailedalerts",
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
                    sizevalue = 50;
                }
                var presentEpoch = Math.round(new Date().getTime());
                var pastEpoch = presentEpoch - (60 * intervalRef * 1000);
                var queryHeader = {
                    "index": "shieldxdetailedalerts",
                    "ignore_unavailable": true,
                    "preference": 1482528522504
                };

                var queryBody = {
                    "size": 0,
                    "query": {
                        "bool": {
                            "must": [{
                                "query_string": {
                                    "query": "_type:DPI",
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
                                "field": "event.certTag",
                                "size": sizevalue,
                                "order": {
                                    "_count": "desc"
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
                        if (data) {
                            var buckets = data.aggregations["2"].buckets;
                            var piChatData = WidgetDataUtil.parseBarChartData(buckets);
                            console.log("TopNBadCertificatesWidget getBarChartData");
                            console.dir(piChatData);
                            return piChatData;
                        }

                        return [];
                    },
                    getStackedAreaData: function() {

                        return chartData;
                    },

                };
            },
            massageDrillDowndata: function(data) {
                var tabularView = {};
                tabularView.headers = [];
                tabularView.headers.push({ title: 'Certificate Name' });
                tabularView.headers.push({ title: 'Protocol Name' });
                tabularView.headers.push({ title: 'Source IP' });
                tabularView.headers.push({ title: 'Source Port' });
                tabularView.headers.push({ title: 'Destination IP' });
                tabularView.headers.push({ title: 'Destination Port' });
                tabularView.rowData = [];

                console.log("massageDrillDowndata ");
                var events = data.responses[0].hits.hits;
                for (var i = 0; i < events.length; i++) {
                    var source = events[i]._source;
                    tabularView.rowData.push({ val1: source.event.certTag, val2: source.event.protocolName, val3: source.event.srcIpAddress, val4: source.event.srcPort, val5: source.event.dstIpAddress, val6: source.event.dstPort });
                }
                console.dir(tabularView);
                return tabularView;
            }
        };
    };
    angular.module('shieldxApp').factory(WidgetName.TopNBadCertificates + "Factory", TopNBadCertificatesWidget);
})();
