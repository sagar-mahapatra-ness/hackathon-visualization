(function() {
    var TopNAttackersWidget = function() {
        return {
            getDrillDownQueryData: function(intervalRef) {
                console.log(" TopNDetectedAppsWidget getDrillDownQueryData  ");
                console.log("intervalRef  " + intervalRef);
                var query = "_type:DPI AND event.Attacker:(";
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
                    "preference": 1482258802419
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
                    sizevalue = 50;
                }
                var presentEpoch = Math.round(new Date().getTime());
                var pastEpoch = presentEpoch - (60 * intervalRef * 1000);
                var queryHeader = {
                    "index": "shieldxdetailedalerts",
                    "ignore_unavailable": true,
                    "preference": 1481580902567
                };

                var queryBody = {
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
                                "field": "event.Attacker",
                                "size": sizevalue,
                                "order": {
                                    "_count": "desc"
                                }
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
                tabularView.headers.push({ title: 'Attacker' });
                tabularView.headers.push({ title: 'Attacker IP' });
                tabularView.headers.push({ title: 'Attacker resource group' });
                tabularView.headers.push({ title: 'Security Policy Set' });
                tabularView.headers.push({ title: 'Sensor response' });
                tabularView.headers.push({ title: 'Severity' });
                tabularView.headers.push({ title: 'Policy name' });
                tabularView.rowData = [];

                console.log("massageDrillDowndata ");
                var events = data.responses[0].hits.hits;
                for (var i = 0; i < events.length; i++) {
                    var source = events[i]._source;
                    tabularView.rowData.push({ val1: source.event.Attacker, val2: source.event.AttackerIp, val3: source.event.AttackerResourceGroup, val4: source.event.securityPolicySetName, val5: source.event.sensorResponse, val6: source.event.severity, val7: source.event.policyName });
                }
                console.dir(tabularView);
                return tabularView;
            }
        };
    };
    angular.module('shieldxApp').factory(WidgetName.TopNAttackers + "Factory", TopNAttackersWidget);
})();
