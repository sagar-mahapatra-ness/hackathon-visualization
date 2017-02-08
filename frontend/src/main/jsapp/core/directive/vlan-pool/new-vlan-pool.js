(function () {
	function newVlanDirective() {
		var directive = {};
		directive.restrict = 'E';
		directive.templateUrl = 'core/directive/vlan-pool/new-vlan-pool.html';
		directive.scope = {
			vlanval: '=',
		};
		directive.controller = ['$scope', function($scope) {
			$scope.$on('newRadioButtonClicked', function (event, data) {
				setTimeout(function(){
	                document.querySelector('#rangeNameField').focus();
	            },0);
			  
			});

			$scope.valueChanged = function($event, data){
             	$scope.$emit('newRangeValueChanged', data);   
            };
		}];
		return directive;
	}

	angular.module('shieldxApp').directive('newvlan', newVlanDirective);
})();
