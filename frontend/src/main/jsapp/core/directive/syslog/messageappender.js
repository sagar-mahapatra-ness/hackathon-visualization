(function () {
    angular.module('shieldxApp').directive("messageappender", [ '$rootScope', function ($rootScope) {
      console.log("messageappender called");
	  return {	  	
	    link: function(scope, element, attrs) {
	      $rootScope.$on('customMessageBuilder', function(e, val) {
	        var domElement = element[0];
			var token = '|'+ val;
	        if (document.selection) {
	          domElement.focus();
	          var sel = document.selection.createRange();
	          sel.text = token;
	          domElement.focus();
	        } else if (domElement.selectionStart || domElement.selectionStart === 0) {
	          var startPos = domElement.selectionStart;
	          var endPos = domElement.selectionEnd;
	          var scrollTop = domElement.scrollTop;
	          domElement.value = domElement.value.substring(0, startPos) + token + domElement.value.substring(endPos, domElement.value.length);
	          domElement.focus();
	          domElement.selectionStart = startPos + token.length;
	          domElement.selectionEnd = startPos + token.length;
	          domElement.scrollTop = scrollTop;
	        } else {
	          domElement.value += token;
	          domElement.focus();
	        }

	      });
	    }
	  };
  }]);
})();