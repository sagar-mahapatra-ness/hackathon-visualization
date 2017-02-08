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

function ResourceGroups() {
    this.name = "";
    this.controlPolicy = null;
    this.inline = false;
    this.tenant = null;
    this.memberList = null;
    this.subscriptionId = "";
    this.id = "";
    this.viewData = null;
}
ResourceGroups.prototype.init = function (arg) {
    this.name = arg.name;
    this.controlPolicy = arg.controlPolicy;
    this.inline = arg.inline;
    this.tenant = arg.tenant;
    this.subscriptionId = arg.subscriptionId;
    var rtemp = arg.memberList;
    this.memberList = [];
    for (var i = 0; i < rtemp.length; i++) {
        var tm = new Network();
        tm.init(rtemp[i]);
        this.memberList.push(tm);
    }
    this.id = arg.id;
    this.viewData = arg.viewData;
};

ResourceGroups.prototype.copy = function () {
    var rs = new ResourceGroups();
    rs.name = this.name;
    rs.controlPolicy = this.controlPolicy;
    rs.inline = this.inline;
    rs.tenant = this.tenant;
    rs.subscriptionId = this.subscriptionId;
    rs.memberList = [];
    if (this.memberList) {
        for (var i = 0; i < this.memberList.length; i++) {
            rs.memberList.push(this.memberList[i].copy());
        }
    }

    console.log(" ResourceGroups copy  " + rs);
    console.dir(rs);
    rs.viewData = this.viewData;
    return rs;
};

ResourceGroups.prototype.setViewData = function (key, value) {
    if (!this.viewData) {
        this.viewData = {};
    }
    this.viewData[key] = value;
};

ResourceGroups.prototype.getViewData = function (key) {
    if (this.viewData) {
        return this.viewData[key];
    }
    return null;
};

ResourceGroups.prototype.getNetworkServerFormat = function () {
    var format = [];
    if (this.memberList !== null) {
        for (var i = 0; i < this.memberList.length; i++) {
            format.push({"id": 0, "networkId": this.memberList[i].networkId});
        }
    }

    return format;
};

ResourceGroups.prototype.addNetworks = function (arg) {
    if (this.memberList !== null) {
        for (var i = 0; i < arg.length; i++) {
            this.memberList.push(arg[i]);
        }
    } else {
        this.setNetWorks(arg);
    }
};

ResourceGroups.prototype.setNetWorks = function (arg) {
    this.memberList = arg;
};

ResourceGroups.prototype.getNetWorks = function () {
    return this.memberList;
};

function Network() {
    this.name = "";
    this.id = -1;
    this.networkId = "";
    this.resourceGroupId = "";
    this.resourceGroupName = "";
}

Network.prototype.copy = function () {
    var n = new Network();
    n.networkName = this.name;
    n.id = this.id;
    n.networkId = this.networkId;
    n.resourceGroupId = this.resourceGroupId;
    n.resourceGroupName = this.resourceGroupName;
    return n;
};

Network.prototype.init = function (arg) {
  this.name = arg.name;
  this.id = arg.id;
  this.networkId = arg.networkId;
  this.resourceGroupId = arg.resourceGroupId;
  this.resourceGroupName = arg.resourceGroupName;
};

