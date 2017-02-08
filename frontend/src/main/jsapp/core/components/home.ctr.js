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
    function homeCtr($scope, 
        $rootScope,
        $state, 
        $translate,
        $mdSidenav,
        $mdDialog,
        $sessionStorage,
        $log,coreservices,screenMenagment,userSessionMenagment,$timeout) {
        "ngInject";
        //screenMenagment.setCurrentScreen(screenMenagment.screens.HOME_PAGE); 
        // userSessionMenagment.validateUserSession();

        $scope.$storage = $sessionStorage;
        $scope.headerText = $translate.instant('HEADER_TEXT');
        $scope.$on('listenHeaderText', function (event, args) {
            console.log(args);
            $scope.headerText = args.headerText;
        });

       $scope.maximize = false;
        
        $scope.toastTimeout = 5000;
        $scope.active_help_id = "";
        $scope.helpButtonClicked = function(id){
            $scope.active_help_id = id;
            console.log("  helpButtonClicked ");
            $scope.bordcastEventHelpButtonClicked($scope.active_help_id);
        };

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
       
        });
        function findMenuItem(){
            $scope.subpaneItem = '';
             _.each($scope.panesA,function(item){
                    if(item.subpanes){
                       $scope.subpaneItem =  _.find(item.subpanes,function(subpane){
                        var menuname = subpaneItemFun(subpane);
                        var data = ($scope.toStateName.indexOf('.')>0)?($scope.toStateName.substring(0,$scope.toStateName.indexOf('.'))):($scope.toStateName);
                            return menuname === data;
                        });
                       //return subpaneItem;
                    }else{
                       if(item.id === $scope.toStateName){
                            $scope.subpaneItem = item;
                       }
                    }
                });
             return $scope.subpaneItem;
        }

        $scope.clickSignOut = function(){
           coreservices.signout();
        };

        $scope.$on('quickSetupBegun', function(){
            //enabling cancel
            $scope.qsStarted = true;
        });
        $scope.$on('quickSetupEnded', function(){
            //disable cancel
            $scope.qsStarted = false;
        });


        console.log('in homeCtr');


        $scope.endSetup = function(ev) {
            // Appending dialog to document.body to cover sidenav in docs app
            var confirm = $mdDialog.confirm({
                    //clickOutsideToClose : true,
                    //escapeToClose : true,
                    onComplete: function afterShowAnimation() {
                        var $dialog = angular.element(document.querySelector('md-dialog'));
                        var $actionsSection = $dialog.find('md-dialog-actions');
                        var $cancelButton = $actionsSection.children()[0];
                        var $confirmButton = $actionsSection.children()[1];

                        var $contentBody = $dialog.find('md-dialog-content');
                        var $contentText = $contentBody.find('div');
                        angular.element($contentText).addClass('confirm-dialog-content-style');

                        angular.element($confirmButton).css('color','#f37864');
                        angular.element($cancelButton).css('color','#f37864');

                    }
                }).title('Cancel Quick Setup?')
                  .textContent('You can save & exit setup and resume later from the Quick setup screen?')
                  .ariaLabel('Exit setup')
                  .targetEvent(ev)
                  .ok('SAVE & EXIT')
                  .cancel('CANCEL SETUP');
            $mdDialog.show(confirm).then(function() {
                console.log($scope.$storage.cloudData);
                $scope.qsStarted = false;
                $state.go('home.quickSetup.quickSetup-begin');
            }, function() {
                delete $scope.$storage.cloudData;
                $scope.clearUnsavedData();
                console.log("deleted coloudData from $sessionStorage");
                $state.go('home.quickSetup.quickSetup-begin');
                $scope.qsStarted = false;
            });
        };
        $scope.clearUnsavedData = function(){
            $scope.$broadcast("unsavedExistInIt");
        };
        $scope.changeLanguage = function() {

            $translate.use('gb').then(function () {
                $scope.headerText = $translate.instant('HEADER_TEXT');
            });
        };

        $scope.leftPanelToggle = function(){
            $mdSidenav('left-nav-panel').toggle()
                .then(function(){
                    $log.debug("close LEFT is done");
                });                
        };

        $scope.gotoPage = function($event) {
            var stateList = $state.get();
            var temp = this;

            console.log(_.find(stateList, { 'name' : temp.$pane.id}));

            var x = _.find(stateList, function(o){
                 return o.name.match('home.'+temp.$pane.id);
            });

            //find 'active' and remove class
            angular.element(document.querySelector('v-pane-header.active')).removeClass('active');
            //set current elem to 'active'
            angular.element($event.currentTarget).addClass('active');

            if(!!x) {
                $scope.leftPanelToggle();
                $state.go('home.'+ temp.$pane.id);
            } else return;
        };

        $scope.setFocusOnElem = function(elemId) {
            setTimeout(function(){
                document.querySelector(elemId).focus();
            },0);
        };

        $scope.bordcastEventHelpButtonClicked = function(helpId){
            console.log("bordcastEventHelpButtonClicked ");
            $scope.$broadcast('onHelpButtonClicked', {
               helpIDString: helpId 
            });
        };
        
        function returnMenuItem(){
            return $scope.panesA;
        }

        $scope.panesB = [
            {
                id: 'aboutUs',
                header: 'About ShieldX Product',
                icon: 'theaters',
                details: 'Video Gallery',
                content: ''
            },
            {
                id: 'dashboard',
                header: 'Dashboard',
                icon: 'dashboard',
                details: 'Overview',
                content: ''
            },
            {
            id: 'pane-1a',
            header: 'Administration',
            content: '',
            icon: 'settings',
            details: 'Setup, Manage & Monitor',
            isExpanded: false,
            isVisible: true,
            subpanes: [
                {
                    id: 'quickSetup.quickSetup-begin',
                    header: 'Quick setup',
                    content: '',
                    headerAddOn: 'Start here'
                }, {
                    id: 'policy.policylist',
                    header: 'Security Policies & Sets',
                    content: ''
                }, {
                    id: 'deploymentComponents',
                    header: 'Deployment Components',
                    content: '',
                    isExpanded: false,
                    subpanes: [
                        {
                            id: 'infrastructureConnectors',
                            header: 'Infrastructure Connectors',
                            content: ''
                            //bubble: '99+'
                            //isDisabled: true

                        }, {
                            id: 'ipPools',
                            header: 'IP Pools',
                            content: ''
                        },{
                            id: 'vlanPools',
                            header: 'VLAN Pools',
                            content: ''
                        }, {
                            id: 'deploymentSpecifications',
                            header: 'Deployment Specifications',
                            content: ''
                        }, {
                            id: 'virtualChassis',
                            header: 'Data Planes',
                            content: ''
                        }, {
                            id: 'managementPlane',
                            header: 'Management Plane',
                            content: ''
                        }
                    ]
                },
                 /*{
                    id: 'resourceGroups',
                    header: 'Groups',
                    content: ''
                }, {
                    id: 'managePolicies',
                    header: 'Manage Policies',
                    content: '',
                    isDisabled: false
                },*/ 
                {
                    id: 'system',
                    header: 'System',
                    content: '',
                    subpanes: [
                        {
                            id: 'shieldxUpdates',
                            header: 'Updates',
                            content: '',
                            isDisabled: false
                        }, {
                            id: 'integrations',
                            header: 'Integrations',
                            content: '',
                            isDisabled: false
                        }, {
                            id: 'logs',
                            header: 'Logs',
                            content: '',
                            isDisabled: false
                        }, {
                            id: 'setuptls.tlsdecryption',
                            header: 'TLS Inspection',
                            content: ''
                        }, {
                            id: 'notification.settings',
                            header: 'Notification',
                            content: ''
                        }, {
                            id: 'setup.settings',
                            header: 'Setup',
                            content: ''
                        }, {
                            id: 'maintenance.maintenancetasks',
                            header: 'Maintenance',
                            content: ''
                        }
                    ]
                },
                {
                    id: 'usersMain',
                    header: 'Users',
                    content: '',
                    subpanes: [
                        {
                            id: 'users',
                            header: 'Manage Users',
                            content: '',
                        }
                    ]
                },
                {
                    id: 'license',
                    header: 'License',
                    content: ''
                }, {
                    id: 'reports',
                    header: 'Reports',
                    content: ''
                }
            ]
            },
            {
                id: 'systemHealth',
                header: 'System Health tools',
                details: 'Keep system running strong',
                icon: 'images/heart-pulse.svg',
                content: '',
                subpanes: [
                    /*{
                        id: 'TroubledMicroservices',
                        header: 'Troubled Microservices',
                        content: '',
                        isDisabled: false
                    }, */
                    {
                        id: 'InventoryofMicroServices',
                        header: 'Inventory of Microservices',
                        content: '',
                        isDisabled: false
                    }
                    /*, {
                        id: 'SystemInformation',
                        header: 'System Information',
                        content: '',
                        isDisabled: false
                    }, {
                        id: 'Scaling',
                        header: 'Scaling',
                        content: ''
                    }, {
                        id: 'Throughput',
                        header: 'Throughput',
                        content: ''
                    }, {
                        id: 'Flows',
                        header: 'Flows',
                        content: ''
                    }, {
                        id: 'EventRate',
                        header: 'Event Rate',
                        content: ''
                    }*/
                ]
                //bubble: '9999+'
            }, {
                id: 'systemAnalysis',
                header: 'Security Analysis tools',
                icon: 'images/binoculars.svg',
                details: 'Correlate & Learn',
                content: '',
                subpanes: [
                    {
                        id: 'EventCorrelationExplorer',
                        header: 'Event Correlation Explorer',
                        content: '',
                        isDisabled: false
                    }, {
                        id: 'TopNDetectedThreats',
                        header: 'Top N Detected Threats',
                        content: '',
                        isDisabled: false
                    }, {
                        id: 'TopNDetectedApps',
                        header: 'Top N Detected Apps',
                        content: '',
                        isDisabled: false
                    }, {
                        id: 'TopNMalwareDomains',
                        header: 'Top N Malware Domains',
                        content: ''
                    }, {
                        id: 'TopNMalwareDetections',
                        header: 'Top N Malware Detections ',
                        content: ''
                    }, {
                        id: 'TopNBadCertificates',
                        header: 'Top N Bad Certificates',
                        content: ''
                    }, {
                        id: 'TopNAttackerResourceGroup',
                        header: 'Top N Attacker Resource Group',
                        content: ''
                    }, {
                        id: 'TopNVictimResourceGroups',
                        header: 'Top N Target Resource Groups',
                        content: ''
                    }, {
                        id: 'TopNAttackers',
                        header: 'Top N Attackers',
                        content: ''
                    }, {
                        id: 'TopNVictims',
                        header: 'Top N Victims',
                        content: ''
                    }, {
                        id: 'TopNTalkersbyVMname',
                        header: 'Top N VMs by Number of Connections',
                        content: ''
                    }, {
                        id: 'TopNTalkersbyResourceGroup',
                        header: 'Top N Resource Groups by Number of Connections',
                        content: ''
                    }, {
                        id: 'TopNBlockedClients',
                        header: 'Top N Blocked Clients',
                        content: ''
                    }, {
                        id: 'TopNServedDomains',
                        header: 'Top N Served Domains ',
                        content: ''
                    }, {
                        id: 'TopNConversations',
                        header: 'Top N VMs by Data Transferred (measured in bytes)',
                        content: ''
                    }, {
                        id: 'IOP',
                        header: 'Indicator of Pivot (I0P)',
                        content: ''
                    }, {
                        id: 'NewApplications',
                        header: 'New Applications',
                        content: ''
                    }
                ]
            }, {
                id: 'myLocker',
                icon: 'work',
                details: 'Bookmarks & Notes',
                header: 'My Locker',
                content: ''
            }
            //,
            // {
            //     id: 'networks',
            //     header: 'Networks',
            //     icon: '',
            //     content: ''
            //     //bubble: '9999+'
            // }
//            ,{
//                id: 'manage',
//                header: 'Manage',
//                content: '',
//                //isExpanded: true,
//                subpanes: [{
//                    id: 'setup',
//                    header: 'Setup',
//                    content: ''
//                },{
//                    id: 'supportability',
//                    header: 'Supportability',
//                    content: ''
//                },{
//                    id: 'integration',
//                    header: 'Integration',
//                    content: ''
//                }]
//            }
        ];
      
       //coreservices.getListOfAuthorities().then(function(data){
            renderLeftPanelMenu();
         //   $scope.$broadcast("authoritiesListavalibale",{"data":data});
       //});
      
      var menuName,menuId,auth_id,valid;
      function subpaneItemFun(data){
        var menuNameWithOutDot;
        if(data.id.indexOf('.') > 0){
            menuNameWithOutDot = data.id.substring(0, data.id.indexOf('.'));    
        }else{
         menuNameWithOutDot = data.id;    
        }
        return menuNameWithOutDot;
      }
      function getAddOnToMenuItem(Pane){
            var menuName = subpaneItemFun(Pane);
            if(menuName === 'logs'){
                menuName = menuName+"_upload";    
            }else if(menuName === "shieldxUpdates"){
                menuName = menuName+"_update";
            }else{
                menuName = menuName+"_read";       
            }
        return menuName;
      }
     // $scope.panesA = [];

        function checkSubmenuAccess(subPane) {

            menuId = getAddOnToMenuItem(subPane);
            if (menuId === "quickSetup_read") {
                var idToCheck = [];
                idToCheck.push(authorities("infrastructureConnectors_discover"));
                idToCheck.push(authorities("deploymentSpecifications_create"));
                idToCheck.push(authorities("virtualChassis_create"));
                idToCheck.push(authorities("resourceGroups_create"));
                auth_id = idToCheck;
            } else {
                auth_id = authorities(menuId);
            }
            if (subPane.id === "shieldxUpdates") {
                // idToCheck  = [];
                var auth_1 = authorities("shieldxUpdates_update");
                var auth_2 = authorities("shieldxUpdates_content_update");
                var auth_3 = authorities("shieldxUpdates_controlplane_read");
                var auth_4 = authorities("shieldxUpdates_controlplane_update");
                valid = false;
                if (userSessionMenagment.isUserAllowd(auth_1) || userSessionMenagment.isUserAllowd(auth_2) || userSessionMenagment.isUserAllowd(auth_3) || userSessionMenagment.isUserAllowd(auth_4)) {
                    valid = true;
                }
            } else if (subPane.id === "systemHealth" || subPane.id === "systemAnalysis") {
                var authdash = authorities("dashboard_read");
                valid = false;
                if (userSessionMenagment.isUserAllowd(authdash)) {
                    valid = true;
                    if (Array.isArray(subPane.subpanes)) {
                        _.each(subPane.subpanes, function(sp) {
                            sp.isVisible = valid;
                        });
                    }
                }
            } else {
                valid = userSessionMenagment.isUserAllowd(auth_id);
            }
            subPane.isVisible = valid;
        }

        function renderLeftPanelMenu() {
            _.each($scope.panesB, function(menuItem) {
                if (menuItem.id === "systemHealth" || menuItem.id === "systemAnalysis") {
                    checkSubmenuAccess(menuItem);
                } else if (Array.isArray(menuItem.subpanes)) {
                    _.each(menuItem.subpanes, function(subPane) {
                        if (Array.isArray(subPane.subpanes)) {
                            _.each(subPane.subpanes, function(subsubPane) {
                                checkSubmenuAccess(subsubPane);
                                if (subsubPane.isVisible) {
                                    subPane.isVisible = true;
                                }
                            });
                        } else {
                            checkSubmenuAccess(subPane);
                        }
                    });
                } else {
                    menuId = getAddOnToMenuItem(menuItem);
                    auth_id = authorities(menuId);
                    //valid = userSessionMenagment.isUserAllowd(auth_id);
                    menuItem.isVisible = userSessionMenagment.isUserAllowd(auth_id);
                }
                //console.log(menuItem);
            });
            $scope.panesA = angular.copy($scope.panesB);
        }
      $scope.expandCallback = function (index, id) {
        console.log('expand:', index, id);
      };

      $scope.collapseCallback = function (index, id) {
        console.log('collapse:', index, id);
      };

      $scope.$on('accordionA:onReady', function () {
        console.log('accordionA is ready!');
      });


        // manage functionality

        $scope.disableTimeout = 300*1000;

        $scope.callout = {};

        if(typeof $sessionStorage.callout !== 'undefined') $scope.callout = $sessionStorage.callout;

        $scope.currentTime = parseInt(new Date().getTime());

        $scope.disableCallout = function (calloutType) {
            if(typeof $sessionStorage.callout === 'undefined') {
                $sessionStorage.callout = {};
            }
            $sessionStorage.callout[calloutType] = new Date().getTime();

            $scope.callout = $sessionStorage.callout;

        };

        $scope.openMenu = function($mdOpenMenu, ev) {
          console.log(" openMenu  ");  
          originatorEv = ev;
          $mdOpenMenu(ev);
        };
        
        $rootScope.$on('$stateChangeStart',
            function(event, toState, toParams, fromState, fromParams){
                if(fromState.name == "home.dashboard"){
                    angular.element(document.querySelector('.headerBar')).removeClass('dark-theme');
                }
                $rootScope.previousState = fromState;
        });
        
        $scope.$on('fullscreenInit', function (event, data) {
            $scope.maximize = !$scope.maximize;
            $scope.$broadcast('fullscreen', null);
        });

//        $scope.checkCalloutEnabled = function (calloutType) {
//            if (typeof $sessionStorage.callout[calloutType] !== 'undefined') {
//                return (parseInt(new Date().getTime()) - $sessionStorage.callout[calloutType] >= $scope.disableTimeout);
//            } else {
//                $sessionStorage.callout[calloutType] = new Date().getTime();
//                return true;
//            }
//        };

    } 
     /*function leftNavCtrl($scope, $timeout, $mdSidenav, $log) {
        "ngInject";
        $scope.close = function () {
            // Component lookup should always be available since we are not using `ng-if`
            $mdSidenav('left-nav-panel').toggle()
                .then(function () {
                    $log.debug("close LEFT is done");
                });
        };
     }*/

    angular.module('shieldxApp').controller('homeCtr', homeCtr);
    //angular.module('shieldxApp').controller('leftNavCtrl', leftNavCtrl);
})();
