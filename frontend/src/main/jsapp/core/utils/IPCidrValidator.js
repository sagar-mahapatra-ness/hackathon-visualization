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

function IPCidrValidator() {
    this.cidrRegex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))$/;
    this.subnetPattern = [
        {
            range: {max: 32, min: 25},
            ippattetern: [-1, -1, -1, -1]
        },
        {
            range: {max: 24, min: 17},
            ippattetern: [-1, -1, -1, 0]
        },
        {
            range: {max: 16, min: 9},
            ippattetern: [-1, -1, 0, 0]
        },
        {
            range: {max: 8, min: 1},
            ippattetern: [-1, 0, 0, 0]
        },
        {
            range: {max: 0, min: 0},
            ippattetern: [0, 0, 0, 0]
        }
    ];
}

IPCidrValidator.prototype.validateCidr = function (cidr) {
    //console.log(" validateCidr "+cidr);
    if (this.cidrRegex.test(cidr)) {
        var index = cidr.indexOf("/");
        //console.log(" index "+index);
        if (index !== -1) {
            var prifix = parseInt(cidr.substring(index + 1));
            //console.log(" prifix "+cidr.substring(index+1)+" num "+prifix);
            if (!isNaN(prifix)) {
                var objRef = _.find(this.subnetPattern, function (pattern) {
                    return ((prifix <= pattern.range.max) && (prifix >= pattern.range.min));
                });
                //console.log(" objRef "+objRef);
                //console.dir(objRef);
                if (objRef) {
                    var ip = cidr.substring(0, index);
                    //console.log(" ip "+ip);
                    var ipArray = ip.split(".");
                    /* jshint ignore:start */
                    for (var i = 0; i < objRef.ippattetern.length; i++) {
                        var ret = objRef.ippattetern[i];
                        //console.log(" ret "+ret+" ipArray[i] "+ipArray[i]);
                        if (ret == 0) {

                            if (ipArray[i] != 0) {
                                //console.log(" invalid ret  1 "+ret+" ipArray[i] "+ipArray[i]);
                                return false;
                            }

                        } else if (ipArray[i] == 0) {
                            //console.log(" invalid ret  2 "+ret+" ipArray[i] "+ipArray[i]);
                            return false;
                        }

                    }
                    /* jshint ignore:end */
                    //console.log(" valid ");
                    return true;
                }
            }

        }
    }
    return false;
};
