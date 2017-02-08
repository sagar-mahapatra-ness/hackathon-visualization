(function () {
   

     function screenMenagment($state,$mdDialog,$timeout) {
        "ngInject";

        return{
            currentScreen:null,
            screens:{
                LANDING_PAGE :{name:'landing_page',path:"landingpage"},
                HOME_PAGE :{name:'home_page',path:"homepage"},
                WIZARD_SCREEN :{name:'wizard_page'},
                ADMIN_SCREEN :{name:'admin_page'}
            },
            navigateToPage:function(screen){
               /* var cs = this.getCurrentScreen();
                console.log(" navigateToPage 2 "+cs.name); 
                console.log(" navigateToPage 3 "+screen.name); 
                if(cs.name !== screen.name){
                  this.setCurrentScreen(screen);  
                  $mdDialog.hide();
                  $timeout(function(){
                    $state.go(screen.path);
                  },0); 
                }
                */
            },
            setCurrentScreen : function(screen){
               this.currentScreen = screen; 
            },
            getCurrentScreen : function(){
               return this.currentScreen; 
            }
        };

       
    }

 angular.module('shieldxApp').factory('screenMenagment', screenMenagment);

})();
