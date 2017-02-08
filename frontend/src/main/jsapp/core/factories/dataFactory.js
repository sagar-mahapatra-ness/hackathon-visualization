(function () {
   

     function commonDataManagement() {
        "ngInject";

        var dataSet = [];
        var dataObj = {};
        return {
            setData: function (data) {
                if(data.hasOwnProperty("id") && data.id !== 0){
                    var updateIndex = _.find(dataSet,{"id": parseInt(data.id)});
                    if(updateIndex){
                        dataSet.splice(updateIndex,0,data);
                    } else {
                        dataSet.splice(data.id,0,data);
                    }
                } else {
                    dataSet.push(data);
                }

            },
            getData: function () {
                return dataSet;
            },
            clearData:function(){
              dataSet = [];
            },
            setObj:function(objValue){
                dataObj = objValue;
            },
            getObj:function(){
                return dataObj;
            }       
      };
    }

 angular.module('shieldxApp').factory('commonDataManagement', commonDataManagement);

})();
