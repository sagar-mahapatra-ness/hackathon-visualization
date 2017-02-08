(function() {
    var TopNAttackerResourceGroupsWidget = function() {
        return {
            getDrillDownQueryData: function(intervalRef) {
                var presentEpoch = Math.round(new Date().getTime());
                var pastEpoch = presentEpoch - (60 * intervalRef * 1000);
                /*  var query = "_type:DPI AND event.AttackerResourceGroup:(";
                  console.dir(arguments);
                   var addFirst = true;
                  for (i = 1; i < arguments.length; i++) {
                     if (!addFirst) {
                        query += " OR "+arguments[i];
                     } else if(addFirst)
                     {
                        addFirst = false;
                        query += "  "+arguments[i];  
                     }
                 }
                 query += ")";
                 console.log("query  "+query);*/
                var startStr = "_type:DPI AND event.AttackerResourceGroup:(";
                var endStr = ")";
                var query = WidgetDataUtil.drillDownParamsWithOutSpace(startStr, arguments, endStr);
                console.dir(arguments);
                var queryHeader = {
                    "index": "shieldxdetailedalerts",
                    "ignore_unavailable": true,
                    "preference": 1481582140001
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
            getQueryData: function(intervalRef, sizeValue) {
                var presentEpoch = Math.round(new Date().getTime());
                var pastEpoch = presentEpoch - (60 * intervalRef * 1000);
                if (!sizeValue) {
                    sizeValue = 50;
                }
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
                                "field": "event.AttackerResourceGroup",
                                "size": sizeValue,
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

                };
            },
            massageDrillDowndata: function(data) {
                var hits = data.responses[0].hits.hits;
                var rowData = [];
                var sourceData = '';
                for (var i = 0; i < hits.length; i++) {
                    sourceData = hits[i]._source;
                    sourceData = sourceData.event;
                    rowData.push({
                        "appId": sourceData.appId,
                        "Attacker": sourceData.Attacker,
                        "AttackerIp": sourceData.AttackerIp,
                        "AttackerResourceGroup": sourceData.AttackerResourceGroup,
                        "Victim": sourceData.Victim,
                        "VictimIp": sourceData.VictimIp,
                        "VictimResourceGroup": sourceData.VictimResourceGroup,
                        "dstIpAddress": sourceData.dstIpAddress,
                        "policyName": sourceData.policyName,
                        "policyType": sourceData.policyType,
                        "protocolName": sourceData.protocolName,
                        "securityPolicySetName": sourceData.securityPolicySetName,
                        "sensorResponse": sourceData.sensorResponse,
                        "severity": sourceData.severity,
                        "srcIpAddress": sourceData.srcIpAddress,
                        "srcPort": sourceData.srcPort,
                        "threatName": sourceData.threatName,
                        "dstPort": sourceData.dstPort
                    });
                }
                return rowData;

            }
        };
    };
    angular.module('shieldxApp').factory(WidgetName.TopNAttackerResourceGroups + "Factory", TopNAttackerResourceGroupsWidget);
})();
