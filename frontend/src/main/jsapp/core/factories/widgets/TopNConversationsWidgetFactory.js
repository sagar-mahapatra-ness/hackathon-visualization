(function() {
    var TopNConversationsWidget = function() {
        return {
            getDrillDownQueryData: function(intervalRef) {
                console.log(" TopNConversationsWidget getDrillDownQueryData  ");
                console.log("intervalRef  " + intervalRef);
                var query = "_type:TCP AND event.srcMachineName:" + arguments[1].source + " AND event.dstMachineName:" + arguments[1].victim + "";
                console.log("query  " + query);
                console.dir(arguments[1].source);
                var presentEpoch = Math.round(new Date().getTime());
                var pastEpoch = presentEpoch - (60 * intervalRef * 1000);

                var queryHeader = {
                    "index": ["shieldxevents"],
                    "ignore_unavailable": true,
                    "preference": 1482191877914
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
                    "preference": 1481580902567
                };

                var queryBody = {
                    "size": 0,
                    "query": {
                        "bool": {
                            "must": [{
                                "query_string": {
                                    "analyze_wildcard": true,
                                    "query": "_type:TCP"
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
                        "3": {
                            "terms": {
                                "field": "event.srcMachineName",
                                "size": parseInt(sizevalue),
                                "order": {
                                    "4": "desc"
                                }
                            },
                            "aggs": {
                                "4": {
                                    "sum": {
                                        "field": "event.sendByte"
                                    }
                                },
                                "5": {
                                    "terms": {
                                        "field": "event.dstMachineName",
                                        "size": 50,
                                        "order": {
                                            "4": "desc"
                                        }
                                    },
                                    "aggs": {
                                        "4": {
                                            "sum": {
                                                "field": "event.sendByte"
                                            }
                                        },
                                        "6": {
                                            "sum": {
                                                "field": "event.recvByte"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                };
                return JSON.stringify(queryHeader) + "\n" + JSON.stringify(queryBody);
            },
            getDataMassageObject: function(data, navlue) {
                var ognvalue = navlue;
                return {
                    getBarChartData: function() {
                        console.log(ognvalue);
                        var navlue = parseInt(ognvalue);
                        var buckets = data.aggregations["3"].buckets;
                        console.log("TopNConversationsWidget getBarChartData");
                        console.dir(buckets);
                        var piChatData = [];
                        for (var i = 0; i < buckets.length; i++) {
                            var bucket = buckets[i];
                            var name = bucket.key;
                            var subBukets = bucket["5"].buckets;
                            for (var j = 0; j < subBukets.length; j++) {
                                var sb = subBukets[j];
                                var subName = sb.key;
                                var byteSent = parseInt(sb["4"].value);
                                var byteRecived = parseInt(sb["6"].value);
                                piChatData.push({ "Letter": "(" + name + " _ " + subName + ")", "Freq": (byteSent + byteRecived), "source": name, "victim": subName });
                            }

                        }
                        var totalData = _.sortBy(piChatData, 'Freq');
                        console.log(totalData);
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
                    }
                };
            },
            massageDrillDowndata: function(data) {
                var tabularView = {};
                tabularView.headers = [];
                tabularView.headers.push({ title: 'action' });
                tabularView.headers.push({ title: 'Destination IP' });
                tabularView.headers.push({ title: 'Destination Resource Group' });
                tabularView.headers.push({ title: 'Policy type' });
                tabularView.headers.push({ title: 'Recived Byte' });
                tabularView.headers.push({ title: 'Send Byte' });
                tabularView.headers.push({ title: 'Source IP' });
                tabularView.rowData = [];

                console.log("massageDrillDowndata ");
                var events = data.responses[0].hits.hits;
                for (var i = 0; i < events.length; i++) {
                    var source = events[i]._source;
                    tabularView.rowData.push({ val1: source.event.action, val2: source.event.dstIpAddress, val3: source.event.dstResourceGroup, val4: source.event.policyType, val5: source.event.recvByte, val6: source.event.sendByte, val7: source.event.srcIpAddress });
                }
                console.dir(tabularView);
                return tabularView;
            }
        };
    };
    angular.module('shieldxApp').factory(WidgetName.TopNConversations + "Factory", TopNConversationsWidget);
})();
