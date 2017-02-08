(function () {
	function vlanRangsDirective() {
		var directive = {};
		directive.restrict = 'E';
		directive.templateUrl = 'core/directive/vlan-pool/vlan-ranges.html';
		directive.scope = {
			ranges: '=',
			added : '&',
			deleted : '&'
		};
		directive.controller = ['$scope', function($scope) {
			//$scope.rangeForm = [];
			$scope.onAddnewRangeClicked = function(){

			};
			$scope.addNewRange = function(){
				$scope.rangesRef.push(new Range());
				$scope.added({ranges:$scope.rangesRef});	
			};

			$scope.removeRange = function(range){
				var i = _.findIndex($scope.rangesRef,function(item){
                 return range === item;
				});

				if(i){
					$scope.rangesRef.splice(i,1);
				}
			 $scope.deleted({ranges:$scope.rangesRef});	
			};
		$scope.formvalidation = function (event) {
			console.log("chnagedsadda");
		};
		$scope.$watch("rangeForm.$invalid",function (newValue,old,scope) {
			$scope.$emit('invalidRangeFormData', newValue);  
		},true);
		$scope.createStarRangetMessage = function (rangeForm, index) {

            return   rangeForm["startRange" + index].$error;
         };
         $scope.createEndRangeMessage = function (rangeForm, index) {
            return   rangeForm["endRange" + index].$error;
         };

         $scope.valueChanged = function($event, data){
             $scope.$emit('newRangeValueChanged', data);   
         };

		}];
		directive.link = function(scope, element, attrs) {
		   console.log(" llink "+scope);	
		   
		  
           scope.$watchCollection('ranges', function(newValue, oldValue) {
                if (newValue){
                    if(scope.ranges){
						scope.rangesRef = scope.ranges;
						console.log(" link ");
						console.dir(scope.rangesRef);
						if(scope.rangesRef.length === 0){
							scope.rangesRef.push(new Range());
						}
					} else{
							scope.rangesRef = [new Range()];
					}
                }
            }, true);
        };

		return directive;
	}

	angular.module('shieldxApp').directive('vlanranges', vlanRangsDirective);
})();
