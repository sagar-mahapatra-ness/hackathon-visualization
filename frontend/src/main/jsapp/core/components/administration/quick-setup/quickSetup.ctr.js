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
    function quickSetupCtr($scope,
            $translate,
            sideNav,
            $location,
            $state) {
        "ngInject";

        $scope.$emit('listenHeaderText', {headerText: $translate.instant('quicksetup.header.quick_setup')});


        $scope.quicksetup_heading = $translate.instant('quicksetup.heading.create_detect_protect');
        $scope.quicksetup_subheading = $translate.instant('quicksetup.subheading.our_wizard_will_get_you_setup_started_as_quick_as_flash');
        $scope.administration = $translate.instant('wizardbreadcrumb.label.administration');
        $scope.quicksetup = $translate.instant('wizardbreadcrumb.label.quicksetup');
        $scope.provide_infrastructure_access = $translate.instant('wizardbreadcrumb.label.provide_infrastructure_access');
        $scope.specifiy_ip_addressing = $translate.instant('wizardbreadcrumb.label.specifiy_ip_addressing');
        $scope.create_deployment_specification = $translate.instant('wizardbreadcrumb.label.create_deployment_specification');
        $scope.create_virtual_chassis = $translate.instant('wizardbreadcrumb.label.create_virtual_chassis');
        $scope.networks_to_monitor_in_chassis = $translate.instant('wizardbreadcrumb.label.networks_to_monitor_in_chassis');
        $scope.back = $translate.instant('wizardbreadcrumb.label.back');
        $scope.next = $translate.instant('wizardbreadcrumb.label.next');
        $scope.commit = $translate.instant('wizardbreadcrumb.label.commit');
        $scope.configure_management_network = $translate.instant('wizardbreadcrumb.label.configure_management_network');
        $scope.configure_backplane_network = $translate.instant('wizardbreadcrumb.label.configure_backplane_network');

        $scope.headerValues = [];
        $scope.toggleRight = sideNav.buildToggler('right');
        $scope.hideRightPanel = false;

        $scope.prevState = null;
        $scope.nextState = null;

        $scope.prevEnableState = true;
        $scope.nextEnableState = false;
        $scope.activeScreenName = 'infrastructure-connector';
        
        $scope.showVchassisCreationInProgress = false;

        $scope.maximize = false;
        
        $scope.breadcrumbs = {
            '/quickSetup/infrastructure-connector': {
                'name': 'infrastructure-connector',
                'text': $scope.provide_infrastructure_access,
                'url': '/quickSetup/infrastructure-connector',
                'prev': 'home.quickSetup.quickSetup-begin',
                'next': 'home.quickSetup.ip-pools-management',
                'step': 1
            },
            '/quickSetup/ip-pools-management': {
                'name': 'ip-pools-management',
                'text': $scope.configure_management_network,
                'url': '/quickSetup/ip-pools-management',
                'prev': 'home.quickSetup.infrastructure-connector',
                'next': 'home.quickSetup.ip-pools-backplane',
                'step': 2
            },
            '/quickSetup/ip-pools-backplane': {
                'name': 'ip-pools-backplane',
                'text': $scope.configure_backplane_network,
                'url': '/quickSetup/ip-pools-backplane',
                'prev': 'home.quickSetup.ip-pools-management',
                'next': 'home.quickSetup.deployment-specifications',
                'step': 3
            },
            '/quickSetup/deployment-specifications': {
                'name': 'deployment-specifications',
                'text': $scope.create_deployment_specification,
                'url': '/quickSetup/deployment-specifications',
                'prev': 'home.quickSetup.ip-pools-backplane',
                'next': 'home.quickSetup.virtual-chassis',
                'step': 4
            },
            '/quickSetup/virtual-chassis': {
                'name': 'virtual-chassis',
                'text': $scope.create_virtual_chassis,
                'url': '/quickSetup/virtual-chassis',
                'prev': 'home.quickSetup.deployment-specifications',
                'next': 'home.quickSetup.monitor-networks',
                'step': 5
            },
            '/quickSetup/monitor-networks': {
                'name': 'monitor-networks',
                'text': $scope.networks_to_monitor_in_chassis,
                'url': '/quickSetup/monitor-networks',
                'prev': 'home.quickSetup.virtual-chassis',
                'next': null,
                'step': 6
            }
        };
        $scope.$on('$viewContentLoaded', function (event) {
            if (typeof $scope.breadcrumbs[$location.path()] != 'undefined') {
                $scope.activeScreenName = $scope.breadcrumbs[$location.path()].name;
                $scope.updateBreadcrumbUI();
            }
        });

        $scope.$on('fullscreen', function (event, data) {
            $scope.maximize = !$scope.maximize;
        });

        $scope.updateBreadcrumbUI = function () {
            if (!document.querySelector('.quick-setup-steper'))
                return;
            //get width of parent section
            var qsStepperWidth = angular.element(document.querySelector('.quick-setup-steper'))[0].getBoundingClientRect().width;
            //position of active crumb
            //var activeCrumbPos = angular.element(document.querySelector('.currentPage')).prop('offsetLeft');
            //width of active crumb
            //var activeCrumbWidth = angular.element(document.querySelector('.currentPage'))[0].getBoundingClientRect().width;
            var avgElemWidth = 230;
            if (($scope.breadcrumbs[$location.path()].step * avgElemWidth) > qsStepperWidth * 0.75) {
                if ($scope.breadcrumbs[$location.path()].step >= 5) {
                    angular.element(document.querySelector('.content-mask')).css('left', (qsStepperWidth - 1390) + 'px');
                    angular.element(document.querySelector('.left-mask')).css('visibility', 'visible');
                    angular.element(document.querySelector('.right-mask')).css('visibility', 'hidden');
                }
            } else if (($scope.breadcrumbs[$location.path()].step * avgElemWidth) < qsStepperWidth * 0.75) {
                if ($scope.breadcrumbs[$location.path()].step <= 3) {
                    angular.element(document.querySelector('.content-mask')).css('left', 0 + 'px');
                    angular.element(document.querySelector('.left-mask')).css('visibility', 'hidden');
                    angular.element(document.querySelector('.right-mask')).css('visibility', 'visible');
                }
            }

        };

        //to dynamically position right mask
        $scope.getPos = function () {
            var qsStepperWidth = angular.element(document.querySelector('.quick-setup-steper'))[0].getBoundingClientRect().width;
            return 'left:' + (qsStepperWidth - 200) + 'px';
        };

        $scope.getPrevPage = function () {
            $scope.prevState = $scope.breadcrumbs[$location.path()].prev;
            if ($scope.prevState === "home.quickSetup.quickSetup-begin") {
                $scope.$emit('quickSetupEnded', {});
            }
            $state.go($scope.prevState);

        };

        $scope.getNextPage = function () {
            $scope.nextState = $scope.breadcrumbs[$location.path()].next;
            $state.go($scope.nextState);
            $scope.disableNextButton();

        };

        $scope.showBreadCrumb = function () {
            return angular.isDefined($scope.breadcrumbs[$location.path()]);
        };

        $scope.showPrev = function () {
            return ($scope.breadcrumbs[$location.path()] && $scope.breadcrumbs[$location.path()].prev);
        };

        $scope.showNext = function () {
            return ($scope.breadcrumbs[$location.path()] && $scope.breadcrumbs[$location.path()].next);
        };

        $scope.showCommit = function () {
            return ($scope.breadcrumbs[$location.path()] && $scope.breadcrumbs[$location.path()].prev && ($scope.breadcrumbs[$location.path()].next === null)
                    );
        };

        $scope.isCurrentPage = function (locationUrl) {
            if ($scope.breadcrumbs[$location.path()] && (locationUrl === $scope.breadcrumbs[$location.path()].url)) {
                $scope.currentIndex = $scope.breadcrumbs[$location.path()].step;
            }
            return (($scope.breadcrumbs[$location.path()] && (locationUrl === $scope.breadcrumbs[$location.path()].url)));
        };

        $scope.isPreviousPage = function (step) {
            var stepIndex = step + 1;
            return stepIndex < $scope.currentIndex;
        };

        $scope.setLastQuickSetupPage = function () {
            $scope.lastQuickSetupPage = $location.path();
        };
        $scope.disableNextButton = function () {
            $scope.nextEnableState = false;
        };
        $scope.enableNextButton = function () {
            $scope.nextEnableState = true;
        };

        $scope.clickNextButton = function (event) {
            var data = {stopNextClick: false};
            $scope.$broadcast('nextClicked', data);
            if($location.path() === "/quickSetup/monitor-networks") {
                $scope.showVchassisCreationInProgress = true;
            }
            console.log(" nextClicked " + data.stopNextClick);
            if (!data.stopNextClick) {
                $scope.getNextPage();
            }
        };
        $scope.toggleHelpPanel = function () {
            console.log($scope.hideRightPanel);
            $scope.hideRightPanel = !($scope.hideRightPanel);
        };
    }

    angular.module('shieldxApp').controller('quickSetupCtr', quickSetupCtr);
})();

