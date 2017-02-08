(function() {
    var ScalingWidget = function() {
        return {
            getDrillDownQueryData: function() {
                return "";
            },
            getQueryData: function(intervalRef) {
                var presentEpoch = Math.round(new Date().getTime());
                var pastEpoch = presentEpoch - (60 * intervalRef * 1000);
                var timezone = jstz.determine().name();
                var queryHeader = {
                    "index": "shieldxstats",
                    "ignore_unavailable": true,
                    "preference": 1481237372803
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
                        "3": {
                            "date_histogram": {
                                "field": "aggregate",
                                "interval": "1m",
                                "time_zone": timezone,
                                "min_doc_count": 1
                            },
                            "aggs": {
                                "4": {
                                    "terms": {
                                        "field": "microServiceTypeString",
                                        "size": 5,
                                        "order": {
                                            "1": "desc"
                                        }
                                    },
                                    "aggs": {
                                        "1": {
                                            "cardinality": {
                                                "field": "microServiceInstanceId"
                                            }
                                        },
                                        "5": {
                                            "terms": {
                                                "field": "microServiceTypeString",
                                                "size": 5,
                                                "order": {
                                                    "1": "desc"
                                                }
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
                    getStackedAreaData: function(otheroption) {
                        console.log(" ScalingWidget  otheroption");
                        if (!otheroption) {
                            otheroption = "ALL";
                        }
                        var chartData = [];
                        console.log("FlowWidget getStackedAreaData");
                        console.dir(data);
                        var buckets = data.aggregations["3"].buckets;
                        console.log("buckets");
                        console.dir(buckets);
                        var maxBucketLength = 0;
                        var maxBucket;
                        var allSubBucket = [];
                        var missingBucketnamesObj = {};
                        var missingBucketnamesArray = [];
                        for (var i = 0; i < buckets.length; i++) {
                            var bucket = buckets[i];
                            //var kas = bucket.key_as_string.slice(0, 19);
                            var kas = bucket.key;
                            var subBucket = bucket["4"].buckets;

                            if (subBucket.length > maxBucketLength) {
                                maxBucketLength = subBucket.length;
                                maxBucket = subBucket;
                            }

                            for (var o = 0; o < subBucket.length; o++) {
                                if (missingBucketnamesObj[subBucket[o].key] === undefined) {
                                    missingBucketnamesObj[subBucket[o].key] = true;
                                    missingBucketnamesArray.push(subBucket[o].key);
                                }
                            }

                            allSubBucket.push({ "data": kas, "bucket": subBucket });
                        }

                        for (var k = 0; k < allSubBucket.length; k++) {
                            var fgTemp = allSubBucket[k].bucket;
                            var newKas = allSubBucket[k].data;
                            for (var j = 0; j < fgTemp.length; j++) {
                                var temp = fgTemp[j];
                                if (otheroption === "ALL") {
                                    chartData.push({ "date": newKas, "key": temp.key, "value": temp["1"].value });
                                } else {
                                    if (temp.key === otheroption) {
                                        chartData.push({ "date": newKas, "key": temp.key, "value": temp["1"].value });
                                    }
                                }

                            }

                            /* jshint ignore:start */

                            /*if (fgTemp.length < maxBucketLength) {
                                for (var t = 0; t < maxBucket.length; t++) {
                                    var keyExt = maxBucket[t].key;
                                    var tx = _.find(fgTemp, function(ty) {
                                        return ty.key === keyExt;
                                    });

                                    if (!tx) {
                                        chartData.push({ "date": newKas, "key": keyExt, "value": 0 });
                                    }
                                }
                            }
                            */
                            for (var t = 0; t < missingBucketnamesArray.length; t++) {
                                var keyFound = _.find(fgTemp, function(ty) {
                                    return ty.key === missingBucketnamesArray[t];
                                });
                                if (!keyFound) {
                                    if (otheroption === "ALL") {
                                        chartData.push({ "date": newKas, "key": missingBucketnamesArray[t], "value": 0 });
                                    } else {
                                        if (missingBucketnamesArray[t] === otheroption) {
                                            chartData.push({ "date": newKas, "key": missingBucketnamesArray[t], "value": 0 });
                                        }
                                    }

                                }
                            }

                            /* jshint ignore:end */



                        }
                        console.log("chatData FlowWidget >> ");
                        console.dir(chartData);
                        return chartData;
                    },
                    massageDrillDowndata: function(data) {
                        return "";
                    }
                };
            }
        };
    };
    angular.module('shieldxApp').factory(WidgetName.Scaling + "Factory", ScalingWidget);
})();
