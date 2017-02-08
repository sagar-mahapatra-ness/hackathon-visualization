/* Unit Test for Vlan Service*/

describe('vlanService Test', function () {

    var vlanService, httpBackend,  Restangular;

    beforeEach(module('shieldxApp'));
    beforeEach(module("restangular"));
    beforeEach(module('ngMockE2E')); 

    beforeEach(inject(function (_coreservices_, _vlanService_, _Restangular_, $injector, $httpBackend) {
        vlanService = _vlanService_;
        Restangular = _Restangular_;
        httpBackend = $httpBackend;
        coreservices = _coreservices_;
        coreservices.signin('admin', 'admin');
    }));
    
    //TEST for create vLan Pool
    it("Create vLan Pool", function () {
        
        httpBackend.whenGET(/languages/).respond({});
        var createData =  {"id":0,"name":"test111","cloudid":100,"ranges":"2000-2100,3000-3010"};
        
        httpBackend.when('POST','/shieldxapi/vlanpool').respond(function(method, url, data, headers){
            console.log('Received these data:', method, url, data, headers);
            //depSpecData.push(angular.fromJson(data));
            return [200, {}, {}];
        });
        //httpBackend.flush();
        vlanService.updateVlanPool(createData).then(function (result) {
            //console.log('IN GET DEPLOY LIST'+list);
            httpBackend.flush();
            expect(result).toEqual([200, {}, {}]);
            expect(result).not.toEqual([403, {}, {}]);
        });
        
    });
    
    //TEST for Update vLan Pool
    it("Update vLan Pool", function () {
        
        httpBackend.whenGET(/languages/).respond({});
        var updateData =  {"id":400,"name":"test","cloudid":100,"ranges":"2000-2100,3000-3010"};
        
        httpBackend.when('PUT','/shieldxapi/vlanpool').respond(function(method, url, data, headers){
            console.log('Received these data:', method, url, data, headers);
            //depSpecData.push(angular.fromJson(data));
            return [200, {}, {}];
        });
        //httpBackend.flush();
        vlanService.updateVlanPool(updateData).then(function (result) {
            //console.log('IN GET DEPLOY LIST'+list);
            httpBackend.flush();
            expect(result).toEqual([200, {}, {}]);
            expect(result).not.toEqual([403, {}, {}]);
        });
        
    });
    
    //TEST for DELETE Pool
    it("Delete vLan Pool", function () { 
        
        httpBackend.whenGET(/languages/).respond({});
        httpBackend.when('DELETE', '/shieldxapi/vlanpool/400').respond(function(method, url, data, headers){
            console.log('Received these data:', method, url, data, headers);
            return [200, {}, {}];
        });
        
        vlanService.deleteVlanPool(400).then(function (result) {
            //console.log('IN GET DEPLOY LIST'+list);
            expect(result).toEqual([200, {}, {}]);
            expect(result).not.toEqual([403, {}, {}]);
            
        });
        //httpBackend.flush();
    });
    
    //TEST for Get vLan Pool List
    it("Get vLan Pool List", function () {
        
        //httpBackend.whenGET(/^\10.8.103.20:8080\/shieldxapi\//).passThrough();
        //httpBackend.whenGET(/base\/jsondata\/languages/).passThrough();
        //httpBackend.whenGET(/base\/dist/).passThrough();
        httpBackend.whenGET(/languages/).respond({});
        httpBackend.whenGET("/shieldxapi/100000/vlanpool").respond({
            data: {
                list: [
                        {
                          "cloudid": 100,
                          "id": 400,
                          "name": "test",
                          "ranges": "2000-2100,3000-3010"
                        },
                        {
                          "cloudid": 100,
                          "id": 4000,
                          "name": "test11",
                          "ranges": "20000-21000,30000-30100"
                        }
                      ]
            }
        });
        
        vlanService.getvlanList(100).then(function (list) {
            //console.log('IN GET DEPLOY LIST'+list);
            expect(list).toEqual([
                        {
                          "cloudid": 100,
                          "id": 400,
                          "name": "test",
                          "ranges": "2000-2100,3000-3010"
                        },
                        {
                          "cloudid": 100,
                          "id": 4000,
                          "name": "test11",
                          "ranges": "20000-21000,30000-30100"
                        }
                      ]);
            expect(list).not.toEqual([
                        {
                          "cloudid": 1000,
                          "id": 4000,
                          "name": "test",
                          "ranges": "2000-21000,3000-30100"
                        },
                        {
                          "cloudid": 1000,
                          "id": 40000,
                          "name": "test101",
                          "ranges": "20000-210000,30000-301000"
                        }
                      ]);
        });
        //httpBackend.flush();
    });
        
});