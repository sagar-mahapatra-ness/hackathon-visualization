(function () {
    function landingPageCtr($scope,$state, coreservices, $mdDialog,screenMenagment,userSessionMenagment) {
        "ngInject";
         console.log("landingPageCtr >>>  ");
        screenMenagment.setCurrentScreen(screenMenagment.screens.HOME_PAGE); 
        $scope.showAuthError = false;
        $scope.errorMesage = "Invalid user name or password";
        $scope.userInfo =  {name:"", password:""};

         $scope.signinUser = function(){
         	console.log(" sigin clicked ");
           $state.go('home.EventCorrelationExplorer');  
         	
         };

        $scope.getUserName = function(){
          	return $scope.userInfo.name;
        };

        $scope.pwdType= "password";

        $scope.togglePasswordType = function () {
            $scope.pwdType = $scope.pwdType === 'password' ? 'text' : 'password';
        };

        $scope.showPrivacyMessage = function(ev){
            $mdDialog.show({
                controller: 'showMessagesCtr', templateUrl: 'core/components/landingpage/privacy-message.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true
                
            }).then(function (answerVal) {
                
            }, function () {
               
            });
        };

        $scope.showTermMessage = function(ev){
            $mdDialog.show({
                controller: 'showMessagesCtr', templateUrl: 'core/components/landingpage/term-message.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true
                
            }).then(function (answerVal) {
                
            }, function () {
               
            });
        };

        $scope.onPasswordFieldKeyup = function(event){
           if(event.keyCode === 13){
               $scope.signinUser();
           }     
        }; 

    }

    angular.module('shieldxApp').controller('landingPageCtr', landingPageCtr);
})();