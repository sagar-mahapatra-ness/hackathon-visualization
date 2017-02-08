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

(function () {
    angular.module('shieldxApp').directive("netmaskvalidation", function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, ele, attrs, ctrl) {

                function validationError(value) // you can use any function and parameter name 
                {
                    var regEx = /^[0-9]*$/;
                    if (regEx.test(value)) {
                        if (value >= 1 && value <= 32) {
                            ctrl.$setValidity('invalidnetmask', true);
                        } else {
                            ctrl.$setValidity('invalidnetmask', false);
                        }

                    } else {
                        ctrl.$setValidity('invalidnetmask', false);
                    }

                    return value; //return to display  error 
                }
                ctrl.$parsers.push(validationError);
            }
        };
    });
})();