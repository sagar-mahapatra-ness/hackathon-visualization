(function() {
    var TroubledMicroServicesWidget = function() {
        return {
            getDrillDownQueryData: function() {
                return "";
            },
            getQueryData: function() {
                var presentEpoch = Math.round(new Date().getTime());
                var interval = 30;
                var pastEpoch = presentEpoch - (60 * interval * 1000);
                console.log(" present ephoc >> " + presentEpoch);
                console.log(" pastEpoch ephoc >> " + pastEpoch);
                var queryRequest = new ElasticSearchRequest();
                queryRequest.setSearchType("count").
                setIgnoreUnavailable(true).
                setIndex("shieldxalerts").
                setQuery("*").
                setGte(pastEpoch).
                setlte(presentEpoch);

                var agg = new ElasticSearchAgg();

                var bucket = new ElasticSearchBucket();
                bucket.setType(ElasticSearchBucket.TERMS);
                bucket.setFieldName("malDomain");

                var field = new ElasticSearchField();
                field.value = 50;
                field.type = ElasticSearchField.NUMERICAL;
                bucket.addFields("size", field);

                field = new ElasticSearchField();
                field.value = "{\"1\":\"desc\"}";
                field.type = ElasticSearchField.GENARIC;
                bucket.addFields("order", field);
                agg.addBucket(bucket);

                var agg1 = new ElasticSearchAgg();
                bucket = new ElasticSearchBucket();
                bucket.setType(ElasticSearchBucket.SUM);
                bucket.setFieldName("malDomCount");
                agg1.addBucket(bucket);

                agg.addNestedArgs(agg1);

                queryRequest.setAggregation(agg);

                var query = queryRequest.getJSON();

                return query;
            },
            getDataMassageObject: function(data) {
                return {
                    getBarChartData: function() {
                        return "";
                    },
                    getAlertData: function() {
                        var piChatData = [];
                        console.log("getBasicPieChartData");
                        console.dir(data);
                        var buckets = data.aggregations["1"].buckets;
                        console.log("buckets");
                        console.dir(buckets);
                        for (var i = 0; i < buckets.length; i++) {
                            var bucket = buckets[i];
                            piChatData.push({ "label": bucket.key, "value": bucket["1"].value });
                        }
                        console.log("piChatData  >> ");
                        console.dir(buckets);
                        return piChatData;
                    }
                };
            },
            massageDrillDowndata: function(data) {
                return "";
            }
        };
    };

    angular.module('shieldxApp').factory(WidgetName.TroubledMicroServices + "Factory", TroubledMicroServicesWidget);
})();
