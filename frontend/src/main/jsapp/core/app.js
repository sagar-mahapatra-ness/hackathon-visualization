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
var angular;

WebFontConfig = {
    google: { families: [ 'Roboto::latin' ] }
};
(function() {
    var wf = document.createElement('script');
    wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
})();

angular
    .module('shieldxApp', [
        'ngMaterial', 
        'ngMessages',
        'ui.router', 
        'md.data.table',
        'shieldxApp.config',
        'restangular',
        'pascalprecht.translate',
        'ngAnimate',
        'vAccordion',
        'dragularModule',
        'ngStorage',
        'gridster',
        'mdPickers',
        'ngSanitize',
        'ngCsv','ngWebworker'])
    .config(function($mdThemingProvider, $mdIconProvider){
        "ngInject";

        var shieldXPrimary = {
            '50': '#fbfbfb',
            '100': '#fbfbfb', // light-grey 3
            '200': '#f7f7f7', // light-grey 2
            '300': '#ff2f3a',
            '400': '#eeeeee', // light-grey 1
            '500': '#fb000d',
            '600': '#6d6e71', // slate-grey
            '700': '#c8000a',
            '800': '#ae0009',
            '900': '#950008',
            'A100': '#ff959a',
            'A200': '#ffaeb3',
            'A400': '#ffc8cb',
            'A700': '#7b0006'
        };
        $mdThemingProvider.definePalette('shieldXPrimary',shieldXPrimary);

            var shieldXAccent = {
                '50': '#000a08',
                '100': '#00231d',
                '200': '#003d31',
                '300': '#005646',
                '400': '#4a90e2', // faded-orange
                '500': '#00896f',
                '600': '#00bc97',
                '700': '#00d6ac',
                '800': '#00efc0',
                '900': '#0affcf',
                'A100': '#f3c444', // maize
                'A200': '#01bcb1', // turquoise
                'A400': '#4a90e2', // tomato
                'A700': '#4a90e2'
            };
            $mdThemingProvider.definePalette('shieldXAccent', shieldXAccent);

        var shieldXWarn = {
            '50': '#ffb280',
            '100': '#ffa266',
            '200': '#ff934d',
            '300': '#ff8333',
            '400': '#e74c3c', // tomato 
            '500': '#ff6400',
            '600': '#ee1c25', // pinkish-red
            '700': '#cc5000',
            '800': '#b34600',
            '900': '#993c00',
            'A100': '#ffc199',
            'A200': '#ffd1b3',
            'A400': '#ffe0cc',
            'A700': '#e74c3c'
            };
        $mdThemingProvider.definePalette('shieldXWarn',shieldXWarn);

        $mdThemingProvider.theme('default')
            .primaryPalette('shieldXPrimary', {
                'default': '400', // light-grey 1
                'hue-1': '100', // light-grey 3
                'hue-2': '200', // light-grey 2
                'hue-3': '600' // slate-grey
            })
            .accentPalette('shieldXAccent', {
                'default' : '400',
                'hue-1': 'A100', 
                'hue-2': 'A200', 
                'hue-3': 'A400'
            })
            .warnPalette('shieldXWarn', {
                'default' : '400',
                'hue-1': '600',
            });

        // $mdThemingProvider.theme('default')
        // .primaryPalette('grey');
    })
    .config(['$translateProvider', function($translateProvider) {
        $translateProvider.useSanitizeValueStrategy('escape');
        $translateProvider.useStaticFilesLoader({
          prefix: '/languages/locale-',
          suffix: '.json'
        });

        $translateProvider.preferredLanguage('us');
    }])
    .config(function($stateProvider, $urlRouterProvider, $httpProvider) {
        "ngInject";

       

        $stateProvider.state('home', {
            controller: 'homeCtr',
            abstract: true,
            controllerAs: 'homeCtr',
            templateUrl: 'core/components/home.html'
        });

         $stateProvider.state('landingpage', {
            url: '/landingpage',
            controller: 'landingPageCtr',
            controllerAs: 'landingPageCtr',
            templateUrl: 'core/components/landingpage/landingpage.html'
        });

        $stateProvider.state('home.quickSetup',{
            url: '/quickSetup',
            controller: 'quickSetupCtr',
            controllerAs: 'quickSetupCtr',
            templateUrl: 'core/components/administration/quick-setup/quick-setup.html'
        });

        $stateProvider.state('home.aboutUs',{
            url: '/aboutUs',
            controller: 'aboutUsCtr',
            controllerAs: 'aboutUsCtr',
            templateUrl: 'core/components/aboutus/aboutUS.html'
        });

        $stateProvider.state('home.infrastructureConnectors',{
            url: '/infrastructureConnectors',
            controller: 'infrastructureConnectorsCtr',
            controllerAs: 'infrastructureConnectorsCtr',
            templateUrl: 'core/components/administration/infrastructure-connectors/infrastructure-connectors.html'
        });

        $stateProvider.state('home.ipPools',{
            url: '/ipPools',
            controller: 'ipPoolsCtr',
            controllerAs: 'ipPoolsCtr',
            templateUrl: 'core/components/administration/ip-pools/ip-pools.html'
        });

        $stateProvider.state('home.ipPoolId', {
            url: "/ipPools/:poolId",
            controller: 'ipPoolsCtr',
            controllerAs: 'ipPoolsCtr',
            templateUrl: 'core/components/administration/ip-pools/ip-pools.html'
        });
        
        $stateProvider.state('home.vlanPools',{
            url: '/vlanPools',
            controller: 'vlanPoolsCtr',
            controllerAs: 'vlanPoolsCtr',
            templateUrl: 'core/components/administration/vlan-pools/vlan-pools.html'
        });

        $stateProvider.state('home.vlanPoolId', {
            url: "/vlanPools/:vlanId",
            controller: 'vlanPoolsCtr',
            controllerAs: 'vlanPoolsCtr',
            templateUrl: 'core/components/administration/vlan-pools/vlan-pools.html'
        });
        
        $stateProvider.state('home.deploymentSpecifications',{
            url: '/deploymentSpecifications',
            controller: 'deploymentSpecificationsCtr',
            controllerAs: 'deploymentSpecificationsCtr',
            templateUrl: 'core/components/administration/deployment-specifications/deployment-specifications.html'
        });

        $stateProvider.state('home.deploymentSpecificationById',{
            url: '/deploymentSpecifications/:deploySpecId',
            controller: 'deploymentSpecificationsCtr',
            controllerAs: 'deploymentSpecificationsCtr',
            templateUrl: 'core/components/administration/deployment-specifications/deployment-specifications.html'
        });

        $stateProvider.state('home.virtualChassis',{
            url: '/virtualChassis',
            controller: 'listVirtualChassisCtr',
            controllerAs: 'listVirtualChassisCtr',
            templateUrl: 'core/components/administration/virtual-chassis/virtual-chassis.html'
        });

        $stateProvider.state('home.managementPlane',{
            url: '/managementPlane',
            controller: 'managementPlaneCtr',
            controllerAs: 'managementPlaneCtr',
            templateUrl: 'core/components/administration/management-plane/management-plane.html'
        });

        $stateProvider.state('home.resourceGroups',{
            url: '/resourceGroups',
            controller: 'resourceGroupsCtr',
            controllerAs: 'resourceGroupsCtr',
            templateUrl: 'core/components/administration/resource-groups/resource-groups.html'
        });
        
        $stateProvider.state('home.resourceGroupById',{
            url: '/resourceGroups/:rgId',
            controller: 'resourceGroupsCtr',
            controllerAs: 'resourceGroupsCtr',
            templateUrl: 'core/components/administration/resource-groups/resource-groups.html'
        });

       /* $stateProvider.state('home.managePolicies',{
            url: '/managePolicies',
            controller: 'managePoliciesCtr',
            controllerAs: 'managePoliciesCtr',
            templateUrl: 'core/components/administration/manage-policies/manage-policies.html'
        });*/

        $stateProvider.state('home.shieldxUpdates',{
            url: '/shieldxUpdates',
            controller: 'shieldxUpdatesCtr',
            controllerAs: 'shieldxUpdatesCtr',
            templateUrl: 'core/components/administration/shieldx-updates/shieldx-updates.html'
        });

        $stateProvider.state('home.integrations',{
            url: '/integrations',
            controller: 'integrationsCtr',
            controllerAs: 'integrationsCtr',
            templateUrl: 'core/components/administration/integrations/integrations.html'
        });

        $stateProvider.state('home.logs',{
            url: '/logs',
            controller: 'logsCtr',
            controllerAs: 'logsCtr',
            templateUrl: 'core/components/administration/logs/logs.html'
        });

        $stateProvider.state('home.networks',{
            url: '/networks',
            controller: 'networksCtr',
            controllerAs: 'networksCtr',
            templateUrl: 'core/components/networks/networks.html'
        });

        $stateProvider.state('home.dashboard',{
            url: '/dashboard',
            controller: 'dashboardCtr',
            controllerAs: 'dashboardCtr',
            templateUrl: 'core/components/dashboard/dashboard.html'
        });

        $stateProvider.state('home.EventCorrelationExplorer',{
            url: '/analysis',
            controller: 'analysisCtr',
            controllerAs: 'analysisCtr',
            templateUrl: 'core/components/analysis/analysis.html'
        });

        $stateProvider.state('home.sslkeys',{
            url: '/sslkeys',
            controller: 'sslkeysCtr',
            controllerAs: 'sslkeysCtr',
            templateUrl: 'core/components/administration/sslkeys/sslkeys.html'
        });

        $stateProvider.state('home.license', {
            url: '/license',
            controller: 'licenseCtr',
            controllerAs: 'licenseCtr',
            templateUrl: 'core/components/administration/license/license.html'
        });

        $stateProvider.state('home.reports', {
            url: '/reports',
            controller: 'reportsCtr',
            controllerAs: 'reportsCtr',
            templateUrl: 'core/components/administration/reports/report-configuration.html'
        });

        $stateProvider.state('home.setuptls', {
            url: '/setuptls',
            abstract:true,
            controller: 'setupTlsCtr',
            controllerAs: 'setupTlsCtr',
            templateUrl: 'core/components/administration/sslkeys/setup-tls.html'
        });
        $stateProvider.state('home.setuptls.tlsdecryption', {
            url: '/tlsdecryption',
            controller: 'tlsDecryptionCtr',
            templateUrl: 'core/components/administration/sslkeys/tlsdecryption.html',
        });
        
        $stateProvider.state('home.setuptls.tlsdecryption.inboundkeys', {
            url: '/inboundkeys',
            views: {
                'inboundwebserverkeys': {
                    controller: 'sslkeysCtr',
                    controllerAs: 'sslkeysCtr',
                    templateUrl: 'core/components/administration/sslkeys/sslkeys.html'
                }
             },
            data: {
                 'selectedTab': 0
             },
        });        
        $stateProvider.state('home.setuptls.tlsdecryption.outboundkeys', {
            url: '/outboundkeys',
            views: {
                'resigningcerts': {
                    controller: 'resigningkeysCtr',
                    controllerAs: 'resigningkeysCtr',
                    templateUrl: 'core/components/administration/sslkeys/resigningkeys.html'
                }
             },
            data: {
                 'selectedTab': 1
             },
        }); 


        $stateProvider.state('home.myLocker',{
            url: '/myLocker',
            controller: 'myLockerCtr',
            controllerAs: 'myLockerCtr',
            templateUrl: 'core/components/my-locker/my-locker.html'
        });

		
        $stateProvider.state('home.notification', {
            url: '/notification',
            abstract:true,
            controller: 'notificationCtr',
            controllerAs: 'notificationCtr',
            templateUrl: 'core/components/administration/notification/notification.html'
        });		
        $stateProvider.state('home.notification.settings', {
            url: '/notificationSettingsCtr',
            controller: 'notificationSettingsCtr',
            templateUrl: 'core/components/administration/notification/notification-settings.html',
        });

        $stateProvider.state('home.notification.settings.syslog', {
            url: '/syslog',
            views: {
                'syslognotificationprofile': {
                    controller: 'syslogforwarderCtr',
                    controllerAs: 'syslogforwarderCtr',
                    templateUrl: 'core/components/administration/notification/syslogprofiles.html'
                }
             },
            data: {
                 'selectedTab': 0
             },
        });        
        $stateProvider.state('home.notification.settings.email', {
            url: '/email',
            views: {
                'emailnotificationprofile': {
                    controller: 'emailnotificationCtr',
                    controllerAs: 'emailnotificationCtr',
                    templateUrl: 'core/components/administration/notification/email-notification.html'
                }
             },
            data: {
                 'selectedTab': 1
             },
        }); 

		
        $stateProvider.state('home.setup', {
            url: '/setup',
            abstract:true,
            controller: 'setupCtr',
            controllerAs: 'setupCtr',
            templateUrl: 'core/components/administration/setup/setup.html'
        });
        $stateProvider.state('home.setup.settings', {
            url: '/settings',
            controller: 'settingsCtr',
            templateUrl: 'core/components/administration/setup/settings.html',
        });
        
        $stateProvider.state('home.setup.settings.smbserver', {
            url: '/smbserver',
            views: {
                'smbserversettings': {
                    controller: 'smbServerSettingsCtr',
                    controllerAs: 'smbServerSettingsCtr',
                    templateUrl: 'core/components/administration/setup/smbserver-settings.html'
                }
             },
            data: {
                 'selectedTab': 0
             },
        });        
        $stateProvider.state('home.setup.settings.syslog', {
            url: '/syslog',
            views: {
                'syslogserversettings': {
                    controller: 'syslogServerSettingsCtr',
                    controllerAs: 'syslogServerSettingsCtr',
                    templateUrl: 'core/components/administration/setup/syslogservers.html'
                }
             },
            data: {
                 'selectedTab': 1
             },
        });        
        $stateProvider.state('home.setup.settings.emailserver', {
            url: '/emailserver',
            views: {
                'emailserversettings': {
                    controller: 'emailServerSettingsCtr',
                    controllerAs: 'emailServerSettingsCtr',
                    templateUrl: 'core/components/administration/setup/emailserver-settings.html'
                }
             },
            data: {
                 'selectedTab': 2
             },
        }); 
        $stateProvider.state('home.setup.settings.ldapserver', {
            url: '/ldapserver',
            views: {
                'ldapserversettings': {
                    controller: 'ldapServerSettingsCtr',
                    controllerAs: 'ldapServerSettingsCtr',
                    templateUrl: 'core/components/administration/setup/ldapserver-settings.html'
                }
             },
            data: {
                 'selectedTab': 3
             },
        }); 

        $stateProvider.state('home.users',{
            url: '/users',
            controller: 'usersCtr',
            controllerAs: 'usersCtr',
            templateUrl: 'core/components/administration/users/users.html'
        });      


        $stateProvider.state('home.maintenance', {
            url: '/maintenance',
            abstract:true,
            controller: 'maintenanceCtr',
            controllerAs: 'maintenanceCtr',
            templateUrl: 'core/components/administration/maintenance/maintenance.html'
        });
        $stateProvider.state('home.maintenance.maintenancetasks', {
            url: '/maintenancetasks',
            controller: 'maintenanceTasksCtr',
            templateUrl: 'core/components/administration/maintenance/maintenance-tasks.html',
        });
        
        $stateProvider.state('home.maintenance.maintenancetasks.backup', {
            url: '/backupnow',
            views: {
                'backupnow': {
                    controller: 'backupRestoreCtr',
                    controllerAs: 'backupRestoreCtr',
                    templateUrl: 'core/components/administration/maintenance/backupconfigdata.html'
                }
            },
            data:{
                'selectedTab': 0
            }
        });
        $stateProvider.state('home.maintenance.maintenancetasks.schedulebackup', {
            url: '/schedule-backup',
            views: {
               'schedulebackup': {
                    controller: 'backupSchedulerCtr',
                    controllerAs: 'backupSchedulerCtr',
                    templateUrl: 'core/components/administration/maintenance/backup-scheduler.html'
                }
            },
            data: {
                 'selectedTab': 1
            },
        });
        $stateProvider.state('home.maintenance.maintenancetasks.restore', {
            url: '/restore',
            views: {
                 'restorebackup': {
                    controller: 'backupRestoreCtr',
                    controllerAs: 'backupRestoreCtr',
                    templateUrl: 'core/components/administration/maintenance/restore-data.html'
                }
            },
            data: {
                 'selectedTab': 2
            },
        });
        /*
        $stateProvider.state('home.maintenance.maintenancetasks.schedulepruning', {
            url: '/schedule-pruning',
            views: {
                'schedulepruning': {
                    controller: 'pruningSchedulerCtr',
                    controllerAs: 'pruningSchedulerCtr',
                    templateUrl: 'core/components/administration/maintenance/pruning-scheduler.html'
                }
             },
            data: {
                 'selectedTab': 3
             },
        });
        */
        $stateProvider.state('home.maintenance.maintenancetasks.autocontentdownload', {
            url: '/autocontentdownload',
            views: {
                'autocontentdownload': {
                    controller: 'contentDownloadSchedulerCtr',
                    controllerAs: 'contentDownloadSchedulerCtr',
                    templateUrl: 'core/components/administration/maintenance/content-scheduler.html'
                }
             },
            data: {
                 'selectedTab': 3
             },
        });

        $stateProvider.state('home.policy', {
            url: '/policy',
            abstract:true,
            controller: 'policyCtr',
            controllerAs: 'policyCtr',
            templateUrl: 'core/components/administration/policy/policy.html'
        });
        $stateProvider.state('home.policy.policylist', {
            url: '/policies',
            controller: 'policyListCtrl',
            templateUrl: 'core/components/administration/policy/policy-list.html',
        });
        /*newPolicy  and duplicated variables will be usefull to distigiush between newly created policies*/
        $stateProvider.state('home.policy.policylist.malware', {
            url: '/malwarePolicy/:newPolicy/:duplicated',
            views: {
                'malware': {
                    controller: 'malwarePolicyCtr',
                    controllerAs: 'malwarePolicyCtr',
                    templateUrl: 'core/components/administration/policy/malware/malware.html'
                }
            },
            data:{
                'selectedTab': 2
            }
        });
        $stateProvider.state('home.policy.policylist.accesscontrol', {
            url: '/accesscontrolepolicy/:newPolicy/:duplicated',
            views: {
               'accesscontrol': {
                    controller: 'accessPolicyCtr',
                    controllerAs: 'accessPolicyCtr',
                    templateUrl: 'core/components/administration/policy/acl/access-policy.html'
                }
            },
            data: {
                 'selectedTab': 0
            },
        });
        $stateProvider.state('home.policy.policylist.threatdetection', {
            url: '/threatdetection/:newPolicy/:duplicated',
            views: {
                 'threatdetection': {
                     controller: 'threatDetectionCtr',
                     controllerAs: 'threatDetectionCtr',
                     templateUrl: 'core/components/administration/policy/threat-detection.html'
                 }
             },
            data: {
                 'selectedTab': 1
             },
        });

        $stateProvider.state('home.policy.policylist.securitypolicyset', {
            url: '/securitypolicyset/:newPolicy/:duplicated',
            views: {
                 'securitypolicyset': {
                     controller: 'spsPolicyListCtr',
                     controllerAs: 'spsPolicyListCtr',
                     templateUrl: 'core/components/administration/policy/sps-policy-list.html'
                 }
             },
            data: {
                 'selectedTab': 3
             },
        });

        $stateProvider.state('home.policy.policylist.globalthreat', {
            url: '/globalthreat',
            views: {
                 'globalthreat': {
                     controller: 'globalThreatCtr',
                     controllerAs: 'globalThreatCtr',
                     templateUrl: 'core/components/administration/policy/global/global-threat.html'
                 }
             },
            data: {
                 'selectedTab': 4
             },
        });

        $stateProvider.state('home.policy.threatdetectiondetail', {
            url: '/threatdetectiondetails/:policyId',
            templateUrl: 'core/components/administration/policy/threatdetection-details.html',
            controller: 'threatDetectionDetailCtr',
            params:{tenantData:null, policyobject:null,existingrules: null}

        });
        $stateProvider.state('home.policy.addthreatdetection', {
            url: '/threatdetection/addnew',
            templateUrl: 'core/components/administration/policy/threatdetection-new.html',
            controller: 'newthreatDetectionCtr',
            params : { existingrules: null, policyobject:null}
        });
        $stateProvider.state('home.policy.addthreatdetectionrule', {
            url: '/threatdetection/addnewrule',
            templateUrl: 'core/components/administration/policy/addnewrule.html',
            controller: 'newthreatRuleCtr',
            params : { ruleobject: null, policyobject:null,existingrules:null},
        });
        $stateProvider.state('home.policy.viewallthreat', {
            url: '/threatdetection/viewallthreat/:policyId',
            templateUrl: 'core/components/administration/policy/viewallthreat.html',
            controller: 'allthreatsCtr'
        });
        $stateProvider.state('home.policy.malwaredetail', {
            url: '/malwarepolicydetails/:policyId',
            controller: 'malwarePolicyDetailCtr',
            controllerAs: 'malwarePolicyDetailCtr',
            templateUrl: 'core/components/administration/policy/malware/malware-details.html'
        });
        $stateProvider.state('home.policy.accesspolicydetail', {
            url: '/accesscontrolpolicy/:policyId',
            templateUrl: 'core/components/administration/policy/acl/acl-policy-details.html',
            controller: 'aclPolicyDetailsCtr',
            controllerAs: 'aclPolicyDetailsCtr',
        });
        $stateProvider.state('home.policy.policydetail', {
            url: '/policydetail/:policyId',
            templateUrl: 'core/components/administration/policy/policy-details.html',
            controller: 'editPolicyCtr',
            controllerAs: 'editPolicyCtr',
           /* views: {
                'malware': {
                   // controller: 'malwarePolicyDetalCtr',
                    //controllerAs: 'malwarePolicyCtr',
                    templateUrl: 'core/components/administration/policy/malware-details.html'
                }
            }*/
        });
//        $stateProvider.state('home.policy.editpolicydetail', {
//            url: '/editpolicydetail',
//            templateUrl: 'core/components/administration/policy/policy-details.html',
//            controller: 'editPolicyCtr',
//            controllerAs: 'editPolicyCtr'
//           /* views: {
//                'malware': {
//                   // controller: 'malwarePolicyDetalCtr',
//                    //controllerAs: 'malwarePolicyCtr',
//                    templateUrl: 'core/components/administration/policy/malware-details.html'
//                }
//            }*/
//        });
        $stateProvider.state('home.policy.addpolicydetail', {
            url: '/addpolicydetail',
            templateUrl: 'core/components/administration/policy/add-policy-details.html'
           /* views: {
                'malware': {
                   // controller: 'malwarePolicyDetalCtr',
                    //controllerAs: 'malwarePolicyCtr',
                    templateUrl: 'core/components/administration/policy/malware-details.html'
                }
            }*/
        });
        $stateProvider.state('home.quickSetup.quickSetup-begin', {
            url: '/quickSetup-begin',
            controller: 'quickSetupBeginCtr',
            controllerAs: 'quickSetupBeginCtr',
            templateUrl: 'core/components/administration/quick-setup/quick-setup-begin/quick-setup-begin.html',
            data : {
                'displayName': 'Quick Setup'
            }
        });
        
        $stateProvider.state('home.quickSetup.infrastructure-connector', {
            url: '/infrastructure-connector',
            controller: 'infrastructureConnectorCtr',
            controllerAs: 'infrastructureConnectorCtr',
            templateUrl: 'core/components/administration/quick-setup/infrastructure-connector/infrastructure-connector.html',
            data : {
                'displayName': 'Infrastructure Access'
            }
        });

        $stateProvider.state('home.quickSetup.deployment-specifications', {
            url: '/deployment-specifications',
            controller: 'deploymentSpecificationCtr',
            controllerAs: 'deploymentSpecificationCtr',
            templateUrl: 'core/components/administration/quick-setup/deployment-specification/deployment-specification.html',
            data: {
                'displayName': 'Deployment Specifications'
            }
        });

        $stateProvider.state('home.quickSetup.virtual-chassis', {
            url: '/virtual-chassis',
            controller: 'virtualChassisCtr',
            controllerAs: 'virtualChassisCtr',
            templateUrl: 'core/components/administration/quick-setup/virtual-chassis/virtual-chassis.html',
            data: {
                'displayName': 'Virtual Chassis'
            }
        });

        $stateProvider.state('home.quickSetup.monitor-networks', {
            url: '/monitor-networks',
            controller: 'monitorNetworksCtr',
            controllerAs: 'monitorNetworksCtr',
            templateUrl: 'core/components/administration/quick-setup/monitor-networks/monitor-networks.html',
            data: {
                'displayName': 'Monitor Networks'
            }
        });
        $stateProvider.state('home.quickSetup.ip-pools-management', {            
            url: '/ip-pools-management',
            controller: 'ipPoolsManagementCtr',
            controllerAs: 'ipPoolsManagementCtr',
            templateUrl: 'core/components/administration/quick-setup/ip-pools/ip-pools-management.html',
            data : {
                'displayName': 'IP Addressing Management'
            }
        });
    
        $stateProvider.state('home.quickSetup.ip-pools-backplane', {            
            url: '/ip-pools-backplane',
            controller: 'ipPoolsBackPlaneCtr',
            controllerAs: 'ipPoolsBackPlanelCtr',
            templateUrl: 'core/components/administration/quick-setup/ip-pools/ip-pools-backplane.html',
            data : {
                'displayName': 'IP Addressing Bacckplane'
            }
        });


       $stateProvider.state("addvirtualChassis", {
            views:{
              "addchassiscontainer": {
                templateUrl: "core/components/administration/virtual-chassis/add-virtual-chassis-container.html"
              }
            },
            abstract: true
         });

      $stateProvider.state("addvirtualChassis.newvc", {
        views:{
          "addchassis": {
            templateUrl: "core/components/administration/virtual-chassis/addVitualChassisNew.html"
          }
        }
      });

       $stateProvider.state("addvirtualChassis.newrc", {
        views:{
          "addchassis": {
            templateUrl: "core/components/administration/virtual-chassis/addVirtualChassisneResourceGroup.html"
          }
        }
      });


    $stateProvider.state("addrulecontainer", {
        views:{
          "addrulecontainer": {
            templateUrl: "core/components/administration/resource-groups/add-rule-container.html"
          },
          abstract: true
        }
      });

     $stateProvider.state("addrulecontainer.infra", {
        views:{
          "addrulecontainerchield": {
            templateUrl: "core/components/administration/resource-groups/add-new-rule-infra.html"
          }
        }
      }); 

     $stateProvider.state("addrulecontainer.rule", {
        views:{
          "addrulecontainerchield": {
            templateUrl: "core/components/administration/resource-groups/add-new-rule.html"
          }
        }
      }); 
     $stateProvider.state('home.TopNDetectedThreats', {
        url: '/'+WidgetName.TopNDetectedThreats+'',
        templateUrl: 'core/directive/widget-painter/drilldown-collection/TopNDetectedThreats/TopNDetectedThreats.html',
    });
    $stateProvider.state('home.TopNDetectedApps', {
        url: '/'+WidgetName.TopNDetectedApps+'',
        templateUrl: 'core/directive/widget-painter/drilldown-collection/TopNDetectedApps/TopNDetectedApps.html',
    });
     $stateProvider.state('home.TopNMalwareDomains', {
        url: '/'+WidgetName.TopNMalwareDomains+'',
        templateUrl: 'core/directive/widget-painter/drilldown-collection/TopNMalwareDomains/TopNMalwareDomains.html',
    });
     $stateProvider.state('home.TopNMalwareDetections', {
        url: '/'+WidgetName.TopNMalwareDetections+'',
        templateUrl: 'core/directive/widget-painter/drilldown-collection/TopNMalwareDetections/TopNMalwareDetections.html',
    });
    $stateProvider.state('home.TopNBadCertificates', {
        url: '/'+WidgetName.TopNBadCertificates+'',
        templateUrl: 'core/directive/widget-painter/drilldown-collection/TopNBadCertificates/TopNBadCertificates.html',
    });
    $stateProvider.state('home.TopNAttackerResourceGroup', {
        url: '/'+WidgetName.TopNAttackerResourceGroups+'',
        templateUrl: 'core/directive/widget-painter/drilldown-collection/TopNAttackerResourceGroups/TopNAttackerResourceGroups.html',
    });
    $stateProvider.state('home.TopNVictimResourceGroups', {
        url: '/'+WidgetName.TopNVictimResourceGroups+'',
        templateUrl: 'core/directive/widget-painter/drilldown-collection/TopNVictimResourceGroups/TopNVictimResourceGroups.html',
    });
    $stateProvider.state('home.TopNAttackers', {
        url: '/'+WidgetName.TopNAttackers+'',
        templateUrl: 'core/directive/widget-painter/drilldown-collection/TopNAttackers/TopNAttackers.html',
    });
    $stateProvider.state('home.TopNVictims', {
        url: '/'+WidgetName.TopNVictims+'',
        templateUrl: 'core/directive/widget-painter/drilldown-collection/TopNVictims/TopNVictims.html',
    });
    $stateProvider.state('home.TopNTalkersbyVMname', {
        url: '/'+WidgetName.TopNTalkersbyVMname+'',
        templateUrl: 'core/directive/widget-painter/drilldown-collection/TopNTalkersbyVMname/TopNTalkersbyVMname.html',
    });
    $stateProvider.state('home.TopNTalkersbyResourceGroup', {
        url: '/'+WidgetName.TopNTalkersbyResourceGroup+'',
        templateUrl: 'core/directive/widget-painter/drilldown-collection/TopNTalkersbyResourceGroup/TopNTalkersbyResourceGroup.html',
    });
    $stateProvider.state('home.TopNBlockedClients', {
        url: '/'+WidgetName.TopNBlockedClients+'',
        templateUrl: 'core/directive/widget-painter/drilldown-collection/TopNBlockedClients/TopNBlockedClients.html',
    });
    $stateProvider.state('home.TopNServedDomains', {
        url: '/'+WidgetName.TopNServedDomains+'',
        templateUrl: 'core/directive/widget-painter/drilldown-collection/TopNServedDomains/TopNServedDomains.html',
    });
    $stateProvider.state('home.TopNConversations', {
        url: '/'+WidgetName.TopNConversations+'',
        templateUrl: 'core/directive/widget-painter/drilldown-collection/TopNConversations/TopNConversations.html',
    });
    $stateProvider.state('home.IOP', {
        url: '/'+WidgetName.IOP+'',
        templateUrl: 'core/directive/widget-painter/drilldown-collection/IOP/IOP.html',
    });
    $stateProvider.state('home.InventoryofMicroServices', {
        url: '/'+WidgetName.InventoryofMicroServices+'',
        templateUrl: 'core/directive/widget-painter/drilldown-collection/InventoryofMicroServices/InventoryofMicroServices.html',
    });
    $stateProvider.state('home.NewApplications', {
        url: '/'+WidgetName.NewApplications+'',
        templateUrl: 'core/directive/widget-painter/drilldown-collection/NewApplications/NewApplications.html',
    });  
    
      $urlRouterProvider.otherwise('analysis');  
      // $urlRouterProvider.otherwise('quickSetup/quickSetup-begin');
    }).config(function(RestangularProvider) {
        "ngInject";
        RestangularProvider.setBaseUrl('/shieldxapi/');
        RestangularProvider.setDefaultHeaders({
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        });
        console.log("the RestangularProvider has this ",RestangularProvider);
        /*RestangularProvider.setErrorInterceptor(function(response, deferred, responseHandler) {
            console.log("I run for every request which throws error");
            if(response.status === 500) {
                console.log("error is catched");

                //return false; // error handled return false incase of the error is handled and no further operation is required, but we also need the regular implementation that we had hence commenting this
            }

            return true; // error not handled
        });*/
        //console.log("dialog obj ",$mdDialog);
    });
