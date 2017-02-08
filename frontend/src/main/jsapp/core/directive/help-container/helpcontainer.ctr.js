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
    function helpcontainerDirective() {
        var directive = {};
        directive.restrict = 'E';
        directive.templateUrl = 'core/directive/help-container/helpcontainer.html';
        directive.scope = {
            helpContentID: '=contentid',
            excessComponent: '=excesscomponent'
        };
        directive.controller = ['$rootScope','$scope','$translate', function ($rootScope, $scope,$translate) {
            
            $scope.languageInUse = $translate.use();
            $scope.helpContentURL = "help/"+$scope.languageInUse+"/"+$scope.helpContentID+".html";
            $scope.isOpen = false;
            console.log("helpcontainerDirective >> "+ $scope.helpContentURL);
            console.log(" languageInUse "+$scope.languageInUse);

            $scope.$on("onHelpButtonClicked",function(event, data){
                 $scope.helpContentID = data.helpIDString;
                 $scope.openHelpPanel();
            });

            $rootScope.$on('$translateChangeSuccess', function () {
                // Language has changed
            });

            $scope.toggleHelpPanel = function(){
                 $scope.isOpen = ! $scope.isOpen;
                 $scope.loadHelpContent();
            };

            $scope.openHelpPanel = function(){
                 $scope.isOpen = false;
                 $scope.loadHelpContent();
            };

            $scope.loadHelpContent = function(){
                 console.log("loadhelp with id"+$scope.helpContentID);
                 $scope.helpContentURL = "help/"+$scope.languageInUse+"/"+$scope.helpContentID+".html";
                 console.log("helpContentURL "+$scope.helpContentURL);
                 console.dir($scope.helpContentID);
            };


            $scope.fixHelpContentHeight = function(){
//              console.log("  fixHelpContent >>>>");  
              return fixHelpContent($scope.excessComponent);
//              return 600;
            };

            

     
        }];
    return directive;
    }
    
    angular.module('shieldxApp').directive('helpcontainer', helpcontainerDirective);
})();
