(function () {
    angular.module('shieldxApp').directive('fixheight', function($window){
  return{
  	restrict: 'A',
    link: function(scope, element, attrs){
    	var fixheight = parseInt(attrs.fixheight);
    	console.log(" fx height >>>>>>>>>>>>>>>>>>>>>>> "+fixheight);
    	console.log(" actual  window height "+$window.innerHeight);
        element.css('height', ($window.innerHeight - fixheight) + 'px');
        //element.height($window.innerHeight/3);
    }
  };
});
})();