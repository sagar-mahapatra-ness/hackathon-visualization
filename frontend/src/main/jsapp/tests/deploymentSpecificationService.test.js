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

/* Unit Test for Deployment Specification Service*/

describe('deploymentSpecSevice Test', function () {

    var deploymentSpecificationService, httpBackend, Restangular;

    beforeEach(module('shieldxApp'));
    beforeEach(module("restangular"));
    beforeEach(module('ngMockE2E')); //<-- IMPORTANT!

    //beforeEach(module('App'));

    beforeEach(inject(function (_coreservices_, _deploymentSpecificationService_, _Restangular_, $injector, $httpBackend) {
        deploymentSpecificationService = _deploymentSpecificationService_;
        Restangular = _Restangular_;
        httpBackend = $httpBackend;
        coreservices = _coreservices_;
        coreservices.signin('admin', 'admin');
    }));

    //TEST for Create Deployment Specification
    it("Create DeploymentSpecification", function () {
        spyOn(Restangular, 'all').and.callThrough();

        var depSpecData = {"backPlaneIpPoolId": 0,
            "backPlaneIsDhcp": true,
            "backPlaneNetworkId": "36",
            "cloudid": 12,
            "datastoreId": 0,
            "descr": "",
            "hosts": [12, 13],
            "id": 0,
            "mgmtIpPoolId": 4,
            "mgmtIsDhcp": false,
            "mgmtNetworkId": "34",
            "name": "Unit Test Deployment Spec",
            "storageIsLocal": true
        };

        //httpBackend.whenGET(/base\/jsondata\/languages/).passThrough();
        //httpBackend.whenGET(/base\/dist/).passThrough();
        httpBackend.whenGET(/languages/).respond({});
        httpBackend.whenPOST('/shieldxapi/deployspec').respond(function (method, url, data, headers) {
            console.log('Received these data:', method, url, data, headers);
            //depSpecData.push(angular.fromJson(data));
            return [200, 10, {}];
        });
        //httpBackend.flush();
        deploymentSpecificationService.createDeploymentSpecfication(depSpecData).then(function (result) {
            httpBackend.flush();
            expect(result).toEqual([200, 10, {}]);
            expect(result).not.toEqual([403, {}, {}]);
        });

    });


    //TEST for Update Deployment Specification
    it("Update DeploymentSpecification", function () {
        //httpBackend.whenGET(/base\/jsondata\/languages/).passThrough();
        //httpBackend.whenGET(/base\/dist/).passThrough();
        httpBackend.whenGET(/languages/).respond({});
        var depSpecData = {"backPlaneIpPoolId": 1,
            "backPlaneIsDhcp": false,
            "backPlaneNetworkId": "34",
            "cloudid": 12,
            "datastoreId": 0,
            "descr": "",
            "hosts": [12],
            "id": 0,
            "mgmtIpPoolId": 2,
            "mgmtIsDhcp": false,
            "mgmtNetworkId": "36",
            "name": "New1 Deployment Spec",
            "storageIsLocal": true
        };

        httpBackend.when('PUT', '/shieldxapi/deployspec').respond(function (method, url, data, headers) {
            console.log('Received these data:', method, url, data, headers);
            //depSpecData.push(angular.fromJson(data));
            return [200, {}, {}];
        });
        //httpBackend.flush();
        deploymentSpecificationService.updateDeploymentSpecfication(depSpecData).then(function (result) {
            //console.log('IN GET DEPLOY LIST'+list);
            httpBackend.flush();
            expect(result).toEqual([200, {}, {}]);
            expect(result).not.toEqual([403, {}, {}]);
        });

    });

    //TEST for DELETE Deployment Specification
    it("Delete DeploymentSpecification", function () {
        //httpBackend.whenGET(/base\/jsondata\/languages/).passThrough();
        //httpBackend.whenGET(/base\/dist/).passThrough();
        httpBackend.whenGET(/languages/).respond({});
        httpBackend.when('DELETE', '/shieldxapi/deployspec/100').respond(function (method, url, data, headers) {
            console.log('Received these data:', method, url, data, headers);
            return [200, {}, {}];
        });

        deploymentSpecificationService.deleteDeploymentSpecfication(100).then(function (result) {
            //console.log('IN GET DEPLOY LIST'+list);
            expect(result).toEqual([200, {}, {}]);
            expect(result).not.toEqual([403, {}, {}]);
        });
        //httpBackend.flush();
    });
    //$httpBackend.when('DELETE', '/auth.py').respond({userId: 'userX'}, {'A-Token': 'xxx'});

    //TEST for Get Deployment Specification List
    it("Get Deployment Specification List", function () {

        //httpBackend.whenGET(/^\10.8.103.20:8080\/shieldxapi\//).passThrough();
        //httpBackend.whenGET(/base\/jsondata\/languages/).passThrough();
        //httpBackend.whenGET(/base\/dist/).passThrough();
        httpBackend.whenGET(/languages/).respond({});
        httpBackend.whenGET("/shieldxapi/100000/deployspec").respond({
            data: {
                list: [
                    {
                        "backPlaneIpPoolId": 0,
                        "backPlaneIsDhcp": true,
                        "backPlaneNetworkId": 0,
                        "cloudid": 100000,
                        "datastoreId": 0,
                        "descr": "DEP-SPEC-001 Desc",
                        "hosts": [
                            0
                        ],
                        "id": 100,
                        "mgmtIpPoolId": 0,
                        "mgmtIsDhcp": true,
                        "mgmtNetworkId": 0,
                        "name": "DEP-SPEC-001",
                        "storageIsLocal": true
                    },
                    {
                        "backPlaneIpPoolId": 0,
                        "backPlaneIsDhcp": true,
                        "backPlaneNetworkId": 0,
                        "cloudid": 100000,
                        "datastoreId": 0,
                        "descr": "DEP-SPEC-002 Desc",
                        "hosts": [
                            0
                        ],
                        "id": 200,
                        "mgmtIpPoolId": 0,
                        "mgmtIsDhcp": true,
                        "mgmtNetworkId": 0,
                        "name": "DEP-SPEC-002",
                        "storageIsLocal": true
                    }
                ]
            }
        });

        deploymentSpecificationService.getDeploymentSpecList(100000).then(function (list) {
            //console.log('IN GET DEPLOY LIST'+list);
            expect(list).toEqual([
                {
                    "backPlaneIpPoolId": 0,
                    "backPlaneIsDhcp": true,
                    "backPlaneNetworkId": 0,
                    "cloudid": 100000,
                    "datastoreId": 0,
                    "descr": "DEP-SPEC-001 Desc",
                    "hosts": [
                        0
                    ],
                    "id": 100,
                    "mgmtIpPoolId": 0,
                    "mgmtIsDhcp": true,
                    "mgmtNetworkId": 0,
                    "name": "DEP-SPEC-001",
                    "storageIsLocal": true
                },
                {
                    "backPlaneIpPoolId": 0,
                    "backPlaneIsDhcp": true,
                    "backPlaneNetworkId": 0,
                    "cloudid": 100000,
                    "datastoreId": 0,
                    "descr": "DEP-SPEC-002 Desc",
                    "hosts": [
                        0
                    ],
                    "id": 200,
                    "mgmtIpPoolId": 0,
                    "mgmtIsDhcp": true,
                    "mgmtNetworkId": 0,
                    "name": "DEP-SPEC-002",
                    "storageIsLocal": true
                }
            ]);
            expect(list).not.toEqual([
                {
                    "backPlaneIpPoolId": 10,
                    "backPlaneIsDhcp": false,
                    "backPlaneNetworkId": 0,
                    "cloudid": 100,
                    "datastoreId": 10,
                    "descr": "DEP-SPEC-0011 Desc",
                    "hosts": [
                        0
                    ],
                    "id": 100,
                    "mgmtIpPoolId": 0,
                    "mgmtIsDhcp": true,
                    "mgmtNetworkId": 0,
                    "name": "DEP-SPEC-0011",
                    "storageIsLocal": false
                }
            ]);
        });
        //httpBackend.flush();
    });

    //TEST for GET Tenants
    it("Get Tenants List", function () {
        //httpBackend.whenGET(/^\10.8.103.20:8080\/shieldxapi\//).passThrough();
        //httpBackend.whenGET(/base\/jsondata\/languages/).passThrough();
        httpBackend.whenGET(/languages/).respond({});
        httpBackend.whenGET("/shieldxapi/infras/100000/tenants").respond({
            data: {
                list: [
                    {
                        "cloudId": 100000,
                        "id": 10,
                        "name": "tenant1"
                    },
                    {
                        "cloudId": 100000,
                        "id": 20,
                        "name": "tenant2"
                    }
                ]
            }
        });

        deploymentSpecificationService.getTenants(100000).then(function (list) {
            expect(list).toEqual([
                {
                    "cloudId": 100000,
                    "id": 10,
                    "name": "tenant1"
                },
                {
                    "cloudId": 100000,
                    "id": 20,
                    "name": "tenant2"
                }
            ]);
            expect(list).not.toEqual([
                {
                    "cloudId": 1000,
                    "id": 1000,
                    "name": "tenant100"
                },
                {
                    "cloudId": 1000,
                    "id": 2000,
                    "name": "tenant200"
                }
            ]);
        });
        //httpBackend.flush();
    });

    //TEST for GET Datastores
    it("Get Datastore List", function () {
        //httpBackend.whenGET(/^\10.8.103.20:8080\/shieldxapi\//).passThrough();
        //httpBackend.whenGET(/base\/jsondata\/languages/).passThrough();
        httpBackend.whenGET(/languages/).respond({});
        httpBackend.whenGET("/shieldxapi/infras/100000/datastore").respond({
            data: {
                list: [
                    {
                        "cloudId": 100000,
                        "id": 10,
                        "name": "dataStore1"
                    },
                    {
                        "cloudId": 100000,
                        "id": 20,
                        "name": "dataStore11"
                    }
                ]
            }
        });

        deploymentSpecificationService.getDatastore(100000).then(function (list) {
            expect(list).toEqual([
                {
                    "cloudId": 100000,
                    "id": 10,
                    "name": "dataStore1"
                },
                {
                    "cloudId": 100000,
                    "id": 20,
                    "name": "dataStore11"
                }
            ]);
        });
        //httpBackend.flush();
    });

    //TEST for GET Hosts
    it("Get Hosts List", function () {
        //httpBackend.whenGET(/^\10.8.103.20:8080\/shieldxapi\//).passThrough();
        //httpBackend.whenGET(/base\/jsondata\/languages/).passThrough();
        httpBackend.whenGET(/languages/).respond({});
        httpBackend.whenGET("/shieldxapi/infras/100000/hosts").respond({
            data: {
                list: [
                    {
                        "cloudId": 100000,
                        "id": 10,
                        "name": "Host11"
                    },
                    {
                        "cloudId": 100000,
                        "id": 20,
                        "name": "Host12"
                    }
                ]
            }
        });

        deploymentSpecificationService.getHosts(100000).then(function (list) {
            console.log("List of Hosts");
            expect(list).toEqual([
                {
                    "cloudId": 100000,
                    "id": 10,
                    "name": "Host11"
                },
                {
                    "cloudId": 100000,
                    "id": 20,
                    "name": "Host12pp"
                }
            ]);
            expect(list).not.toEqual([
                {
                    "cloudId": 100000,
                    "id": 1055,
                    "name": "Host5511"
                },
                {
                    "cloudId": 100000,
                    "id": 2055,
                    "name": "Host1255pp"
                }
            ]);
        });
        //httpBackend.flush();
    });

});