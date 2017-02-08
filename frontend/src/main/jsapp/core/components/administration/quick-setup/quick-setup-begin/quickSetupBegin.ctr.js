/*
 ShieldX Networks Inc. CONFIDENTIAL
 ----------------------------------
 *
 Copyright (c) 2016 ShieldX Networks Inc.
 All Rights Reserved.
 *
 NOTICE: All information contained herein is, and remains
 the property of ShieldX Networks Incorporated and its suppliers,
 if any. The intellectual and technical concepts contained
 herein are proprietary to ShieldX Networks Incorporated
 and its suppliers and may be covered by U.S. and Foreign Patents,
 patents in process, and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from ShieldX Networks Incorporated.
 */

(function () {
    function quickSetupBeginCtr($scope,
            $sessionStorage,
            $rootScope,
            $state,
            $translate,
            $mdDialog,
            userSessionMenagment) {
        "ngInject";
        clearAllSession($sessionStorage);
        $scope.quicksetup_heading = $translate.instant('quicksetup.heading.create_detect_protect');
        $scope.quicksetup_subheading = $translate.instant('quicksetup.subheading.our_wizard_will_get_you_setup_started_as_quick_as_flash');

        $scope.$storage = $sessionStorage;
        $scope.resumeWizard = false;
        $scope.$gotoState = '';
        $scope.active_help_id = "splashPage_help_wizard";
        $scope.showHelp = false;
        $scope.getWiardState = function () {
            if ($scope.$storage.hasOwnProperty('cloudData')) {
                if ($scope.$storage.cloudData.hasOwnProperty('savedState')) {
                    $scope.resumeWizard = true;
                    $scope.infraName = $scope.$storage.cloudData.infrastructure.name;
                    $scope.$gotoState = $scope.$storage.cloudData.savedState;
                }
            }
        };

        $scope.helpButtonClicked = function(id){
                $scope.active_help_id = id;
                $scope.showHelp =  !$scope.showHelp;
                console.log(" helpButtonClicked ");
                $scope.bordcastEventHelpButtonClicked($scope.active_help_id);
                
        };
        //$scope.is_quick_setup_enabled = false;
        function isQuickSetupEnabled(){
            var idToCheck  = [];
            idToCheck.push( authorities("infrastructureConnectors_discover"));
            idToCheck.push(authorities("deploymentSpecifications_create"));
            idToCheck.push(authorities("virtualChassis_create"));
            idToCheck.push(authorities("resourceGroups_create"));
            $scope.is_quick_setup_enabled = userSessionMenagment.isUserAllowd(idToCheck); 
        }
        $scope.$on("authoritiesListavalibale",function(event,data){
                isQuickSetupEnabled();
        });

        if($sessionStorage.userdata.authorities){
            isQuickSetupEnabled();
        }
           
        $scope.startNew = function () {
            delete $scope.$storage.cloudData;
            delete $sessionStorage.qSdeploySpecvlanDataId;
            delete $sessionStorage.qSdeploySpecvlanData;
            delete $sessionStorage.qSdeploySpecvData;
            delete $sessionStorage.qSdeploySpecvDataId;
            
            $state.go('home.quickSetup.infrastructure-connector');
        };
        $scope.resume = function () {
            $state.go($scope.$gotoState);
        };

        $scope.showAnimation = function(ev){
            $mdDialog.show({
                controller: 'AnimationDialogCtr', templateUrl: 'core/components/administration/quick-setup/quick-setup-begin/animation-dialog/animation-dialog-templet.html', parent: angular.element(document.body), targetEvent: ev, clickOutsideToClose: true
            }).then(function (answerVal) {
            }, function () {
                
            });
        };


        //$scope.getWiardState();

        

        /*slider*/
        $scope.slides = [
            {image: 'images/Canvas 1.png', description: 'Canvas 1'},
            {image: 'images/Canvas 2.png', description: 'Canvas 2'},
            {image: 'images/Canvas 3.png', description: 'Canvas 3'},
            {image: 'images/Canvas 4.png', description: 'Canvas 4'},
            {image: 'images/Canvas 5.png', description: 'Canvas 5'},
            {image: 'images/Canvas 6.png', description: 'Canvas 6'},
            {image: 'images/Canvas 7.png', description: 'Canvas 7'}
        ];

        $scope.direction = 'left';
        $scope.currentIndex = 0;

        $scope.setCurrentSlideIndex = function (index) {
            $scope.direction = (index > $scope.currentIndex) ? 'left' : 'right';
            $scope.currentIndex = index;
        };

        $scope.isCurrentSlideIndex = function (index) {
            return $scope.currentIndex === index;
        };

        $scope.prevSlide = function () {
            $scope.direction = 'left';
            $scope.currentIndex = ($scope.currentIndex < $scope.slides.length - 1) ? ++$scope.currentIndex : 0;
        };

        $scope.nextSlide = function () {
            $scope.direction = 'right';
            $scope.currentIndex = ($scope.currentIndex > 0) ? --$scope.currentIndex : $scope.slides.length - 1;
        };

        /*end slider*/
        $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            if ($state.is('home.quickSetup.quickSetup-begin')) {
                console.log("scope change from quickSetupBeginCtr");
                $scope.getWiardState();
            }
        });

        $scope.activLink = '';
        fixContainerHeight(1);
    }

    angular.module('shieldxApp').controller('quickSetupBeginCtr', quickSetupBeginCtr)
    .animation('.slide-animation', function () {
        return {
            beforeAddClass: function (element, className, done) {
                var scope = element.scope();

                if (className == 'ng-hide') {
                    var finishPoint = element[0].clientWidth;
                    if(scope.direction !== 'right') {
                        finishPoint = -finishPoint;
                    }
                    TweenMax.to(element, 0.5, {left: finishPoint, onComplete: done });
                }
                else {
                    done();
                }
            },
            removeClass: function (element, className, done) {
                var scope = element.scope();

                if (className == 'ng-hide') {
                    element.removeClass('ng-hide');

                    var startPoint = element[0].clientWidth;
                    if(scope.direction === 'right') {
                        startPoint = -startPoint;
                    }

                   TweenMax.fromTo(element, 0.5, { left: startPoint }, {left: 0, onComplete: done });
                }
                else {
                    done();
                }
            }
        };
    });
})();

