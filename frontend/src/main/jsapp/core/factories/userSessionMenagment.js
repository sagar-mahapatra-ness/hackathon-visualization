(function () {
    function dataVisualizationApi() {
        "ngInject";

        return shieldxDataFx();
       
    }

    angular.module('shieldxApp').factory('dataVisualizationApi', dataVisualizationApi);

    function userSessionMenagment($q, $sessionStorage,$state,authRestangular,screenMenagment) {
        "ngInject";

        return{
            validateUserSession:function(){
                        
             var sessionValidity = this.isUserSessionValid();
              if(sessionValidity){
                    var userData = authRestangular.getUserDetail();
                   
//                    console.dir(userData);

                    if(!userData){
                        var data = this.getUserSessionData();
                        authRestangular.setUserDetail(data);
                    }
                 }
              if(!sessionValidity) {
                screenMenagment.navigateToPage(screenMenagment.screens.LANDING_PAGE);
              }  

             return sessionValidity;   
            },
            invalidateUserSession : function(){
               /* if($sessionStorage.userdata && $sessionStorage.userdata.userSession){
                    delete $sessionStorage.userdata.userSession;
                    delete $sessionStorage.userdata.authorities;
                }
                screenMenagment.navigateToPage(screenMenagment.screens.LANDING_PAGE);
                 */
            },
            getUserSessionData : function(){
//                console.log("getUserSessionData 1 ");
                var userdata  = $sessionStorage.userdata; 
//                 console.dir(userdata);
                if(!userdata){
                   return null;
                }
                if(!$sessionStorage.userdata.userSession)
                {
                     return null;
                }
//                console.log("getUserSessionData 2 ");
//                 console.dir($sessionStorage.userdata.userSession);
                return $sessionStorage.userdata.userSession;
            },
            isUserSessionValid : function(){
                return this.getUserSessionData() !== null;
            },
            isUserAllowd:function(data){
                
            },
            saveToUserSession : function(){
                var userdata   = $sessionStorage.userdata; 
                if(!userdata){
                    $sessionStorage.userdata = {};
                }
                var data = authRestangular.getUserDetail();
                if(data){
                    $sessionStorage.userdata.userSession = data;
                } 
           },
           saveListOfAuthorities: function(data){
                $sessionStorage.userdata.authorities = data;
           }

        };

       
    }

    angular.module('shieldxApp').factory('userSessionMenagment', userSessionMenagment);

})();
