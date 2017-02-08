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

describe('virtualChassisService Test', function () {

    var virtualChassisService, httpBackend, Restangular;

    beforeEach(module('shieldxApp'));
    beforeEach(module("restangular"));
    beforeEach(module('ngMockE2E')); //<-- IMPORTANT!

    //beforeEach(module('App'));

    beforeEach(inject(function (_coreservices_, _virtualChassisService_, _Restangular_, $injector, $httpBackend) {
        virtualChassisService = _virtualChassisService_;
        Restangular = _Restangular_;
        httpBackend = $httpBackend;
        coreservices = _coreservices_;
        coreservices.signin('admin', 'admin');
    }));



//Test Create  Resource Group
    it("Create  Resource Group", function () {
        spyOn(Restangular, 'all').and.callThrough();
        httpBackend.whenGET(/languages/).respond({});

        var paramObj = {
            "cloudId": 1,
            "memberList": [
                {
                    "id": 2,
                    "networkId": 3
                }
            ],
            "name": "ResourceGrp",
            "tenantId": 0
        };

        httpBackend.whenPOST('/shieldxapi/infras/resourcegroup').respond(function (method, url, data, headers) {
            console.log('Received these data:', method, url, data, headers);
            return [200, 10, {}];
        });

        virtualChassisService.createResourceGroup(paramObj).then(function (result) {
            httpBackend.flush();
            expect(result).toEqual([200, 10, {}]);
            expect(result).not.toEqual([403, {}, {}]);
        });
    });

//Test Update  Resource Group
    it("Update  Resource Group", function () {
        spyOn(Restangular, 'all').and.callThrough();
        httpBackend.whenGET(/languages/).respond({});

        var paramObj = {
            "cloudId": 1,
            "id": 12,
            "memberList": [
                {
                    "id": 2,
                    "networkId": 3
                }
            ],
            "name": "ResourceGrp",
            "tenantId": 0
        };

        httpBackend.when('PUT', '/shieldxapi/infras/resourcegroup').respond(function (method, url, data, headers) {
            console.log('Received these data:', method, url, data, headers);
            return [200, 10, {}];
        });

        virtualChassisService.updateResourceGroup(paramObj).then(function (result) {
            httpBackend.flush();
            expect(result).toEqual([200, 10, {}]);
            expect(result).not.toEqual([403, {}, {}]);
        });
    });

//Test Create Subscription 
    it("Create Subscription Group", function () {
    });

//Test Create  Virtual Chassis
    it("Create  Virtual Chassis", function () {
        spyOn(Restangular, 'all').and.callThrough();
        httpBackend.whenGET(/languages/).respond({});

        var paramObj = {
            "cloudId": 12,
            "datapathDeploySpecId": 13,
            "descr": "V Chassis",
            "name": "VChassis1",
            "subscriptionList": [
                {
                    "id": 23,
                    "resourceGroupId": 1,
                    "spsId": 4
                }
            ]
        };

        httpBackend.whenPOST('/shieldxapi/chassis').respond(function (method, url, data, headers) {
            console.log('Received these data:', method, url, data, headers);
            return [200, 10, {}];
        });

        virtualChassisService.createResourceGroup(paramObj).then(function (result) {
            httpBackend.flush();
            expect(result).toEqual([200, 10, {}]);
            expect(result).not.toEqual([403, {}, {}]);
        });
    });

    //Test Update  updateVirtualChassis
    it("Update  Virtual Chassis", function () {
        spyOn(Restangular, 'all').and.callThrough();
        httpBackend.whenGET(/languages/).respond({});

        var paramObj = {
            "cloudId": 12,
            "id": 12,
            "datapathDeploySpecId": 13,
            "descr": "V Chassis",
            "name": "VChassis1",
            "subscriptionList": [
                {
                    "id": 23,
                    "resourceGroupId": 1,
                    "spsId": 4
                }
            ]
        };
        httpBackend.when('PUT', '/shieldxapi/chassis').respond(function (method, url, data, headers) {
            console.log('Received these data:', method, url, data, headers);
            return [200, 10, {}];
        });

        virtualChassisService.updateVirtualChassis(paramObj).then(function (result) {
            httpBackend.flush();
            expect(result).toEqual([200, 10, {}]);
            expect(result).not.toEqual([403, {}, {}]);
        });

    });


    //TEST for Get Virtual Chassis List
    it("Get Virtual Chassis List", function () {

        httpBackend.whenGET(/languages/).respond({});
        httpBackend.whenGET("/shieldxapi/chassislist").respond({
            data: {
                list: [
                    {
                        "id": 20,
                        "name": "alpha1releas",
                        "descr": "alpha1releas",
                        "cloudId": 8,
                        "subscriptionList": [
                            {
                                "id": 20,
                                "resourceGroupId": 20,
                                "spsId": 1
                            }
                        ],
                        "datapathDeploySpecId": 7
                    },
                    {
                        "id": 21,
                        "name": "dwarka",
                        "descr": "dwarka",
                        "cloudId": 6,
                        "subscriptionList": [
                            {
                                "id": 21,
                                "resourceGroupId": 21,
                                "spsId": 1
                            }
                        ],
                        "datapathDeploySpecId": 9
                    }
                ]
            }
        });

        virtualChassisService.getListOfVirtualChassis().then(function (list) {

            /* 
             * Todo : Sample V chassis list
             */
            expect(list).toEqual([
                {
                    "id": 20,
                    "name": "alpha1releas",
                    "descr": "alpha1releas",
                    "cloudId": 8,
                    "subscriptionList": [
                        {
                            "id": 20,
                            "resourceGroupId": 20,
                            "spsId": 1
                        }
                    ],
                    "datapathDeploySpecId": 7
                },
                {
                    "id": 21,
                    "name": "dwarka",
                    "descr": "dwarka",
                    "cloudId": 6,
                    "subscriptionList": [
                        {
                            "id": 21,
                            "resourceGroupId": 21,
                            "spsId": 1
                        }
                    ],
                    "datapathDeploySpecId": 9
                }
            ]);
            expect(list).not.toEqual([
                {
                    "id": 23,
                    "name": "alpha1releas",
                    "descr": "alpha1releas",
                    "cloudId": 8,
                    "subscriptionList": [
                        {
                            "id": 20,
                            "resourceGroupId": 20,
                            "spsId": 1
                        }
                    ],
                    "datapathDeploySpecId": 7
                },
                {
                    "id": 24,
                    "name": "dwarka",
                    "descr": "dwarka",
                    "cloudId": 6,
                    "subscriptionList": [
                        {
                            "id": 21,
                            "resourceGroupId": 21,
                            "spsId": 1
                        }
                    ],
                    "datapathDeploySpecId": 9
                }
            ]);
        });
    });


    //TEST for Get Resource Group List
    it("Get Resource Group List", function () {

        var cloudId = 8;
        httpBackend.whenGET(/languages/).respond({});
        httpBackend.whenGET("/shieldxapi/infras/8/resourcegroup").respond({
            data: {
                list: [
                    {
                        "id": 20,
                        "name": "alpha1ResourceGroup5876.284788923387",
                        "cloudId": 8,
                        "tenantId": 8,
                        "memberList": [
                            {
                                "id": 25,
                                "networkId": 28
                            }
                        ]
                    }
                ]
            }
        });

        virtualChassisService.getListOfResourceGroups(cloudId).then(function (list) {
            expect(list).toEqual([
                {
                    "id": 20,
                    "name": "alpha1ResourceGroup5876.284788923387",
                    "cloudId": 8,
                    "tenantId": 8,
                    "memberList": [
                        {
                            "id": 25,
                            "networkId": 28
                        }
                    ]
                }
            ]);
            expect(list).not.toEqual([
                {
                    "id": 30,
                    "name": "alpha1ResourceGroup5876.284788923387",
                    "cloudId": 11,
                    "tenantId": 8,
                    "memberList": [
                        {
                            "id": 25,
                            "networkId": 28
                        }
                    ]
                }
            ]);
        });
    });

    //TEST for deploy VirtualChassis
    it("Deploy VirtualChassis", function () {
        var vChassisId = 8;

        httpBackend.whenGET(/languages/).respond({});
        httpBackend.whenGET("/shieldxapi/chassis/" + vChassisId + "/check").respond({
            data: {'status': true}
        });

        virtualChassisService.deployVirtualChassis(vChassisId).then(function (deployed) {

            expect(deployed).toEqual({'status': true});
            expect(deployed).not.toEqual({'status': false, 'errorMessage': error.data.message});
        });
    });

    //TEST for re deploy VirtualChassis
    it("Redeploy VirtualChassis", function () {
        var vChassisId = 8;

        httpBackend.whenGET(/languages/).respond({});
        httpBackend.whenGET("/shieldxapi/chassis/" + vChassisId + "/redeploy").respond({
            data: {'status': true}
        });

        virtualChassisService.reDeployVirtualChassis(vChassisId).then(function (deployed) {

            expect(deployed).toEqual({'status': true});
            expect(deployed).not.toEqual({'status': false, 'errorMessage': error.data.message});
        });
    });

    //TEST for DELETE resourcegroup
    it("Delete resourcegroup", function () {

        httpBackend.whenGET(/languages/).respond({});
        httpBackend.when('DELETE', '/infras/resourcegroup/100').respond(function (method, url, data, headers) {
            console.log('Received these data:', method, url, data, headers);
            return [200, {}, {}];
        });

        virtualChassisService.deleteResourceGroup(100).then(function (result) {

            expect(result).toEqual([200, {}, {}]);
            expect(result).not.toEqual([403, {}, {}]);
        });

    });

    //TEST for DELETE VirtualChassis
    it("Delete VirtualChassis", function () {

        httpBackend.whenGET(/languages/).respond({});
        httpBackend.when('DELETE', '/chassis//100').respond(function (method, url, data, headers) {
            console.log('Received these data:', method, url, data, headers);
            return [200, {}, {}];
        });

        virtualChassisService.deleteVirtualChassis(100).then(function (result) {
            //console.log('IN GET DEPLOY LIST'+list);
            expect(result).toEqual([200, {}, {}]);
            expect(result).not.toEqual([403, {}, {}]);
        });
        //httpBackend.flush();
    });

    //TEST for Get Tenants List
    it("Get Tenants List", function () {

        httpBackend.whenGET(/languages/).respond({});
        httpBackend.whenGET("/shieldxapi/infras/1/tenants").respond({
            data: {
                list: [
                    {
                        "id": 8,
                        "name": "default-tenant",
                        "cloudId": 8
                    }
                ]
            }
        });

        virtualChassisService.getListOfTenants(1).then(function (list) {

            /* 
             * Todo : Sample tenants list
             */
            expect(list).toEqual([
                {
                    "id": 8,
                    "name": "default-tenant",
                    "cloudId": 8
                }
            ]);
            expect(list).not.toEqual([
                {
                    "id": 1,
                    "name": "default-tenant",
                    "cloudId": 2
                }
            ]);
        });
    });
});