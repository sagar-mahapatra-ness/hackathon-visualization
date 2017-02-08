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

/* Unit Test for Group Service*/

describe('resourceGroupSevice Test', function () {

    var resourceGroupService, httpBackend, Restangular;

    beforeEach(module('shieldxApp'));
    beforeEach(module("restangular"));
    beforeEach(module('ngMockE2E')); //<-- IMPORTANT!

    //beforeEach(module('App'));

    beforeEach(inject(function (_coreservices_, _resourceGroupService_, _Restangular_, $injector, $httpBackend) {
        resourceGroupService = _resourceGroupService_;
        Restangular = _Restangular_;
        httpBackend = $httpBackend;
        coreservices = _coreservices_;
        coreservices.signin('admin', 'admin');
    }));

    //TEST for Update Group
    it("Update Group", function () {

        httpBackend.whenGET(/languages/).respond({});
        var updateData = {
            "id": 6,
            "name": "alpha1ResourceGroup26",
            "cloudId": 100000,
            "tenantId": 19,
            "memberList":
                    [
                        {"id": 0, "networkId": 143},
                        {"id": 0, "networkId": 146}
                    ]
        };

        httpBackend.when('PUT', '/shieldxapi/infras/resourcegroup').respond(function (method, url, data, headers) {
            console.log('Received these data:', method, url, data, headers);
            //depSpecData.push(angular.fromJson(data));
            return [200, {}, {}];
        });
        //httpBackend.flush();
        resourceGroupService.updateResourceGroup(updateData).then(function (result) {
            //console.log('IN GET DEPLOY LIST'+list);
            httpBackend.flush();
            expect(result).toEqual([200, {}, {}]);
            expect(result).not.toEqual([403, {}, {}]);
        });

    });

    //TEST for DELETE Group
    it("Delete Group", function () {

        httpBackend.whenGET(/languages/).respond({});
        httpBackend.when('DELETE', '/shieldxapi/infras/resourcegroup/100').respond(function (method, url, data, headers) {
            console.log('Received these data:', method, url, data, headers);
            return [200, {}, {}];
        });

        resourceGroupService.deleteGroupList(100).then(function (result) {
            //console.log('IN GET DEPLOY LIST'+list);
            expect(result).toEqual([200, {}, {}]);
            expect(result).not.toEqual([403, {}, {}]);

        });
        //httpBackend.flush();
    });
    //$httpBackend.when('DELETE', '/auth.py').respond({userId: 'userX'}, {'A-Token': 'xxx'});

    //TEST for DELETE Group assigned to chassis
    it("Delete Group attached to Chassis", function () {

        httpBackend.whenGET(/languages/).respond({});
        httpBackend.when('DELETE', '/shieldxapi/infras/resourcegroup/1400').respond(function (method, url, data, headers) {
            console.log('Received these data:', method, url, data, headers);
            return [500, {"timestamp": 1474613722578, "status": 500, "error": "Internal Server Error", "exception": "java.lang.Exception", "message": "Resource Group is subscribed to a Chassis. Remove it first before deletion.", "path": "/shieldxapi/infras/resourcegroup/1400"}, {}];
        });

        resourceGroupService.deleteGroupList(100).then(function (result) {
            //console.log('IN GET DEPLOY LIST'+list);
            expect(result).toEqual([500, {}, {}]);
            expect(result).not.toEqual([200, {}, {}]);

        });
        //httpBackend.flush();
    });

    //TEST for Get Group List
    it("Get Group List", function () {

        //httpBackend.whenGET(/^\10.8.103.20:8080\/shieldxapi\//).passThrough();
        //httpBackend.whenGET(/base\/jsondata\/languages/).passThrough();
        //httpBackend.whenGET(/base\/dist/).passThrough();
        httpBackend.whenGET(/languages/).respond({});
        httpBackend.whenGET("/shieldxapi/infras/100000/resourcegroup").respond({
            data: {
                list: [
                    {
                        "id": 5,
                        "name": "alpha2ResourceGroup",
                        "cloudId": 10000,
                        "tenantId": 19,
                        "memberList": [{"id": 56, "networkId": 34},
                            {"id": 94, "networkId": 35}]
                    },
                    {
                        "id": 6,
                        "name": "alpha1ResourceGroup26",
                        "cloudId": 10000,
                        "tenantId": 19,
                        "memberList": [{"id": 53, "networkId": 143}, {"id": 108, "networkId": 146}]
                    }
                ]
            }
        });

        resourceGroupService.getGroupList(10000).then(function (list) {
            //console.log('IN GET DEPLOY LIST'+list);
            expect(list).toEqual([
                {
                    "id": 5,
                    "name": "alpha2ResourceGroup",
                    "cloudId": 10000,
                    "tenantId": 19,
                    "memberList": [{"id": 56, "networkId": 34},
                        {"id": 94, "networkId": 35}]
                },
                {
                    "id": 6,
                    "name": "alpha1ResourceGroup26",
                    "cloudId": 10000,
                    "tenantId": 19,
                    "memberList": [{"id": 53, "networkId": 143}, {"id": 108, "networkId": 146}]
                }
            ]);
            expect(list).not.toEqual([
                {
                    "id": 85,
                    "name": "alpha2ResourceGroup6666",
                    "cloudId": 1009900,
                    "tenantId": 1999,
                    "memberList": [{"id": 56, "networkId": 34},
                        {"id": 94, "networkId": 35}]
                },
                {
                    "id": 86,
                    "name": "alpha1ResourceGroup266666",
                    "cloudId": 1009900,
                    "tenantId": 1999,
                    "memberList": [{"id": 583, "networkId": 1493}, {"id": 1808, "networkId": 1460}]
                }
            ]);
        });
        //httpBackend.flush();
    });

});