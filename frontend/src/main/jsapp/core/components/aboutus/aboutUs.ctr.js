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

(function() {
    function aboutUsCtr($scope,
        $state,
        $translate) {
        "ngInject";

        $scope.$emit('listenHeaderText', {headerText: 'About the ShieldX Product'});

        $scope.filterByTopic = null;
        $scope.openSearchBox = false;
        $scope.allTopics = ["topic 1", "topic 2", "topic 3", "topic 4", "topic 5", "topic 6"];
        $scope.galleryLimit = Math.floor(window.innerWidth / 360);
        $scope.videos = [{
                "title": "ShieldX Technology Overview",
                "details": "one",
                "topics": ["topic 3", "topic 2"],
                "src": "videos/shieldx_intro_animation.mp4"
            },
            {
                "title": "ShieldX Infrastructure Discovery",
                "details": "two",
                "topics": [
                    "topic 1",
                    "topic 5"
                ],
                "src": ""
            },
            {
                "title": "ShieldX Security Orchestration Policy",
                "details": "three",
                "topics": ["topic 1", "topic 2"],
                "src": ""
            },
            {
                "title": "Headline4",
                "details": "four",
                "topics": ["topic 1"],
                "src": ""
            },
            {
                "title": "Headline5",
                "details": "five",
                "topics": ["topic 6", "topic 3"],
                "src": ""
            },
            {
                "title": "Headline6",
                "details": "six",
                "topics": ["topic 4", "topic 5"],
                "src": ""
            }
        ];
        $scope.featured = $scope.videos[0];
        $scope.change = function() {
            if ($scope.filterByTopic === null) {
                $scope.filterByTopic = '';
            } else if ($scope.filterByTopic === '') {
                $scope.filterByTopic = null;
            }
        };

        $scope.selectTopic = function(value) {
            if (value == $scope.filterByTopic) {
                $scope.filterByTopic = null;
            } else {
                $scope.filterByTopic = value;
            }
        };
        $scope.isFireFox = function(){

            return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
        };
    }

    angular.module('shieldxApp').controller('aboutUsCtr', aboutUsCtr);

})();
