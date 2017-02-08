function AuthUser(){
  this.userName ="";
  this.password = "";
  this.isLoggedIn = false;
  this.role = "";
  this.token = "";
}


AuthUser.prototype.copy= function(data){
  this.userName = data.userName;
  this.password = data.password;
  this.isLoggedIn = data.isLoggedIn;
  this.role = data.role;
  this.token = data.token;
};

AuthUser.prototype.getToken= function(){
 return this.token;
};


function authorities(id){
  return authorities.list[id];
}
authorities.list = {
  quickSetup_read:"QUICKSETUP_READ",
  ipPools_read:"IPPOOL_READ", 
  ipPools_create:"IPPOOL_CREATE",
  ipPools_update:"IPPOOL_UPDATE",
  ipPools_delete:"IPPOOL_DELETE",
  infrastructureConnectors_read:"INFRA_READ",
  infrastructureConnectors_create:"INFRA_CREATE",
  infrastructureConnectors_delete:"INFRA_DELETE",
  infrastructureConnectors_update:"INFRA_UPDATE",
  infrastructureConnectors_discover:"INFRA_DISCOVER",
  vlanPools_read:"VLANPOOL_READ",
  vlanPools_create:"VLANPOOL_CREATE",
  vlanPools_delete:"VLANPOOL_DELETE",
  vlanPools_update:"VLANPOOL_UPDATE",
  deploymentSpecifications_read:"DEPLOYSPEC_READ",
  deploymentSpecifications_create:"DEPLOYSPEC_CREATE",
  deploymentSpecifications_delete:"DEPLOYSPEC_DELETE",
  deploymentSpecifications_update:"DEPLOYSPEC_UPDATE",
  virtualChassis_read:"CHASSIS_READ",
  virtualChassis_create:"CHASSIS_CREATE",
  virtualChassis_delete:"CHASSIS_UPDATE",
  virtualChassis_update:"CHASSIS_UPDATE",
  virtualChassis_check:"CHASSIS_CHECK",
  virtualChassis_deploy:"CHASSIS_DEPLOY",
  resourceGroups_read:"RG_READ",
  resourceGroups_create:"RG_CREATE",
  resourceGroups_delete:"RG_DELETE",
  resourceGroups_update:"RG_UPDATE", 
  shieldxUpdates_update:"SOFTWARE_UPGRADE",
  shieldxUpdates_content_update:"CONTENT_UPDATE",
  shieldxUpdates_controlplane_read:"CONTROLPLANE_READ",
  shieldxUpdates_controlplane_update:"CONTROLPLANE_UPDATE",
  integrations_read:"INTEGRATIONS_READ",
  integrations_update:"INTEGRATIONS_UPDATE",
  logs_upload:"LOG_UPLOAD",
  policy_read:"POLICY_READ",
  policy_create:"POLICY_CREATE",
  policy_delete:"POLICY_DELETE",
  policy_update:"POLICY_UPDATE",
  setuptls_read:"TLS_IMPORT_KEYS",
  setuptls_read_public_keys:"TLS_GET_KEYS",
  setuptls_generate_default_keys:"TLS_UPDATE_KEYS",
  setup_read:"SETUP_READ",
  setup_update:"SETUP_UPDATE",
  notification_read:"SETUP_READ",
  notification_update:"SETUP_UPDATE",
  license_read:"SETUP_READ",
  license_update:"SETUP_UPDATE",
  reports_read:"SETUP_READ",
  maintenance_read:"MAINTENANCE_READ",
  maintenance_update:"MAINTENANCE_UPDATE",
  users_read:"USER_READ",
  users_create:"USER_CREATE",
  users_delete:"USER_DELETE",
  users_update:"USER_UPDATE",
  dashboard_read:"DASHBOARD_READ",
  dashboard_create:"DASHBOARD_CREATE",
  networks_read:"NETWORK_READ",
  analysis_read:"ANALYSIS_READ",
  myLocker_read:"MYLOCKER_READ",
  aboutUs_read:"ABOUTUS_READ"
};

