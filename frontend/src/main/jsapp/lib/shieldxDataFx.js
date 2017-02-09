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

/*jshint strict:false */

var shieldXUI = shieldXUI || {};


function shieldxDataFx() {

    shieldXUI.cfg = {
        platform: 'D3'
    };

    shieldXUI.landscapeData = null;
    shieldXUI.maxVolume = 0;
    shieldXUI.minVolume = 0;

    function truncLabel(label) {
        if (label.length >= 10) {
            var label1 = label.substr(0, 4);
            var label2 = label.substr(label.length-4, 4);
            return label1+"..."+label2;
        } else {
            return label;
        }
    }

    function setColors(obj) {
        var severityIndex = ['None', 'Low', 'Medium', 'High', 'Critical'];
        var colorLegend = {
            severity : {
                Critical: '#f03e3e',
                High: '#fd7e14',
                Medium: '#fcc419',
                Low : '#d0cd02',
                None : '#ffffff'
            }                        
            /*"VOLUME": [
                { text: 'High', color: '#c92a2a' },
                { text: 'Above Median', color: '#f03e3e' },
                { text: 'Median', color: '#ff6b6b' },
                { text: 'Below Median', color: '#ffa8a8' },
                { text: 'Low', color: '#ffe3e3' }
            ]*/
        };
        var filterSelected = angular.element(document.getElementById('events')).scope().graphAttributeModel.colorSelected;
        var maxValue = 0, maxValKey;
        if(!!!obj) {            
            return "#000000";
        }               
        
        if(filterSelected.match(/severity/ig)) {
            _.forEach(severityIndex, function(value, key){
                if( obj.severity[value] >= maxValue) {
                    maxValue = obj.severity[value];
                    maxValKey = value;
                }
            });
            return colorLegend.severity[maxValKey];                 
        } else if (filterSelected.match(/volume/ig)){

            var linearScale = d3.scale.linear()
                .domain([shieldXUI.minVolume,shieldXUI.maxVolume])
                .range([0,100]);
            var temp = Math.round(linearScale(obj.volume));

            if( temp >= 0 && temp <= 19 ) return "#ffe3e3"; 
            else if ( temp >= 20 && temp <= 39 ) return "#ffa8a8";
            else if ( temp >= 40 && temp <= 59 ) return "#ff6b6b";
            else if ( temp >= 60 && temp <= 79 ) return "#f03e3e";
            else if ( temp >= 80 && temp <= 100 ) return "#c92a2a";
        }
    }

    function events2DViewer(options){
        var data = options.dataset;
        var domElem = options.elem;
        var w, h, marginTop = 150, marginRight = 75, marginBottom = 150, marginLeft = 150, xAxisPadding = 144, yAxisPadding = 64;
        for(var i=0;i<data.links.length;i++){
            data.links[i].value = [{"value":Math.floor(Math.random() * 100) + 1 },{"value":Math.floor(Math.random() * 100) + 1},{"value":Math.floor(Math.random() * 100) + 1 }];
        }
        var selectedList2D = [];
        var nodeRadius;

        var eventMarqueeDiv;
        
        //var elemRef = document.querySelector(options.elem);
        w = window.innerWidth * 0.75 - xAxisPadding;
        h = window.innerHeight - (64*2) - yAxisPadding;

        matrixW = w -20;// - (marginLeft);
        matrixH = ((w -20) / data.nodesX.length) * data.nodesY.length;// - (marginBottom); 
        //nodeRadius = w / data.nodesX.length;
        if(matrixH > h) {
            matrixW = (h / data.nodesY.length) * data.nodesX.length;
            matrixH = h;
        }


        

        function makeToolTipDOM(data){
            var tooltipTitle = "Event Volume", tooltipSubtitle = data.value.volume;
            var toolTipDOM;

            function volAvg(val){
                return Math.round((val/data.value.volume)*100);
            }

            if(angular.element(document.getElementById('events')).scope().graphAttributeModel.colorSelected.match(/volume/ig))
                toolTipDOM = "<div class=\"tip-arrow\"></div><div class=\"node-tooltip-container-volume\">" +
                    "<div class=\"node-tooltip-header\"><div class=\"node-title text-accent\">" + tooltipTitle + "</div><div class=\"node-subtitle\">"+tooltipSubtitle+"</div></div>" +
                    "</div>";
            else {

                toolTipDOM = "<div class=\"tip-arrow\"></div><div class=\"node-tooltip-container\">" +
                    "<div class=\"node-tooltip-header\"><div class=\"node-title text-accent\">" + tooltipTitle + "</div><div class=\"node-subtitle\">"+tooltipSubtitle+"</div></div>" +
                    "<div class=\"node-tooltip-body\"><div class=\"node-svg\"></div>" + 
                    "<div class=\"node-details\"> "+ 
                        "<div><div style=\"background: #f03e3e; height: 8px; width: 8px; margin: 11px 10px 11px 0; border-radius: 50%; float:left;\"></div>" +
                        "<div style=\"float:left; margin: 7px 10px 7px 0; font-size: 13px; width: 70px;\">Critical</div>" +
                        "<div style=\"float:left; margin: 7px 20px 7px 0; font-size: 13px; width: 25px;\">"+ volAvg(data.value.severity.Critical) +"%</div>" +
                        "<div style=\"float:left; margin: 7px 10px 7px 0; font-size: 13px; opacity: 0.6\">"+ data.value.severity.Critical + "</div>" +
                        "<div style=\"clear:both;\"></div>" +
                        "</div>" +

                        "<div><div style=\"background: #fd7e14; height: 8px; width: 8px; margin: 11px 10px 11px 0; border-radius: 50%; float:left;\"></div>" +
                        "<div style=\"float:left; margin: 7px 10px 7px 0; font-size: 13px; width: 70px;\">High</div>" +
                        "<div style=\"float:left; margin: 7px 20px 7px 0; font-size: 13px; width: 25px;\">"+ volAvg(data.value.severity.High) +"%</div>" +
                        "<div style=\"float:left; margin: 7px 10px 7px 0; font-size: 13px; opacity: 0.6\">"+ data.value.severity.High + "</div>" +
                        "<div style=\"clear:both;\"></div>" +
                        "</div>" +

                        "<div><div style=\"background: #fcc419; height: 8px; width: 8px; margin: 11px 10px 11px 0; border-radius: 50%; float:left;\"></div>" +
                        "<div style=\"float:left; margin: 7px 10px 7px 0; font-size: 13px; width: 70px;\">Medium</div>" +
                        "<div style=\"float:left; margin: 7px 20px 7px 0; font-size: 13px; width: 25px;\">"+ volAvg(data.value.severity.Medium) +"%</div>" +
                        "<div style=\"float:left; margin: 7px 10px 7px 0; font-size: 13px; opacity: 0.6\">"+ data.value.severity.Medium + "</div>" +
                        "<div style=\"clear:both;\"></div>" +
                        "</div>" +

                        "<div><div style=\"background: #d0cd02; height: 8px; width: 8px; margin: 11px 10px 11px 0; border-radius: 50%; float:left;\"></div>" +
                        "<div style=\"float:left; margin: 7px 10px 7px 0; font-size: 13px; width: 70px;\">Low</div>" +
                        "<div style=\"float:left; margin: 7px 20px 7px 0; font-size: 13px; width: 25px;\">"+ volAvg(data.value.severity.Low) +"%</div>" +
                        "<div style=\"float:left; margin: 7px 10px 7px 0; font-size: 13px; opacity: 0.6\">"+ data.value.severity.Low + "</div>" +
                        "<div style=\"clear:both;\"></div>" +
                        "</div>" +

                        "<div><div style=\"background: #ffffff; height: 8px; width: 8px; margin: 11px 10px 11px 0; border-radius: 50%; float:left;\"></div>" +
                        "<div style=\"float:left; margin: 7px 10px 7px 0; font-size: 13px; width: 70px;\">None</div>" +
                        "<div style=\"float:left; margin: 7px 20px 7px 0; font-size: 13px; width: 25px;\">"+ volAvg(data.value.severity.None) +"%</div>" +
                        "<div style=\"float:left; margin: 7px 10px 7px 0; font-size: 13px; opacity: 0.6\">"+ data.value.severity.None + "</div>" +
                        "<div style=\"clear:both;\"></div>" +
                        "</div>" +

                    "</div>" +
                    "</div>" +
                    "</div>";
                }
                
            return toolTipDOM;
        }

        function getTooltipTopPos(thisEvent, thisData){
            return (thisEvent.cy.baseVal.value + 112) - thisEvent.r.baseVal.value +"px"; // pos + transpose + (2 * toolbars) - radius
        }
        function drawtTooltipDonut(options) {
            var width = document.querySelector(options.elem).clientWidth,
                height = document.querySelector(options.elem).clientHeight,
            radius = Math.min(width, height) / 2;            

            var dataset = [options.dataset.severity.Critical,options.dataset.severity.High,options.dataset.severity.Medium,options.dataset.severity.Low,options.dataset.severity.None];
            var colourSet = ['#f03e3e','#fd7e14','#fcc419','#d0cd02','#ffffff'];

            var pie = d3.layout.pie()
                .sort(null)
                .value(function(d) { return d.value; });

            var arc = d3.svg.arc()
                .innerRadius(radius - 20)
                .outerRadius(radius);

            //Remove whatever chart with the same id/class was present before
            d3.select(options.elem).select("svg").remove();

            var svg = d3.select(options.elem).append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");    

            var path = svg.selectAll("path")
                .data(pie(dataset))
                .enter().append("path")
                .attr("fill", function(d, i) { 
                    return colourSet[i]; 
                })
                .attr("d", arc);

        }

        var adjacencyMatrix = d3.layout.adjacencyMatrix()
            .size([matrixW,matrixH])
            //.nodes(data.nodes)
            .nodesX(data.nodesX)
            .nodesY(data.nodesY)
            .links(data.links)
            .square(false) // set to false if m x n matrix
            .directed(true)
            .nodeID(function (d) {return d.name;});

        var matrixData = adjacencyMatrix();
        
        //Remove whatever chart with the same id/class was present before
        d3.select(options.elem).select("svg").remove();
        d3.select('.eventsToolTip').remove();
        angular.element(document.querySelector('.events-x-axis-data')).css('display', 'none');
        angular.element(document.querySelector('.events-y-axis-data')).css('display', 'none');

        angular.element(document.querySelector('#Alpha-4---Analysis path')).css('fill', '#6d6e71');
        angular.element(document.querySelector('#Alpha-4---Cursor-Arrow #Solid')).css('fill', '#4a90e2');  
        d3.select("#events-container .marquee-selection-prompt").remove();  

        var eventTooltipDiv = d3.select("#events").append("div").attr("class", "eventsToolTip");

        var brush, brushButtonTray, brushClose, brushResize;
        var radius_pie_data = matrixData[0].height;
        //add the SVG element
        var svg = d3.select(options.elem).append("svg")
            .attr("width", w)
            .attr("height", h);
        var colourSet = ['#1f77b4','#aec7e8','#ff7f0e','#ffbb78','#2ca02c'];

        var pie = d3.layout.pie()
            .sort(null)
            .value(function(d) { return d.value; });

        var arc = d3.svg.arc()
            .innerRadius(radius_pie_data/2 - (radius_pie_data/2)/2)
            .outerRadius(radius_pie_data/2);

        var nodes = svg.attr("id", "events-analysis")
            .selectAll("rect")
            .data(matrixData)
            .enter()
            .append("g")
            .attr("transform",function(d){ 
                return "translate(" + w/2 + "," + h/2 + ")"; 
            });
            
       var arcs = nodes.selectAll("path")   
            .data(function(d){
                if(d.value){
                    return pie(d.value);    
                }else{
                    return "";    
                }
                
            })
            .enter()
            .append("path")
            .attr("fill", function(d, i) { 
                return colourSet[i]; 
            })
            .attr("d", arc)
            .append("text")
            .attr("transform",function(d){
                d.innerRadius = 0;
                d.outerRadius = radius_pie_data/2;
                return "translate(" + arc.centroid(d) + ")";   
            })
            .attr("text-anchor", "middle")
            .text(function(d, i) { 
                return d.value; })
            /*.attr("x", function (d) {return d.x+(d.height / 2);})
            .attr("y", function (d) {return d.y+(d.height / 2);})*/
            //.attr("height", function (d) {return d.height;})
            /*.attr("cx", function (d) {return d.x+(d.height / 2);})
            .attr("cy", function (d) {return d.y+(d.height / 2);})
            .style("stroke", "black")
            .style("stroke-width", "1px")
            .style("stroke-opacity", 0.1)
            .style("fill", function (d) { 
                return setColors(d.value);
            })*/
            .style("fill-opacity", function (d) { return d.weight * 0.8; /*return 1;*/ });
            /*.on('mouseover', function(d,i){
                
            })
            .on('mouseout', function(d,i){
                //eventTooltipDiv.style("display", "none");
            })
            .on("click", function(d){
                if(eventTooltipDiv.style('display') === "none") {
                    var coords = d3.mouse(this);
                    d3.selectAll("circle")
                        .style("opacity",'0.4');
                    d3.select(this).style("opacity",'1');
                    //eventTooltipDiv.style("left", d3.event.pageX+10+"px"); - this.r.baseVal.value
                    //eventTooltipDiv.style("top", d3.event.pageY+"px");
                    eventTooltipDiv.style("left", this.cx.baseVal.value + d.width + 10 +"px");
                    eventTooltipDiv.style("top", getTooltipTopPos(this, d));
                    eventTooltipDiv.style("display", "block");
                    eventTooltipDiv.html(makeToolTipDOM(d));
                    if(angular.element(document.getElementById('events')).scope().graphAttributeModel.colorSelected.match(/severity/ig))
                        drawtTooltipDonut({elem: '.node-tooltip-body .node-svg', dataset:d.value });

                    angular.element(document.querySelector('.events-x-axis-data-key')).text(d.target.name);
                    angular.element(document.querySelector('.events-x-axis-data')).css('display', 'block');
                    angular.element(document.querySelector('.events-x-axis-data')).css('top', this.cy.baseVal.value +'px');                    

                    angular.element(document.querySelector('.events-y-axis-data-key')).text(d.source.name);
                    angular.element(document.querySelector('.events-y-axis-data')).css('display', 'block');
                    angular.element(document.querySelector('.events-y-axis-data')).css('left', this.cx.baseVal.value +'px');


                } else {
                    d3.selectAll("circle")
                        .style("opacity",'1');
                    eventTooltipDiv.style("display", "none");
                    angular.element(document.querySelector('.events-x-axis-data')).css('display', 'none');
                    angular.element(document.querySelector('.events-y-axis-data')).css('display', 'none');
                }
            });*/ 
        nodes.transition()
            .delay(function(d, i) { return i * 200; })
            .duration(500)
            .attr("transform",function(d){ 
                return "translate(" + (d.x+(d.height / 2)) + "," + (d.y+(d.height / 2)) + ")"; 
            });

        d3.select('#brush-event-data-btn').on('click',function(d,i){
            angular.element(document.getElementById('events')).scope().toggle3D();
        });


        function brushstart() {
            var e = brush.extent();
            var mouseCood = d3.mouse(this);

            d3.select("#events-container .marquee-selection-prompt").remove();

            if(angular.element(document.querySelector('.dataLandscapeBtnDiv'))) {
                angular.element(document.querySelector('.dataLandscapeBtnDiv')).remove();
                angular.element(document.querySelector('.d3evenDataBtnDiv')).remove();
                angular.element(document.querySelector('.d3brushCloseBtnDiv')).remove();
            }
            selectedList2D.length = 0;
            svg.selectAll("circle").style("fill-opacity",'0.2');
            if(!brushButtonTray) {
                brushButtonTray = d3.select('.matrix-brush').append('g')
                    .attr('id','brush-button-tray');
                    //.append('rect')
                    //.attr('height',32)
                    //.attr('width', 56)
                    //.attr('fill', 'none');

                brushButtonTray.append('rect')
                    .attr('id', 'brush-data-landscape-btn')
                    .attr("transform","translate(0,8)")
                    .attr('height',24)
                    .attr('width', 24)
                    .attr('rx',2)
                    .attr('ry',2)
                    .attr('fill','#4990e2');

                brushButtonTray.append('rect')
                    .attr('id', 'brush-event-data-btn')
                    .attr("transform","translate(32,8)")
                    .attr('height',24)
                    .attr('width', 24)
                    .attr('rx',2)
                    .attr('ry',2)
                    .attr('fill','#4990e2');
            }
            if(!brushClose) {
                brushClose = d3.select('.matrix-brush').append('g')
                    .attr('id','brush-close')
                    .append('rect')
                    .attr('height',24)
                    .attr('width', 24)
                    .attr('rx',2)
                    .attr('ry',2)
                    .attr('fill','#ffffff');
            }

            d3.select('.matrix-brush .resize.se rect')
                .attr('fill', 'url(#marqueeResizeBg)')
                .attr('x',0)
                .attr('y',0);
        }

        function brushmove() {
            var e = brush.extent();
            selectedList2D.length = 0;

            if(brushButtonTray) {
                brushButtonTray.attr("transform", function(){
                    return "translate("+e[0][0]+","+e[1][1]+")";
                }); 
                brushClose.attr("transform", function(){
                    return "translate("+e[1][0]+","+(e[0][1]-24)+")";
                }); 
                //return "translate("+e[1][0]+","+e[1][1]+")"; - for resize
                // return "translate("+e[0][0]+","+e[1][1]+")"; - button cluster 
            }

            nodes.classed('selected', function(d) {
                if(typeof d === 'object') {
                    //if(e[0][0] <= d.x && d.x < e[1][0] && e[0][1] <= d.y && d.y < e[1][1]) {
                    if( (e[0][0] <= d.x || e[0][0] < d.x * 1.25) && (d.x < e[1][0] || d.x*1.25 < e[1][0]) && (e[0][1] <= d.y || e[0][1] <= d.y*1.2) && d.y < e[1][1]) {
                        selectedList2D.push(d);                        
                        return true;
                    } 
                }                
            });
        }

        function brushend() {

            //create pseudo buttons
            var d3dataLandscapeBtnDiv = document.querySelector('#brush-data-landscape-btn').getBoundingClientRect();
            var dataLandscapeBtnDiv = document.createElement('div');
            dataLandscapeBtnDiv.className = "dataLandscapeBtnDiv marguee-btn-style";            
            angular.element(document.querySelector('body')).append(dataLandscapeBtnDiv);
            angular.element(document.querySelector('.dataLandscapeBtnDiv')).css('top',d3dataLandscapeBtnDiv.top+"px");
            angular.element(document.querySelector('.dataLandscapeBtnDiv')).css('left',d3dataLandscapeBtnDiv.left+"px");
            angular.element(document.querySelector('.dataLandscapeBtnDiv')).on('click', function(){
                if(selectedList2D.length === 0) {
                    return;
                }
                angular.element(document.getElementById('events')).scope().toggle3D(null);
                angular.element(document.querySelector('.dataLandscapeBtnDiv')).remove();
                angular.element(document.querySelector('.d3evenDataBtnDiv')).remove();
                angular.element(document.querySelector('.d3brushCloseBtnDiv')).remove();
            });

            var d3evenDataBtnDiv = document.querySelector('#brush-event-data-btn').getBoundingClientRect();
            var evenDataBtnDiv = document.createElement('div');
            evenDataBtnDiv.className = "d3evenDataBtnDiv marguee-btn-style";            
            angular.element(document.querySelector('body')).append(evenDataBtnDiv);
            angular.element(document.querySelector('.d3evenDataBtnDiv')).css('top',d3evenDataBtnDiv.top+"px");
            angular.element(document.querySelector('.d3evenDataBtnDiv')).css('left',d3evenDataBtnDiv.left+"px");
            angular.element(document.querySelector('.d3evenDataBtnDiv')).on('click', function(){
                if(selectedList2D.length === 0) {                    
                    return;
                }
                angular.element(document.getElementById('events')).scope().showGrid(null);
                angular.element(document.querySelector('.dataLandscapeBtnDiv')).remove();
                angular.element(document.querySelector('.d3evenDataBtnDiv')).remove();
                angular.element(document.querySelector('.d3brushCloseBtnDiv')).remove();
            });

            var d3closeBtnDiv = document.querySelector('#brush-close').getBoundingClientRect();
            var brushCloseBtnDiv = document.createElement('div');
            brushCloseBtnDiv.className = "d3brushCloseBtnDiv marguee-btn-style";            
            angular.element(document.querySelector('body')).append(brushCloseBtnDiv);
            angular.element(document.querySelector('.d3brushCloseBtnDiv')).css('top',d3closeBtnDiv.top+"px");
            angular.element(document.querySelector('.d3brushCloseBtnDiv')).css('left',d3closeBtnDiv.left+"px");
            angular.element(document.querySelector('.d3brushCloseBtnDiv')).on('click', function (){  
                d3.select(".matrix-brush").remove();
                d3.selectAll('#events-container .selected', function(d) {
                    angular.element(this).removeClass("selected");
                });
                d3.selectAll("#events-container circle").style("fill-opacity",'0.8');
                angular.element(document.querySelector('#Alpha-4---Analysis path')).css('fill', '#6d6e71');
                angular.element(document.querySelector('#Alpha-4---Cursor-Arrow #Solid')).css('fill', '#4a90e2');
                brushButtonTray = null;
                brushClose = null;

                angular.element(document.querySelector('.dataLandscapeBtnDiv')).remove();
                angular.element(document.querySelector('.d3evenDataBtnDiv')).remove();
                angular.element(document.querySelector('.d3brushCloseBtnDiv')).remove();

                angular.element(document.querySelector('#events-tabs')).css('display', 'block');
                angular.element(document.querySelector('#landscape-explorer')).css('display', 'none');

            });

            angular.element(document.querySelector('#events-tabs')).css('display', 'none');
            angular.element(document.querySelector('#landscape-explorer')).css('display', 'block');
            
            if(selectedList2D.length > 0) {
                selectedList2D = _.uniq(selectedList2D);            
                shieldXUI.landscapeData = setFormatForNewData(selectedList2D);
            } else {
                shieldXUI.landscapeData = null;
            }            
        }

        d3.select('#node-marquee-selector').on("click", function(){
            angular.element(document.querySelector('#Alpha-4---Analysis path')).css('fill', '#4a90e2');
            angular.element(document.querySelector('#Alpha-4---Cursor-Arrow #Solid')).css('fill', '#6d6e71');
            brushButtonTray = null;
            brushClose = null;

            brush = d3.svg.brush()
                .x(d3.scale.identity().domain([0, w]))
                .y(d3.scale.identity().domain([0, h]))                     
                .on("brushstart", brushstart)
                .on("brush", brushmove)
                .on("brushend", brushend);
            
            svg.append("g")
                .attr("class", "matrix-brush")
                .call(brush);

            d3.select('.matrix-brush').append("defs")
                .append('pattern')
                .attr('id', 'marqueeResizeBg')
                .attr('patternUnits', 'userSpaceOnUse')
                .attr('width', 24)
                .attr('height', 24)
                .append("image")
                .attr("xlink:href", "images/marqueeExpand.png")
                .attr('width', 24)
                .attr('height', 24);

            var eventMarqueeDiv = d3.select("#events-container").append("div").attr("class", "marquee-selection-prompt");
            var marqueePos = document.querySelector('#events-container').getBoundingClientRect();
            eventMarqueeDiv.html("<img src='images/Bulp.svg'><div class='text' id='marquee-help-btn'>Click and drag to select area</div>");
            eventMarqueeDiv.style("left", marqueePos.left + (marqueePos.width/2) - (235/2)+ "px");
            eventMarqueeDiv.style("top", marqueePos.top + (marqueePos.height/2) - (48) + "px");

        });

        d3.select('#node-cursor').on('click', function(){
            angular.element(document.querySelector('#Alpha-4---Analysis path')).css('fill', '#6d6e71');
            angular.element(document.querySelector('#Alpha-4---Cursor-Arrow #Solid')).css('fill', '#4a90e2');

            angular.element(document.querySelector('#landscape-explorer')).css('display', 'none');
            angular.element(document.querySelector('#events-tabs')).css('display', 'block');

            d3.select("#events-container .marquee-selection-prompt").remove();

            d3.select(".matrix-brush").remove();
            brushButtonTray = null;
            brushClose = null;

            nodes.classed('selected', function(d) {
                angular.element(this).removeClass("selected");
            });

            svg.selectAll("circle").style("fill-opacity",'0.8');

            angular.element(document.querySelector('.dataLandscapeBtnDiv')).remove();
            angular.element(document.querySelector('.d3evenDataBtnDiv')).remove();
            angular.element(document.querySelector('.d3brushCloseBtnDiv')).remove();

        });

        function setFormatForNewData(matrixDataList) {
            var selectedDataPoints = { nodesX:[], nodesY:[], links:[]};
            //console.log("setFormatForNewData ");
            //console.log(nodes.selectAll(".selected"));
            var nodesX = [];
            var nodesY = [];
            _.forEach(matrixDataList, function(node, key){

                if(key === 0) {
                    nodesX.push({ name: node.source.name, group: node.source.group });
                    nodesY.push({ name: node.target.name, group: node.target.group });                        
                } else {
                    var indexOfSource = _.findIndex(nodesX, function(o) { return o.name === node.source.name; });
                    var indexOfTarget = _.findIndex(nodesY, function(o) { return o.name === node.target.name; });
                    if(indexOfSource === -1) {
                        nodesX.push({ name: node.source.name, group: node.source.group });
                    }
                    if(indexOfTarget === -1) {
                        nodesY.push({ name: node.target.name, group: node.target.group });
                    }
                }
            });

            _.forEach(data.nodesX, function(node, key){
                var inx = _.findIndex(nodesX, function(o) { return o.name === node.name; });
                if(inx !== -1){
                    selectedDataPoints.nodesX.push(nodesX[inx]);
                }
            });

            _.forEach(data.nodesY, function(node, key){
                var iny = _.findIndex(nodesY, function(o) { return o.name === node.name; });
                if(iny !== -1){
                    selectedDataPoints.nodesY.push(nodesY[iny]);
                }
            });



            _.forEach(matrixDataList, function(node, key){
                if(node.weight === 1) {
                    selectedDataPoints.links.push({
                        source: _.findIndex(selectedDataPoints.nodesX, function(o) { return o.name === node.source.name; }),
                        target: _.findIndex(selectedDataPoints.nodesY, function(o) { return o.name === node.target.name; }),
                        value: node.value
                    });
                }
            });

            //console.log("selectedDataPoints"); 
            //console.dir(selectedDataPoints);

            return selectedDataPoints;
        }
       

    }

    return {
        // config to setup wrapper [under construction *DO NOT CALL*]
        // 1. choose which platform to use. [D3, google charts]
        init: function (options) {
            //Put all of the options into a variable called cfg
            if ('undefined' !== typeof options) {
                for (var i in options) {
                    if ('undefined' !== typeof options[i]) {
                        shieldXUI.cfg[i] = options[i];
                    }
                }
            }
        },
        
        // event visualisation
        eventsVfx: function (options) {

            switchto3D = {};

            switchto3D.Events3d = function() {

                var _width          = (window.innerWidth * 0.75) - 40,
                    _height         = (window.innerHeight - 112) - 40,
                    _renderer       = null,
                    _controls       = null,
                    _scene          = new THREE.Scene(),
                    _camera         = new THREE.PerspectiveCamera(45, _width/_height , 1, 20000),
                    _zmetric        = "base", // "size",
                    _colorScale     = { Critical: '#f03e3e', High: '#fd7e14', Medium: '#fcc419', Low : '#d0cd02', None : '#ffffff'},
                    _zscaleSize     = d3.scale.linear().range([0,500]),
                    _zscale         = d3.scale.linear(),
                    _buttonBarDiv   = null,
                    _elements       = null;                    

                function Events3d(selection) {
                    _camera.setLens(100);
                    //_camera.position.set(-500, -3000, 4000);
                    _camera.position.set(_width/2, _height/2, 7000);

                    _renderer = new THREE.CSS3DRenderer();
                    _renderer.setSize(_width, _height);
                    _renderer.domElement.style.position = 'absolute';
                    _renderer.domElement.style.top = '20px';
                    _renderer.domElement.style.background = '#000';
                    
                    selection.node().appendChild(_renderer.domElement);

                    
                    function position() {
                        /* jshint ignore:start */
                        this.style("width",  function(d) { return Math.max(0, d.dx) + "px"; })
                            .style("height", function(d) { return Math.max(0, d.dy) + "px"; });
                        /* jshint ignore:end */
                    }
                    
                    function enterHandler(d) {
                        d.dx=20; 
                        d.dy=20;

                        d3.select(this)
                            .attr("class","node-3D-group")
                            .style("height", function(d){
                                return d.height+"px";
                            })
                            .style("width", function(d){
                                return d.height+"px";
                            })
                            .style("border-radius", "50%")
                            .style("position", "absolute")
                            /*.style("background", function(d){
                                return "#fcc419";//setColors(d.value);
                            })*/
                            .style("opacity", function(d){
                                return d.weight * 0.8;
                            }).on('click',function(){
                                if(angular.element(this).hasClass('selected-3D')) {
                                    angular.element(this).removeClass('selected-3D');
                                    _.remove(angular.element(document.getElementById('events')).scope().selected3DNodes, function(n) {
                                        return n.id === d.id;
                                    });

                                } else {
                                    angular.element(this).addClass('selected-3D');                              
                                    angular.element(document.getElementById('events')).scope().selected3DNodes.push(d);
                                }                                
                                angular.element(document.querySelector('#unselect-3D-values')).css('display', 'block');
                            });

                        
                        d3.select(this)
                            .append("div")
                            .attr("class", "node-3D-elem")
                            .style("height", function(d){
                                return (d.height * 0.7)+"px";
                            })
                            .style("width", function(d){
                                return (d.height * 0.7)+"px";
                            }) 
                            .style("margin", function(d){
                                return (d.height * 0.3)/2+"px";
                            })                           
                            .style("background", function(d){
                                if(d.value) {
                                    var filterSelected = angular.element(document.getElementById('events')).scope().graphAttributeModel.colorSelected;
                                    if(filterSelected.match(/severity/ig)) {                                    
                                            return _colorScale[d.value.severity];
                                    } else if (filterSelected.match(/volume/ig)) {
                                        return '#4990e2';
                                    }
                                }
                            })
                            .style("border-radius", "50%");

                            //.attr("r", function (d) {return d.height / 2;})
                            //.attr("height", function (d) {return d.height;})
                            //.attr("cx", function (d) {return d.x+(d.height / 2);})
                            //.attr("cy", function (d) {return d.y+(d.height / 2);})
                            //.style("stroke", "black")
                            //.style("stroke-width", "1px")
                            //.style("stroke-opacity", 0.1)
                            //.style("fill", function (d) { return someColors(d.source.group); })
                            //.style("fill-opacity", function (d) { return d.weight * 0.8; /*return 1;*/ });

                        switchto3D._nodeDetails.height = d.height;

                        var labelElementX = document.createElement('div');
                        labelElementX.innerHTML = d.source.name;
                        labelElementX.style.fontSize = d.height * 0.3 + "px";
                        labelElementX.style.width = (d.height * 0.3) * d.source.name.length + "px";
                        labelElementX.className = 'node-3D-labelX'; 

                        var labelElementDivX = new THREE.CSS3DObject(labelElementX);
                        labelElementDivX.position.z = -((d.height * 0.3) * d.source.name.length / 2) - (d.height * 0.3);
                        labelElementDivX.rotation.y = Math.PI / 2;

                        var labelElementY = document.createElement('div');
                        labelElementY.innerHTML = d.target.name;
                        labelElementY.style.fontSize = d.height * 0.3 + "px";
                        labelElementY.style.width = (d.height * 0.3) * d.target.name.length + "px";
                        labelElementY.className = 'node-3D-labelY'; 

                        var labelElementDivY = new THREE.CSS3DObject(labelElementY);
                        //labelElementDivY.position.x = d.x;
                        labelElementDivY.position.x = (((d.height * 0.3) * d.target.name.length / 2)) + (d.height / 2);

                        
                        var object = new THREE.CSS3DObject(this); // jshint ignore: line 
                        // object.position.x = d.x + (d.dx / 2);
                        // object.position.y = d.y + (d.dy / 2);
                        // object.position.z = 0;
                        //d.object = object;

                        var group = new THREE.Object3D();
                        group.add(object);
                        if(d.value) {
                            group.add(labelElementDivX);
                            group.add(labelElementDivY);
                        }
                            

                        group.position.x = d.x + (d.dx / 2);
                        group.position.y = d.y + (d.dy / 2);
                        group.position.z = 0;

                        d.object = group;

                        _scene.add(group);
                    }
                    
                  
                    function updateHandler(d) {
                        var object = d.object;
                        var duration = 1000;
                        
                        var zvalue = d.value ? _zscale(d.value.threeDimValues/1000) : 0;  // (_zmetric === "size" ? _zscaleSize(d.size) : (_zmetric === "cost" ? _zscaleCost(d.cost) : 0));

                        var newMetrics = {
                            x: d.x + (d.dx / 2) - _width / 2,
                            y: d.y + (d.dy / 2) - _height / 2,
                            z: -zvalue * 5
                        };

                        var coords = new TWEEN.Tween(object.position)
                            .to({x: newMetrics.x, y: newMetrics.y, z: newMetrics.z}, duration)
                            .easing(TWEEN.Easing.Sinusoidal.InOut)
                            .start();
                      
                        /* jshint ignore: start */
                        var update = new TWEEN.Tween(this)
                            .to({}, duration)
                            .onUpdate(_.bind(render, this))
                            .start();
                        /* jshint ignore: end */
                    }
                  
                    
                    function exitHandler(d) {
                        _scene.remove(d.object);
                        this.remove(); // jshint ignore: line
                    }
                    
                  
                    function transform() {
                        TWEEN.removeAll();
                        _elements.each(updateHandler);
                    }
                    
                  
                    function render() {
                        _renderer.render(_scene, _camera);
                    }
                    
                    
                    function animate() {
                        requestAnimationFrame(animate);
                        TWEEN.update();
                        _controls.update();
                    }
               
                        
                    Events3d.load = function(data) {
                        var zAxisDomain = angular.element(document.getElementById('events')).scope().timeRange;
                        _zscale.domain([ parseInt(zAxisDomain[0]), parseInt(zAxisDomain[1]) ])
                            .range([0,1000]);

                        _elements = selection.datum(data).selectAll(".nodes")
                            .data(data);
                      
                        _elements.enter()
                            .append("div")                            
                            .each(enterHandler);

                        _elements.each(updateHandler);

                        _elements.exit().each(exitHandler).remove();

                        //adding planes
                        var _nodeDetails = switchto3D._nodeDetails;
                        var planeBottom = document.createElement('div');
                        planeBottom.style.width = (_nodeDetails.height * _nodeDetails.totalY) + (_nodeDetails.height * 2)  + "px";
                        planeBottom.style.height = 2500 * 3+ "px";
                        planeBottom.className = 'plane-bottom'; 

                        var planeBottomDiv = new THREE.CSS3DObject(planeBottom);
                        planeBottomDiv.position.y = - ((_nodeDetails.height * _nodeDetails.totalX) / 2) - (_nodeDetails.height);
                        planeBottomDiv.position.x = - ((_nodeDetails.height * _nodeDetails.totalY) / 2);
                        planeBottomDiv.position.z = - (2500 * 3) / 2;
                        planeBottomDiv.rotation.x = Math.PI / 2;

                        var planeLeft = document.createElement('div');
                        planeLeft.style.height = (_nodeDetails.height * _nodeDetails.totalX) + (_nodeDetails.height * 2) + "px";
                        planeLeft.style.width = 2500 * 3+ "px";
                        planeLeft.className = 'plane-left'; 

                        var planeLeftDiv = new THREE.CSS3DObject(planeLeft);
                        //planeLeftDiv.position.y = ((_nodeDetails.height * _nodeDetails.totalY)) / 2;
                        planeLeftDiv.position.x = - (_nodeDetails.height * _nodeDetails.totalY) - (_nodeDetails.height);
                        planeLeftDiv.position.z = - (2500 * 3) / 2;
                        planeLeftDiv.rotation.y = Math.PI / 2;

                        _scene.add(planeBottomDiv);
                        _scene.add(planeLeftDiv);
                      
                        render();
                        animate();
                        transform();
                    };
                    
                    _controls = new THREE.OrbitControls(_camera, _renderer.domElement);
                    //_controls = new THREE.TrackballControls(_camera, _renderer.domElement);
                    /*_controls.staticMoving  = true;
                    _controls.minDistance = 100;
                    _controls.maxDistance = 10000;
                    _controls.rotateSpeed = 1.5;
                    _controls.zoomSpeed = 1.5;
                    _controls.maxZoom = -1;
                    _controls.panSpeed = 0.5;
                    _controls.minPolarAngle = Math.PI/2; // radians
                    _controls.maxPolarAngle = Math.PI/2; // radians
                    _controls.minAzimuthAngle = - Infinity; // radians
                    _controls.maxAzimuthAngle = Infinity; // radians */
                    _controls.staticMoving  = true;
                    _controls.minDistance = 100;
                    _controls.maxDistance = 15000;
                    _controls.rotateSpeed = 1.5;
                    _controls.zoomSpeed = 1.5;
                    _controls.panSpeed = 0.5;
                    _controls.addEventListener('change', render);
                }

                return Events3d;
            };
            
            //var data = shieldXUI.landscapeData;
            var domElem = options.elem, data= options.dataset;
            var w, h;

            w = window.innerWidth * 0.75;
            h = window.innerHeight - 128;

            var adjacencyMatrix = d3.layout.adjacencyMatrix3D()
                .size([w,h])
                //.nodes(shieldXUI.landscapeData.nodes)
                .nodesX(data.nodesX.nodes)
                .nodesY(data.nodesY.nodes)
                .links(data.links)
                .square(false) // set to false if m x n matrix
                .directed(true)
                .renderAs3D(true)
                .nodeID(function (d) {return d.name;});

            var matrixData = adjacencyMatrix;
            
            //Remove whatever chart with the same id/class was present before
            d3.select(options.elem).select("div").remove();    

            //restoring 2D matrix
            d3.select(".matrix-brush").remove();
            d3.selectAll('#events-container .selected', function(d) {
                angular.element(this).removeClass("selected");
            });
            d3.selectAll("#events-container circle").style("fill-opacity",'0.8');
            angular.element(document.querySelector('#Alpha-4---Analysis path')).css('fill', '#6d6e71');
            angular.element(document.querySelector('#Alpha-4---Cursor-Arrow #Solid')).css('fill', '#4a90e2');

            switchto3D._nodeDetails = {};
            switchto3D._nodeDetails.totalX = options.dataset.nodesX.nodes.length;
            switchto3D._nodeDetails.totalY = options.dataset.nodesY.nodes.length;

            var Events3d = switchto3D.Events3d();
            d3.select(domElem).append("div")
                .style("position", "relative")
                .call(Events3d);
            Events3d.load(matrixData);

        },
        
        eventsNavigator: function(options) {
            var data = options.dataset;
            var domElem = options.elem;
            var w, h;
            for(var i=0;i<data.links.length;i++){
                data.links[i].value = [{"value":Math.floor(Math.random() * 100) + 1 },{"value":Math.floor(Math.random() * 100) + 1},{"value":Math.floor(Math.random() * 100) + 1 }];
            }
            /* for(var i=0;i<data.links.length;i++){
                data.links[i].value = [{"value":Math.floor(Math.random() * 6) + 1 },{"value":Math.floor(Math.random() * 6) + 1},{"value":Math.floor(Math.random() * 6) + 1 }];
            }*/
            //w = parseInt(angular.element(document.querySelector(options.elem)).css('width'));           
            //h = parseInt(angular.element(document.querySelector(options.elem)).css('height'));
            
            var elemRef = angular.element(document.querySelector(options.elem));
            var selectedList = [];
            
            var standardNavWidth = parseInt(angular.element(document.querySelector('#navigator')).css('width'));
            var standardNavHeight = parseInt(angular.element(document.querySelector('#navigator')).css('height'));
            var xNodeCount = data.nodesX.nodes.length, yNodeCount = data.nodesY.nodes.length;
            var calculatedRadius;

            if(yNodeCount >= xNodeCount) {
                w = ((standardNavHeight)/yNodeCount) * xNodeCount;
                h = standardNavHeight;
                calculatedRadius = (standardNavHeight/yNodeCount);
            } else {
                w = standardNavWidth; 
                h = (standardNavWidth/xNodeCount) * yNodeCount; 
                calculatedRadius = (standardNavWidth/xNodeCount);
                if(h > standardNavHeight) {
                    angular.element(document.querySelector('#navigator')).css('height',h+'px');
                }
            }
            



            var adjacencyMatrix = d3.layout.adjacencyMatrix()
                .size([w,h])
                //.nodes(data.nodes)
                .nodesX(data.nodesX.nodes)
                .nodesY(data.nodesY.nodes)
                .links(data.links)
                .square(false) // set to false if m x n matrix
                .directed(true)
                .nodeID(function (d) {
                    if(d){
                        return d.name;    
                    }else{
                        return "teamZenith";
                    }
                    });

            var matrixData = adjacencyMatrix();
            if(angular.element(document.getElementById('events')).scope().graphAttributeModel.colorSelected.match(/volume/ig)) {
                shieldXUI.maxVolume = d3.max(matrixData, function(d) { 
                    if(d.hasOwnProperty("value"))
                        return d.value.volume;
                });
                shieldXUI.minVolume = d3.min(matrixData, function(d) { 
                    if(d.hasOwnProperty("value"))
                        return d.value.volume;
                });                
            }
            //Remove whatever chart with the same id/class was present before
            d3.select(options.elem).select("svg").remove();
            var radius_pie = matrixData[0].height;
            // add the SVG element
            var svg = d3.select(options.elem).append("svg")
                //.attr("transform", "translate(50,50)")
                .attr("id", "events-analysis")
                .attr("width",w)
                .attr("height",h);
            var colourSet = options.color;

            var pie = d3.layout.pie()
                .sort(null)
                .value(function(d) { return d.value; });

            var arc = d3.svg.arc()
                .innerRadius(radius_pie/2 - (radius_pie/2)/2)
                .outerRadius(radius_pie/2);

            var nodes = svg
                .selectAll("rect")
                .data(matrixData)
                .enter()
                .append("g")
                .attr("transform",function(d){ 
                    return "translate(" + (d.x+(d.height / 2)) + "," + (d.y+(d.height / 2)) + ")"; 
                });

                nodes.selectAll("path")
                .data(function(d){
                    if(d.value){
                        return pie(d.value);    
                    }else{
                        return "";    
                    }
                    
                })
                .enter()
                .append("path")
                .attr("fill", function(d, i) { 
                    return colourSet; 
                })
                .attr("d", arc)
                /*.style("stroke", "black")
                .style("stroke-width", "1px")
                .style("stroke-opacity", 0.1)
                .style("fill", function (d) {                    
                    return setColors(d.value); 
                })*/
                .style("fill-opacity", function (d) { return d.weight * 0.2; });


            var brush = d3.svg.brush()
                .x(d3.scale.identity().domain([0, w]))
                .y(d3.scale.identity().domain([0, h]))                     
                .on("brushstart", brushstart)
                .on("brush", brushmove)
                .on("brushend", brushend);

            

            function brushstart(p) {
                selectedList.length = 0;                
            }            

            function brushmove(p) {
                var e = brush.extent();
                selectedList.length = 0;
                //var extent = d3.event.target.extent();
                nodes.classed('selected', function(d) {
                    
                    if(typeof d === 'object') {
                        //if(extent[0][0] <= d.x && d.x < extent[1][0] && extent[0][1] <= d.y && d.y < extent[1][1]) {
                        if(e[0][0] <= d.x && d.x < e[1][0] && e[0][1] <= d.y && d.y < e[1][1]) {
                            selectedList.push(d);
                            return true;
                        } 
                    }
                    
                });

            }

            function brushend(p) {
                var test = brush.extent();
                if(selectedList.length === 0) drawBrush();

                selectedList = _.uniq(selectedList);
                console.log('brush ended', selectedList.length);
                /*nodes.selectAll(".selected").datum(function(){
                    console.log("from datum >>",this);
                });*/
                //shieldXUI.landscapeData = setFormatForNewData(selectedList);
                var chartObj = {
                    elem: '#events-container',
                    dataset:  setFormatForNewData(selectedList),  // not customisable option
                };
                events2DViewer(chartObj);
                lastExtent = brush.extent();
            }

            function drawBrush() {
                brush.extent([[0,0],[standardNavWidth/2,(standardNavWidth/2) / 1.7]]);
                brush(d3.select(".nav-brush").transition());
                brush.event(d3.select(".nav-brush").transition());
                d3.selectAll('.nav-brush > .resize').remove();                
            }

            
            svg.append("g")
                .attr("class", "nav-brush")
                .call(brush)
                .call(drawBrush);
                /*.selectAll(".background")
                .each(function(d) { 
                    d.type = "extent"; 
                })
                .on("click", function(ev){
                    console.log(ev);
                    redrawBrush();
                });*/
            

            function redrawBrush (event){
                var navMouseCoods = d3.mouse(this);
                console.log(d3.select(this.parentNode));
            }

            function setFormatForNewData(matrixDataList) {
                var selectedDataPoints = { nodesX:[], nodesY:[], links:[]};
                //console.log("setFormatForNewData ");
                //console.log(nodes.selectAll(".selected"));
                var nodesX = [];
                var nodesY = [];
                _.forEach(matrixDataList, function(node, key){

                    if(key === 0) {
                        nodesX.push({ name: node.source.name, group: node.source.group });
                        nodesY.push({ name: node.target.name, group: node.target.group });                        
                    } else {
                        var indexOfSource = _.findIndex(nodesX, function(o) { return o.name === node.source.name; });
                        var indexOfTarget = _.findIndex(nodesY, function(o) { return o.name === node.target.name; });
                        if(indexOfSource === -1) {
                            nodesX.push({ name: node.source.name, group: node.source.group });
                        }
                        if(indexOfTarget === -1) {
                            nodesY.push({ name: node.target.name, group: node.target.group });
                        }
                    }
                });

                _.forEach(data.nodesX.nodes, function(node, key){
                     var inx = _.findIndex(nodesX, function(o) { return o.name === node.name; });
                     if(inx !== -1){
                        selectedDataPoints.nodesX.push(nodesX[inx]);
                     }
                });

                 _.forEach(data.nodesY.nodes, function(node, key){
                     var iny = _.findIndex(nodesY, function(o) { return o.name === node.name; });
                     if(iny !== -1){
                        selectedDataPoints.nodesY.push(nodesY[iny]);
                     }
                });



            _.forEach(matrixDataList, function(node, key){
                if(node.weight === 1) {
                        selectedDataPoints.links.push({
                            source: _.findIndex(selectedDataPoints.nodesX, function(o) { return o.name === node.source.name; }),
                            target: _.findIndex(selectedDataPoints.nodesY, function(o) { return o.name === node.target.name; }),
                            value: node.value
                        });
                 }
             });
               
              console.log("selectedDataPoints"); 
              console.dir(selectedDataPoints);

              return selectedDataPoints;
            }

        },
        barChart: function (options) {

            var margin = {top: 20, right: 30, bottom: 250, left: 75},
            width = options.elem.parentElement.clientWidth - margin.left - margin.right,
            height = options.elem.parentElement.clientHeight - margin.top - margin.bottom;


            // set the ranges
            var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.05);

            var y = d3.scale.linear().range([height, 0]);

            // define the axis
            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .outerTickSize(0)
                .tickPadding(10);


            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .innerTickSize(-width)
                .outerTickSize(0)
                .tickPadding(10);

            if(options.columns == 2){
                yAxis.ticks(2);
            }else if(options.columns == 3){
                yAxis.ticks(1);
            }else{
                yAxis.ticks(4);
            }

            d3.select(".d3-tip.n").remove();

            var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d) {
                    return "<span style='font-weight:bold;'>"+d.Letter+"</span><br/><span'> Value: <span style='font-weight:bold;'>" + d.Freq + "</span></span>";
                });



            //Remove whatever chart with the same id/class was present before
            d3.select(options.elem).select("svg").remove();


            // add the SVG element
            var svg = d3.select(options.elem).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            svg.call(tip);

            var todaldata = options.dataset;
            function dataToSet(datavalue){
                datavalue.forEach(function(d) {
                    d.Letter = d.Letter;
                    d.Freq = +d.Freq;
                });
                data = datavalue;
                x.domain(data.map(function(d) { return d.Letter; }));
                y.domain([0, d3.max(data, function(d) { return d.Freq; })]);
                console.log(x.rangeBand());
                if(x.rangeBand() < 14){
                   data = (data.length > 5)?data.slice(5,data.length):data;
                   dataToSet(data); 
                }
            }

            dataToSet(todaldata);
            // scale the range of the data
            

           
            
            
            // add axis
        var xAxisg = svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis)
            .selectAll("text")
              .text(function(d){
                return truncLabel(d);
              })
              .style("text-anchor", "end")
              .attr("dx", "-.8em")
              .attr("dy", "-.55em")
              .style("font-size","14px")
              .attr("transform", "rotate(-90)" );

            svg.append("text")
              .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
              .attr("transform", "translate("+ (width/2) +","+(height+(margin.bottom/2)-30)+")")  // centre below axis
              .text(options.axis.xlabel)
              .attr('class','axis-label');

            svg.append("g")
              .attr("class", "y axis")
              .call(yAxis);

            svg.append("text")
              .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
              .attr("transform", "translate("+ (-35) +","+(height/2)+")rotate(-90)")  // centre below axis
              .text(options.axis.ylabel)
              .attr('class','axis-label');
              /*.append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 5)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("label-y");*/


            // Add bar chart
            svg.selectAll("bar")
                .data(data)
                .enter().append("rect")
                    .attr("class", "bar")
                    .attr("x", function(d) { return x(d.Letter); })
                    .attr("width", x.rangeBand())
                    .attr("y", function(d) { return y(d.Freq); })
                    .attr("height", function(d) { return height - y(d.Freq); })
                    .on('mouseover', tip.show)
                    .on('mouseout', tip.hide); 

        },
        pieChartBasic: function (options) {
            console.log(options);
            var w = options.elem.parentElement.clientWidth; //350, //width
            var h = options.elem.parentElement.clientHeight; //350, //height
            if(w < 100 || h < 100) {
                h = w = 350;
            } else {
                h = h - 104; w = w - 104;
            }
            var r = Math.min(w, h) / 2;            //radius
            var color = d3.scale.category20c();     //builtin range of colors
            var data = angular.copy(options.dataset);

            //Remove whatever chart with the same id/class was present before
            d3.select(options.elem).select("svg").remove();

            var vis = d3.select(options.elem)
                .append("svg:svg")                  //create the SVG element inside the <body>
                .data([data])                       //associate our data with the document
                .attr("width", w)                   //set the width and height of our visualization (these will be attributes of the <svg> tag
                .attr("height", h)
                .append("svg:g")                    //make a group to hold our pie chart
                .attr("transform", "translate(" + r + "," + r + ")");    //move the center of the pie chart from 0, 0 to radius, radius
            
            var arc = d3.svg.arc()                  //this will create <path> elements for us using arc data
                .outerRadius(r);

            var pie = d3.layout.pie()               //this will create arc data for us given a list of values
                .value(function(d) { return d.value; });    //we must tell it out to access the value of each element in our data array

            var arcs = vis.selectAll("g.slice")     //this selects all <g> elements with class slice (there aren't any yet)
                .data(pie)                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) 
                .enter()                            //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
                .append("svg:g")                    //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
                .attr("class", "slice");            //allow us to style things in the slices (like text)

            arcs.append("svg:path")
                .attr("fill", function(d, i) { return color(i); } ) //set the color for each slice to be chosen from the color function defined above
                .attr("d", arc);                                    //this creates the actual SVG path using the associated data (pie) with the arc drawing function

            arcs.append("svg:text")                                     //add a label to each slice
                .attr("transform", function(d) {                    //set the label's origin to the center of the arc
                //we have to make sure to set these before calling arc.centroid
                d.innerRadius = 0;
                d.outerRadius = r;
                return "translate(" + arc.centroid(d) + ")";        //this gives us a pair of coordinates like [50, 50]
            })
            .attr("text-anchor", "middle")                          //center the text on it's origin
            .text(function(d, i) { return data[i].label; });        //get the label from our original data array

        },
        pieChartDonut: function (options) {
            var width = 350,
            height = 350,
            radius = Math.min(width, height) / 2;
            var color = d3.scale.category20c();

            var dataset = options.dataset;

            var pie = d3.layout.pie()
                .sort(null);

            var arc = d3.svg.arc()
                .innerRadius(radius - 100)
                .outerRadius(radius - 50);

            //Remove whatever chart with the same id/class was present before
            d3.select(options.elem).select("svg").remove();

            var svg = d3.select(options.elem).append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");    

            var path = svg.selectAll("path")
                .data(pie(dataset.nodes))
                .enter().append("path")
                .attr("fill", function(d, i) { return color(i); })
                .attr("d", arc);

        },
        realtimeMultiseriesTrendline: function(options) {
            var limit = 60 * 1,
            duration = 750,
            now = new Date(Date.now() - duration);

            var width = 700,
                height = 330;

            var groups = {
                current: {
                    value: 0,
                    color: 'orange',
                    data: d3.range(limit).map(function() {
                        return 0;
                    })
                },
                target: {
                    value: 0,
                    color: 'green',
                    data: d3.range(limit).map(function() {
                        return 0;
                    })
                },
                output: {
                    value: 0,
                    color: 'grey',
                    data: d3.range(limit).map(function() {
                        return 0;
                    })
                }
            };

            //Remove whatever chart with the same id/class was present before
            d3.select(options.elem).select("svg").remove();

            var x = d3.time.scale()
                .domain([now - (limit - 2), now - duration])
                .range([0, width]);

            var y = d3.scale.linear()
                .domain([0, 100])
                .range([height, 0]);

            var line = d3.svg.line()
                .interpolate('basis')
                .x(function(d, i) {
                    return x(now - (limit - 1 - i) * duration);
                })
                .y(function(d) {
                    return y(d);
                });

            var svg = d3.select(options.elem).append('svg')
                .attr('class', 'chart')
                .attr('width', width)
                .attr('height', height + 50);

            var axis = svg.append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0,' + height + ')')
                .call(x.axis = d3.svg.axis().scale(x).orient('bottom'));

            var paths = svg.append('g');

            for (var name in groups) {
                var group = groups[name];
                group.path = paths.append('path')
                    .data([group.data])
                    .attr('class', name + ' group')
                    .style('stroke', group.color);
            }

            function tick() {
                now = new Date();

                // Add new values
                for (var name in groups) {
                    var group = groups[name];
                    //group.data.push(group.value) // Real values arrive at irregular intervals
                    group.data.push(Math.random() * 100);
                    group.path.attr('d', line);
                }

                // Shift domain
                x.domain([now - (limit - 2) * duration, now - duration]);

                // Slide x-axis left
                axis.transition()
                    .duration(duration)
                    .ease('linear')
                    .call(x.axis);

                // Slide paths left
                paths.attr('transform', null)
                    .transition()
                    .duration(duration)
                    .ease('linear')
                    .attr('transform', 'translate(' + x(now - (limit - 1) * duration) + ')')
                    .each('end', tick);

                // Remove oldest data point from each group
                for (var namex in groups) {
                    var groupx = groups[namex];
                    groupx.data.shift();
                }
            }

            tick();
        },
        stackedArea: function(options) {
            //var format = d3.time.format("%m/%d/%y");
            var format = d3.time.format.utc("%Y-%m-%dT%H:%M:%S"); // need to change this

            var margin = {top: 20, right: 30, bottom: 100, left: 75},
                width = options.elem.parentElement.clientWidth - margin.left - margin.right,
                height = options.elem.parentElement.clientHeight - 128 - margin.top - margin.bottom;

            var x = d3.time.scale()
                .range([0, width]);

            var y = d3.scale.linear()
                .range([height, 0]);

            var z = d3.scale.linear().range(["#b6d2f3","#6ea6e7","#4a90e2","#3b73b4","#2c5687"]);
            var colourStack = ["#b6d2f3","#6ea6e7","#4a90e2","#3b73b4","#2c5687"];

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .ticks(d3.time.minutes) //days
                .outerTickSize(0)
                .tickPadding(10); 

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .ticks(4)
                .innerTickSize(-width)
                .outerTickSize(0)
                .tickPadding(10);

            var stack = d3.layout.stack()
                .offset("zero")
                .values(function(d) { return d.values; })
                .x(function(d) { return d.date; })
                .y(function(d) { return d.value; });

            var nest = d3.nest()
                .key(function(d) { return d.key; });

            var area = d3.svg.area()
                .interpolate("linear") //cardinal
                .x(function(d) { return x(d.date); })
                .y0(function(d) { return y(d.y0); })
                .y1(function(d) { return y(d.y0 + d.y); });

            var eventTooltipDiv = d3.select("#shieldx-dashboard").append("div").attr("class", "stackedBarEventsToolTip");

            //Remove whatever chart with the same id/class was present before
            d3.select(options.elem).select("svg").remove();

            var svg = d3.select(options.elem).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var data = angular.copy(options.dataset);

            data.forEach(function(d) {
                if(typeof d.date === 'number') d.date = new Date(d.date);
                else d.date = format.parse(d.date);
                
                d.value = +d.value;
            });

            var layers = stack(nest.entries(data));

            x.domain(d3.extent(data, function(d) { return d.date; }));
            y.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);

            svg.selectAll(".layer")
                .data(layers)
                .enter().append("path")
                .attr("class", "layer")
                .attr("d", function(d) { return area(d.values); })
                .style("fill", function(d, i) {                     
                        return colourStack[i%colourStack.length];                    
                        //return z(i);                     
                });

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
            .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", "-.55em")
                .attr("transform", "rotate(-90)" )
                .style("font-size","14px");

            svg.append("text")
              .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
              .attr("transform", "translate("+ (width/2) +","+(height+(margin.bottom/2)+20)+")")  // centre below axis
              .text(options.axis.xlabel)
              .attr('class','axis-label');

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis);

            svg.append("text")
              .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
              .attr("transform", "translate("+ (-45) +","+(height/2)+")rotate(-90)")  // centre below axis
              .text(options.axis.ylabel)
              .attr('class','axis-label');

           /* svg.selectAll(".layer")
                .attr("opacity", 1)
                .on("mouseover", function(d, i) {
                    svg.selectAll(".layer").transition()
                    .duration(250)
                    .attr("opacity", function(d, j) {
                        return j != i ? 0.8 : 1;
                    });
                })
                .on("mousemove", function(d, i) {
                    mousex = d3.mouse(this);
                    mousex = mousex[0];
                    var invertedx = x.invert(mousex);
                    //console.log(invertedx);
                });*/

            svg.selectAll(".dot")
                .data(data)
                .enter().append("circle")
                .attr("class", "dot")
                .attr("r", 5)
                .attr("cx", function(d){ return x(d.date); })
                .attr("cy", function(d){ 
                    return y(d.value + d.y0); 
                })
                .attr("opacity", 0)
                .style("fill", "#000")
                .on("mouseover", function(d, i) {
                    svg.selectAll(".dot").transition()
                    .duration(250)
                    .attr("opacity", function(d, j) {
                        return j != i ? 0 : 1;
                    });

                    if(eventTooltipDiv.style('display') === "none") {
                        var coords = d3.mouse(this);
                        eventTooltipDiv.style("display", "inline-block");
                        eventTooltipDiv.html("<span>"+d.key+": </span><br/><span>"+d.value+"</span>");
                        eventTooltipDiv.style("left", d3.event.pageX - (eventTooltipDiv["0"]["0"].offsetWidth/2) +"px");
                        eventTooltipDiv.style("top", d3.event.pageY - 115 +"px");
                    } else {
                        eventTooltipDiv.style("display", "none");
                    }
                })
                .on('mouseout', function(d,i){
                    svg.selectAll(".dot").attr("opacity", 0);
                    eventTooltipDiv.style("display", "none");
                 });
            
        
        },
        groupedBarChart: function(options) {
            var margin = {top: 20, right: 20, bottom: 30, left: 40},
                width = 700 - margin.left - margin.right,
                height = 330 - margin.top - margin.bottom;

            var x0 = d3.scale.ordinal()
                .rangeRoundBands([0, width], 0.1);

            var x1 = d3.scale.ordinal();

            var y = d3.scale.linear()
                .range([height, 0]);

            var color = d3.scale.ordinal()
                .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

            var xAxis = d3.svg.axis()
                .scale(x0)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .tickFormat(d3.format(".2s"));

            //Remove whatever chart with the same id/class was present before
            d3.select(options.elem).select("svg").remove();

            var svg = d3.select(options.elem).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var data = options.dataset;

            var ageNames = d3.keys(data[0]).filter(function(key) { return key !== "country"; });

            data.forEach(function(d) {
                d.ages = ageNames.map(function(name) { return {name: name, value: +d[name]}; });
            });

            x0.domain(data.map(function(d) { return d.country; }));
            x1.domain(ageNames).rangeRoundBands([0, x0.rangeBand()]);
            y.domain([0, d3.max(data, function(d) { return d3.max(d.ages, function(d) { return d.value; }); })]);

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Something!");

            var state = svg.selectAll(".state")
                .data(data)
                .enter().append("g")
                .attr("class", "state")
                .attr("transform", function(d) { return "translate(" + x0(d.country) + ",0)"; });

            state.selectAll("rect")
                .data(function(d) { return d.ages; })
                .enter().append("rect")
                .attr("width", x1.rangeBand())
                .attr("x", function(d) { return x1(d.name); })
                .attr("y", function(d) { return y(d.value); })
                .attr("height", function(d) { return height - y(d.value); })
                .style("fill", function(d) { return color(d.name); });

            var legend = svg.selectAll(".legend")
                .data(ageNames.slice().reverse())
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

            legend.append("rect")
                .attr("x", width - 18)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", color);

            legend.append("text")
                .attr("x", width - 24)
                .attr("y", 9)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .text(function(d) { return d; });

        },
        lineGraphBasic: function(options) {

            var data = d3.range(20).map(function(i) {
              return {x: i / 19, y: (Math.sin(i / 3) + 2) / 4};
            });

            var margin = {top: 20, right: 30, bottom: 30, left: 40},
                width = 330 - margin.left - margin.right,
                height = 330 - margin.top - margin.bottom;

            var x = d3.scale.linear()
                .domain([0, 1])
                .range([0, width]);

            var y = d3.scale.linear()
                .domain([0, 1])
                .range([height, 0]);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");

            var line = d3.svg.line()
                //.interpolate(function(points) { return points.join("A 1,1 0 0 1 "); }) // custom interpolator
                .interpolate('linear')
                .x(function(d) { return x(d.x); })
                .y(function(d) { return y(d.y); });

            //Remove whatever chart with the same id/class was present before
            d3.select(options.elem).select("svg").remove();

            var svg = d3.select(options.elem).append("svg")
                .datum(data)
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis);

            svg.append("path")
                .attr("class", "line")
                .attr("d", line);

            svg.selectAll(".dot")
                .data(data)
              .enter().append("circle")
                .attr("class", "dot")
                .attr("cx", line.x())
                .attr("cy", line.y())
                .attr("r", 3.5);

        },
        tables: function(options) {
            console.log("drawing tables in widgets", options.elem, options.dataset);
            var margin = {top: 20, right: 30, bottom: 30, left: 40},
                width = options.elem.parentElement.clientWidth - margin.left - margin.right,
                height = options.elem.parentElement.clientHeight - margin.top - margin.bottom;

            var tableHeader = '', tableRows = '', temp, loopLength;
            var setcolor, stageCount;


            function drawDonut(options,id,cloumncount) {
                if(id === 0 || id === 3){      
                    return '';      
                }
                var width = 23*(5-cloumncount),
                    height = 23*(5-cloumncount),
                radius = Math.min(width, height) / 2;
                if(cloumncount === 1){
                    radius = 30; 
                }else if(cloumncount === 2){
                    radius = 24;
                }else{
                    radius = 18;
                }
                var color = d3.scale.category20c();

                var dataset = options.dataset;

                var pie = d3.layout.pie()
                    .sort(null);

                var arc = d3.svg.arc()
                    .innerRadius(radius - (4*(5-cloumncount)+cloumncount*2))
                    .outerRadius(radius);

                //Remove whatever chart with the same id/class was present before
                d3.select(options.elem).select("svg").remove();

                var svg = d3.select(options.elem).append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append("g")
                    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");    

                var path = svg.selectAll("path")
                    .data(pie(dataset))
                    .enter().append("path")
                    .attr("fill", function(d, i) { 
                        return options.colors.primary; 
                    })
                    .attr("opacity", function(d,i){
                        if(i === 0)
                            return 1;
                        else
                            return 0.2;
                    })
                    .attr("d", arc);

            }
            

            //Remove whatever chart with the same id/class was present before
            d3.select(options.elem).select("section.table-container").remove();            

            if(!!!options.elem.id.match(/IOP/)) {
                tableHeader = "<tr><td class='table-header'>Application Name</td></tr>";

                loopLength = (options.dataset.length > 7) ? loopLength = 7 : loopLength = options.dataset.length;

                for(var i = 0; i < loopLength; i++){
                    tableRows = tableRows + "<tr><td class='table-rows'>"+ options.dataset[i].key +"</td></tr>";
                }
                if(loopLength === 7) {
                    tableRows = tableRows + "<tr><td class='last-table-row'>+ "+ (options.dataset.length-loopLength) +" more</td></tr>";
                }
            } else {
                stageCount = [0,0,0,0];
                var stageColors = {
                    1: { primary: '#d0cd02', secondary: '#f5f4cb'},
                    2: { primary: '#fcc419', secondary: '#fdf2d0'},
                    3: { primary: '#fd7e14', secondary: '#fee4cf'},
                    4: { primary: '#f03e3e', secondary: '#fbd7d7'}
                };
                //create table header
                tableHeader = '<tr style="text-align: center;">';
                _.forEach(options.dataset.headers, function(obj, key){
                    if(obj.title.match(/id/ig)) {
                        tableHeader = tableHeader + "<td class='table-header'>"+ obj.title +"</td>";
                    } else {
                        if (obj.title.match(/1/ig)){
                            setcolor = stageColors[1].primary;
                        } else if(obj.title.match(/2/ig)) {
                            setcolor = stageColors[2].primary;
                        } else if(obj.title.match(/3/ig)) {
                            setcolor = stageColors[3].primary;
                        } else if(obj.title.match(/4/ig)) {
                            setcolor = stageColors[4].primary;
                        }
                        tableHeader = tableHeader + "<td class='table-header'><div style=\"background:"+setcolor+";height: 8px;width: 8px;border-radius: 50%;margin: 0 auto\"></div>"+ obj.title +"</td>";
                    }
                });
                tableHeader = tableHeader + "</tr>";
                //create table body
                var idTemp='',ioppadding = '';
                if(options.columns === 3){
                   ioppadding =  '0px';
                }else{
                    ioppadding =  '5px';
                }
                _.forEach(options.dataset.rowData, function(obj, key){
                    tableRows = tableRows + '<tr class="iop-'+options.columns+'-view">';
                    //adding ID col
                    idTemp = obj.id.substr(0,5)+"..."+obj.id.substr(obj.id.length-5,obj.id.length);
                    tableRows = tableRows + '<td style="padding: 3px; " class="iop-id">'+idTemp+'</td>';
                    _.forEach(obj.val, function(stages, id){
                        if(parseInt(id) ===0 || parseInt(id) === 3 ){
                            tableRows = tableRows + '<td style="padding:'+ioppadding+';" align="center"><div style="margin: 0 auto;width: 100%;">' +
                            '<div style="font-size: 14px;" class="event-details-count"><div class="count">'+stages.count+' Events</div></div>'+ 
                            '</div></td>';    /*<div class="hours" style="color:#000;font-weight:bold;">'+stages.hours+':'+stages.mintues+' hrs</div>*/
                        }else{
                        tableRows = tableRows + '<td style="padding:'+ioppadding+';" align="center"><div style="margin: 0 auto;width: 165px;">' +
                            '<div id="pie'+obj.id+'-'+id+'-'+options.elem.id+'" class="donut-container"></div><div class="stage-detail"><div class="hours">'+stages.hours+':'+stages.mintues+' hrs</div><div class="count">'+stages.count+' Events</div></div>'+ 
                            '</div></td>';
                        }
                        stageCount[id] = stages.hours*60 + stages.mintues;
                    });
                    //closing TR
                    tableRows = tableRows + '</tr>';
                });
            }
            var tableDOM = "<section class='table-container'><table class='widget-table' style='width:"+width+"px;'>" + tableHeader + tableRows + "</table></section>";
            angular.element(options.elem).append(tableDOM); 

            console.log(stageCount);

            if(!!options.elem.id.match(/IOP/)) {
                //draw the peicharts
                _.forEach(options.dataset.rowData, function(obj, key){
                    _.forEach(obj.val, function(stages, id){
                        drawDonut({
                            elem: document.querySelector('#pie'+obj.id+'-'+id+'-'+options.elem.id),
                            colors: stageColors[parseInt(id)+1],
                            dataset: [stageCount[parseInt(id)], 2160] 
                        },parseInt(id),options.columns);
                    });
                });
            }
        }
    };

}
