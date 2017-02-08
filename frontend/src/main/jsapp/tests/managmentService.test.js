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

/* Unit Test for Infrastructure Connector Service*/

describe('managementService Test', function () {

    var managementService, httpBackend, Restangular;

    beforeEach(module('shieldxApp'));
    beforeEach(module("restangular"));
    beforeEach(module('ngMockE2E')); //<-- IMPORTANT!

    //beforeEach(module('App'));

    beforeEach(inject(function (_coreservices_, _managementService_, _Restangular_, $injector, $httpBackend) {
        managementService = _managementService_;
        Restangular = _Restangular_;
        httpBackend = $httpBackend;
        coreservices = _coreservices_;
        coreservices.signin('admin', 'admin');
    }));



    //TEST to call UpgradeSoftware
    it("Call UpgradeSoftware", function () {

        httpBackend.whenGET(/languages/).respond({});
        httpBackend.whenGET("/shieldxapi/manage/upgrade").respond({
            data: {'status': true}
        });

        managementService.callUpgradeSoftware().then(function (upgraded) {

            expect(upgraded).toEqual({'status': true});
            expect(upgraded).not.toEqual({'status': false, 'errorMessage': error.data.message});
        });
    });

    //TEST to call callUpgradeContent
    it("Call callUpgradeContent", function () {

        httpBackend.whenGET(/languages/).respond({});
        httpBackend.whenGET("/shieldxapi/manage/updatecontent").respond({
            data: {'status': true}
        });

        managementService.callUpgradeContent().then(function (upgraded) {

            expect(upgraded).toEqual({'status': true});
            expect(upgraded).not.toEqual({'status': false, 'errorMessage': error.data.message});
        });
    });

    //TEST to call upload Logs
    it("Call upload Logs", function () {

        httpBackend.whenGET(/languages/).respond({});
        httpBackend.whenGET("/shieldxapi/manage/upload").respond({
            data: {'status': true}
        });

        managementService.callUploadLogs().then(function (upgraded) {

            expect(upgraded).toEqual({'status': true});
            expect(upgraded).not.toEqual({'status': false, 'errorMessage': error.data.message});
        });
    });

    //TEST to call DownloadEventLogs
    it("Call DownloadEventLogs", function () {

        httpBackend.whenGET(/languages/).respond({});
        httpBackend.whenGET("/shieldxapi/manage/downloadcsv").respond({
            data: {'status': true}
        });

        managementService.callDownloadEventLogs().then(function (upgraded) {

            expect(upgraded).toEqual({'status': true});
            expect(upgraded).not.toEqual({'status': false, 'errorMessage': error.data.message});
        });
    });

    //TEST to get FireEyeIntegration Details
    it("get FireEyeIntegration Details", function () {

        httpBackend.whenGET(/languages/).respond({});
        httpBackend.whenGET("/shieldxapi/manage/fireeyeconfig").respond({
            data: {
                "id": 1,
                "enabled": false,
                "ip": null,
                "username": "root",
                "password": "root123",
                "https": true
            }
        });

        managementService.getFireEyeIntegrationDetails().then(function (details) {

            expect(details).toEqual({
                "id": 1,
                "enabled": false,
                "ip": null,
                "username": "root",
                "password": "root123",
                "https": true
            });
            expect(details).not.toEqual({
                "id": 14,
                "enabled": true,
                "ip": null,
                "username": "roo1t",
                "password": "root1123",
                "https": true
            });
        });
    });

    it("Update  FireEyeIntegration Details", function () {
        spyOn(Restangular, 'all').and.callThrough();
        httpBackend.whenGET(/languages/).respond({});

        var paramObj = {
            "id": 1,
            "enabled": false,
            "ip": null,
            "username": "root",
            "password": "root123",
            "https": true
        };
        httpBackend.when('PUT', '/').respond(function (method, url, data, headers) {
            console.log('Received these data:', method, url, data, headers);
            return [200, 10, {}];
        });

        managementService.updateFireEyeIntegrationDetails(paramObj).then(function (result) {
            httpBackend.flush();
            expect(result).toEqual([200, 10, {}]);
            expect(result).not.toEqual([403, {}, {}]);
        });

    });

    it("Update Control Plane Setting", function () {
        spyOn(Restangular, 'all').and.callThrough();
        httpBackend.whenGET(/languages/).respond({});
        var paramObj = {
            "datapathDeploySpecId": 1,
            "cloudId": false,
        };
        httpBackend.when('PUT', '/').respond(function (method, url, data, headers) {
            console.log('Received these data:', method, url, data, headers);
            return [200, 10, {}];
        });

        managementService.updateControlPlaneSetting(paramObj).then(function (result) {
            httpBackend.flush();
            expect(result).toEqual([200, 10, {}]);
            expect(result).not.toEqual([403, {}, {}]);
        });

    });

});