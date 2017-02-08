(function () {
    function vlanPoolsCtr(
        $scope, 
        $state, 
        $stateParams, 
        infrastructureConnectorService, 
        vlanService, 
        deploymentSpecificationService,
        $translate, 
        $q, 
        $mdDialog, 
        $sessionStorage,
        userSessionMenagment) {

        "ngInject";

        clearAllSession($sessionStorage);
        var deferred = $q.defer();
        $scope.promise = deferred.promise;
        $scope.promiseCompleted = true;
        var promiseCtr = 0;
        var totalClouds = 0;
        var vlanData = [];
        var viewData = [];

        var vlanId = ($stateParams && $stateParams.vlanId) ? parseInt($stateParams.vlanId) : null;

        /* **** for tables [start] **** */
        $scope.$emit('listenHeaderText', {headerText: $translate.instant('admin.toolbar.heading')});
        $scope.$emit('quickSetupEnded', {});

        $scope.selected = [];
        $scope.query = {
            order: 'name',
            limit: 10,
            page: 1
        };
        $scope.isAdornmentPanelOpen = false;
        $scope.isSearchBarOpen = false;
        $scope.updateAdornmentPanel = function (event, rowData) {
            $scope.toggleAdornmentPanel();
            $scope.adornmentData = angular.copy(rowData);
        };

        $scope.toggleAdornmentPanel = function () {
            $scope.isAdornmentPanelOpen = $scope.isAdornmentPanelOpen === false ? true : false;
            //toggleGridCols($scope.isAdornmentPanelOpen);
        };
        $scope.toggleSearchBar = function (event) {
            $scope.isSearchBarOpen = $scope.isSearchBarOpen === false ? true : false;
            if ($scope.isSearchBarOpen)
                angular.element(event.currentTarget.firstElementChild).css('color', '#4a90e2');
            else
                angular.element(event.currentTarget.firstElementChild).css('color', '#6d6e71');
        };
        /* **** for tables [end] **** */

        
           var create_id = authorities("vlanPools_create");
           var delete_id = authorities("vlanPools_delete");
           var update_id = authorities("vlanPools_update");
           $scope.is_create_vlanPool = userSessionMenagment.isUserAllowd(create_id);
           $scope.is_update_vlanPool = userSessionMenagment.isUserAllowd(update_id);
           $scope.is_delete_vlanPool = userSessionMenagment.isUserAllowd(delete_id);

        //GET LIST OF ALL INFRASTRUCTURE
        infrastructureConnectorService.getListOfInfrastructures().then(function (data) {
            totalClouds = data.length;
            
            if (totalClouds === 0) {
                $scope.errorMessage = "No Infrastructures!!!";
                //NO DATA FOR VIEW
                deferred.resolve();
                $scope.promiseCompleted = false;
            } else {
                $scope.infrastructres = [];
                for (i = 0; i < data.length; i++) {
                    if (data[i].type === 'VMWARE') {
                        console.log(data[i]);
                        vlanData[i] = {};
                        $scope.infrastructres.push(data[i]);
                        vlanData[i].cloud_data = data[i];
                        vlanData[i].cloudId = data[i].id;
                        vlanData[i].vlan_data = [];
                        vlanData[i].deploySpec_data = [];
                        getVlanData(data[i], vlanData[i]);
                        //$sessionStorage.vlanPoolAllData.push(vlanData[i]);
                    } else {
                        totalClouds --;
                    }
                }
            }
        });
        
        function findDeploySpecforVLAN(obj, vlanPoolDataId){
            return _.filter(obj.deploySpec_data, { 'vlanPoolId': parseInt(vlanPoolDataId) });
        }
        
        getVlanData = function(cloudData, obj) {
            
            deploymentSpecificationService.getDeploymentSpecList(cloudData.id).then(function(deployData){
            //getvlanList
            obj.deploySpec_data = deployData;
                vlanService.getvlanList(cloudData.id).then(function(vlanPoolData){

                    for(c=0; c< vlanPoolData.length; c++) { //c for counter
                        var arrRanges = [];
                        vlanPoolData[c].cloudName = obj.cloud_data.name;
                        arrRanges = vlanPoolData[c].ranges.split(",");
                        vlanPoolData[c].rangeList = [];
                        for(i=0; i < arrRanges.length; i++) {                       
                           vlanPoolData[c].rangeList[i] = {};
                           var eachRange = arrRanges[i].split("-");
                           vlanPoolData[c].rangeList[i].start = parseInt(eachRange[0]);
                           vlanPoolData[c].rangeList[i].end = parseInt(eachRange[1]);
                        }
                        vlanPoolData[c].deploy_spec_data = findDeploySpecforVLAN(obj, vlanPoolData[c].id);
                        
                        viewData.push(vlanPoolData[c]);
                    }
                    obj.vlan_data = vlanPoolData;

                    promiseCtr += 1;
                    //console.log("PROMISE COUNTER==="+promiseCtr);
                    if(promiseCtr >= totalClouds) {
                        deferred.resolve();
                        console.log(viewData);
                        $scope.promiseCompleted = false;
                        $scope.vlanPoolData = moveRecordToStart(viewData, "id", vlanId);
                        console.log($scope.vlanPoolData);
                    }
                }, function(error){
                    console.log(error);
                    obj.vlan_data = [];
                    promiseCtr += 1;
                    if(promiseCtr === totalClouds) {

                        //$sessionStorage.groupViewData = viewData;
                        deferred.resolve();
                        $scope.promiseCompleted = false;
                    }
                });

                });
            
        };
        
        $scope.createRangeStartMessage = function (poolForm, index){
              return   poolForm["startrange"+index].$error;
        };

        $scope.createRangeEndMessage = function (poolForm, index){
              return   poolForm["endrange"+index].$error;
        };
        
        $scope.$on('UpdateRowData', function(event, arg){
            viewData.unshift(arg);
            $scope.vlanPoolData = viewData;
        });
        //ADD VLAN POOL
        $scope.addVlanPool = function(cloudData, ev){
            $mdDialog.show({
                controller: addVlanPoolController,
                skipHide: true,
                templateUrl: 'core/components/administration/vlan-pools/addvlan.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                locals: {'cloudData': cloudData}
            });
        };
        
        function addVlanPoolController($rootScope, $scope, cloudData){
            $scope.createRangeStartMessage = function (poolForm, index){
              return   poolForm["startrange"+index].$error;
            };

            $scope.createRangeEndMessage = function (poolForm, index){
                  return   poolForm["endrange"+index].$error;
            };
            
            $scope.addnewranges = function(objectData){
                objectData.rangeList.push({"start" : '', "end": ''});
            };

            $scope.deleterange = function(range, adornmentData){
               var index = _.findIndex(adornmentData.rangeList, range);
               adornmentData.rangeList.splice(index, 1); 
            };
            
            $scope.vlanPoolObject = {};
            //$scope.vlanPoolObject.cloudId = cloudId;
            $scope.vlanPoolObject.id = 0;
            $scope.vlanPoolObject.name = "";
            $scope.vlanPoolObject.ranges = "";
            $scope.vlanPoolObject.rangeList = [{"start": '', "end": ''}];
            $scope.clouds = cloudData;
            $scope.active_help_id = "admin_deploy_components_add_vlan_pool_help";
            $scope.helpButtonClicked = function(id){
                $scope.active_help_id = id;
                console.log("  helpButtonClicked ");
                $scope.bordcastEventHelpButtonClicked($scope.active_help_id);
            }; 
            $scope.bordcastEventHelpButtonClicked = function(helpId){
                $scope.$broadcast('onHelpButtonClicked', {
                   helpIDString: helpId 
                });
             };  

            $scope.cancelDialogue = function() {
                $mdDialog.cancel();
            };
            
            
            $scope.done = function(){
                $scope.vlanPoolObject.cloudid = JSON.parse($scope.vlanPoolObject.cloud).id;
                $scope.vlanPoolObject.cloudName  = JSON.parse($scope.vlanPoolObject.cloud).name;
                
                var objectData = $scope.vlanPoolObject;
                
                var arrRangeList = [];
                for (i = 0, ctr = 0; i < objectData.rangeList.length; i++){
                    if(objectData.rangeList[i].start !== '') {
                        arrRangeList[ctr++] = objectData.rangeList[i].start + '-' + objectData.rangeList[i].end;
                    } else {
                        objectData.rangeList.splice(i, 1);
                        i--;
                    }
                }
                console.log(arrRangeList.toString());
                objectData.ranges = arrRangeList.toString();
                
                var toastparam = {};
                toastparam = {
                    'heading': 'VLAN Pool creation in progress',
                    'subHeading': 'Pool creation initiated.',
                    'type': 'progress',
                    'timeout': 15000
                };
                showToast(toastparam);
                $scope.promiseCompleted = true;
                console.log(objectData);
                $mdDialog.hide();
                vlanService.createVlanPool(objectData).then(function(data){

                    //update rows
                    $rootScope.$broadcast('UpdateRowData', objectData);
                    
                    
                    ////////////////////////
                    //$mdDialog.cancel();
                    toastparam = {
                        'heading': 'VLAN Pool (' + objectData.name + ') created successfully',
                        'subHeading': '&nbsp;',
                        'type': 'success',
                        'timeout': 5000
                    };
                    showToast(toastparam);
                    $scope.promiseCompleted = false;

                }, function(error){
                    console.log("Unable to create VLAN Pool - %s due to %s", objectData.name, error.data.message);
                    //TODO to show message/something else;
                    toastparam = {
                        'heading': 'VLAN Pool create failed',
                        'subHeading': "ERROR: "+error.data.message,
                        'type': 'fail',
                        'timeout': 5000
                    };
                    showToast(toastparam);
                    $scope.promiseCompleted = false;
                });
            };
        }
        //ADD VLAN POOL ENDS
        
        //EDIT VLAN POOL
        $scope.addnewranges = function(objectData){
            objectData.rangeList.push({"start" : '', "end": ''});
        };
        
        $scope.deleterange = function(range, adornmentData){
           var index = _.findIndex(adornmentData.rangeList, range);
           adornmentData.rangeList.splice(index, 1); 
        };
        
        $scope.editPoolData = function(objectData){
            console.log(objectData);
            var arrRangeList = [];
            for (i = 0, ctr = 0; i < objectData.rangeList.length; i++){
                if(objectData.rangeList[i].start !== '') {
                    arrRangeList[ctr++] = objectData.rangeList[i].start + '-' + objectData.rangeList[i].end;
                } else {
                    objectData.rangeList.splice(i, 1);
                    i--;
                }
            }
            console.log(arrRangeList.toString());
            objectData.ranges = arrRangeList.toString();
            console.log(objectData);
            $scope.isAdornmentPanelOpen = false;
            
            var toastparam = {};
            toastparam = {
                'heading': 'VLAN Pool update in progress',
                'subHeading': 'Pool update initiated.',
                'type': 'progress',
                'timeout': 15000
            };
            $scope.editPool = false;
            showToast(toastparam);
            $scope.promiseCompleted = true;
            var list = $scope.vlanPoolData;
            
            
            vlanService.updateVlanPool(objectData, objectData.cloudid).then(function(){
                
                //update rows
                for(i=0; i<list.length ; i++) {
                    if (list[i].id === objectData.id) {
                        //list.splice(i, 1);
                        list[i] = objectData;
                    }
                }

                toastparam = {
                    'heading': 'VLAN Pool (' + objectData.name + ') updated successfully',
                    'subHeading': '&nbsp;',
                    'type': 'success',
                    'timeout': 5000
                };
                showToast(toastparam);
                $scope.promiseCompleted = false;
                
            }, function(error){
                console.log("Unable to update VLAN Pool - %s due to %s", objectData.name, error.data.message);
                //TODO to show message/something else;
                toastparam = {
                    'heading': 'VLAN Pool update failed',
                    'subHeading': "ERROR: "+error.data.message,
                    'type': 'fail',
                    'timeout': 5000
                };
                showToast(toastparam);
                $scope.promiseCompleted = false;
            });
        };
        
        //EDIT VLAN POOL ENDS
        
        $scope.deleteVlanPool = function(objectData){
            console.log(objectData);
            $scope.isAdornmentPanelOpen = false;
            
            var toastparam = {};
            toastparam = {
                'heading': 'VLAN Pool deletion in progress',
                'subHeading': 'Pool deletion initiated.',
                'type': 'progress',
                'timeout': 10000
            };
            showToast(toastparam);
            $scope.promiseCompleted = true;
            var list = $scope.vlanPoolData;
            
            //DELETE /shieldxapi/infras/resourcegroup/{rgId} 
            vlanService.deleteVlanPool(objectData.id, objectData.cloudid).then(function(data){
                if(data.status) {
                //update rows
                    for(i=0; i<list.length ; i++) {
                        if (list[i].id === objectData.id) {
                            list.splice(i, 1);
                        }
                    }

                    toastparam = {
                        'heading': 'VLAN Pool deleted successfully',
                        'subHeading': '&nbsp;',
                        'type': 'success',
                        'timeout': 5000
                    };
                    showToast(toastparam);
                    $scope.promiseCompleted = false;
                } else {
                    console.log("Unable to delete VLAN Pool (%s) due to %s", objectData.name, data.errorMessage);
                    //TODO to show message/something else;
                    toastparam = {
                        'heading': 'VLAN Pool deletion failed',
                        'subHeading': "Error: "+data.errorMessage,
                        'type': 'fail',
                        'timeout': 5000
                    };
                    showToast(toastparam);
                    $scope.promiseCompleted = false;
                }
            }, function(error){
                console.log("Unable to delete VLAN Pool - %s due to %s", objectData.name, error.message);
                //TODO to show message/something else;
                toastparam = {
                    'heading': 'VLAN Pool deletion failed',
                    'subHeading': "Something went wrong",
                    'type': 'fail',
                    'timeout': 5000
                };
                showToast(toastparam);
                $scope.promiseCompleted = false;
            });
        }; //DELETE POOL ENDS.
        
        //EDIT
        var oldData;
        $scope.discardChanges = function(){
            $scope.editPool = false;
            console.log(oldData);
            $scope.adornmentData = oldData; //ASSIGN OLD DATA TO OBJECT.
        };
        $scope.updatePool = function(dataObject){
            //THIS FUNCTION WILL CALL WHEN USER COMING IN EDIT MODE.
            oldData = angular.copy(dataObject); //MAKE COPY OF OLD DATA.
            console.log(oldData);
            $scope.editPool = true;
            $scope.rangeheightsetup();
        };
        
        //EDIT ENDS
        
        
        //Cleare session stored data.
        $scope.callCacheBurst = function () {
            console.log('Bursting cache data and reloading from server');
            clearMasterSession($sessionStorage, $state);
            /*$sessionStorage.groupViewData = false;
            $state.reload();*/
        };
        
        $scope.$on('$viewContentLoaded', function(event){ 
            console.log(event);
            fixContainerHeight(1);
        });
        $scope.rangeheightsetup = function(){
            console.log((window.innerHeight - 355) + 'px');
            $scope.rangeheight = (window.innerHeight - 355) + 'px';
        };
    }

    angular.module('shieldxApp').controller('vlanPoolsCtr', vlanPoolsCtr);
})();
