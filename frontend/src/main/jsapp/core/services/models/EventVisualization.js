function EventVisualizationData(filterdata, queryResult,simulate) {
    this.filterdata = filterdata;
    this.queryResult = queryResult;
    this.simulate = false;
    if(simulate){
      this.simulate = simulate;
    }
    

     this.fieldConfig = {
        Src_IP: { filedName: "srcIpAddress", type:"IP", map:"source"},
        Dest_IP: { filedName: "dstIpAddress",type:"IP", map:"destination" },
        Src_RG: { filedName: "srcResourceGroup" ,type:"RG", map:"source"},
        Dest_RG: { filedName: "dstResourceGroup",type:"RG", map:"destination" },
        Dest_VM: { filedName: "dstMachineName",type:"VM", map:"destination" },
        Src_VM: { filedName: "srcMachineName",type:"VM", map:"source" },
        Application_NAME: { filedName: "applicationName",type:"AN", map:"source" },
        Victim_IP: { filedName: "VictimIp",type:"IP", map:"source" },
        Attacker_IP: { filedName: "AttackerIp",type:"IP", map:"destination" },
        Attacker_VM: { filedName: "Attacker",type:"VM", map:"destination" },
        Victim_VM: { filedName: "Victim",type:"VM", map:"source" },
        Victim_RG: { filedName: "VictimResourceGroup",type:"RG", map:"source" },
        Attacker_RG: { filedName: "AttackerResourceGroup",type:"RG", map:"destination" },
        Policy_Name: { filedName: "policyName",type:"PN", map:"source" },
        Threat_Name:{filedName: "threatName",type:"PN", map:"source"},
        Malware_Name:{filedName: "fileTag",type:"PN", map:"source"}

    };


}

EventVisualizationData.prototype.mapAxsisToType = function(axsis) {
   return  this.fieldConfig[axsis];
};

EventVisualizationData.prototype.createParser = function(queryType) {

    var parser = null;
    switch (queryType) {
        case "TWO_DIMENSIONAL":
            parser = new EventParser2DData(this.simulate);
            break;
        case "THREE_DIMENSIONAL":
            parser = new EventParser3DData(this.simulate);
            break;
    }

    return parser;
};

EventVisualizationData.prototype.createJSONFor3D = function() {

    var parser = this.createParser(this.filterdata.queryType);
    var normalizedData = parser.parse(this.queryResult.responses["0"].hits.hits, this.filterdata, this.fieldConfig);
    console.log("normalizedData  ");
    console.dir(normalizedData);
    var eventData = this.mapTo2DFormat(normalizedData);
    console.log(" final 3d data JSON Format for UI");
    console.dir(eventData);
    return eventData;

};

/*
    2D Format 
    {
      "nodesX":{
        name : this.filterdata.xAxisAttr,
        nodes:[{"name":"MYSQL"},{"name":"MONODB"}]
    },
     "nodesY":{
        name : this.filterdata.xAxisAttr,
        nodes:[{"name":"TOMCAT"}, {"name":"NGINX"}]
    },
      "links":[
         
       ]
    };
*/

EventVisualizationData.prototype.createJSONFor2D = function() {

    
    console.log("createJSON ");
    console.dir(this.filterdata);
    console.dir(this.queryResult);

    var parser = this.createParser(this.filterdata.queryType);

    var normalizedData = parser.parse(this.queryResult.responses["0"].aggregations, this.filterdata, this.fieldConfig);
    console.log("normalizedData  ");
    console.dir(normalizedData);

    var eventData = this.mapTo2DFormat(normalizedData);
    console.log(" final 2d data JSON Format for UI");
    console.dir(eventData);

    return eventData;
};

EventVisualizationData.prototype.mapTo2DFormat = function(normalizedData) {
    var eventData = {
        "nodesX": {
            name: this.filterdata.xAxisAttr,
            nodes: []
        },
        "nodesY": {
            name: this.filterdata.yAxisAttr,
            nodes: []
        },
        "links": [

        ]
    };

    for (var i = 0; i < normalizedData.xvalue.length; i++) {
        eventData.nodesX.nodes.push({ name: normalizedData.xvalue[i] });
    }

    for (var j = 0; j < normalizedData.yvalue.length; j++) {
        eventData.nodesY.nodes.push({ name: normalizedData.yvalue[j] });
    }

    for (var k = 0; k < normalizedData.data.length; k++) {
        var nodeData = normalizedData.data[k];
        var yval = nodeData.yval;
        var xVal = nodeData.xval;
        var source = _.indexOf(normalizedData.xvalue, xVal);
        var target = _.indexOf(normalizedData.yvalue, yval);
        var node = { "source": source, "target": target, "value": nodeData.data };
        eventData.links.push(node);
    }

    return eventData;
};

function EventParser2DData(simulate) {
	 this.YaxisisFirst = true;
     this.simulate = simulate;
}


EventParser2DData.prototype.parse = function(data, filterdata, fieldConfig) {
    console.log("EventParser  ");
    console.dir(data);
    var normalizedData = {
        xvalue: [],
        yvalue: [],
        data: []
    };
    var outerFielld = "";
    var innerField = "";
    if (this.YaxisisFirst) {
        outerFielld = "event."+fieldConfig[filterdata.yAxisAttr].filedName;
        innerField = "event."+fieldConfig[filterdata.xAxisAttr].filedName;
    }
    console.log("outer fileld   " + outerFielld);
    console.log("inner fileld   " + innerField);
    var outerBucket = data[outerFielld].buckets;
    var xVal = {};
    for (var i = 0; i < outerBucket.length; i++) {
        var bucket = outerBucket[i];
        var yvalue = bucket.key;
        normalizedData.yvalue.push(yvalue);
        var innerBuckets = bucket[innerField].buckets;
        for (var j = 0; j < innerBuckets.length; j++) {
            var innerBucket = innerBuckets[j];
            var xvalue = innerBucket.key;
            if (xVal[xvalue] === undefined) {
                xVal[xvalue] = true;
            }
            var eventCount = innerBucket.doc_count;

            var dataVal = { volume: eventCount };
            if(this.simulate){
                dataVal.volume = getRandomInt(0,1000);
            }
            var severity = innerBucket["event.severity"];
            if(severity)
            {
              var severityLevels =   severity.buckets;
              var severityObj = {
                  "Low":0,
                  "Critical":0,
                  "High":0,
                  "Medium":0,
                  "None":0
              };
              for(var k=0; k < severityLevels.length; k++){

                severityObj[severityLevels[k].key] = severityLevels[k].doc_count;

              }

              dataVal.severity = severityObj; 
            }

            normalizedData.data.push({ yval: yvalue, xval: xvalue, data:dataVal});
        }
    }

    console.log(" after >>>  data normalized");
    console.dir(xVal);
    for (var filedx in xVal) {
        console.log(" xvals " + filedx);
        normalizedData.xvalue.push(filedx);
    }
    console.dir(normalizedData);
    return normalizedData;
};

function EventParser3DData(simulate) {
    this.simulate = simulate;

}
EventParser3DData.prototype.parse = function(data, filterdata, fieldConfig) {

	console.log(" EventParser3DData ");
 	console.dir(data);

 	 var normalizedData = {
        xvalue: [],
        yvalue: [],
        data: []
    };

    var yAxisFielld = fieldConfig[filterdata.yAxisAttr].filedName;
    var xAxisField =  fieldConfig[filterdata.xAxisAttr].filedName;
    var xVal = {};
    var yVal = {};
    for(var i=0; i < data.length ;i++){
      var event  = data[i]._source.event;
      var timestamp = data[i]._source.timeStamp;
      var yAxisValue = event[yAxisFielld];
      var xAxisValue = event[xAxisField];

      if (xVal[xAxisValue] === undefined) {
          xVal[xAxisValue] = true;
      }

      if (yVal[yAxisValue] === undefined) {
          yVal[yAxisValue] = true;
      }
      var severityRef = event.severity;
      var dataVal = {volume: 0, threeDimValues:timestamp, severity:""};
      if(severityRef){
        dataVal.severity = severityRef;
      }
      normalizedData.data.push({ yval: yAxisValue, xval: xAxisValue, data: dataVal });
    }

    for (var filedx in xVal) {
        console.log(" xvals " + filedx);
        normalizedData.xvalue.push(filedx);
    }

    for (var filedy in yVal) {
        console.log(" yvals " + filedy);
        normalizedData.yvalue.push(filedy);
    }

    return normalizedData;
};

function EventVisualizationFilter() {
    this.actionTypeList = [];
    this.colorType = null;
    this.eventType = null;
    this.startTime = null;
    this.endTime = null;
    this.queryType = null;
    this.severity = null;
    this.xAxisAttr = null;
    this.yAxisAttr = null;
    this.attackerSourceList = [];
    this.attackerSourceType = "RG";
    this.targetDestinationList = [];
    this.targetDestinationType = "RG";
}

EventVisualizationFilter.prototype.getJSON = function(arg) {

    var postdata = {
    };

     postdata.actionTypeList = this.actionTypeList;
      if(this.colorType){
       postdata.colorType =  this.colorType;
     }

     postdata.eventType=  this.eventType;
     postdata.gte=  this.startTime;
     postdata.lte=  this.endTime;
     postdata.queryType=  this.queryType;
     if(this.severity){
     	postdata.severity=  this.severity;
     }
     postdata.xAxisAttr=  this.xAxisAttr;
     postdata.yAxisAttr=  this.yAxisAttr;

    
    postdata.attackerSourceList =  this.attackerSourceList;
    postdata.attackerSourceType = this.attackerSourceType;
    postdata.targetDestinationList = this.targetDestinationList;
    postdata.targetDestinationType = this.targetDestinationType;  
    
    return postdata;
};

EventVisualizationFilter.actions = [{ value: "PERMITTED", name: "" }, { value: "DENIED", name: "" }];
EventVisualizationFilter.colorType = [{ value: "EVENT_TYPE", name: "" }, { value: "L4_PROTOCAL", name: "" }, { value: "SEVERITY", name: "" }, { value: "ACTION_TAKEN", name: "" }];
EventVisualizationFilter.eventType = [{ value: "ACCESS_CONTROL", name: "" }, { value: "MALWARE", name: "" }, { value: "THREAT_PREVENTION", name: "" }];
EventVisualizationFilter.queryType = [{ value: "TWO_DIMESIONAL", name: "" }, { value: "THREE_DIMENSIONAL", name: "" }];
EventVisualizationFilter.severity = [{ value: "LOW", name: "" }, { value: "MEDIUM", name: "" }, { value: "HIGH", name: "" }, { value: "CRITICAL", name: "" }];
