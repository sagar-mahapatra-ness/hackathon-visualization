(function() {
    var TopNTalkersbyVMnameWidget = function() {
        return {
            getDrillDownQueryData: function(intervalRef) {
                console.log(" TopNDetectedAppsWidget getDrillDownQueryData  ");
                console.log("intervalRef  " + intervalRef);
                var filterData = arguments[1];
                var source = filterData.name;
                var dest = filterData.destnation;
                //var subQuery = "";
                var addFirst = true;
                /*for (i = 0; i < dest.length; i++) {
                    if (!addFirst) {
                        subQuery += " OR  ( event.srcMachineName:" + source + " AND event.dstMachineName:" + dest[i] + ")";
                    } else if (addFirst) {
                        addFirst = false;
                        subQuery += " ( event.srcMachineName:" + source + " AND event.dstMachineName:" + dest[i] + ")";
                    }
                }*/
                var query = "_type:TCP AND event.srcMachineName:" + arguments[1].source + " AND event.dstMachineName:" + arguments[1].victim + "";
                //event.srcMachineName:bats1Ctr-2-Clnt_2_35.80 AND event.dstMachineName:bats1Ctr-2-Srvr_2_35.81
                //var query = "_type:DPI AND (" + subQuery + ")";
                console.log("query  " + query);
                console.dir(arguments);
                var presentEpoch = Math.round(new Date().getTime());
                var pastEpoch = presentEpoch - (60 * intervalRef * 1000);

                var queryHeader = {
                    "index": "shieldxevents",
                    "ignore_unavailable": true,
                    "preference": 1482170500264
                };
                var queryBody = {
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
                    "preference": 1482173223246
                };

                var queryBody = {
                    "size": 0,
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
                                "field": "event.srcMachineName",
                                "size": sizevalue,
                                "order": { "_count": "desc" }
                            },
                            "aggs": {
                                "3": {
                                    "terms": {
                                        "field": "event.dstMachineName",
                                        "size": sizevalue,
                                        "order": { "_count": "desc" }
                                    }
                                }
                            }
                        }
                    }
                };
                return JSON.stringify(queryHeader) + "\n" + JSON.stringify(queryBody);
            },
            getDataMassageObject: function(data,navlue) {
                 var ognvalue = navlue;
                return {
                    getBarChartData: function() {
                        console.log("TopNTalkersbyVMnameWidget");
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
                    getFiltterData: function() {
                        var buckets = data.responses[0].aggregations["2"].buckets;
                        var filterData = [];
                        for (var i = 0; i < buckets.length; i++) {
                            var eachBucket = buckets[i];
                            var vmdata = {
                                name: eachBucket.key,
                                destnation: []
                            };
                            var subBucket = eachBucket["3"].buckets;
                            for (var k = 0; k < subBucket.length; k++) {
                                vmdata.destnation.push(subBucket[k].key);
                            }

                            filterData.push(vmdata);
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
                //tabularView.headers.push({ title: 'Application Name' });
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
    angular.module('shieldxApp').factory(WidgetName.TopNTalkersbyVMname + "Factory", TopNTalkersbyVMnameWidget);
})();
