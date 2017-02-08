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
    function eventsFilterCtr($scope){
    	//dynamically correcting all the heights and widths of elements
        if(document.querySelector('#filter-form')) {
            angular.element(document.querySelector('#filter-form')).css('height', (window.innerHeight-113-36)+'px');
            angular.element(document.querySelector('#graph-attributes')).css('height', (window.innerHeight-113)+'px');
            angular.element(document.querySelector('#navigator')).css('width', (window.innerWidth*0.25)+'px');
            angular.element(document.querySelector('#navigator svg')).css('width', (window.innerWidth*0.25)+'px');
        }
    }
    angular.module('shieldxApp').controller('eventsFilterCtr', eventsFilterCtr);
})();