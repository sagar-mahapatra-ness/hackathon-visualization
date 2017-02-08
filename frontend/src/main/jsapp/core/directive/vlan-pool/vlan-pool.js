(function () {
	function vlanPoolDirective() {
		var directive = {};
		directive.restrict = 'E';
		directive.templateUrl = 'core/directive/vlan-pool/vlan-pool.html';
		directive.scope = {
			vlan: '=',
			infraid : '=',
			option : '=',
			selectvlan : '=',
			selectedoption : '&',
			selectedvlan : '&'
		};
		directive.controller = ['$scope','vlanService', function($scope, vlanService) {
			if(!$scope.option){
				$scope.option = "novlan";	
			}
			$scope.selectedOption = $scope.option;
			$scope.existingVlanFetched = false;
			$scope.existingVlans = null;
			$scope.selectedVlanVal = "";
			if($scope.selectvlan){
				$scope.selectedVlanVal = $scope.selectvlan;
		    }
            
            $scope.fetchVlanData = function(){
            	 console.log("vlan data fetched 1 "+$scope.infraid); 
            	if($scope.infraid){
            		 $scope.existingVlanFetched = false;
	             	vlanService.getvlanList($scope.infraid).then(function(data){
	                 console.log("vlan data fetched"); 
	                 console.dir(data);
	                 $scope.existingVlans = [];
	                 for(var i = 0; i < data.length; i++){
	                  var vlan = new Vlan();
	                  vlan.diserialize(data[i]);	
	                  $scope.existingVlans.push(vlan); 
	                 }
	                 $scope.existingVlanFetched = true;
	             	});
               }
            };  
			
			$scope.radioOptionClicked = function(){
			  //console.log("radioOptionClicked ");
			  //console.dir($scope.selectedOption);
              $scope.selectedoption({selectedOpt:$scope.selectedOption});
			};

			$scope.newRadioButtonClicked = function(){
				console.log(" newRadioButtonClicked  ");
				$scope.$broadcast('newRadioButtonClicked', {
				});
			};

			$scope.radioVlanClicked = function(){
			  //console.log("radioVlanClicked ");
			  //console.dir($scope.selectedVlanVal);	
              $scope.selectedvlan({selectedVal:$scope.selectedVlanVal});
			};
           $scope.fetchVlanData();
		}];

      directive.link = function(scope, element, attrs) {
		   
           scope.$watch('selectvlan', function(newValue, oldValue) {
                if (newValue){
                   scope.selectedVlanVal = scope.selectvlan;
                }
            }, true);

           scope.$watch('infraid', function(newValue, oldValue) {
                if (newValue){
                   scope.fetchVlanData();
                }
            }, true);
        };
		return directive;
	}

	angular.module('shieldxApp').directive('vlanpool', vlanPoolDirective);
})();
