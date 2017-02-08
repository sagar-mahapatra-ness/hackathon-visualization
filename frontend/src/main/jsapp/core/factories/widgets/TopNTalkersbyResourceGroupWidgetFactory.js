(function() {
    var TopNTalkersbyResourceGroupWidget = function() {
        return {
            getDrillDownQueryData: function(intervalRef) {
                var filterData = arguments[1];
                var source = filterData.name;
                var dest = filterData.destnation;
           //_type:TCP AND event.srcMachineName:bats1Ctr-2-Clnt_2_35.80 AND event.dstMachineName:bats1Ctr-2-Srvr_2_35.81
                 var query = " _type:TCP AND event.srcResourceGroup:" + arguments[1].source + " AND event.dstResourceGroup:" + arguments[1].victim + "";
                var presentEpoch = Math.round(new Date().getTime());
                var pastEpoch = presentEpoch - (60 * intervalRef * 1000);
                var queryHeader = {
                        "index": "shieldxevents",
                        "ignore_unavailable": true,
                        "preference": 1482170500264
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
                var queryStr = JSON.stringify(queryHeader) + "\n" + JSON.stringify(queryBody);
                return queryStr;
            },
            getQueryData: function(intervalRef, sizevalue) {
                if (!sizevalue) {
                    sizevalue = 5;
                }
                var presentEpoch = Math.round(new Date().getTime());
                var pastEpoch = presentEpoch - (60 * intervalRef * 1000);
                var timezone = jstz.determine().name();
                var queryHeader = {
                    "index": "shieldxevents",
                    "ignore_unavailable": true,
                    "preference": 1482173223246
                };

                var queryBody = {
                    "size": 50,
                    "query": {
                        "bool": {
                            "must": [{
                                "query_string": {
                                    "query": "_type:TCP",
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
                                "field": "event.srcResourceGroup",
                                "size": sizevalue,
                                "order": { "_count": "desc" }
                            },
                            "aggs": {
                                "3": {
                                    "terms": {
                                        "field": "event.dstResourceGroup",
                                        "size": sizevalue,
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
            getDataMassageObject: function(data,navlue) {
                var ognvalue = navlue;
                return {
                    getBarChartData: function() {
                        var buckets = data.aggregations["2"].buckets;
                        var navlue = parseInt(ognvalue);
                        var piChatData = WidgetDataUtil.getPairedBarChartData(buckets);
                        console.log("TopNBadCertificatesWidget getBarChartData");
                        console.dir(piChatData);
                        var totalData = _.sortBy(piChatData, 'Freq');
                        if (totalData.length >= navlue) {
                            piChatData = totalData.slice(totalData.length - navlue, totalData.length);
                        }
                        return piChatData;
                    },
                    getStackedAreaData: function() {

                        return chartData;
                    },
                    massageDrillDowndata: function(data) {
                        return "";
                    },
                    getFiltterData: function() {
                        var buckets = data.responses[0].aggregations["2"].buckets;
                        var filterData = [];
                        for (var i = 0; i < buckets.length; i++) {
                            var eachBucket = buckets[i];
                            var rgData = {
                                name: eachBucket.key,
                                destnation: []
                            };
                            var subBucket = eachBucket["3"].buckets;
                            for (var k = 0; k < subBucket.length; k++) {
                                rgData.destnation.push(subBucket[k].key);
                            }

                            filterData.push(rgData);
                        }
                        return filterData;
                    }
                };
            },
            massageDrillDowndata: function(data) {
                var tabularView = {};
                tabularView.headers = [];
                tabularView.headers.push({ title: 'Source Machine Name' });
                tabularView.headers.push({ title: 'Source IP' });
                tabularView.headers.push({ title: 'Source ResourceGroup ' });
                tabularView.headers.push({ title: 'Destination Machine Name' });
                tabularView.headers.push({ title: 'Destination IP' });
                tabularView.headers.push({ title: 'Destination ResourceGroup' });

                tabularView.rowData = [];

                console.log("massageDrillDowndata ");
                var events = data.responses[0].hits.hits;
                for (var i = 0; i < events.length; i++) {
                    var source = events[i]._source;
                    tabularView.rowData.push({ val1: source.event.srcMachineName, val2: source.event.srcIpAddress, val3: source.event.srcResourceGroup, val4: source.event.dstMachineName, val5: source.event.dstIpAddress, val6: source.event.dstResourceGroup });
                }
                console.dir(tabularView);
                return tabularView;
            }
        };
    };
    angular.module('shieldxApp').factory(WidgetName.TopNTalkersbyResourceGroup + "Factory", TopNTalkersbyResourceGroupWidget);
})();
