(function() {
    var TopNVictimResourceGroupsWidget = function() {
        return {
            getDrillDownQueryData: function(intervalRef) {
                console.log("  TopNDetectedThreatsWidget >>> ");
                var query = "_type:DPI AND event.VictimResourceGroup:(";
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
                var presentEpoch = Math.round(new Date().getTime());
                var pastEpoch = presentEpoch - (60 * intervalRef * 1000);
                var queryHeader = {
                    "index": "shieldxdetailedalerts",
                    "ignore_unavailable": true,
                    "preference": 1481583229034
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
                var queryStr = JSON.stringify(queryHeader) + "\n" + JSON.stringify(queryBody);
                return queryStr;
            },
            getQueryData: function(intervalRef, sizevalue) {
                if (!sizevalue) {
                    sizevalue = 5;
                }
                var presentEpoch = Math.round(new Date().getTime());
                var pastEpoch = presentEpoch - (60 * intervalRef * 1000);

                var queryHeader = {
                    "index": "shieldxdetailedalerts",
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
                                    "query": "_type:DPI"
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
                                "field": "event.VictimResourceGroup",
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
                        var buckets = data.aggregations["2"].buckets;
                        var piChatData = WidgetDataUtil.parseBarChartData(buckets);
                        console.log("TopNDetectedThreatsWidget getBarChartData");
                        console.dir(piChatData);
                        return piChatData;
                    },
                    getStackedAreaData: function() {

                        return chartData;
                    }
                };
            },
            massageDrillDowndata: function(data) {
                var tabularView = {};
                tabularView.headers = [];
                tabularView.headers.push({ title: 'Victim Resource Group Name' });
                tabularView.headers.push({ title: 'Victim IP' });
                tabularView.headers.push({ title: 'Attacker ResourceGroup Name' });
                tabularView.headers.push({ title: 'Attacker IP' });
                tabularView.headers.push({ title: 'Attacker Name' });
                tabularView.headers.push({ title: 'Victim Name' });
                tabularView.headers.push({ title: 'Threat Name' });
                tabularView.rowData = [];

                console.log("massageDrillDowndata ");
                var events = data.responses[0].hits.hits;
                for (var i = 0; i < events.length; i++) {
                    var source = events[i]._source;
                    tabularView.rowData.push({ val1: source.event.VictimResourceGroup, val2: source.event.VictimIp, val3: source.event.AttackerResourceGroup, val4: source.event.AttackerIp, val5: source.event.Attacker, val6: source.event.Victim, val7: source.event.threatName });
                }
                console.dir(tabularView);
                return tabularView;
            }
        };
    };
    angular.module('shieldxApp').factory(WidgetName.TopNVictimResourceGroups + "Factory", TopNVictimResourceGroupsWidget);
})();
