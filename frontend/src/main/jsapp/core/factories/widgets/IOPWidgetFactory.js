(function() {
    var IOPWidget = function() {
        return {
            getDrillDownQueryData: function(intervalRef) {
                var presentEpoch = Math.round(new Date().getTime());
                var pastEpoch = presentEpoch - (60 * intervalRef * 1000);
                var timezone = jstz.determine().name();
                console.dir(arguments);
                var startStr = "event.iopDetectionId:(";
                var endStr = ")";
                var query = WidgetDataUtil.drillDownParamsWithOutSpace(startStr, arguments, endStr);
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
                //return query;
            },
            getQueryData: function(intervalRef) {
                var presentEpoch = Math.round(new Date().getTime());
                var pastEpoch = presentEpoch - (60 * intervalRef * 1000);
                var timezone = jstz.determine().name();
                var queryHeader = {
                    "index": "shieldxdetailedalerts",
                    "ignore_unavailable": true,
                    "preference": 1484156126157
                };

                var queryBody = {
                        "size": 0,
                        "query": {
                            "bool": {
                                "must": [{
                                    "query_string": {
                                        "query": "iop",
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
                            "iopChain": {
                                "terms": {
                                    "field": "event.iopDetectionId",
                                    "order": { "_count": "desc" }
                                },
                                "aggs": {
                                    "iopHop": {
                                        "terms": {
                                            "field": "event.iopHop",
                                            "order": { "_count": "desc" }
                                        },
                                        "aggs": {
                                            "Time Interval": {
                                                "date_histogram": {
                                                    "field": "aggregate",
                                                    "interval": "5m",
                                                    "time_zone": timezone,
                                                    "min_doc_count": 1
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
            getDataMassageObject: function(data) {
                return {
                    getTablesData: function() {
                        console.log("From Iop Pie Chart Data");
                        console.dir(data);
                        var totalData = data.aggregations.iopChain.buckets;
                        var tableData = { headers: "", rowData: "" };
                        var chainData= {};
                        var multiChain = {},temp,totalChainData;
                        var timeInterval1,timeInterval2;
                        var hour1,hour2,minutes1,minutes2,date1,date2,newDate,todayDate,offset;
                        tableData.headers = [
                            { title: 'ID' },
                            { title: 'Stage 1' },
                            { title: 'Stage 2' },
                            { title: 'Stage 3' },
                            { title: 'Stage 4' }
                        ];
                        for(var i=0;i<totalData.length;i++){
                            chainData[i] ={id:"",val:""};
                            chainData[i].id =totalData[i].key;
                            totalChainData = totalData[i].iopHop.buckets;
                            for(var j=0;j<totalChainData.length;j++){
                                multiChain[j] = {count:"0",hours:"0",mintues:"0"};
                                temp = totalChainData[j];
                                multiChain[j].count = totalChainData[j].doc_count;
                                if(j !== 0 && j !== totalChainData.length -1){
                                    timeInterval1 = totalChainData[j-1];
                                    timeInterval1 = new Date(timeInterval1['Time Interval'].buckets[0].key_as_string);
                                    /*hour1 =  timeInterval1.getHours();
                                    minutes1 =  timeInterval1.getMinutes();*/
                                    timeInterval2 = totalChainData[j+1];
                                    timeInterval2 = new Date(timeInterval2['Time Interval'].buckets[0].key_as_string);
                                    date1 = timeInterval1.getTime(); 
                                    date2 = timeInterval2.getTime();
                                    newDate = new Date(date2-date1);
                                    todayDate = new Date();
                                    offset = todayDate.getTimezoneOffset() * 60 * 1000;
                                     newDate = newDate.getTime() + offset;
                                     newDate = new Date(newDate);
                                    multiChain[j].hours =  newDate.getHours();
                                    multiChain[j].mintues =  (newDate.getMinutes() > 10)?newDate.getMinutes():('0'+newDate.getMinutes());
                                    //var totalHrs = (hour2*60 + minutes2) - (hour1*60 + minutes1);

                                    /*multiChain[j].hours = hour2-hour1; 
                                    multiChain[j].mintues = minutes2-minutes1;*/ 
                               }
                              
                            }
                            chainData[i].val =multiChain;
                           
                        }
                       tableData.rowData = chainData;
                        return tableData;
                    },
                };
            },
            massageDrillDowndata: function(data) {
                var hits = data.responses[0].hits.hits;
                var rowData = [];
                var sourceData = '';
                var stages = [],
                    stageInfo = [],
                    childData = [];

                for (var i = 0; i < hits.length; i++) {
                    //sourceData = hits[i]._source;
                    sourceData = hits[i]._source;
                    sourceData = sourceData.event;
                    stageInfo.push(sourceData);
                    if (stages.length === 0) {
                        stages.push(sourceData.iopHop);
                    } else {
                        if (stages.indexOf(sourceData.iopHop) === -1) {
                            stages.push(sourceData.iopHop);
                        }
                    }
                    /*sourceData= sourceData.event;
                    rowData.push( { "appId":sourceData.appId,"dstIpAddress":sourceData.dstIpAddress,
                    "dstPort":sourceData.dstPort,"iopDetectionId":sourceData.iopDetectionId,
                    "iopHop":sourceData.iopHop,"iopThreatName":sourceData.iopThreatName,"iopRuleId":sourceData.iopRuleId,
                    "protocol":sourceData.protocol,
                    "protocolName":sourceData.protocolName,"srcIpAddress":sourceData.srcIpAddress,
                    "srcPort":sourceData.srcPort,"threatName":sourceData.threatName });*/
                }
                for (var j = 0; j < stages.length; j++) {
                    rowData[j] = { stage: "", val: "" };
                    rowData[j].stage = stages[j];
                    childData = [];
                    for (var k = 0; k < stageInfo.length; k++) {
                        if (stageInfo[k].iopHop === stages[j]) {
                            childData.push(stageInfo[k]);
                        }
                    }
                    rowData[j].val = childData;
                }
                return rowData;
            }
        };
    };
    angular.module('shieldxApp').factory(WidgetName.IOP + "Factory", IOPWidget);
})();
