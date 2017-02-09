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
            $mdpTimePicker,coreservices,$mdDialog,$q,$http) {
        "ngInject";

        console.log("analysisCtr initialised");
        $scope.tenentID = null;
        $scope.eventFilterModel = {};
        $scope.graphAttributeModel = {};
        $scope.eventFilterModel.defaultAxisAccessControl = {xAxsis:"Src_RG", yAxis:"Dest_RG"};
        $scope.filterApplyed = false;
        var twodData = dataVisualizationService.returnTwoDDataToAnalysis();
        console.dir(twodData);
        $scope.showPane= false;
        $scope.load2DData = function(result){
            angular.element(document.querySelector('#events-page-mask')).css('display', 'block');
            $scope.filterApplyed = true;
            var color_to_show = 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')';
            //console.log(dataVC);
           // dataVisualizationService.getEventDataFor2DRendering(dataVC).then(function(result){
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
                    dataset: result,
                    color:color_to_show  // not customisable option
                };
            setTimeout(function(){ 
                dataVisualizationApi.eventsNavigator(chartObj); 
             }, 2000);
            

         // });
       };
       if(twodData !== ''){
            console.dir(twodData);
            if(twodData.length === 0){
               twodData.data = "c1"; 
            }
            $http.get('/languages/'+twodData.data+'.json').then(function(res){
                $scope.load2DData(res.data);  
            });
            //var data_2d ="";
              
        }
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

       /*$scope.load2DData = function(dataVC){
            console.log(dataVC);
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
       };*/
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
            $scope.senDataToWebSocket({command:"start",data:"one"});
            $scope.filterApplyed = true;
            $scope.timeRange = ["1486472447319", "1486558847319"];
            $scope.show3DLabels = false;
            $scope.switchTo3D = true;   
            if(!shieldXUI.landscapeData) {
                return;
            }
            //$scope.show3DData();   

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

            angular.element(document.querySelector('#events-y-axis')).css('width', (window.innerWidth ) - 144+'px');
            angular.element(document.querySelector('#events-container')).css('width', (window.innerWidth ) - 144+'px');
            //angular.element(document.querySelector('#events-x-axis')).css('height', window.innerHeight - 192+'px');
            angular.element(document.querySelector('#events-container')).css('height', window.innerHeight - 192+'px');    

        }); 
       
        dataVisualizationService.conectToWebSocket().then(
            function(data){
           var callback = function(dataRecived){
                   console.log(" data recived from server 3"+dataRecived);
                   console.dir(dataRecived);
                   var refdata = JSON.parse(dataRecived.content);
                   $scope.processCraditData(refdata);
                };
                dataVisualizationService.subscribToTheTopic("/topic/outgoing",callback).then(callback);
            }
        );
        
        $scope.event3d = null;
        $scope.result = null;
        $scope.result =  {
            "nodesX":{"name":"Cradit_Type","nodes":[{"name":"GL"},{"name":"SL"},{"name":"PL"},{"name":"TT"},{"name":"VL"}]},
            "nodesY":{"name":"area","nodes":[{"name":"MH"},{"name":"GJ"},{"name":"MP"},{"name":"AP"},{"name":"WB"}]},
            "links":[]
            };
        $scope.processCraditData = function(data){
           console.log("processCraditData 2");
           console.dir(data);
           console.log("$scope.result");
           console.dir($scope.result);
           var presentEpoch = Math.round(new Date().getTime());
           $scope.timeRange = ["1486472447319", presentEpoch];
/* jshint ignore:start */

           if(!(data instanceof Array))
           {
               var t = [];
               t.push(data);
               data = t;
           }
           for(var i =0; i<data.length; i++){
             var xVal =  _.findIndex($scope.result.nodesX.nodes, function(val){
                 if(val.name === data[i].type){
                    return true;
                 }
             });

              var yVal =  _.findIndex($scope.result.nodesY.nodes, function(val){
                 if(val.name === data[i].area){
                    return true;
                 }
                });

              $scope.result.links.push({"source":xVal,"target":yVal,"value":{"volume":0,"threeDimValues":parseInt(data[i].time),"severity":data[i].severity}});
              
           }
           console.log(" $scope.result ");
           console.dir($scope.result);
           /* jshint ignore:end */
           //var result = {"nodesX":{"name":"Src_RG","nodes":[{"name":"teamZenith"},{"name":"mastersOfUniverse"}]},"nodesY":{"name":"Dest_RG","nodes":[{"name":"suicideSquad"},{"name":"thunderCats"}]},"links":[{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486495193744174,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486507557146212,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486527911222646,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486538854111826,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486505901581326,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486547532356012,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486477503451025,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486524737117782,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486481211082273,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486537028440621,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486478790022342,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486521945439144,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486490817865998,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486497171221399,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486484540218403,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486493156413829,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486504618703450,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486520362646141,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486554492743742,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486530474695475,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486499302140490,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486546630068869,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486548135769494,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486491346354539,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486509686682446,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486498464468195,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486514286982622,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486557816449965,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486484691346592,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486492025099559,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486496334105104,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486522623684248,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486479546767755,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486506278235993,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486540816901800,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486476973939988,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486540590605700,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486471603469324,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486485901818091,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486517467454505,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486526778695311,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486489682153866,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486494590142700,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486523377710915,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486510743384294,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486477503450876,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486493156413964,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486480908845468,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486498921012735,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486552508863088,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486480304345124,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486509536283099,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486536569180075,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486548287199312,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486509761953995,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486536569180211,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486548587995559,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486534508283992,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486525341700260,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486472813865872,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486502731691842,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486504240932317,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486528137346396,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486531840462196,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486484842418576,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486487715571113,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486510743384429,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486490363834580,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486500064899323,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486496334105246,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486509914463001,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486472662483325,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486484766900979,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486497323415375,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486518153347257,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486534050980772,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486556682994309,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486491799207364,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486532450179484,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486491573088233,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486529042311435,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486536416865843,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486556909218088,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486538627623166,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486547231569423,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486507331309225,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486512098606754,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486487791098911,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486535654873086,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486534431770718,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486494137516161,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486539382615289,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486503863846929,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486517315047394,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486533365036917,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486518686758224,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486504543312883,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486517086478147,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486519830973736,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486493835739199,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486535042711893,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486475537701579,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486502354453854,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486502882554651,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486503863846980,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486496410117342,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486547005831424,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486491648527716,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486473269177573,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486526174159589,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486541118757964,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486503939283032,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486521568565979,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486539835483174,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486475084026292,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486495497079552,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486501514562129,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486501285812709,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486500598787920,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486508707981268,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486510818740777,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486514664629358,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486476520632186,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486480151960311,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486487791098861,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486507632337582,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486515193347937,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486525190531050,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486539005211137,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486551151568670,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486544594034621,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486479394884886,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486527459060824,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486475537701715,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486502430203069,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486503485861458,"severity":""}},{"source":0,"target":1,"value":{"volume":0,"threeDimValues":1486539759972068,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486510517302968,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486523076203510,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486527383699449,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486494741295913,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486497931775331,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486497931775383,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486530323960104,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486534279476733,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486555551050205,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486472435677144,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486485069067437,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486487111247112,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486537181685880,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486540061898078,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486478714396809,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486546479752333,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486490742263261,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486513757899758,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486514891165437,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486517086478096,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486535042711999,"severity":""}},{"source":1,"target":1,"value":{"volume":0,"threeDimValues":1486497855728869,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486522096152067,"severity":""}},{"source":0,"target":0,"value":{"volume":0,"threeDimValues":1486532830886693,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486499912440991,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486508093775351,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486529494498794,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486533441240461,"severity":""}},{"source":1,"target":0,"value":{"volume":0,"threeDimValues":1486548210991137,"severity":""}}]};
           /*if(!$scope.result){
            
            
           } else {
        
            $scope.result.links.push({"source":$scope.xcounter,"target":$scope.ycounter,"value":{"volume":0,"threeDimValues":presentEpoch,"severity":""}});
            console.log($scope.result)
           }*/
           

           $scope.event3d = dataVisualizationApi.eventsVfx({ elem: "#events-container-3D", dataset: $scope.result },$scope.event3d);
        };

       $scope.senDataToWebSocket = function(data){
          dataVisualizationService.sendDataToWebSocketTopic("/app/incoming",data);
       }; 

        $scope.showGraph = function(event) {
           
        };
        
    }


    angular.module('shieldxApp').controller('analysisCtr', analysisCtr);

})();
