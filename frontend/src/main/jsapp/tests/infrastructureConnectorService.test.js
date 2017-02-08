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

describe('infrastructureConnectorService Test', function () {

    var infrastructureConnectorService, httpBackend, Restangular;

    beforeEach(module('shieldxApp'));
    beforeEach(module("restangular"));
    beforeEach(module('ngMockE2E')); //<-- IMPORTANT!

    //beforeEach(module('App'));

    beforeEach(inject(function (_coreservices_, _infrastructureConnectorService_, _Restangular_, $injector, $httpBackend) {
        infrastructureConnectorService = _infrastructureConnectorService_;
        Restangular = _Restangular_;
        httpBackend = $httpBackend;
        coreservices = _coreservices_;
        coreservices.signin('admin', 'admin');
    }));

    //TEST for Create VMWARE type Infra
    it("Create Infrastructure VMWARE", function () {
        spyOn(Restangular, 'all').and.callThrough();

        var paramObj = {
            "domain": "",
            "https": false,
            "id": 0,
            "ip": "10.1.103.11",
            "name": "TestInfra",
            "password": "password",
            "type": "VMWARE",
            "username": "admin"
        };

        //httpBackend.whenGET(/base\/jsondata\/languages/).passThrough();
        //httpBackend.whenGET(/base\/dist/).passThrough();
        httpBackend.whenGET(/languages/).respond({});
        httpBackend.whenPOST('/shieldxapi/infras').respond(function (method, url, data, headers) {
            console.log('Received these data:', method, url, data, headers);
            //depSpecData.push(angular.fromJson(data));
            return [200, 10, {}];
        });
        //httpBackend.flush();
        infrastructureConnectorService.createInfrastructure(paramObj).then(function (result) {
            httpBackend.flush();
            expect(result).toEqual([200, 10, {}]);
            expect(result).not.toEqual([403, {}, {}]);
        });

    });

    //TEST for Create OPENSTACK type Infra
    it("Create Infrastructure OPENSTACK", function () {
        spyOn(Restangular, 'all').and.callThrough();

        var paramObj = {
            "domain": "default",
            "https": false,
            "id": 0,
            "ip": "10.1.103.11",
            "name": "TestInfraOS",
            "password": "password",
            "type": "OPENSTACK",
            "username": "admin"
        };

        //httpBackend.whenGET(/base\/jsondata\/languages/).passThrough();
        //httpBackend.whenGET(/base\/dist/).passThrough();
        httpBackend.whenGET(/languages/).respond({});
        httpBackend.whenPOST('/shieldxapi/infras').respond(function (method, url, data, headers) {
            console.log('Received these data:', method, url, data, headers);
            //depSpecData.push(angular.fromJson(data));
            return [200, 10, {}];
        });
        //httpBackend.flush();
        infrastructureConnectorService.createInfrastructure(paramObj).then(function (result) {
            httpBackend.flush();
            expect(result).toEqual([200, 10, {}]);
            expect(result).not.toEqual([403, {}, {}]);
        });

    });


    //TEST for DELETE Infra
    it("Delete DeploymentSpecification", function () {
        //httpBackend.whenGET(/base\/jsondata\/languages/).passThrough();
        //httpBackend.whenGET(/base\/dist/).passThrough();
        httpBackend.whenGET(/languages/).respond({});
        httpBackend.when('DELETE', '/shieldxapi/infras/100').respond(function (method, url, data, headers) {
            console.log('Received these data:', method, url, data, headers);
            return [200, {}, {}];
        });

        infrastructureConnectorService.deleteInfrastructure(100).then(function (result) {
            //console.log('IN GET DEPLOY LIST'+list);
            expect(result).toEqual([200, {}, {}]);
            expect(result).not.toEqual([403, {}, {}]);
        });
        //httpBackend.flush();
    });
    //TEST for Discover Infras List

    it("Discover Infrastructure", function () {

        //httpBackend.whenGET(/^\10.8.103.20:8080\/shieldxapi\//).passThrough();
        //httpBackend.whenGET(/base\/jsondata\/languages/).passThrough();
        //httpBackend.whenGET(/base\/dist/).passThrough();
        httpBackend.whenGET(/languages/).respond({});
        httpBackend.whenGET("/shieldxapi/infras/10/discover").respond(10);

        infrastructureConnectorService.discoverInfrastructure(10).then(function (list) {
            //console.log('IN GET DEPLOY LIST'+list);
            expect(result).toEqual(10);
            expect(result).not.toEqual(20);
        });
        //httpBackend.flush();
    });

    //TEST for Get Infras List
    it("Get Infrastructure List", function () {

        //httpBackend.whenGET(/^\10.8.103.20:8080\/shieldxapi\//).passThrough();
        //httpBackend.whenGET(/base\/jsondata\/languages/).passThrough();
        //httpBackend.whenGET(/base\/dist/).passThrough();
        httpBackend.whenGET(/languages/).respond({});
        httpBackend.whenGET("/shieldxapi/infras").respond({
            data: {
                list: [
                    {
                        "domain": "",
                        "https": false,
                        "id": 10,
                        "ip": "10.1.103.101",
                        "name": "TestInfra",
                        "password": null,
                        "type": "VMWARE",
                        "username": "admin"
                    },
                    {
                        "domain": "default",
                        "https": false,
                        "id": 20,
                        "ip": "10.1.103.11",
                        "name": "TestInfraOS",
                        "password": null,
                        "type": "OPENSTACK",
                        "username": "admin"
                    }
                ]
            }
        });

        infrastructureConnectorService.getListOfInfrastructures().then(function (list) {
            //console.log('IN GET DEPLOY LIST'+list);
            expect(list).toEqual([
                {
                    "domain": "",
                    "https": false,
                    "id": 10,
                    "ip": "10.1.103.101",
                    "name": "TestInfra",
                    "password": null,
                    "type": "VMWARE",
                    "username": "admin"
                },
                {
                    "domain": "default",
                    "https": false,
                    "id": 20,
                    "ip": "10.1.103.11",
                    "name": "TestInfraOS",
                    "password": null,
                    "type": "OPENSTACK",
                    "username": "admin"
                }
            ]);
            expect(list).not.toEqual([
                {
                    "domain": "dddd",
                    "https": false,
                    "id": 101,
                    "ip": "10.1.106.101",
                    "name": "TestInfra",
                    "password": "",
                    "type": "VMWARE",
                    "username": "admin"
                },
                {
                    "domain": "",
                    "https": false,
                    "id": 220,
                    "ip": "10.1.103.191",
                    "name": "TestInfraOS",
                    "password": "password",
                    "type": "OPENSTACK",
                    "username": "admin"
                }
            ]);
        });
        //httpBackend.flush();
    });

});