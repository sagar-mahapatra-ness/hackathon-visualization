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

describe('ipPoolSpecSevice Test', function () {
    beforeEach(module('shieldxApp'));
    beforeEach(module("restangular"));
    beforeEach(module('ngMockE2E'));

    var ipPoolService, restangular, httpBackend, sessionStorage;


        beforeEach(inject(function (_coreservices_, _ipPoolServices_, _Restangular_, $injector, $httpBackend, $sessionStorage) {
            ipPoolService = _ipPoolServices_;
            Restangular = _Restangular_;
            httpBackend = $httpBackend;
            sessionStorage = $sessionStorage;
             console.log(" sessionStorage "+$sessionStorage);
                coreservices = _coreservices_;
                coreservices.signin('admin', 'admin');
        }));
        

          


       

         it('check if clode data  is initialized to 1 ', function() {
             
              var cloudData = ipPoolService.getInfrastructureData();

              expect(cloudData.cloudId).toEqual('1');

         });

       

/*
       
         it('check if IP Pool  ', function() {
             
              var ipPoolData = ipPoolService.getIPPoolData();

              expect(ipPoolData.name).toEqual('IPPoolData');
              expect(ipPoolData.serverData.backPlaneIsDhcp).toEqual(false);
              expect(ipPoolData.serverData.mgmtIsDhcp).toEqual(false);
              expect(ipPoolData.serverData.backPlaneNetworkId).toEqual(0);
              expect(ipPoolData.serverData.mgmtIpPool).toEqual(0);
              expect(ipPoolData.serverData.mgmtNetworkId).toEqual(0);

         });
*/
       


        

             it('check if Network information is correct according to cloud id ', function() {
                
                    httpBackend.whenGET(/languages/).respond({});
                    httpBackend.whenGET("/shieldxapi/infras/100000/networks").respond({
                        data: {
                                list: [
                                  {
                                    "cloudId": 100000,
                                    "id": 1,
                                    "name": "VMNetwork"
                                  }
                                ]
                        }
                    });

                  

                  ipPoolService.getNetworkListByCloudId(100000).then(function (list) {
                    console.log(" getNetworkListByCloudId "+list);
                    expect(list[0].name).toEqual("VMNetwork");
                  });

                 });



             it('check if ip pool  information is correct according to cloud id ', function() {
                

                    httpBackend.whenGET(/languages/).respond({});
                    httpBackend.whenGET("shieldxapi/100000/ippool").respond({
                        data: {
                                list: [
                                  {
                                    "cloudid": 100000,
                                    "descr": "descr",
                                    "gateway": "5.5.5.1",
                                    "id": 1,
                                    "name": "IpPool1",
                                    "prefix": 24,
                                    "ranges": "5.5.5.2-5.5.5.200,5.5.5.0/24"
                                  },{
                                    "cloudid": 100000,
                                    "descr": "descr",
                                    "gateway": "5.5.5.1",
                                    "id": 2,
                                    "name": "IpPool2",
                                    "prefix": 24,
                                    "ranges": "5.5.5.2-5.5.5.200,5.5.5.0/24"
                                  },{
                                    "cloudid": 100000,
                                    "descr": "descr",
                                    "gateway": "5.5.5.",
                                    "id": 3,
                                    "name": "IpPool1",
                                    "prefix": 24,
                                    "ranges": "5.5.5.2-5.5.5.200,5.5.5.0/24"
                                  },{
                                    "cloudid": 100000,
                                    "descr": "descr",
                                    "gateway": "5.5.5.1",
                                    "id": 4,
                                    "name": "IpPool3",
                                    "prefix": 24,
                                    "ranges": "5.5.5.2-5.5.5.200,5.5.5.0/24"
                                  }
                                ]
                        }
                    });

                 

                  ipPoolService.getIpPoolListByCloudId(100000).then(function (list) {
                    console.log(" getNetworkListByCloudId "+list);
                    expect(list[0].name).toEqual("IpPool1");
                    expect(list[0].descr).toEqual("descr");
                    expect(list[0].gateway).toEqual("5.5.5.1");
                    expect(list[0].prefix).toEqual("24");
                    expect(list[0].ranges).toEqual("5.5.5.2-5.5.5.200,5.5.5.0/24");
                  });

                 });





             it(' delete ip from infrastructure ', function() {
                

                    httpBackend.whenGET(/languages/).respond({});

                    httpBackend.when('DELETE', '/shieldxapi/ippool/100000').respond(function(method, url, data, headers){
            
                        return [200, {}, {}];
                    });

                   
                  

                  ipPoolService.deleteIPPool(100000).then(function (result ) {
                     expect(result).toEqual([200, {}, {}]);
                     expect(result).not.toEqual([403, {}, {}]);
                  });

                 });



             it('check ip pool information according to IP Pool id ', function() {
                

                    httpBackend.whenGET(/languages/).respond({});
                    httpBackend.whenGET("shieldxapi/100000/ippool").respond({
                        data: {
                                list: [
                                  {
                                    "cloudid": 100000,
                                    "descr": "descr",
                                    "gateway": "5.5.5.1",
                                    "id": 1,
                                    "name": "IpPool1",
                                    "prefix": 24,
                                    "ranges": "5.5.5.2-5.5.5.200,5.5.5.0/24"
                                  },{
                                    "cloudid": 100000,
                                    "descr": "descr",
                                    "gateway": "5.5.5.1",
                                    "id": 2,
                                    "name": "IpPool2",
                                    "prefix": 24,
                                    "ranges": "5.5.5.2-5.5.5.200,5.5.5.0/24"
                                  },{
                                    "cloudid": 100000,
                                    "descr": "descr",
                                    "gateway": "5.5.5.",
                                    "id": 3,
                                    "name": "IpPool1",
                                    "prefix": 24,
                                    "ranges": "5.5.5.2-5.5.5.200,5.5.5.0/24"
                                  },{
                                    "cloudid": 100000,
                                    "descr": "descr",
                                    "gateway": "5.5.5.1",
                                    "id": 4,
                                    "name": "IpPool3",
                                    "prefix": 24,
                                    "ranges": "5.5.5.2-5.5.5.200,5.5.5.0/24"
                                  }
                                ]
                        }
                    });

                  

                  ipPoolService.getIpPollInfoFromID(4).then(function (list) {
                  
                    expect(list[0].name).toEqual("IpPool3");
                    expect(list[0].id).toEqual("4");
                  });

                 });



             it('check if IP Pool Information get Updated for a give IPPool IP id ', function() {
                 console.log("ipPoolService 1 "+ipPoolService);

                    httpBackend.whenGET(/languages/).respond({});
                    httpBackend.when('PUT','/shieldxapi/ippool').respond(function(method, url, data, headers){
                            console.log('Received these data:', method, url, data, headers);
                            //depSpecData.push(angular.fromJson(data));
                             return [200, {}, {}];
                    });
                   

                    ipPoolService.updateIPPool(100000).then(function (list) {
                     httpBackend.flush();
                     expect(result).toEqual([200, {}, {}]);
                     expect(result).not.toEqual([403, {}, {}]);
                  });

            });


             it('check if a new IP Pool gets created successfully ', function() {
                
                    httpBackend.whenGET(/languages/).respond({});
                    httpBackend.whenPOST('/shieldxapi/ippool').respond(function(method, url, data, headers){
            console.log('Received these data:', method, url, data, headers);
           
            return [200, 10, {}];
        });
       //httpBackend.flush();
                ipPoolService.createNewIPPool(100000, "descr", "5.5.5.1", "IpPool5", 24, "5.5.5.2-5.5.5.200,5.5.5.0/24").then(function (result) {
                    httpBackend.flush();
                    expect(result).toEqual([200, 10, {}]);
                    expect(result).not.toEqual([403, {}, {}]);
                });

            });



    });