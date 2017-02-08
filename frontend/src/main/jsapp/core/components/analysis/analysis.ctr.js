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
    function analysisCtr($scope,
            $state,
            $translate,
            chartDataLoader,
            dataVisualizationApi,            
            dataVisualizationService, 
            $mdpDatePicker, 
            $mdpTimePicker,coreservices,$mdDialog,$q) {
        "ngInject";

        console.log("analysisCtr initialised");
        $scope.tenentID = null;
        $scope.eventFilterModel = {};
        $scope.graphAttributeModel = {};
        $scope.eventFilterModel.defaultAxisAccessControl = {xAxsis:"Src_RG", yAxis:"Dest_RG"};
        $scope.filterApplyed = false;

        $scope.eventFilterModel.axisAccessControl = [
            {value: "Src_IP", text: 'Source IP'},
            {value: "Src_VM", text: 'Source VM'},
            {value: "Src_RG", text: 'Source Resource Group'},
            {value: "Dest_IP", text: 'Destination IP'},
            {value: "Dest_VM", text: 'Destination VM'},
            {value: "Dest_RG", text: 'Destination Resource Group'},
            {value: "Application_NAME", text: 'Application Name'}
        ];

         $scope.eventFilterModel.defaultAxisMalware = {xAxsis:"Victim_RG", yAxis:"Attacker_RG"};
         $scope.eventFilterModel.axisMalware = [
            {value: "Malware_Name", text: 'Malware Name'},
            {value: "Attacker_IP", text: 'Attacker IP'},
            {value: "Attacker_VM", text: 'Attacker VM'},
            {value: "Attacker_RG", text: 'Attacker Resource Group'},
            {value: "Victim_IP", text: 'Victim IP'},
            {value: "Victim_VM", text: 'Victim VM'},
            {value: "Victim_RG", text: 'Victim Resource Group'}
        ];
         $scope.eventFilterModel.defaultAxisThreatPrevention = {xAxsis:"Victim_RG", yAxis:"Attacker_RG"}; 
         $scope.eventFilterModel.axisThreatPrevention = [
            {value: "Attacker_IP", text: 'Attacker IP'},
            {value: "Attacker_VM", text: 'Attacker VM'},
            {value: "Attacker_RG", text: 'Attacker Resource Group'},
            {value: "Victim_IP", text: 'Victim IP'},
            {value: "Victim_VM", text: 'Victim VM'},
            {value: "Victim_RG", text: 'Victim Resource Group'},
            {value: "Threat_Name", text: 'Threat Name'},
            {value: "Application_NAME", text: 'Application Name'},
            {value: "Policy_Name", text: 'Policy Name'}
        ];


        //$scope.selectedIndex = 0;

       
        var currentDate = new Date();
        var endDate = new Date(currentDate.getTime()- (24*60*60*1000));
        $scope.eventFilterModel.startDate = endDate;
        $scope.eventFilterModel.startTime = endDate;
        $scope.eventFilterModel.endDate = currentDate;
        $scope.eventFilterModel.endTime = currentDate;

        $scope.eventFilterModel.selectedSeverity = null;

        $scope.eventFilterModel.severity = [ 
            {label: 'Critical', color: '#f03e3e', value: "Critical", selected: true},
            {label: 'High', color: '#fd7e14', value: "High", selected: false},
            {label: 'Medium', color: '#d0cd02', value: "Medium", selected: false},
            {label: 'Low', color: '#74b816', value: "Low", selected: false}
        ];

        $scope.eventFilterModel.tenentsSelected = null;
        $scope.eventFilterModel.tenents = [
            {value: 1, text: 'Home Depot'},
            {value: 2, text: 'Home Depot 2'}
        ];

        $scope.eventFilterModel.attackerSelected = "";
        $scope.eventFilterModel.attacker = [
            {value: "RG", text: 'Resource Group'},
            {value: "VM", text: 'VM'}
        ];

        $scope.eventFilterModel.targetSelected = "";
        $scope.eventFilterModel.target = [
            {value: "RG", text: 'Resource Group'},
            {value: "VM", text: 'VM'}
        ];

        $scope.eventFilterModel.eventTypeSelected = "ACCESS_CONTROL";
        $scope.graphAttributeModel.xAxisSelected = $scope.eventFilterModel.defaultAxisAccessControl.xAxsis;
        $scope.graphAttributeModel.xAxis = $scope.eventFilterModel.axisAccessControl;
        $scope.graphAttributeModel.yAxisSelected = $scope.eventFilterModel.defaultAxisAccessControl.yAxis;
        $scope.graphAttributeModel.yAxis =$scope.eventFilterModel.axisAccessControl;

        $scope.eventFilterModel.eventTypes = [
            {value: "ACCESS_CONTROL", text: 'Access Control'},
            {value: "THREAT_PREVENTION", text: 'Threat Prevention'},
            {value: "MALWARE", text: 'Malware'}
        ];
        $scope.eventFilterModel.actionSelected = "PERMIT";
        $scope.eventFilterModel.actions = null;

        $scope.eventFilterModel.actionsACL = [
            {value: "PERMIT", text: 'Flow permitted', selected: true},
            {value: "BLOCKED", text: 'Flow denied', selected: true}
        ];

        $scope.eventFilterModel.actionsTreats = [
            {value: "PERMIT", text: 'Alert Only', selected: true},
            {value: "BLOCKED", text: 'Block', selected: true}
        ];

        $scope.graphAttributeModel.colorSelected = "VOLUME";
        $scope.graphAttributeModel.colorItems = null;

        $scope.graphAttributeModel.colorItemsOthers = [
           {value: "VOLUME", text: 'Volume'}
        ];

        $scope.graphAttributeModel.colorTreats = [
            {value: "SEVERITY", text: 'Severity'},
            {value: "VOLUME", text: 'Volume'}
        ];

        $scope.threedDataVC = null; 

        $scope.colorLegend = {
            "SEVERITY": [
                { text: 'Critical', color: '#f03e3e' },
                { text: 'High', color: '#fd7e14' },
                { text: 'Medium', color: '#fcc419' },
                { text: 'Low', color: '#d0cd02' },
                { text: 'None', color: '#ffffff' } //#74b816
            ],
            "VOLUME": [
                { text: 'High', color: '#c92a2a' },
                { text: 'Above Median', color: '#f03e3e' },
                { text: 'Median', color: '#ff6b6b' },
                { text: 'Below Median', color: '#ffa8a8' },
                { text: 'Low', color: '#ffe3e3' }
            ]
        };

        $scope.eventFilterModel.source = {
            rgselection:"selGR",
            selectedSourceType:"",
            selectedGroups:[],
            selectedVMS:"",
            querySelection:"contains",
            queryResorceGroup:"",
            vmSelection:"contains"
        };

        $scope.eventFilterModel.destination = {
            rgselection:"selGR",
            selectedDestinationType:"",
            selectedGroups:[],
            selectedVMS:"",
            querySelection:"contains",
            queryResorceGroup:"",
            vmSelection:"contains"
        };

        $scope.eventFilterModel.groupType = [
            {value: "selGR", text: 'Select Resource Group'},
            {value: "selQR", text: 'Query Name'}
        ];

        $scope.eventFilterModel.matchingCondition = [
            {value: "beginwith", text: 'BeginWith'},
            {value: "equals", text: 'Equals'},
            {value: "contains", text: 'Contains'}
        ];

        $scope.validateRGName = function(){
          return true;
        };

        $scope.validateVMName = function(){
            return true;
        };


       
       $scope.selectResourceGroupSource = function(event){

         $mdDialog.show({
                controller: 'respourceGroupDialogboxCtr', templateUrl: 'core/components/analysis/resource-group-dialogbox.html', parent: angular.element(document.body), targetEvent: event, clickOutsideToClose: true,
                locals: {
                  selectedgroups:$scope.eventFilterModel.source.selectedGroups
                }
            }).then(function (answerVal) {
                console.log(" resource group  selected");
                console.dir(answerVal);
                $scope.eventFilterModel.source.selectedGroups = answerVal;
                console.log(" $scope.eventFilterModel.source.selectedGroups ");
                 console.dir($scope.eventFilterModel.source.selectedGroups);
            }, function () {
                $scope.status = 'You cancelled the dialog.';
            });

       };
       $scope.selectResourceGroupDestination = function(event){
        $mdDialog.show({
                controller: 'respourceGroupDialogboxCtr', templateUrl: 'core/components/analysis/resource-group-dialogbox.html', parent: angular.element(document.body), targetEvent: event, clickOutsideToClose: true,
                locals: {
                  selectedgroups:$scope.eventFilterModel.source.selectedGroups
                }
            }).then(function (answerVal) {
                console.log(" resource group  selected");
                console.dir(answerVal);
                eventFilterModel.destination.selectedGroups = answerVal;
                console.log(" $scope.eventFilterModel.source.selectedGroups ");
                 console.dir($scope.eventFilterModel.source.selectedGroups);
            }, function () {
                $scope.status = 'You cancelled the dialog.';
            });
       };
         
        // set defaults 
        $scope.eventFilterModel.eventTypeSelected = "ACCESS_CONTROL";
        $scope.eventFilterModel.actions = $scope.eventFilterModel.actionsACL;
        $scope.graphAttributeModel.xAxisSelected = $scope.eventFilterModel.defaultAxisAccessControl.xAxsis;
        $scope.graphAttributeModel.xAxis = $scope.eventFilterModel.axisAccessControl;
        $scope.graphAttributeModel.yAxisSelected = $scope.eventFilterModel.defaultAxisAccessControl.yAxis;
        $scope.graphAttributeModel.yAxis =$scope.eventFilterModel.axisAccessControl;
        $scope.graphAttributeModel.colorSelected = "VOLUME"; 
        $scope.graphAttributeModel.colorItems = $scope.graphAttributeModel.colorItemsOthers;


        $scope.showMore = function(event, data){
            console.log(" show more dialog "+data);

            $mdDialog.show({
                controller: 'showMoreCtr', templateUrl: 'core/components/analysis/show-more.html', parent: angular.element(document.body), targetEvent: event, clickOutsideToClose: true,
                locals: {
                  moreData:data
                }
            }).then(function (answerVal) {
                
            }, function () {
                $scope.status = 'You cancelled the dialog.';
            });
        };

       $scope.selectResourceGroupDestination = function(event){

         $mdDialog.show({
                controller: 'respourceGroupDialogboxCtr', templateUrl: 'core/components/analysis/resource-group-dialogbox.html', parent: angular.element(document.body), targetEvent: event, clickOutsideToClose: true,
                locals: {
                   selectedgroups:$scope.eventFilterModel.destination.selectedGroups
                }
            }).then(function (answerVal) {
                console.log(" resource group  selected");
                console.dir(answerVal);
                $scope.eventFilterModel.destination.selectedGroups = answerVal;
            }, function () {
                $scope.status = 'You cancelled the dialog.';
            });

       };


       $scope.editResourceGroupSource  = function(event){

       };


       $scope.onEventTypeSelectionChanged = function(){

           switch($scope.eventFilterModel.eventTypeSelected){

                case "ACCESS_CONTROL":
                $scope.eventFilterModel.actions = $scope.eventFilterModel.actionsACL;
                $scope.graphAttributeModel.colorItems = $scope.graphAttributeModel.colorItemsOthers;
                $scope.graphAttributeModel.xAxisSelected = $scope.eventFilterModel.defaultAxisAccessControl.xAxsis;
                $scope.graphAttributeModel.xAxis = $scope.eventFilterModel.axisAccessControl;
                $scope.graphAttributeModel.yAxisSelected = $scope.eventFilterModel.defaultAxisAccessControl.yAxis;
                $scope.graphAttributeModel.yAxis =$scope.eventFilterModel.axisAccessControl;
                $scope.graphAttributeModel.colorSelected = "VOLUME";
                break;
                case "THREAT_PREVENTION":
                $scope.eventFilterModel.actions = $scope.eventFilterModel.actionsTreats;
                $scope.graphAttributeModel.colorItems = $scope.graphAttributeModel.colorTreats; 
                $scope.graphAttributeModel.xAxisSelected = $scope.eventFilterModel.defaultAxisThreatPrevention.xAxsis;
                $scope.graphAttributeModel.xAxis = $scope.eventFilterModel.axisThreatPrevention;
                $scope.graphAttributeModel.yAxisSelected = $scope.eventFilterModel.defaultAxisThreatPrevention.yAxis;
                $scope.graphAttributeModel.yAxis =$scope.eventFilterModel.axisThreatPrevention;
                $scope.graphAttributeModel.colorSelected = "SEVERITY";
                break;
                case "MALWARE":
                $scope.graphAttributeModel.xAxisSelected = $scope.eventFilterModel.defaultAxisMalware.xAxsis;
                $scope.graphAttributeModel.xAxis = $scope.eventFilterModel.axisMalware;
                $scope.graphAttributeModel.yAxisSelected = $scope.eventFilterModel.defaultAxisMalware.yAxis;
                $scope.graphAttributeModel.yAxis =$scope.eventFilterModel.axisMalware;
                $scope.graphAttributeModel.colorSelected = "VOLUME";
                $scope.graphAttributeModel.colorItems = $scope.graphAttributeModel.colorItemsOthers;
                break;
            }
            console.log(" onEventTypeSelectionChanged ");
            console.dir($scope.graphAttributeModel);

       };
       $scope.filterData = function(dataArray,criteria,match){
         console.log("filterData "); 
         console.dir(dataArray); 
         console.dir(criteria);
         console.dir(match); 
         var result = [];

         if(criteria === "equal"){
            result.push(dataArray[i]);
         }

          for(var i=0; i <dataArray.length; i++){
              var ind = dataArray[i].indexOf(match);
              if( ind !== -1){
                
                if(criteria === "contains" && ind > 0){
                   result.push(dataArray[i]);
                } else if(criteria === "beginwith" && ind === 0){
                    result.push(dataArray[i]);
                }
              }
               
           }
           console.dir(result); 
           return result;
       };
       $scope.show2DData = function(){
          var startDate = $scope.eventFilterModel.startDate;
            var startTime = $scope.eventFilterModel.startTime; 
            var endDate = $scope.eventFilterModel.endDate ;
            var endTime = $scope.eventFilterModel.endTime;
            console.log(" startDate ");     
            console.dir(startDate);
            console.log(" startTime ");     
            console.dir(startTime);

            var newStartDate = new Date(startDate.getTime());
            newStartDate.setSeconds(startTime.getSeconds());
            newStartDate.setHours(startTime.getHours());
            newStartDate.setMinutes(startTime.getMinutes());

            var newEndDate = new Date(endDate.getTime());
            newEndDate.setSeconds(endTime.getSeconds());
            newEndDate.setHours(endTime.getHours());
            newEndDate.setMinutes(endTime.getMinutes());

            var dataVC = new EventVisualizationFilter();
            
            /*
            console.log(" eventFilterModel.severity "+$scope.eventFilterModel.severity);
            console.dir($scope.eventFilterModel.severity);
            console.log(" graphAttributeModel.colorSelected "+$scope.graphAttributeModel.colorSelected);
            console.dir($scope.graphAttributeModel.colorItems);

            console.log(" startTime "+newStartDate.getTime());
            console.log(" endTime "+newStartDate.getTime());

            console.log(" actionSelected "+$scope.eventFilterModel.actionSelected);
            console.log(" eventTypeSelected "+$scope.eventFilterModel.eventTypeSelected);

            console.log(" xAxisSelected "+ $scope.graphAttributeModel.xAxisSelected);
            console.log(" yAxisSelected "+$scope.graphAttributeModel.yAxisSelected);
            */

            if($scope.graphAttributeModel.colorSelected === "SEVERITY"){
                dataVC.colorType =  $scope.graphAttributeModel.colorSelected;
            }

            if($scope.eventFilterModel.eventTypeSelected !== "ACCESS_CONTROL"){
               dataVC.actionTypeList  = [$scope.eventFilterModel.actionSelected]; 
            }else {
                dataVC.actionTypeList  = [];
                var actions = $scope.eventFilterModel.actions;
                for (var j = 0; j <  actions.length; j++){
                  if(actions[j].selected){
                     dataVC.actionTypeList.push(actions[j].value);
                  }
                }
            }
            
            dataVC.eventType = $scope.eventFilterModel.eventTypeSelected;
            dataVC.startTime = ""+newStartDate.getTime();
            dataVC.endTime = ""+newEndDate.getTime();

            if($scope.eventFilterModel.eventTypeSelected === "THREAT_PREVENTION"){
                var selectedSeverity = [];
                for(var i=0; i<$scope.eventFilterModel.severity.length; i++){
                    var severity = $scope.eventFilterModel.severity[i];
                    if(severity.selected){
                        selectedSeverity.push(severity.value);
                    }
                } 
                if(selectedSeverity.length > 0){
                    dataVC.severity = selectedSeverity;
                } 
            }        


            dataVC.xAxisAttr = $scope.graphAttributeModel.xAxisSelected;
            dataVC.yAxisAttr = $scope.graphAttributeModel.yAxisSelected;

            $scope.xAxisLable = _.find($scope.graphAttributeModel.xAxis, function(value){
                return $scope.graphAttributeModel.xAxisSelected === value.value;
            });

            $scope.yAxisLable = _.find($scope.graphAttributeModel.yAxis, function(value){
                return $scope.graphAttributeModel.yAxisSelected === value.value;
            });

            /*coreservices.getAllWorkloades().then(function(workLoads){
              console.log(" getAllWorkloades workLoads ");
              console.dir(workLoads);
              $scope.load2DData(dataVC);
            });*/

            /*
            this.attackerSourceList = [];
            this.attackerSourceType = "RG";
            this.targetDestinationList = [];
            this.targetDestinationType = "RG";
            */
            var promices =  [];
            var pr = null;

            if($scope.eventFilterModel.source.selectedSourceType == "RG")
            {
                 dataVC.attackerSourceType = "RG";
                if($scope.eventFilterModel.source.rgselection == "selQR"){

                     pr = coreservices.getListOfResourceGroup().then(function(result){
                        //queryResorceGroup
                        var rs= [];
                         for(var i=0; i < result.length ; i++){
                          rs.push(result[i].name);
                         }
                         var fsrg = $scope.filterData(rs, $scope.eventFilterModel.source.querySelection, $scope.eventFilterModel.source.queryResorceGroup);
                         dataVC.attackerSourceList = fsrg;
                         console.log("source  getListOfResourceGroup"); 
                         console.dir(result);
                      });
                 promices.push(pr);
                } else if($scope.eventFilterModel.source.rgselection == "selGR"){
                    dataVC.attackerSourceList = $scope.eventFilterModel.source.selectedGroups;
                }

            }else if($scope.eventFilterModel.source.selectedSourceType == "VM"){
                dataVC.attackerSourceType = "VM";
                pr = coreservices.getListOfWorkloades().then(function(result){
                    //selectedVMS
                    var workLaodNames = [];
                    for(var k=0; k <result.length; k++){
                        workLaodNames.push(result[k].name);
                    }
                    console.log("source  getListOfWorkloades"); 
                    console.dir(result);
                    var fsvm = $scope.filterData(workLaodNames, $scope.eventFilterModel.source.querySelection, $scope.eventFilterModel.source.selectedVMS);
                   //  var fsvm = $scope.filterData(workLaodNames, "beginwith", "Shieldx");
                    dataVC.attackerSourceList = fsvm;
                });
                promices.push(pr);
            }

            if($scope.eventFilterModel.destination.selectedDestinationType == "RG")
            {
                dataVC.targetDestinationType = "RG";
                if($scope.eventFilterModel.destination.rgselection == "selQR"){

                   pr = coreservices.getListOfResourceGroup().then(function(result){
                    var rs2= [];
                         for(var j=0; j < result.length ; j++){
                          rs2.push(result[j].name);
                         }
                         var fd = $scope.filterData(rs2, $scope.eventFilterModel.destination.querySelection, $scope.eventFilterModel.destination.querySelection.queryResorceGroup);
                         dataVC.targetDestinationList = fd;
                         console.log("source  getListOfResourceGroup"); 
                         console.dir(result); 
                   });
                  promices.push(pr);

                } else if($scope.eventFilterModel.destination.rgselection == "selGR"){
                     dataVC.targetDestinationList = $scope.eventFilterModel.destination.selectedGroups;     
                }

            }else if($scope.eventFilterModel.destination.selectedDestinationType == "VM"){
                dataVC.targetDestinationType = "VM";
               pr = coreservices.getListOfWorkloades().then(function(result){
                  //selectedVMS
                   console.log("destination  getListOfWorkloades"); 
                    console.dir(result);

                    var workLaodNamesd = [];
                    for(var l=0; l <result.length; l++){
                        workLaodNamesd.push(result[l].name);
                    }
                    console.log("source  getListOfWorkloades"); 
                    console.dir(result);
                    var fdvm = $scope.filterData(workLaodNamesd, $scope.eventFilterModel.source.querySelection, $scope.eventFilterModel.source.selectedVMS);
                   // var fdvm = $scope.filterData(workLaodNamesd, "contains", "Dev");
                    dataVC.targetDestinationList = fdvm; 
                });
              promices.push(pr);
            }

           
            console.log("$scope.eventFilterModel.source");   
            console.dir($scope.eventFilterModel.source);

            console.log("$scope.eventFilterModel.destination");   
            console.dir($scope.eventFilterModel.destination);
           if(promices.length > 0){
             $q.all(promices).then(function() {
                console.log("after all data loaded ");
                console.dir(dataVC); 
               $scope.load2DData(dataVC);  
             });
           } else{
             $scope.load2DData(dataVC);
           } 
       };

       $scope.load2DData = function(dataVC){
            dataVisualizationService.getEventDataFor2DRendering(dataVC).then(function(result){
                angular.element(document.querySelector('#events-page-mask')).css('display', 'none');
                var filterWarningDiv;
                 
                if(result.links.length === 0){
                    d3.select('#events-container').select("svg").remove();
                    filterWarningDiv = d3.select("#events-grid").append("div").attr("class", "filter-warning-prompt");
                    var filterWarningPos = document.querySelector('#events-grid').getBoundingClientRect();
                    filterWarningDiv.html("<i class=\"material-icons\">&#xE002;</i><div class='text' id='marquee-help-btn'>No events found.</div>");
                    filterWarningDiv.style("left", filterWarningPos.left + (filterWarningPos.width/2) + "px");
                    filterWarningDiv.style("top", filterWarningPos.top + (filterWarningPos.height/3) + "px");

                    return;
                } else {
                    d3.select("#events-grid .filter-warning-prompt").remove();
                }
                var chartObj = {
                    elem: '#navigator',
                    dataset: result  // not customisable option
                };
                dataVisualizationApi.eventsNavigator(chartObj); 

          });
       };
       $scope.threeDInputData = function(){
        console.log(" show3DData "); 
          console.dir(shieldXUI.landscapeData);
          var startDate = $scope.eventFilterModel.startDate;
            var startTime = $scope.eventFilterModel.startTime; 
            var endDate = $scope.eventFilterModel.endDate ;
            var endTime = $scope.eventFilterModel.endTime;
            console.log(" startDate ");     
            console.dir(startDate);
            console.log(" startTime ");     
            console.dir(startTime);

            var newStartDate = new Date(startDate.getTime());
            newStartDate.setSeconds(startTime.getSeconds());
            newStartDate.setHours(startTime.getHours());
            newStartDate.setMinutes(startTime.getMinutes());

            var newEndDate = new Date(endDate.getTime());
            newEndDate.setSeconds(endTime.getSeconds());
            newEndDate.setHours(endTime.getHours());
            newEndDate.setMinutes(endTime.getMinutes());

            var dataVC = new EventVisualizationFilter();
            
            /*
            console.log(" eventFilterModel.severity "+$scope.eventFilterModel.severity);
            console.dir($scope.eventFilterModel.severity);
            console.log(" graphAttributeModel.colorSelected "+$scope.graphAttributeModel.colorSelected);
            console.dir($scope.graphAttributeModel.colorItems);

            console.log(" startTime "+newStartDate.getTime());
            console.log(" endTime "+newStartDate.getTime());

            console.log(" actionSelected "+$scope.eventFilterModel.actionSelected);
            console.log(" eventTypeSelected "+$scope.eventFilterModel.eventTypeSelected);

            console.log(" xAxisSelected "+ $scope.graphAttributeModel.xAxisSelected);
            console.log(" yAxisSelected "+$scope.graphAttributeModel.yAxisSelected);
            */

            if($scope.graphAttributeModel.colorSelected === "SEVERITY"){
                dataVC.colorType =  $scope.graphAttributeModel.colorSelected;
            }

            if($scope.eventFilterModel.eventTypeSelected !== "ACCESS_CONTROL"){
               dataVC.actionTypeList  = [$scope.eventFilterModel.actionSelected]; 
            }else {
                dataVC.actionTypeList  = [];
                var actions = $scope.eventFilterModel.actions;
                for (var l = 0; l <  actions.length; l++){
                  if(actions[l].selected){
                     dataVC.actionTypeList.push(actions[l].value);
                  }
                }
            }

            dataVC.eventType = $scope.eventFilterModel.eventTypeSelected;
            dataVC.startTime = ""+newStartDate.getTime();
            dataVC.endTime = ""+newEndDate.getTime();

            $scope.timeRange = [dataVC.startTime, dataVC.endTime];

            if($scope.eventFilterModel.eventTypeSelected === "THREAT_PREVENTION"){
                var selectedSeverity = [];
                for(var i=0; i<$scope.eventFilterModel.severity.length; i++){
                    var severity = $scope.eventFilterModel.severity[i];
                    if(severity.selected){
                        selectedSeverity.push(severity.value);
                    }
                } 
                if(selectedSeverity.length > 0){
                    dataVC.severity = selectedSeverity;
                } 
            }        


            dataVC.xAxisAttr = $scope.graphAttributeModel.xAxisSelected;
            dataVC.yAxisAttr = $scope.graphAttributeModel.yAxisSelected;

            $scope.xAxisLable = _.find($scope.graphAttributeModel.xAxis, function(value){
                return $scope.graphAttributeModel.xAxisSelected === value.value;
            });

            $scope.yAxisLable = _.find($scope.graphAttributeModel.yAxis, function(value){
                return $scope.graphAttributeModel.yAxisSelected === value.value;
            });

           if(shieldXUI.landscapeData){
            
             var nodesX = shieldXUI.landscapeData.nodesX;
             var xAxsis = [];   
             for(var k =0; k < nodesX.length; k++){
                xAxsis.push(nodesX[k].name);  
             }

             var nodesY = shieldXUI.landscapeData.nodesY;
             var yAxsis = [];   
             for(var j =0; j < nodesY.length; j++){
                yAxsis.push(nodesY[j].name);  
             }

            /* var ed = new EventVisualizationData(); 
             var mapXval = ed.mapAxsisToType(dataVC.xAxisAttr);
            
             if(mapXval.map === "destination"){
                 dataVC.attackerSourceList = xAxsis;
                 dataVC.attackerSourceType = mapXval.type;
             }else if(mapXval.map === "source"){
                 dataVC.targetDestinationList = xAxsis; 
                 dataVC.targetDestinationType = mapXval.type;  
             }

             var mapYval = ed.mapAxsisToType(dataVC.yAxisAttr);
             if(mapYval.map === "destination"){
                 dataVC.attackerSourceList = yAxsis;
                 dataVC.attackerSourceType = mapYval.type;
             }else if(mapYval.map === "source"){
                 dataVC.targetDestinationList = yAxsis; 
                 dataVC.targetDestinationType = mapYval.type;  
             }
             */

             dataVC.attackerSourceList = xAxsis;
             dataVC.attackerSourceType = "RG";
             dataVC.targetDestinationList = yAxsis; 
             dataVC.targetDestinationType = "RG"; 
         }

         return dataVC;
       }; 
        $scope.show3DData = function(){
            var dataVC = $scope.threeDInputData();
            dataVisualizationService.getEventDataFor3DRendering(dataVC).then(function(result){
                $scope.show3DLabels = false;
                if(!$scope.switchTo3D) dataVisualizationApi.eventsVfx({ elem: "#events-container-3D", dataset: result });
                    $scope.switchTo3D = $scope.switchTo3D ? false: true;
            });
        };

      
        $scope.switchTo3D = false;       

        $scope.selected3DNodes = [];

        $scope.showGrid = function(event){
             var dataVC = $scope.threeDInputData();
             $mdDialog.show({
                controller: 'eventGridCtr', templateUrl: 'core/components/analysis/event-grid.html', parent: angular.element(document.body), targetEvent: event, clickOutsideToClose: true,
                locals: {
                  vc:dataVC
                },
                fullscreen: true
            }).then(function (answerVal) {
                
            }, function () {
                $scope.status = 'You cancelled the dialog.';
            });

            d3.select(".matrix-brush").remove();
            d3.selectAll('#events-container .selected', function(d) {
                angular.element(this).removeClass("selected");
            });
            d3.selectAll("#events-container circle").style("fill-opacity",'0.8');
            angular.element(document.querySelector('#Alpha-4---Analysis path')).css('fill', '#6d6e71');
            angular.element(document.querySelector('#Alpha-4---Cursor-Arrow #Solid')).css('fill', '#4a90e2');

            angular.element(document.querySelector('.dataLandscapeBtnDiv')).remove();
            angular.element(document.querySelector('.d3evenDataBtnDiv')).remove();
            angular.element(document.querySelector('.d3brushCloseBtnDiv')).remove();

            angular.element(document.querySelector('#events-tabs')).css('display', 'block');
            angular.element(document.querySelector('#landscape-explorer')).css('display', 'none');
        }; 
        
        $scope.clearLabels = function(event) {
            angular.element(document.querySelectorAll('.selected-3D')).removeClass('selected-3D');
            $scope.selected3DNodes = [];
            angular.element(event.target).css('display', 'none');
        };

        $scope.show3DLabels = false;
        $scope.toggle3DLabels = function(event) {
            $scope.show3DLabels = !$scope.show3DLabels;
            console.log("$scope.show3DLabels "+$scope.show3DLabels);
            if($scope.show3DLabels) {
                angular.element(document.querySelectorAll('.node-3D-labelX')).addClass('show-3D-label');
                angular.element(document.querySelectorAll('.node-3D-labelY')).addClass('show-3D-label');
            }                
            else {
                angular.element(document.querySelectorAll('.node-3D-labelX')).removeClass('show-3D-label');
                angular.element(document.querySelectorAll('.node-3D-labelY')).removeClass('show-3D-label');
            }
        };

        $scope.toggle3D = function(event) {
            if(!shieldXUI.landscapeData) {
                return;
            }
            $scope.show3DData();   

            angular.element(document.querySelector('#events-tabs')).css('display', 'block');
            angular.element(document.querySelector('#landscape-explorer')).css('display', 'none');

            angular.element(document.querySelector('.dataLandscapeBtnDiv')).remove();
            angular.element(document.querySelector('.d3evenDataBtnDiv')).remove();
            angular.element(document.querySelector('.d3brushCloseBtnDiv')).remove();
        };

        $scope.closeLandscapeExplorer = function(event) {

            d3.select(".matrix-brush").remove();
            d3.selectAll('#events-container .selected', function(d) {
                angular.element(this).removeClass("selected");
            });
            d3.selectAll("#events-container circle").style("fill-opacity",'0.8');
            angular.element(document.querySelector('#Alpha-4---Analysis path')).css('fill', '#6d6e71');
            angular.element(document.querySelector('#Alpha-4---Cursor-Arrow #Solid')).css('fill', '#4a90e2');

            angular.element(document.querySelector('.dataLandscapeBtnDiv')).remove();
            angular.element(document.querySelector('.d3evenDataBtnDiv')).remove();
            angular.element(document.querySelector('.d3brushCloseBtnDiv')).remove();

            angular.element(document.querySelector('#events-tabs')).css('display', 'block');
            angular.element(document.querySelector('#landscape-explorer')).css('display', 'none');

            $scope.switchTo3D = false;
        };

        $scope.$emit('listenHeaderText', { headerText: "Analysis"});
        $scope.$on('$viewContentLoaded', function (event) {
            console.log(event);
            fixContainerHeight(1);            
        });

           

      /*
      
       */

        $scope.$on('$viewContentLoaded', function (event) {

            angular.element(document.querySelector('#events-y-axis')).css('width', (window.innerWidth * 0.75) - 144+'px');
            angular.element(document.querySelector('#events-container')).css('width', (window.innerWidth * 0.75) - 144+'px');
            angular.element(document.querySelector('#events-x-axis')).css('height', window.innerHeight - 192+'px');
            angular.element(document.querySelector('#events-container')).css('height', window.innerHeight - 192+'px');    

        }); 

        dataVisualizationService.conectToWebSocket().then(
            function(data){
                dataVisualizationService.subscribToTheTopic("/topic/outgoing").then(function(dataRecived){
                   console.log(" data recived from server 3"+dataRecived);
                   console.dir(dataRecived);
                   var refdata = JSON.parse(dataRecived.content);
                   $scope.processCraditData(refdata);
                });
            }
        );

        $scope.processCraditData = function(data){
           console.log("processCraditData ");
           console.dir(data);
        };

       $scope.senDataToWebSocket = function(data){
          dataVisualizationService.sendDataToWebSocketTopic("/app/incoming",data);
       }; 

        $scope.showGraph = function(event) {
          /*  angular.element(document.querySelector('#events-page-mask')).css('display', 'block');
            $scope.filterApplyed = true;
            $scope.show2DData();*/
            $scope.senDataToWebSocket({command:"start",data:""});
       };
        
        
    }


    angular.module('shieldxApp').controller('analysisCtr', analysisCtr);

})();
