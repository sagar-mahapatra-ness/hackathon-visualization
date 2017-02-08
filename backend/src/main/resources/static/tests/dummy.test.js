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

/* dummy test file */
// also refer 	> https://docs.angularjs.org/guide/unit-testing
// 				> 

describe('dummyCtr Test', function () {

    var $controller;

    beforeEach(module('shieldxApp'));
    //beforeEach(module('App'));

    beforeEach(inject(function (_$controller_) {
        $controller = _$controller_;
    }));

    describe('$scope.grade', function () {
        var $scope, controller;

        beforeEach(function () {
            $scope = {};
            controller = $controller('dummyCtr', {$scope: $scope});
        });

        it('sets the strength to "strong" if the password length is >8 chars', function () {
            $scope.password = 'longerthaneightchars';
            $scope.grade();
            expect($scope.strength).toEqual('strong');
        });

        it('sets the strength to "weak" if the password length <3 chars', function () {
            $scope.password = 'a';
            $scope.grade();
            expect($scope.strength).toEqual('weak');
        });

    });

});