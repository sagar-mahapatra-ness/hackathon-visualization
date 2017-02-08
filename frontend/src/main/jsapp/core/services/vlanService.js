/**
 * Description: Service for VLan Functionality
 * Author: Mahesh Sonawane
 */

(function () {
    function vlanService(getDataService, Restangular, readDataService, updateDataService, deleteDataService, createDataService) {
        "ngInject";
        
        /**
         * Function to get List of VLAN Pools under given Infrastructure
         * @param cloudId (Cloud Id/ Infrastructure Id)
         * @returns array (vLanPoolListData)
         * 
         */
       
        //GET /shieldxapi/{infraId}/vlanpool
        this.getvlanList = function(cloudId){
            console.log(" getvlanList "+cloudId);
              return readDataService.readData("vlanpool", cloudId).then(function(data){
                return data;
            }, function(error) {
                console.log(error);
                return [];
            });
        };

        
       

        this.createVlanPool = function(data, cloudId){
            return createDataService.createData("vlanpool", data, cloudId).then(function(dataVal){return dataVal;});
        };

        /**
         * Function to Delete VLAN
         * @param poolId 
         * @param cloudId
         * @returns Object of status
         * 
         */
        

        //DELETE /shieldxapi/vlanpool/{poolId}
        this.deleteVlanPool = function(poolId, cloudId){
            return deleteDataService.deleteData('vlanpool', poolId , cloudId).then(function(data){
            //return getDataService.makeRESTDataCall('DELETE', 'deployspec', deploymentSpecId).then(function(data){
                console.log("VLanPool with id %i deleted successfully...", poolId);
                //console.log(data);
                return {'status': true};
            }, function(error){
                console.log(error);
                return {'status': false, 'errorMessage' : error.data.message};
            });
        };
        
        /**
         * Function to Update VLAN
         * @param paramObject (Object to update)
         * @returns promise
         *
         */
        this.updateVlanPool = function(paramObject){
            //{"id":4,"name":"test","cloudid":1,"ranges":"200-210,3000-3010"}
            // PUT /shieldxapi/vlanpool
            return updateDataService.updateData ('vlanpool', paramObject , paramObject.cloudid);
            //return getDataService.makeRESTDataCall('PUT', 'infras/resourcegroup', paramObject);
        };
        
        /**
         * Function to Create VLAN
         * @param paramObject (Object to create)
         * @returns promise
         *
         */
        this.createVlanPool = function(paramObject){
            //{"id":4,"name":"test","cloudid":1,"ranges":"200-210,3000-3010"}
            // PUT /shieldxapi/vlanpool
            return createDataService.createData ('vlanpool', paramObject , paramObject.cloudid).then(function(data){
            //return getDataService.makeRESTDataCall('POST', 'vlanpool', paramObj).then(function(data) {
                return data;
            });
        };
        
    }
    angular.module('shieldxApp').service('vlanService', vlanService);
})();