/*
 ShieldX Networks Inc. CONFIDENTIAL
 ----------------------------------
 *
 Copyright (c) 2016 ShieldX Networks Inc.
 All Rights Reserved.
 *
 NOTICE: All information contained herein is, and remains
 the property of ShieldX Networks Incorporated and its suppliers,
 if any. The intellectual and technical concepts contained
 herein are proprietary to ShieldX Networks Incorporated
 and its suppliers and may be covered by U.S. and Foreign Patents,
 patents in process, and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from ShieldX Networks Incorporated.
 */

function IPRangeRowData() {
    this.rangeStartEnableState = true;
    this.rangeEndEnableState = true;
    this.rangeCIDREnableState = true;
    this.rangeStartValue = "";
    this.rangeEndtValue = "";
    this.cidrValue = "";
}
IPRangeRowData.prototype.copy = function (data) {
    this.rangeStartEnableState = data.rangeStartEnableState;
    this.rangeEndEnableState = data.rangeEndEnableState;
    this.rangeCIDREnableState = data.rangeCIDREnableState;
    this.rangeStartValue = data.rangeStartValue;
    this.rangeEndtValue = data.rangeEndtValue;
    this.cidrValue = data.cidrValue;
};

IPRangeRowData.prototype.isPopulated = function () {
    if (this.rangeCIDREnableState) {
        return this.cidrValue !== "";
    } else {
        return this.rangeStartValue !== "" && this.rangeEndtValue !== "";
    }
};

IPRangeRowData.prototype.clone = function () {
    var ipRangeRowData = new IPRangeRowData();
    ipRangeRowData.rangeStartEnableState = this.rangeStartEnableState;
    ipRangeRowData.rangeEndEnableState = this.rangeEndEnableState;
    ipRangeRowData.rangeCIDREnableState = this.rangeCIDREnableState;
    ipRangeRowData.rangeStartValue = this.rangeStartValue;
    ipRangeRowData.rangeEndtValue = this.rangeEndtValue;
    ipRangeRowData.cidrValue = this.cidrValue;

    return ipRangeRowData;
};


function IPPoolServerData() {
    this.backPlaneIpPoolId = 0;
    this.backPlaneIsDhcp = false;
    this.backPlaneNetworkId = 0;
    this.mgmtIpPoolId = 0;
    this.mgmtIsDhcp = false;
    this.mgmtNetworkId = 0;

    this.managmentNetworkHeaderValue = "";
    this.managmentIPPoolHeaderValue = "";

    this.backpaneNetworkHeaderValue = "";
    this.backpaneIPPoolHeaderValue = "";
}



IPPoolServerData.prototype.copy = function (data) {
    if (typeof data.backPlaneIpPoolId !== "undefined") {
        this.backPlaneIpPoolId = data.backPlaneIpPoolId;
    }
    if (typeof data.backPlaneIsDhcp !== "undefined") {
        this.backPlaneIsDhcp = data.backPlaneIsDhcp;
    }
    if (typeof data.backPlaneNetworkId !== "undefined") {
        this.backPlaneNetworkId = data.backPlaneNetworkId;
    }
    if (typeof data.mgmtIpPoolId !== "undefined") {
        this.mgmtIpPoolId = data.mgmtIpPoolId;
    }
    if (typeof data.mgmtIsDhcp !== "undefined") {
        this.mgmtIsDhcp = data.mgmtIsDhcp;
    }
    if (typeof data.mgmtNetworkId !== "undefined") {
        this.mgmtNetworkId = data.mgmtNetworkId;
    }
};

function NewIPDate() {
    this.id = "";
    this.name = "";
    this.discription = "discription";
    this.ranges = [];
    this.mask = "";
    this.gateway = "";
    this.ranges.push(new IPRangeRowData());
}
NewIPDate.prototype.initializeFromIPData = function (ipdata) {
    // console.log(" initializeFromIPData ");
    this.name = ipdata.descr;
    this.gateway = ipdata.gateway;
    this.id = ipdata.id;
    this.name = ipdata.name;
    this.mask = ipdata.prefix;
    this.convertStringToIPRanges(ipdata.ranges);
};

NewIPDate.prototype.convertIPRangeToString = function () {
    var rangesValues = this.ranges;
    var ranges = "";
    if (rangesValues !== null) {
        for (var i = 0; i < rangesValues.length; i++) {
            var rangesValuesTemp = rangesValues[i];
            if (rangesValuesTemp.rangeCIDREnableState) {
                if (ranges !== "") {
                    ranges = ranges + "," + rangesValuesTemp.cidrValue;
                } else {
                    ranges = ranges + rangesValuesTemp.cidrValue;
                }

            } else {
                if (ranges !== "") {
                    ranges = ranges + "," + rangesValuesTemp.rangeStartValue + "-" + rangesValuesTemp.rangeEndtValue;
                } else {
                    ranges = ranges + rangesValuesTemp.rangeStartValue + "-" + rangesValuesTemp.rangeEndtValue;
                }
            }
        }
    }

    return ranges;
};

NewIPDate.prototype.convertStringToIPRanges = function (rangesStr) {
    // console.log(" convertStringToIPRanges  *** "+rangesStr);

    var commaArray = rangesStr.split(",");
    this.ranges = [];
    for (var i = 0; i < commaArray.length; i++) {

        if (commaArray[i].indexOf("-") != -1) {
            //console.log(" convertStringToIPRanges  ip range found  ");
            var dashArray = commaArray[i].split("-");
            // console.dir(dashArray);
            if (dashArray.length == 2) {
                var beIPRangeRowData = new IPRangeRowData();
                beIPRangeRowData.rangeCIDREnableState = false;
                beIPRangeRowData.rangeEndEnableState = true;
                // console.dir(beIPRangeRowData);
                beIPRangeRowData.rangeEndEnableState = true;
                //console.dir(beIPRangeRowData);
                beIPRangeRowData.rangeStartValue = dashArray[0];
                //console.dir(beIPRangeRowData);
                beIPRangeRowData.rangeEndtValue = dashArray[1];
                //console.dir(beIPRangeRowData);


                this.ranges.push(beIPRangeRowData);
                //console.log(" convertStringToIPRanges  ip range pushed  ");
                // console.dir(beIPRangeRowData);
            }
        } else if (commaArray[i].indexOf("/") != -1) {
            // console.log(" convertStringToIPRanges  ip cidr found  ");
            var cidrIPRangeRowData = new IPRangeRowData();
            cidrIPRangeRowData.rangeCIDREnableState = true;
            cidrIPRangeRowData.rangeEndEnableState = false;
            cidrIPRangeRowData.rangeEndEnableState = false;
            cidrIPRangeRowData.cidrValue = commaArray[i];
            this.ranges.push(cidrIPRangeRowData);
        }

        // console.dir(this.ranges);

    }

};
NewIPDate.prototype.clone = function () {
    var newIPDate = new NewIPDate();
    newIPDate.id = this.id;
    newIPDate.name = this.name;
    newIPDate.discription = this.discription;
    newIPDate.mask = this.mask;
    newIPDate.gateway = this.gateway;
    newIPDate.ranges = [];


    for (var i = 0; i < this.ranges.length; i++) {
        newIPDate.ranges.push(this.ranges[i].clone());
    }

    return newIPDate;

};
NewIPDate.prototype.copy = function (data) {
    this.name = data.name;
    this.ranges = [];
    //console.log(" NewIPDat  data initialize copy >>  ");
    //console.dir(data);
    for (var j = 0; j < data.ranges.length; j++) {
        var rangeVal = new IPRangeRowData();
        // console.log(" new  IPRangeRowData created  ");
        rangeVal.copy(data.ranges[j]);
        this.ranges.push(rangeVal);
    }
    this.mask = data.mask;
    this.gateway = data.gateway;
};

NewIPDate.prototype.getIPRangeRows = function () {
    return this.ranges;
};

NewIPDate.prototype.addNewIPRangeRow = function () {
    this.ranges.push(new IPRangeRowData());
};


NewIPDate.prototype.deleteIPRangeRow = function (index) {
    this.ranges.splice(index, 1);
};

NewIPDate.prototype.isPopulated = function () {
    // console.log(" this.name "+this.name);
    //console.log(" this.discription "+this.discription);
    //console.log(" this.startRange "+this.startRange);
    //console.log(" this.endRange "+this.endRange);
    // console.log(" this.mask "+this.mask);
    //console.log(" this.gateway "+this.gateway);
    var returnVal = (this.name !== "" && this.mask !== "" && this.gateway !== "");
    // console.log("NewIPDate this.returnVal "+returnVal);
    if (returnVal) {
        for (var i = 0; i < this.ranges.length; i++) {
            var rangeValue = this.ranges[i];
            console.log("range  " + rangeValue.isPopulated());
            if (!rangeValue.isPopulated())
            {
                returnVal = false;
                return returnVal;
            }

        }
    }
    return returnVal;
};






function IPPoolViewData() {
    this.networkSelected = {id: -1, name: " "};
    this.typeOfIPSelected = "";
    this.newIPData = new NewIPDate();
    this.existingIP = -1;
}



IPPoolViewData.prototype.isPopulated = function () {

    //console.log(" this.networkSelected "+this.networkSelected.id);
    //console.log(" this.typeOfIPSelected "+this.typeOfIPSelected);
    // console.log(" this.existingIP "+this.existingIP);


    if (this.networkSelected.id == -1) {
        return false;
    }

    if (this.typeOfIPSelected === "") {
        return false;
    } else {
        if (this.typeOfIPSelected == "new") {
            return this.newIPData.isPopulated();
        } else if (this.typeOfIPSelected == "existing") {
            return this.existingIP != -1;
        } else if (this.typeOfIPSelected == "dhcp") {
            return true;
        }
    }

};

IPPoolViewData.prototype.copy = function (data) {
    this.networkSelected = data.networkSelected;
    this.typeOfIPSelected = data.typeOfIPSelected;
    if (typeof data.newIPData !== "undefined") {
        this.newIPData.copy(data.newIPData);
    }
    this.existingIP = data.existingIP;
};

function IPPoolData() {
    this.name = "IPPoolData";
    this.serverData = new IPPoolServerData();
    this.managmentIPData = new IPPoolViewData();
    this.backpaneIPData = new IPPoolViewData();
}


IPPoolData.prototype.copy = function (data) {
    if (typeof data.serverData !== "undefined") {
        this.serverData.copy(data.serverData);
    }
    if (typeof data.managmentIPData !== "undefined") {
        this.managmentIPData.copy(data.managmentIPData);
    }
    if (typeof data.backpaneIPData !== "undefined") {
        // console.log(" backpaneIPData need to be copied >> " );    
        this.backpaneIPData.copy(data.backpaneIPData);
    }
};

IPPoolData.prototype.getManagmentIPData = function () {
    return this.managmentIPData;
};


IPPoolData.prototype.getBackPaneIPData = function () {
    return this.backpaneIPData;
};

IPPoolData.prototype.getServerData = function () {
    return  this.serverData;
};

IPPoolData.prototype.isPopulated = function () {
    //console.log("IPPoolData  isPopulated  managmentIPData "+this.managmentIPData.isPopulated());
    // console.log("IPPoolData  isPopulated  backpaneIPData "+this.backpaneIPData.isPopulated());
    return this.managmentIPData.isPopulated() && this.backpaneIPData.isPopulated();
};


