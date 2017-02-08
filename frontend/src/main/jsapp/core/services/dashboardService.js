  (function() {
      function dashbordService(getDataService, authRestangular) {
          "ngInject";

          this.saveDashboardDataToServer = function(tenantId, dashbordData) {
              var path = "manage/" + tenantId + "/dashboardsettings";
              getDataService.makeRESTDataCall('POST', path, dashbordData).then(function(data) {
                  console.log(" saveDashabordData data file ");
                  console.log(data);
                  return data;
              });
          };

          this.getDashboardDataFromServer = function(tenantId) {
              var path = "manage/" + tenantId + "/dashboardsettings";
              return getDataService.customGet(path).then(function(data) {
                  console.log(" getDashboardData data file ");
                  console.log(data);
                  return data;
              });
          };

          this.getDashboardData = function(teneentId) {
              return this.getDashboardDataFromServer(teneentId).then(function(dataItem) {
                if(!dataItem.hasOwnProperty("columns")) {
                  return {
                    "columns": 1,
                    "lastActiveTab": 0,
                    "tabs": [],
                    "theme": "LIGHT"
                  };
                }
                  var screenData = [];
                  var data = dataItem.tabs;
                  console.log("dashbord data ");
                  console.dir(dataItem);
                  if(dataItem.tabs){
                  for (var i = 0; i < data.length; i++) {
                      var node = data[i];
                      var screenNode = {
                          title: node.title,
                          alerts: node.alerts,
                          dashboardItems: node.dashboarditems
                      };
                      screenData.push(screenNode);
                  }

                  var screenDataDashboard = {
                      "columns": dataItem.columns,
                      "lastActiveTab": dataItem.lastActiveTab,
                      "tabs": screenData,
                      "theme": dataItem.theme
                  };

                  return screenDataDashboard;
                }else{
                  return "";
                }
              });
          };

          this.saveDashboardData = function(teneentId, screenData) {
              var data = [];
              for (var i = 0; i < screenData.tabs.length; i++) {
                  var screen = screenData.tabs[i];
                  var dashBordData = {};
                  dashBordData.title = screen.title;
                  dashBordData.alerts = [];
                  dashBordData.dashboarditems = [];
                  for (var j = 0; j < screen.alerts.length; j++) {
                      var alerts = screen.alerts[j];
                      var alert = {
                          "id": alerts.id,
                          "widgetName": alerts.widgetName
                      };
                      dashBordData.alerts.push(alert);
                  }

                  for (var k = 0; k < screen.dashboardItems.length; k++) {
                      var dashboardItems = screen.dashboardItems[k];
                      var items = {
                          "id": dashboardItems.id,
                          "content": {
                              "widgetName": dashboardItems.content.widgetName
                          }
                      };

                      dashBordData.dashboarditems.push(items);
                  }

                  data.push(dashBordData);
              }
              //console.log(" data *** "+JSON.stringify(data)); 

              var screenDataDashboard = {
                  "columns": screenData.columns,
                  "lastActiveTab": screenData.lastActiveTab,
                  "tabs": data,
                  "theme": screenData.theme
              };

              console.log(" data *** " + JSON.stringify(screenDataDashboard));

              return this.saveDashboardDataToServer(teneentId, screenDataDashboard);
          };

      }
      angular.module('shieldxApp').service('dashbordservice', dashbordService);
  })();
