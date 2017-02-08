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
    function usersCtr($scope,
        $translate,
        usersService,
        $q,
        $sessionStorage,
        $state,
        $mdDialog,
        userSessionMenagment) {
            "ngInject";
            
            clearAllSession($sessionStorage);
            var UserListData = [];
            var deferred = $q.defer();
            $scope.promise = deferred.promise; 
            $scope.promiseCompleted = true;
            var promiseCtr = 0;
            var totalUsers = 0;
            $scope.usersAvailable = false;
            $scope.editMiscState = false;
            /*$scope.freshData = (!$sessionStorage.hasOwnProperty('InfraList') || 
                    typeof $sessionStorage.InfraList === "undefined" || 
                    $sessionStorage.InfraList === false || 
                    $sessionStorage.InfraList.length === 0);*/
            
            var userCtr = 0;
            $scope.users = [];

            
            //for tables [start]
                    
            $scope.$emit('listenHeaderText', { headerText: $translate.instant('admin.toolbar.heading') });
            $scope.$emit('quickSetupEnded',{});

            /* **** for tables [start] **** */
            $scope.selected = [];
            $scope.query = {
                order: 'name',
                limit: 10,  //updated the limit from 5 to 10 for bug id QTAD-2042
                page: 1
            };


        $scope.isAdornmentPanelOpen = false;
        $scope.isSearchBarOpen = false;

        var create_id = authorities("users_create");
        var delete_id = authorities("users_delete");
        var update_id = authorities("users_update");
        $scope.is_create_user = userSessionMenagment.isUserAllowd(create_id);
        $scope.is_update_user = userSessionMenagment.isUserAllowd(update_id);
        $scope.is_delete_user = userSessionMenagment.isUserAllowd(delete_id);


        $scope.updateAdornmentPanel = function (event, rowData) {
            $scope.toggleAdornmentPanel();
            $scope.adornmentData = rowData;
            console.log($scope.adornmentData);
        };

        $scope.toggleAdornmentPanel = function () {
            $scope.isAdornmentPanelOpen = $scope.isAdornmentPanelOpen === false ? true : false;
        };

        $scope.toggleSearchBar = function (event) {
            $scope.isSearchBarOpen = $scope.isSearchBarOpen === false ? true : false;
            if ($scope.isSearchBarOpen)
                angular.element(event.currentTarget.firstElementChild).css('color', '#4a90e2');
            else
                angular.element(event.currentTarget.firstElementChild).css('color', '#6d6e71');
        };
        /* **** for tables [end] **** */

        $scope.showStatus = function (status, test) {
            return status === test;
        };

        //if ($scope.freshData) {
        $sessionStorage.UserList = [];

        usersService.getListOfUsers().then(function (data) {
            totalUsers = data.length;
            if (totalUsers === 0) {
                deferred.resolve();
                $scope.promiseCompleted = false;
                $scope.infrasAvailable = false;
            } else {
                $scope.usersAvailable = true;
                $scope.promiseCompleted = false;
                deferred.resolve();
                var login = "";
                for (var i = 0; i < data.length; i++) {

                    login = data[i].login;

                    UserListData[i] = data[i];

                }
                $scope.users = UserListData;
                console.log(UserListData);
            }

        }, function (error) {
            console.log(error);
            $scope.errorMessage = "ERROR occured while getting User List!!!";
            UserListData = [];
            $scope.users = [];
            deferred.resolve();
            $scope.promiseCompleted = false;
            $scope.usersAvailable = false;
        });



        $scope.deleteUser = function (userObj) {
            toastparam = {
                'heading': 'User deletion in progress',
                'subHeading': 'User deletion deletion initiated.',
                'type': 'progress',
                'timeout': 15000
            };
            showToast(toastparam);
            console.log(userObj);
            var toastparam = {};
            usersService.deleteUser(userObj.login).then(function (data) {
                if (data.status) {
                    //update rows
                    for (i = 0; i < UserListData.length; i++) {
                        if (UserListData[i].login === userObj.login) {
                            UserListData.splice(i, 1);
                        }
                    }
                    $sessionStorage.UserList = UserListData;
                    toastparam = {
                        'heading': 'User deleted successfully',
                        'subHeading': '',
                        'type': 'success',
                        'timeout': 5000
                    };
                    showToast(toastparam);

                } else {
                    //TODO to show message/something else;
                    toastparam = {
                        'heading': 'User deletion failed',
                        'subHeading': "Error: " + data.errorMessage,
                        'type': 'fail',
                        'timeout': 5000
                    };
                    showToast(toastparam);
                }
            }, function (error) {
                console.log(error);
                toastparam = {
                    'heading': 'User deletion failed',
                    'subHeading': "Error: " + error.data.errorMessage,
                    'type': 'fail'
                };
                showToast(toastparam);
            });
        };

        $scope.callpopupToAddUser = function (ev) {
            $mdDialog.show({
                controller: addUserPopupCtr,
                templateUrl: 'core/components/administration/users/addUser.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                fullscreen: true,
                openFrom: {top: 1100, height: 0},
                closeTo: {left: 1500}
            }).then(function () {

            });
        };

        $scope.clearUserListFromSession = function () {
            clearMasterSession($sessionStorage, $state);
            /*$sessionStorage.InfraList = false;
             $state.reload();*/
        };

        $scope.editMiscUserData = function () {
            if(typeof $scope.adornmentData.password !== "undefined") {
                $scope.adornmentData.password = null;
            }
            $scope.tempUserData = angular.copy($scope.adornmentData);
            $scope.userFormValid = false;
            $scope.editMiscState = true;
        };

        $scope.discardMiscChanges = function(){
            if (typeof $scope.adornmentData.password !== "undefined") {
                $scope.adornmentData.password = null;
            }
            $scope.editMiscState = false;
        };
        
        var updateUserStarted = {
            'heading': 'User update started',
            'subHeading': '&nbsp;',
            'type': 'progress',
            'timeout': 5000
        };

        var userUpdated = {
            'heading': 'User updated successfully',
            'subHeading': '&nbsp;',
            'type': 'success',
            'timeout': 5000,
            'callback': function () {
                $state.reload();
            }
        };

        var userUpdateFailed = {
            'heading': 'User Update failed',
            'subHeading': '&nbsp;',
            'type': 'fail',
            'timeout': 5000,
            'callback': function () {
                $state.reload();
            }
        };
        
        $scope.updateUserData = function () {
            if ($scope.editMiscState && $scope.tempUserData.password) {
                $scope.editMiscState = false;
                var userObject = {
                    "login": $scope.tempUserData.login,
                    "name": $scope.tempUserData.name,
                    "authType": $scope.tempUserData.authType,
                    "userDN": $scope.tempUserData.userDN,
                    "password": $scope.tempUserData.password,
                    "role": $scope.tempUserData.role
                };
                console.log(userObject);
                showToast(updateUserStarted);
                usersService.updateUser(userObject).then(function (response) {
                    showToast(userUpdated);
                }, function (error) {
                    userUpdateFailed.subHeading = error.data.message;
                    showToast(userUpdateFailed);
                });
            }
        };
        
        $scope.pwdType = 'password';

        $scope.role = {
                'types': [
                    {'name': 'SuperUser', 'value': 'SuperUser'},
                    {'name': 'SecurityAdministrator', 'value': 'SecurityAdministrator'},
                    {'name': 'SecurityAnalyst', 'value': 'SecurityAnalyst'},
                    {'name': 'VirtualInfraAnalyst', 'value': 'VirtualInfraAnalyst'}
                ]
            };
        
        $scope.togglePasswordType = function () {
            $scope.pwdType = $scope.pwdType === 'password' ? 'text' : 'password';
        };

        $scope.userFormValid = false;
        
        $scope.validateUserForm =  function () {
            var userData = $scope.tempUserData;
            if (
                    userData.login &&
                    userData.name &&
                    userData.authType &&
                    userData.userDN &&
                    userData.password &&
                    userData.role) {
                $scope.userFormValid = true;
            } else {
                $scope.userFormValid = false;
            }
        };

        function addUserPopupCtr($rootScope, $scope, $sessionStorage){
            
            //FUNCTIONALITY TO ADD INFRA
            $scope.active_help_id = "admin_users_manageUsers_help";
            $scope.helpButtonClicked = function(id){
                $scope.active_help_id = id;
                console.log("  helpButtonClicked ");
                $scope.bordcastEventHelpButtonClicked($scope.active_help_id);
            }; 
             $scope.bordcastEventHelpButtonClicked = function(helpId){
                $scope.$broadcast('onHelpButtonClicked', {
                 helpIDString: helpId 
                });
            };     

            $scope.pwdType = 'password';
            $scope.togglePasswordType = function () {
                $scope.pwdType = $scope.pwdType === 'password' ? 'text' : 'password';
            };

            $scope.auth_type = $translate.instant('wizarduser.label.auth_type');
            $scope.user_name = $translate.instant("wizarduser.placeholder.name");
            $scope.user_fqdn = $translate.instant("wizarduser.placeholder.fqdn");
            $scope.user_login = $translate.instant("wizarduser.placeholder.login");
            $scope.user_password = $translate.instant("wizarduser.placeholder.password");
            $scope.user_role = $translate.instant("wizarduser.placeholder.role");
            $scope.create_user = $translate.instant("wizarduser.button.create_user");


            $scope.authentication = {
                'types': [
                    {'name': 'Local', 'value': 'LOCAL'},
                    {'name': 'LDAP', 'value': 'LDAP'}
                ]
            };

            $scope.role = {
                'types': [
                    {'name': 'SuperUser', 'value': 'SuperUser'},
                    {'name': 'SecurityAdministrator', 'value': 'SecurityAdministrator'},
                    {'name': 'SecurityAnalyst', 'value': 'SecurityAnalyst'},
                    {'name': 'VirtualInfraAnalyst', 'value': 'VirtualInfraAnalyst'}
                ]
            };
            $scope.user = {};

            $scope.user.authType = 'SuperUser';

            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            
            $scope.hideRightPanel = false;

            $scope.toggleHelpPanel = function () {
                $scope.hideRightPanel = !($scope.hideRightPanel);
            };


            $scope.addUser = function () {
                console.log($scope.user);
                var userObject = $scope.user;
                var startUserCreationMessage = {
                    'heading': 'Create User',
                    'subHeading': 'This should take only a few minutes max.',
                    'type': 'progress',
                    'timeout': 5000
                };
                var successfulUserCreationMessage = {
                    'heading': 'users Created',
                    'subHeading': 'user created successfully.',
                    'type': 'success',
                    'timeout': 5000
                };
                showToast(startUserCreationMessage);
                usersService.createUser(userObject).then(function (data) {
                    if (data) {
                        var newData = userObject;

                        console.log(UserListData);
                        showToast(successfulUserCreationMessage);

                    
                        UserListData.unshift(newData);
                        console.log(UserListData);
                        $sessionStorage.UserList = UserListData;
                        $scope.users=UserListData;
                        $rootScope.$broadcast('newUsercreated', {});
                    }
                }, function (error) {
                    var failureUserCreation = {
                        'heading': 'User creation failed',
                        'subHeading': "Error: " + error.data.message,
                        'type': 'fail',
                        'timeout': 10000
                    };
                    showToast(failureUserCreation);
                });
                $mdDialog.hide();
            };


            $scope.isFormValid = function () {
                    //validate form data
                    console.log($scope.user);
                    if ($scope.user.login && $scope.user.name && $scope.user.authType &&  $scope.user.role && $scope.user.password) {
                        return true;
                    } else {
                        return false;
                    }

            
            };
        }
        $scope.$on('newUsercreated', function (event) {
            console.log($scope.query);
            $scope.query.page = 1;
        });
        $scope.$on('$viewContentLoaded', function (event) {
            console.log(event);
            fixContainerHeight(1);
        });
    }

    angular.module('shieldxApp').controller('usersCtr', usersCtr);
})();
