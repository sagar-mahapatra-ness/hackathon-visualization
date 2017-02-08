(function () {
    angular.module('shieldxApp').directive('fixwidthheight', function($window){
  return{
  	restrict: 'A',
    link: function(scope, element, attrs){
    	var fixwidthheight = attrs.fixwidthheight;

      var val =   element[0].offsetHeight;
      console.dir(element);
       console.log(" fixwidthheight  >>> width "+val);
      element.css("height", val + 'px');
    }
  };
});
})();