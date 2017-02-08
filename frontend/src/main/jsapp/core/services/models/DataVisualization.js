function widgetConfig() {}

widgetConfig.categories = {
    SystemHealth: "System Health",
    Composition: "Composition",
    SecurityEvent: "Security Event",
    Loading: "Loading",
    Anomaly: "Anomaly"
};

widgetConfig.list = {
    /*"TroubledMicroServices": {
        title: "Troubled Microservices",
        value: WidgetName.TroubledMicroServices,
        chartType: "Alert",
        widgetType: ChartTypes.alert,
        category: widgetConfig.categories.SystemHealth,
        otherConfig: [],
        drillDown: true
    },*/
    "InventoryofMicroServices": {
        title: "Inventory of Microservices",
        value: WidgetName.InventoryofMicroServices,
        chartType: "Alert",
        widgetType: ChartTypes.alert,
        category: widgetConfig.categories.Composition,
        drillDown: true
    },
    "SystemInformation": {
        title: "System Information",
        value: WidgetName.SystemInformation,
        chartType: "Alert",
        widgetType: ChartTypes.alert,
        category: widgetConfig.categories.Composition,
        drillDown: true
    },
    "Scaling": {
        title: "Scaling",
        value: WidgetName.Scaling,
        chartType: "Chart",
        widgetType: ChartTypes.stackedArea,
        category: widgetConfig.categories.Loading,
        otherConfig: [{
            label: 'Time Interval',
            model: 'timeInterval',
            options: [
                { value: 30, text: 'Past 30 min' },
                { value: 60, text: 'Past 1 Hr' },
                { value: 120, text: 'Past 2 Hrs' },
                { value: 240, text: 'Past 4 Hrs' },
                { value: 480, text: 'Past 8 Hrs' }
            ]
        }, {
            label: 'Micro Services',
            model: 'microServices',
            options: [
                { value: 'ALL', text: 'ALL' },
                { value: 'SI', text: 'SI' },
                { value: 'NOX', text: 'NOX' },
                { value: 'DPCC', text: 'DPCC' },
                { value: 'TLS', text: 'TLS' },
                { value: 'DPI', text: 'DPI' }
            ]
        }],
        drillDown: false,
        axis: { xlabel: "Time", ylabel: "Number of micro-services" }
    },
    "Throughput": {
        title: "Throughput",
        value: WidgetName.Throughput,
        chartType: "Chart",
        widgetType: ChartTypes.stackedArea,
        category: widgetConfig.categories.Loading,
        otherConfig: [{
            label: 'Time Interval',
            model: 'timeInterval',
            options: [
                { value: 30, text: 'Past 30 min' },
                { value: 60, text: 'Past 1 Hr' },
                { value: 120, text: 'Past 2 Hrs' },
                { value: 240, text: 'Past 4 Hrs' },
                { value: 480, text: 'Past 8 Hrs' }
            ]
        }],
        drillDown: false,
        axis: { xlabel: "Time", ylabel: "Traffic in Mbps" }
    },
    "Flows": {
        title: "Flows",
        value: WidgetName.Flows,
        chartType: "Chart",
        widgetType: ChartTypes.stackedArea,
        category: widgetConfig.categories.Loading,
        otherConfig: [{
            label: 'Time Interval',
            model: 'timeInterval',
            options: [
                { value: 30, text: 'Past 30 min' },
                { value: 60, text: 'Past 1 Hr' },
                { value: 120, text: 'Past 2 Hrs' },
                { value: 240, text: 'Past 4 Hrs' },
                { value: 480, text: 'Past 8 Hrs' }
            ]
        }],
        drillDown: false,
        axis: { xlabel: "Time", ylabel: "Number of flows" }
    },
    "EventRate": {
        title: "Event Rate",
        value: WidgetName.EventRate,
        chartType: "Chart",
        widgetType: ChartTypes.stackedArea,
        category: widgetConfig.categories.Loading,
        otherConfig: [{
            label: 'Time Interval',
            model: 'timeInterval',
            options: [
                { value: 30, text: 'Past 30 min' },
                { value: 60, text: 'Past 1 Hr' },
                { value: 120, text: 'Past 2 Hrs' },
                { value: 240, text: 'Past 4 Hrs' },
                { value: 480, text: 'Past 8 Hrs' }
            ]
        }, {
            label: 'Threshold',
            model: 'threshold',
            default: "Critical",
            options: [
                { value: 'Critical', text: 'Critical' },
                { value: 'High', text: 'High' }
            ]
        }],
        drillDown: false,
        axis: { xlabel: "Time", ylabel: "Number of events reported" }
    },
    "TopNDetectedThreats": {
        title: "Top N Detected Threats",
        value: WidgetName.TopNDetectedThreats,
        chartType: "Chart",
        widgetType: ChartTypes.barChart,
        category: widgetConfig.categories.SecurityEvent,
        otherConfig: [{
            label: 'Time Interval',
            model: 'timeInterval',
            options: [
                { value: 30, text: 'Past 30 min' },
                { value: 60, text: 'Past 1 Hr' },
                { value: 120, text: 'Past 2 Hrs' },
                { value: 240, text: 'Past 4 Hrs' },
                { value: 480, text: 'Past 8 Hrs' }
            ]
        }],
        drillDown: true,
        axis: { xlabel: "Name of the threat", ylabel: "Count" }
    },
    "TopNDetectedApps": {
        title: "Top N Detected Apps",
        value: WidgetName.TopNDetectedApps,
        chartType: "Chart",
        widgetType: ChartTypes.barChart,
        category: widgetConfig.categories.SecurityEvent,
        otherConfig: [{
            label: 'Time Interval',
            model: 'timeInterval',
            options: [
                { value: 30, text: 'Past 30 min' },
                { value: 60, text: 'Past 1 Hr' },
                { value: 120, text: 'Past 2 Hrs' },
                { value: 240, text: 'Past 4 Hrs' },
                { value: 480, text: 'Past 8 Hrs' }
            ]
        }],
        drillDown: true,
        axis: { xlabel: "Name of the app", ylabel: "Count" }
    },
    "TopNMalwareDomains": {
        title: "Top N Malware Domains",
        value: WidgetName.TopNMalwareDomains,
        chartType: "Chart",
        widgetType: ChartTypes.barChart,
        category: widgetConfig.categories.SecurityEvent,
        otherConfig: [{
            label: 'Time Interval',
            model: 'timeInterval',
            options: [
                { value: 30, text: 'Past 30 min' },
                { value: 60, text: 'Past 1 Hr' },
                { value: 120, text: 'Past 2 Hrs' },
                { value: 240, text: 'Past 4 Hrs' },
                { value: 480, text: 'Past 8 Hrs' }
            ]
        }],
        drillDown: true,
        axis: { xlabel: "Name of the malware domain", ylabel: "Count" }
    },
    "TopNMalwareDetections": {
        title: "Top N Malware Detections",
        value: WidgetName.TopNMalwareDetections,
        chartType: "Chart",
        widgetType: ChartTypes.barChart,
        category: widgetConfig.categories.SecurityEvent,
        otherConfig: [{
            label: 'Time Interval',
            model: 'timeInterval',
            options: [
                { value: 30, text: 'Past 30 min' },
                { value: 60, text: 'Past 1 Hr' },
                { value: 120, text: 'Past 2 Hrs' },
                { value: 240, text: 'Past 4 Hrs' },
                { value: 480, text: 'Past 8 Hrs' }
            ]
        }],
        drillDown: true,
        axis: { xlabel: "Name of the malware", ylabel: "Count" }
    },
    "TopNBadCertificates": {
        title: "Top N Bad Certificates",
        value: WidgetName.TopNBadCertificates,
        chartType: "Chart",
        widgetType: ChartTypes.barChart,
        category: widgetConfig.categories.SecurityEvent,
        otherConfig: [{
            label: 'Time Interval',
            model: 'timeInterval',
            options: [
                { value: 30, text: 'Past 30 min' },
                { value: 60, text: 'Past 1 Hr' },
                { value: 120, text: 'Past 2 Hrs' },
                { value: 240, text: 'Past 4 Hrs' },
                { value: 480, text: 'Past 8 Hrs' }
            ]
        }],
        drillDown: true,
        axis: { xlabel: "Name of the certificate", ylabel: "Count" }
    },
    "TopNAttackerResourceGroups": {
        title: "Top N Attacker Resource Groups",
        value: WidgetName.TopNAttackerResourceGroups,
        chartType: "Chart",
        widgetType: ChartTypes.barChart,
        category: widgetConfig.categories.SecurityEvent,
        otherConfig: [{
            label: 'Time Interval',
            model: 'timeInterval',
            options: [
                { value: 30, text: 'Past 30 min' },
                { value: 60, text: 'Past 1 Hr' },
                { value: 120, text: 'Past 2 Hrs' },
                { value: 240, text: 'Past 4 Hrs' },
                { value: 480, text: 'Past 8 Hrs' }
            ]
        }],
        drillDown: true,
        axis: { xlabel: "Resource groups", ylabel: "Count" }
    },
    "TopNVictimResourceGroups": {
        title: "Top N Victim Resource Groups",
        value: WidgetName.TopNVictimResourceGroups,
        chartType: "Chart",
        widgetType: ChartTypes.barChart,
        category: widgetConfig.categories.SecurityEvent,
        otherConfig: [{
            label: 'Time Interval',
            model: 'timeInterval',
            options: [
                { value: 30, text: 'Past 30 min' },
                { value: 60, text: 'Past 1 Hr' },
                { value: 120, text: 'Past 2 Hrs' },
                { value: 240, text: 'Past 4 Hrs' },
                { value: 480, text: 'Past 8 Hrs' }
            ]
        }],
        drillDown: true,
        axis: { xlabel: "Name of the resource group", ylabel: "Count" }
    },
    "TopNAttackers": {
        title: "Top N Attackers",
        value: WidgetName.TopNAttackers,
        chartType: "Chart",
        widgetType: ChartTypes.barChart,
        category: widgetConfig.categories.SecurityEvent,
        otherConfig: [{
            label: 'Time Interval',
            model: 'timeInterval',
            options: [
                { value: 30, text: 'Past 30 min' },
                { value: 60, text: 'Past 1 Hr' },
                { value: 120, text: 'Past 2 Hrs' },
                { value: 240, text: 'Past 4 Hrs' },
                { value: 480, text: 'Past 8 Hrs' }
            ]
        }],
        drillDown: true,
        axis: { xlabel: "Name of the VM or IP", ylabel: "Count" }
    },
    "TopNVictims": {
        title: "Top N Victims",
        value: WidgetName.TopNVictims,
        chartType: "Chart",
        widgetType: ChartTypes.barChart,
        category: widgetConfig.categories.SecurityEvent,
        otherConfig: [{
            label: 'Time Interval',
            model: 'timeInterval',
            options: [
                { value: 30, text: 'Past 30 min' },
                { value: 60, text: 'Past 1 Hr' },
                { value: 120, text: 'Past 2 Hrs' },
                { value: 240, text: 'Past 4 Hrs' },
                { value: 480, text: 'Past 8 Hrs' }
            ]
        }],
        drillDown: true,
        axis: { xlabel: "Name of the VM", ylabel: "Count" }
    },
    "TopNTalkersbyVMname": {
        title: "Top N VMs by Number of Connections",
        value: WidgetName.TopNTalkersbyVMname,
        chartType: "Chart",
        widgetType: ChartTypes.barChart,
        category: widgetConfig.categories.SecurityEvent,
        otherConfig: [{
            label: 'Time Interval',
            model: 'timeInterval',
            options: [
                { value: 30, text: 'Past 30 min' },
                { value: 60, text: 'Past 1 Hr' },
                { value: 120, text: 'Past 2 Hrs' },
                { value: 240, text: 'Past 4 Hrs' },
                { value: 480, text: 'Past 8 Hrs' }
            ]
        }],
        drillDown: true,
        axis: { xlabel: "Name of the VM", ylabel: "Count" }
    },
    "TopNTalkersbyResourceGroup": {
        title: "Top N Resource Groups by Number of Connections",
        value: WidgetName.TopNTalkersbyResourceGroup,
        chartType: "Chart",
        widgetType: ChartTypes.barChart,
        category: widgetConfig.categories.SecurityEvent,
        otherConfig: [{
            label: 'Time Interval',
            model: 'timeInterval',
            options: [
                { value: 30, text: 'Past 30 min' },
                { value: 60, text: 'Past 1 Hr' },
                { value: 120, text: 'Past 2 Hrs' },
                { value: 240, text: 'Past 4 Hrs' },
                { value: 480, text: 'Past 8 Hrs' }
            ]
        }],
        drillDown: true,
        axis: { xlabel: "Name of the Server domain", ylabel: "Count" }
    },
    "TopNBlockedClients": {
        title: "Top N Blocked Clients",
        value: WidgetName.TopNBlockedClients,
        chartType: "Chart",
        widgetType: ChartTypes.barChart,
        category: widgetConfig.categories.SecurityEvent,
        otherConfig: [{
            label: 'Time Interval',
            model: 'timeInterval',
            options: [
                { value: 30, text: 'Past 30 min' },
                { value: 60, text: 'Past 1 Hr' },
                { value: 120, text: 'Past 2 Hrs' },
                { value: 240, text: 'Past 4 Hrs' },
                { value: 480, text: 'Past 8 Hrs' }
            ]
        }],
        drillDown: true,
        axis: { xlabel: "Name of the VM", ylabel: "Count" }
    },
    "TopNServedDomains": {
        title: "Top N Served Domains",
        value: WidgetName.TopNServedDomains,
        chartType: "Chart",
        widgetType: ChartTypes.barChart,
        category: widgetConfig.categories.SecurityEvent,
        otherConfig: [{
            label: 'Time Interval',
            model: 'timeInterval',
            options: [
                { value: 30, text: 'Past 30 min' },
                { value: 60, text: 'Past 1 Hr' },
                { value: 120, text: 'Past 2 Hrs' },
                { value: 240, text: 'Past 4 Hrs' },
                { value: 480, text: 'Past 8 Hrs' }
            ]
        }],
        drillDown: true,
        axis: { xlabel: "Name of the Server domain", ylabel: "Count" }
    },
    "TopNConversations": {
        title: "Top N VMs by Data Transferred (measured in bytes) ",
        value: WidgetName.TopNConversations,
        chartType: "Chart",
        widgetType: ChartTypes.barChart,
        category: widgetConfig.categories.SecurityEvent,
        otherConfig: [{
            label: 'Time Interval',
            model: 'timeInterval',
            options: [
                { value: 30, text: 'Past 30 min' },
                { value: 60, text: 'Past 1 Hr' },
                { value: 120, text: 'Past 2 Hrs' },
                { value: 240, text: 'Past 4 Hrs' },
                { value: 480, text: 'Past 8 Hrs' }
            ]
        }],
        drillDown: true,
        axis: { xlabel: "Names of the pair of VMs", ylabel: "Count" }
    },
    "IOP": {
        title: "Indicator of Pivot",
        value: WidgetName.IOP,
        chartType: "Chart",
        widgetType: ChartTypes.tables,
        category: widgetConfig.categories.SecurityEvent,
        otherConfig: [{
            label: 'Time Interval',
            model: 'timeInterval',
            options: [
                { value: 1*24*60, text: 'Past 1 Day' },
                { value: 2*24*60, text: 'Past 2 Days' },
                { value: 4*24*60, text: 'Past 4 Days' },
                { value: 9*24*60, text: 'Past 9 Days' }
            ]
        }],
        drillDown: true,
        axis: { xlabel: "", ylabel: "" }
    },
    "NewApplications": {
        title: "New Applications",
        value: WidgetName.NewApplications,
        chartType: "Chart",
        widgetType: ChartTypes.tables,
        category: widgetConfig.categories.Anomaly,
        otherConfig: [],
        drillDown: true,
        axis: { xlabel: "", ylabel: "" }
    }
};


function ProxyData(sourceName, sourceType) {
    this.sourceName = sourceName;
    this.sourceType = sourceType;
    if (!this.sourceType) {
        this.sourceType = "txt";
    }
}

function DataWidgetConfig(chartType, widgetName, interval, queryArguments, proxyData) {
    this.proxyData = proxyData;
    this.widgetName = widgetName;
    this.chartType = chartType;
    if (interval) {
        this.interval = interval;
    } else {
        this.interval = 30;
    }

    if (queryArguments) {
        this.queryArguments = queryArguments;
    } else {
        this.queryArguments = [];
    }

    this.otheroption = null;

}

DataWidgetConfig.prototype.getProxyData = function(arg) {
    return this.proxyData;
};

DataWidgetConfig.prototype.getWidgetName = function(arg) {
    return this.widgetName;
};

DataWidgetConfig.prototype.getChartType = function(arg) {
    return this.chartType;
};

ElasticSearchBucket.DATAHISTOGRAM = "date_histogram";
ElasticSearchBucket.TERMS = "terms";
ElasticSearchBucket.AVG = "avg";
ElasticSearchBucket.SUM = "sum";



function ElasticSearchField() {
    this.value = null;
    this.type = null;
}

ElasticSearchField.NUMERICAL = "numarical";
ElasticSearchField.STRING = "string";
ElasticSearchField.GENARIC = "genaric";

function ElasticSearchBucket() {
    this.containerType = "bucket";
    this.type = "";
    this.fieldName = "";
    this.otherFields = {};
}

ElasticSearchBucket.prototype.getJSON = function() {
    var json = "\"" + this.type + "\":";
    json += "{";
    json += "\"field\": \"" + this.fieldName + "\"";
    for (var property in this.otherFields) {
        if (this.otherFields.hasOwnProperty(property)) {
            var fieldRef = this.otherFields[property];
            switch (fieldRef.type) {
                case ElasticSearchField.STRING:
                    json += ",\"" + property + "\": \"" + fieldRef.value + "\"";
                    break;
                case ElasticSearchField.NUMERICAL:
                case ElasticSearchField.GENARIC:
                    json += ",\"" + property + "\":" + fieldRef.value + "";
                    break;
            }

        }
    }
    json += "}";
    return json;
};

ElasticSearchBucket.prototype.setType = function(arg) {
    this.type = arg;
};

ElasticSearchBucket.prototype.setFieldName = function(arg) {
    this.fieldName = arg;
};

ElasticSearchBucket.prototype.addFields = function(key, value) {
    this.otherFields[key] = value;
};

function ElasticSearchSort() {
    this.aggregation = null;
}

ElasticSearchSort.prototype.getJSON = function() {
    var json = "";
    return "";
};

function ElasticSearchAgg() {
    this.containerType = "aggs";
    this.name = "";
    this.nested = [];
}

ElasticSearchAgg.prototype.setName = function(arg) {
    this.name = arg;
};
ElasticSearchAgg.prototype.addBucket = function(arg) {
    this.nested.push(arg);
};

ElasticSearchAgg.prototype.addNestedArgs = function(arg) {
    this.nested.push(arg);
};

ElasticSearchAgg.prototype.getJSON = function() {
    var json = "";
    var count = 1;
    this.name = count++;
    json = "\"aggs\": {";
    json += "\"" + this.name + "\":";
    json += "{";
    for (var i = 0; i < this.nested.length; i++) {
        var rec = this.nested[i];
        if (rec) {
            if (i > 0) {
                json += ",";
            }
            if (rec.containerType === "aggs") {
                rec.name = count++;
                json += rec.getJSON();
            } else if (rec.containerType === "bucket") {
                json += rec.getJSON();
            }

        }
    }
    json += "}";
    json += "}";

    return json;
};


function ElasticSearchRequest() {
    this.index = null;
    this.searchType = null;
    this.ignoreUnavailable = null;
    this.aggregation = null;
    this.query = "";
    this.sort = false;
    this.gte = "";
    this.lte = "";
    this.exists = [];

}

ElasticSearchRequest.prototype.addExist = function(arg) {
    this.exists.push(arg);
    return this;
};

ElasticSearchRequest.prototype.setSort = function(arg) {
    this.sort = arg;
    return this;
};
ElasticSearchRequest.prototype.setSearchType = function(arg) {
    this.searchType = arg;
    return this;
};
ElasticSearchRequest.prototype.setIgnoreUnavailable = function(arg) {
    this.ignoreUnavailable = arg;
    return this;
};
ElasticSearchRequest.prototype.setIndex = function(arg) {
    this.index = arg;
    return this;
};
ElasticSearchRequest.prototype.setAggregation = function(arg) {
    this.aggregation = arg;
    return this;
};

ElasticSearchRequest.prototype.setQuery = function(arg) {
    this.query = arg;
    return this;
};

ElasticSearchRequest.prototype.setGte = function(arg) {
    this.gte = arg;
    return this;
};

ElasticSearchRequest.prototype.setlte = function(arg) {
    this.lte = arg;
    return this;
};


ElasticSearchRequest.prototype.getJSON = function() {
    var json = "";
    //header 
    json += "{";
    json += "\"index\":[\"" + this.index + "\"]";
    //json += "\"index\":\""+this.index+"\""; 
    if (this.searchType) {
        json += ",\"search_type\":\"" + this.searchType + "\"";
    }
    json += ",\"ignore_unavailable\":" + this.ignoreUnavailable + "";
    json += "}";
    json += "\r\n";
    // body
    json += "{";
    json += "\"size\":0";
    if (this.sort) {
        json += ",\"sort\": [{\"aggregate\": {\"order\": \"desc\",\"unmapped_type\": \"boolean\"}}]";
    }
    json += ",\"query\": {\"bool\":{\"must\": [";
    json += "{\"query_string\": {\"query\": \"" + this.query + "\",\"analyze_wildcard\": true}}";
    if (this.exists) {
        for (var i = 0; i < this.exists.length; i++) {
            json += ",{\"exists\": {";
            json += "\"field\": \"" + this.exists[i] + "\"";
            json += "}}";
        }
    }
    json += ", {\"range\": {\"aggregate\": {\"gte\":" + this.gte + ",\"lte\":" + this.lte + ",\"format\": \"epoch_millis\"}}}";
    json += "]";
    json += ",\"must_not\": []}}";

    if (this.aggregation) {
        json += ",";
        json += this.aggregation.getJSON();
    }
    json += "}";
    return json;
};

function WidgetDataUtil() {

}

WidgetDataUtil.parseBarChartData = function(data) {
    console.log("parseBarChatData ");
    console.dir(data);
    var piChatData = [];
    for (var i = 0; i < data.length; i++) {
        var bucket = data[i];
        piChatData.push({ "Letter": bucket.key, "Freq": bucket.doc_count });
    }
    return piChatData;
};

WidgetDataUtil.drillDownParamsWithOutSpace = function(startString, data, endString) {
    var query = startString;
    var addFirst = true;
    for (i = 1; i < data.length; i++) {
        if (!addFirst) {
            query += " OR " + data[i].split(' ').join('\\ ');
        } else if (addFirst) {
            addFirst = false;
            query += "  " + data[i].split(' ').join('\\ ');
        }
    }
    query += endString;
    return query;
};
WidgetDataUtil.drillDownIntervaloptions = [
    { value: 30, text: 'Past 30 min' },
    { value: 60, text: 'Past 1 Hr' },
    { value: 120, text: 'Past 2 Hrs' },
    { value: 240, text: 'Past 4 Hrs' },
    { value: 480, text: 'Past 8 Hrs' }
];
WidgetDataUtil.getPairedBarChartData = function(buckets){
    var subuckets = '',subbucketData ='',name = '';
    var piChatData = [];
    for(var i =0;i<buckets.length;i++){
        subuckets = buckets[i];
        name = buckets[i].key;
        subbucketData = subuckets["3"].buckets;
        for(var j=0;j<subbucketData.length;j++){
             piChatData.push({ "Letter": "(" + name + " _ " + subbucketData[j].key + ")", "Freq": subbucketData[j].doc_count, "source": name, "victim": subbucketData[j].key });
        }
    }
    return piChatData;
};
