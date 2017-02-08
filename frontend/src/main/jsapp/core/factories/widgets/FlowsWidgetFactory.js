(function() {

    var FlowWidget = function() {
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
                    "preference": 1481054742905
                };

                var queryBody = {
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
                            "date_histogram": {
                                "field": "aggregate",
                                "interval": "1m",
                                "time_zone": timezone,
                                "min_doc_count": 1
                            },
                            "aggs": {
                                "3": {
                                    "terms": {
                                        "field": "microServiceName",
                                        "size": 150,
                                        "order": {
                                            "1": "desc"
                                        }
                                    },
                                    "aggs": {
                                        "1": {
                                            "avg": {
                                                "field": "ncumstatistics.flows_created_rate"
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
                    getStackedAreaData: function() {
                        var chartData = [];
                        console.log("FlowWidget getStackedAreaData");
                        console.dir(data);
                        var buckets = data.aggregations["2"].buckets;
                        console.log("buckets");
                        console.dir(buckets);
                        var maxBucketLength = 0;
                        var maxBucket;
                        var allSubBucket = [];
                        for (var i = 0; i < buckets.length; i++) {
                            var bucket = buckets[i];
                            //var kas = bucket.key_as_string.slice(0, 19);
                            var kas = bucket.key;
                            var subBucket = bucket["3"].buckets;

                            if (subBucket.length > maxBucketLength) {
                                maxBucketLength = subBucket.length;
                                maxBucket = subBucket;
                            }
                            allSubBucket.push({ "data": kas, "bucket": subBucket });
                        }

                        for (var k = 0; k < allSubBucket.length; k++) {
                            var fgTemp = allSubBucket[k].bucket;
                            var newKas = allSubBucket[k].data;
                            for (var j = 0; j < fgTemp.length; j++) {
                                var temp = fgTemp[j];
                                chartData.push({ "date": newKas, "key": temp.key, "value": temp["1"].value });
                            }

                            /* jshint ignore:start */

                            if (fgTemp.length < maxBucketLength) {
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
    console.log("dynamic factory  flows " + (WidgetName.Flows + "Factory"));
    angular.module('shieldxApp').factory(WidgetName.Flows + "Factory", FlowWidget);
})();
