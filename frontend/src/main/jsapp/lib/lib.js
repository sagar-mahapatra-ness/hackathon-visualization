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

// generic library scripts 

function fixContainerHeight(x) {
    console.log(' height fixer fires');
    var winHeight = window.innerHeight - (64 * x);
    var winWidth = window.innerWidth;
    angular.element(document.querySelector('.content-height-fixer')).css('height', winHeight + 'px');
    var rtPanel = document.querySelector('.right-panel-height-fixer');
    var ctrPanel = document.querySelector('.control-panel');
    if (!!rtPanel)
        angular.element(rtPanel).css('height', (winHeight - 48) + 'px');
    if(!!ctrPanel)
        angular.element(ctrPanel).css('height', (winHeight - 48) + 'px');
}

function fixHelpContent(x){
    var winHeight = window.innerHeight - (64 * x) - 73;
    angular.element(document.querySelector('.help-content')).css('height', winHeight + 'px');
    return winHeight;
}

function fixManageNetworkHeight() {
    var winHeight = window.innerHeight - (64 * 4);
    winHeight = winHeight - 106;
    //angular.element(document.querySelector('.content-height-fixer-manage-network')).css('height',  '200px');
}

function setToastWidth() {
    var winWidth = window.innerWidth;
    var helpWidth;
    var anyRightPanel = document.querySelector('.quick-setup-rightpanel') || document.querySelector('.adornment-panel');
    if (anyRightPanel)
        helpWidth = angular.element(anyRightPanel)[0].offsetWidth;
    else
        helpWidth = 0;
    angular.element(document.querySelector('.qs-toast')).css('width', (winWidth - helpWidth) + 'px');
}

function showToast(toastParam) {
    if (!toastParam)
        return;
    setTimeout(function () {
        var toastTypeList = ['progress', 'success', 'fail'];
        setToastWidth();
        angular.element(document.querySelector('.qs-toast')).css('display', 'block');
        angular.element(document.querySelector('.qs-toast')).addClass('toaster-on');

        //load text content 
        var textElems = angular.element(document.querySelector('.' + toastParam.type + ' .text-container')).children();
        if (toastParam.hasOwnProperty('heading')) {
            angular.element(textElems[0]).empty();
            angular.element(textElems[0]).append(toastParam.heading);
        }
        if (toastParam.hasOwnProperty('subHeading')) {
            angular.element(textElems[1]).empty();
            angular.element(textElems[1]).append((toastParam.subHeading) ? toastParam.subHeading : '&nbsp;');
        }
        _.each(toastTypeList, function (value, key) {
            if (value.match(toastParam.type))
                angular.element(document.querySelector('.' + value)).css('display', 'inline-flex');
            else
                angular.element(document.querySelector('.' + value)).css('display', 'none');
        });

        if (toastParam.hasOwnProperty('timeout')) {
            setTimeout(function () {
                var callback = null;
                if (toastParam.hasOwnProperty('callback')) {
                    callback = toastParam.callback;
                }
                hideToast(callback);
            }, parseInt(10000));
        }
    }, 200);
}

function hideToast(callback) {
    angular.element(document.querySelector('.qs-toast')).css('display', 'none');
    if (callback)
        callback();
    //angular.element(document.querySelector('.qs-toast')).addClass('toaster-off');
}

moveRecordToStart = function (rowData, key, value) {
    var index = -1;
    var firstRecord = {};
    var obj = {};
    obj[key] = value;
    rowData = _.each(rowData, function (data) {
        data.active = false;
    });
    if (value) {
        index = _.indexOf(rowData, _.find(rowData, obj));
        if (index >= 0) {
            firstRecord = _.find(rowData, obj);
            firstRecord.active = true;
            rowData.splice(index, 1);   //REMOVING FROM EXISTING ARRAY
            rowData.unshift(firstRecord);   //ADDING THAT AT 0th INDEX OF EXISTING ARRAY
        }
    }
    return rowData;
};

/**
 * Get Tenants Networks only for Alpha-2 until API is not ready
 *
 * @param {String} tenantName
 * @param {array} networkList
 * @returns {Array|getTenantNetworks.returnData}
 */
getTenantNetworks = function (tenantName, networkList) {
    var returnData = [];
    var data = [];
    switch (tenantName) {
        case 'admin':
            data = [
                'CustomerNetwork',
                'ext-net',
                'BackPlane',
                'admin-net'
            ];
            break;
        case 'demo', 'service':
            data = [];
            break;
        case 'nesstenant' :
            data = [
                'NessNetwork2',
                'NessNetwork'
            ];
            break;
        default:
            data = [];
    }

    if (data.length > 0) {
        for (i = 0; i < data.length; i++) {
            var getData = _.find(networkList, {'name': data[i]});
            if (getData) {
                returnData.push(getData);
            }
        }
    }
    return returnData;
};

/**
 * Function to get unused networks of Openstack Infra type
 *
 * @param {object} objectToUpdate
 * @param {array} NetworksMembersList
 * @param {int} tenantId
 * @returns {array} objectToUpdate.tenantsNetwork[tenantId]
 */
getOpenStacksUnusedNetwork = function (objectToUpdate, NetworksMembersList, tenantId) {
    var result = [];
    for (ntw = 0; ntw < NetworksMembersList.length; ntw++) {
        result[ntw] = _.find(objectToUpdate.tenantsNetwork[tenantId], {'id': parseInt(NetworksMembersList[ntw].networkId)});
    }
    //console.log("result of used networks for == "+ objectToUpdate.cloud_data.id);
    //console.log(result);
    //console.log("length b4 removing === "+ objectToUpdate.tenantsNetwork[tenantId].length);
    for (ntwk = 0; ntwk < result.length; ntwk++) {
        _.remove(objectToUpdate.tenantsNetwork[tenantId], result[ntwk]);
    }
    //console.log("length after removing === "+ objectToUpdate.tenantsNetwork[tenantId].length);
    return objectToUpdate.tenantsNetwork[tenantId];
};

getAvailableNetworksForGroupObject = function (Networks, additionalNetworks) {
    var result = additionalNetworks.concat(Networks);
    //console.log(result);
    return result;
};

/**
 * Function to get Unused Network of VMWare InfraType
 *
 * @param {object} objectToUpdate
 * @param {array} NetworksMembersList
 * @returns {array} objectToUpdate.unused_networks
 */

updateUnusedNetworks = function (objectToUpdate, NetworksMembersList) {
    //objectToUpdate.unused_networks.splice()
    var result = [];
    for (ntw = 0; ntw < NetworksMembersList.length; ntw++) {
        result[ntw] = _.find(objectToUpdate.unused_networks, {'id': parseInt(NetworksMembersList[ntw].networkId)});
    }
    //console.log("result of used networks for == "+ objectToUpdate.cloud_data.id);
    //console.log(result);
    //console.log("length b4 removing === "+ objectToUpdate.unused_networks.length);
    for (ntwk = 0; ntwk < result.length; ntwk++) {
        _.remove(objectToUpdate.unused_networks, result[ntwk]);
    }
    //console.log("length after removing === "+ objectToUpdate.unused_networks.length);
    return objectToUpdate.unused_networks;
};

/**
 * Function to get route from route name
 *
 * @param {string} routeName
 * @param {string} methodType
 */
getApiRoute = function (methodType, routeName, mainObjId, subObjectId) {
    var route;
    switch (methodType) {
        case "GET" :
            switch (routeName) {
                case "infras":
                case "chassislist":
                    route = routeName;
                    break;
                case "threatpreventionpolicy":
                    route = mainObjId + '/' + routeName;
                    break;
                case "threats":
                    route = 'policy/' + mainObjId + '/' + routeName;
                    break;
                case "deployspec":
                case "ippool":
                case "vlanpool":
                case "check":
                case "redeploy":
                case "policy":
                case "malwarepolicy":
                case "threatpreventionpolicy":
                case "accesscontrolpolicy":
                    route = mainObjId + '/' + routeName;
                    break;   
                default:
                    route = 'infras/' + mainObjId + '/' + routeName;
                    break;
            }
            break;
        case "DELETE":
        case "POST" :
        case "PUT" :
            switch (routeName) {
                case "resourcegroup":
                    route = "infras/resourcegroup";
                    break;
                default:
                    route = routeName;
                    break;
            }
            break;
        default:
    }
    return route;

};


clearAllSession = function ($sessionStorage) {
    delete $sessionStorage.viewData;
    delete $sessionStorage.infraData;
    delete $sessionStorage.groupAllData;
    delete $sessionStorage.groupViewData;
    delete $sessionStorage.viewData;
    delete $sessionStorage.InfraList;
    delete $sessionStorage.ipPoolList;
    delete $sessionStorage.vChassisList;
    delete $sessionStorage.deploymentSpecForEdit;
    delete $sessionStorage.Storage;
    delete $sessionStorage.Management;
    delete $sessionStorage.Host;
    delete $sessionStorage.Backplane;
    delete $sessionStorage.Tenant;

};

clearMasterSession = function ($sessionStorage, $state) {
    clearAllSession($sessionStorage);
    delete $sessionStorage.infrastructureObj;
    $state.reload();
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}