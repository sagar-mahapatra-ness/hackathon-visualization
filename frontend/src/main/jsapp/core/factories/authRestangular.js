(function () {
    function authRestangular(Restangular, $http, $q, $sessionStorage,$mdDialog){
    	 "ngInject";

    	var authUser = null;
        var alreadyOpen = false;
        function errorController($scope,$mdDialog,msgData) {
			$scope.msgData = msgData;
            $scope.hide = function() {
              console.log("I am called 123456789");
              $mdDialog.hide();
            };
        }

        angular.module('shieldxApp').controller('errorController', errorController);
    
    	return{
    		signIn : function(userName, password){
     			authUser = new AuthUser();
     			authUser.userName =  userName;
     			authUser.password = password;
     			//console.log("authRestangular  ");
     			//console.dir(authUser);
				return Restangular.withConfig(function (RestangularConfigurer) {
		            RestangularConfigurer.setDefaultHeaders({'X-Username' : authUser.userName, 'X-Password' : authUser.password });
		            RestangularConfigurer.setFullResponse(true);
         		}).one('/').customPOST("login").then(function(data){
         			var token = data.headers('X-Auth-Token');
         			authUser.token = token;
         			console.log("Got Token: "+token);
         			return data;
         		},function(error){
         			return $q.reject(error);
         		});
     		},
    		signOut : function(){
    			return  Restangular.withConfig(function (RestangularConfigurer) {
                     RestangularConfigurer.setDefaultHeaders({'X-Auth-Token' : authUser.getToken()});
                 }).all("/logout").post('').then(function(data){
                    authUser = null;
                    return data;
                 });
               
    		},
    		getUserDetail:function(){
              return authUser;
    		},
    		init:function(){
                var ret = Restangular.withConfig(function (RestangularConfigurer) {
                     //RestangularConfigurer.setBaseUrl("/shieldxapi/");
                    // RestangularConfigurer.setDefaultHeaders({'X-Auth-Token' : authUser.getToken()});
                 });
                ret.setErrorInterceptor(function(response, deferred, responseHandler) {
                    console.log("I run for every request which throws error");
                    if(response.status === 500) {
                        var showMsg = false;
                        console.log("error is catched");
                        var msgData = {"msgStart" : "","msgLink" : "","msgEnd" : ""};
                        switch(response.data.path){
                            case "/shieldxapi/infras" :
                                msgData.msgStart = "Some of parts of your operation might have created deployment components. If you need to clean up these components, please review the";
                                msgData.msgLink = "Administration > Deployment Components";
                                msgData.msgEnd = "section.";
                            break;
                            case "/shieldxapi/infras/resourcegroup" :
                                msgData.msgStart = "Some of parts of your operation might have created deployment components. If you need to clean up these components, please review the";
                                msgData.msgLink = "Administration > Deployment Components";
                                msgData.msgEnd = "section.";
                                showMsg = true;
                            break;
                            default : 
                                msgData.msgStart = "Some of parts of your operation might have created deployment components. If you need to clean up these components, please review the";
                                msgData.msgLink = "Administration > Deployment Components";
                                msgData.msgEnd = "section.";
                        }
                        //return false; // error handled return false incase of the error is handled and no further operation is required, but we also need the regular implementation that we had hence commenting this
                        //if checks whether already dialog box is open or not
                        if(!alreadyOpen && showMsg){
                            $mdDialog.show({
                                skipHide: true,
                                clickOutsideToClose: true,
                                templateUrl: 'core/components/screenComponents/error-message-500.html',
                                parent: angular.element(document.body),
								locals : {msgData : msgData },
                                controller: errorController
                               }).then(function(){
                                    alreadyOpen = false;
                               });
                            alreadyOpen = true;
                        }

                    }

                    return true; // error not handled
                });
                return ret;
    		},
            initSxquery:function(){
                var ret = Restangular.withConfig(function (RestangularConfigurer) {
                     RestangularConfigurer.setBaseUrl("/sxquery/");
                     RestangularConfigurer.setDefaultHeaders({'X-Auth-Token' : authUser.getToken()});
                 });
                ret.setErrorInterceptor(function(response, deferred, responseHandler) {
                    console.log("I run for every dashboard query request which throws error");
                    if(response.status === 500) {
                        console.log("error is catched");

                        //return false; // error handled return false incase of the error is handled and no further operation is required, but we also need the regular implementation that we had hence commenting this
                        //if checks whether already dialog box is open or not
                        if(!alreadyOpen){
                            $mdDialog.show({
                                skipHide: true,
                                clickOutsideToClose: true,
                                templateUrl: 'core/components/screenComponents/error-message-500-dashboard.html',
                                parent: angular.element(document.body),
                                controller: errorController
                               }).then(function(){
                                    alreadyOpen = false;
                               });
                            alreadyOpen = true;
                        }

                    }

                    return true; // error not handled
                });
                return ret;
            },
            setUserDetail:function(userData){
               if(!authUser){
                authUser = new AuthUser();
               } 
               authUser.copy(userData);
            }
    	};

    }
    angular.module('shieldxApp').factory('authRestangular', authRestangular);

})();