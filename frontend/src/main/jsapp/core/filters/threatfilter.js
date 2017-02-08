(function () {
   

     function filterthreatFn() {
        "ngInject";

        return function(data,filterObj){
            console.log(filterObj);
            var output = [];
            if(typeof data !== 'undefined'){
                for(var i = 0;i<data.length; i++){
                    if(data[i].threatResponseData){
                        var status = data[i].threatResponseData.enabled ? "Enabled" : "Disabled";
                        if( ( filterObj._status.indexOf(status) !== -1 || !filterObj._status.length ) && filterObj.protectionType.indexOf(data[i].protectionType) !== -1 && filterObj.severity.indexOf(data[i].severity) !== -1){
                            var passed = true;
                            //action filter not present bypass the checks
                            if(filterObj.action.length < 4 || !filterObj.action.length){
                                var notifypositiveLog = filterObj.action.indexOf("notifySysLog-true");
                                var notifynegativeLog = filterObj.action.indexOf("notifySysLog-false");
                                if((notifypositiveLog === -1 && notifynegativeLog !=  -1) || (notifynegativeLog === -1 && notifypositiveLog !== -1)){
                                    if(notifypositiveLog === -1 && data[i].threatResponseData.notifySysLog )
                                        passed = false;
                                    if(notifynegativeLog === -1 && !data[i].threatResponseData.notifySysLog )
                                        passed = false;
                                }

                                var positiveEmail = filterObj.action.indexOf("notifySMTP-true");
                                var negativeEmail = filterObj.action.indexOf("notifySMTP-false");
                                if((positiveEmail === -1 && negativeEmail !=  -1) || (negativeEmail === -1 && positiveEmail !== -1)){
                                    if(positiveEmail === -1 && data[i].threatResponseData.notifySMTP )
                                        passed = false;
                                    if(negativeEmail === -1 && !data[i].threatResponseData.notifySMTP )
                                        passed = false;
                                }
                            }

                            //response filter not present bypass the checks
                            if(filterObj.response.length < 6 || !filterObj.response.length){
                                var positiveBlock = filterObj.response.indexOf("Block-true");
                                var negativeBlock = filterObj.response.indexOf("Block-false");
                                if((positiveBlock === -1 && negativeBlock !=  -1) || (negativeBlock === -1 && positiveBlock !== -1) ){
                                    if(positiveBlock === -1 && data[i].threatResponseData.block )
                                        passed = false;
                                    if(negativeBlock === -1 && !data[i].threatResponseData.block )
                                        passed = false;
                                }

                                var positiveLog = filterObj.response.indexOf("Log-true");
                                var negativeLog = filterObj.response.indexOf("Log-false");
                                if((positiveLog === -1 && negativeLog !=  -1) || (negativeLog === -1 && positiveLog !== -1)){
                                    if(positiveBlock === -1 && data[i].threatResponseData.logPacket )
                                        passed = false;
                                    if(negativeLog === -1 && !data[i].threatResponseData.logPacket )
                                        passed = false;
                                }

                                var positiveAlert = filterObj.response.indexOf("Alert-true");
                                var negativeAlert = filterObj.response.indexOf("Alert-false");
                                if((positiveAlert === -1 && negativeAlert !=  -1) || (negativeAlert === -1 && positiveAlert !== -1)){
                                    if(positiveAlert === -1 && data[i].threatResponseData.alert )
                                        passed = false;
                                    if(negativeAlert === -1 && !data[i].threatResponseData.alert )
                                        passed = false;
                                }
                            }

                            if(passed)
                                output.push(data[i]);
                            /*if(filterObj.response.length < 6){
                                var passed = true;
                                var checkBlock = false;
                                var check = false;
                                var checkBlock = false;
                                if()

                            } else {*/
                                //output.push(data[i]);
                            //}
                        }
                    }
                }
            }
            if(output.length < 1000)
                console.log("this is the output ",output);

            console.log("output length is ",output.length);
            return output;
        };
    }

 angular.module('shieldxApp').filter('filterthreat', filterthreatFn);

})();
