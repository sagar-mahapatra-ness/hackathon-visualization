(function() {
  d3.layout.adjacencyMatrix3D = function() {
    var directed = true,
      size = [1,1],      
      nodes = [],
      nodesX = [],
      nodesY = [],
      edges = [],
      square = true, 
      edgeWeight = function (d) { return 1; },
      render3D = false,
      nodeID = function (d) { return d.id; };

    function matrix() {
      var width = size[0],
      height = size[1],
      nodeWidth,
      nodeHeight,
      constructedMatrix = [],
      matrix = [],
      edgeHash = {},
      xScale, yScale;

      if(square) {
        xScale = d3.scale.linear().domain([0,nodes.length]).range([0,width]);
        yScale = d3.scale.linear().domain([0,nodes.length]).range([0,height]);
        nodeWidth = width / nodes.length;
        nodeHeight = height / nodes.length;
      } else {
        xScale = d3.scale.linear().domain([0,nodesX.length]).range([0,width]);
        yScale = d3.scale.linear().domain([0,nodesY.length]).range([0,height]);  
        nodeWidth = width / nodesX.length;
        nodeHeight = height / nodesY.length;
      }

      
      nodes.forEach(function(node, i) {
        node.sortedIndex = i;
      });

      nodesX.forEach(function(node, i) {
        nodesX.sortedIndex = i;
      });

      nodesY.forEach(function(node, i) {
        nodesY.sortedIndex = i;
      });
      if(square) {
        edges.forEach(function(edge) {
          var constructedEdge = {source: edge.source, target: edge.target, weight: edgeWeight(edge)};
          if (typeof edge.source == "number") {
            constructedEdge.source = nodes[edge.source];
          }
          if (typeof edge.target == "number") {
            constructedEdge.target = nodes[edge.target];
          }
          var id = nodeID(constructedEdge.source) + "-" + nodeID(constructedEdge.target);

          if (directed === false && constructedEdge.source.sortedIndex < constructedEdge.target.sortedIndex) {
            id = nodeID(constructedEdge.target) + "-" + nodeID(constructedEdge.source);
          }
          if (!edgeHash[id]) {
            edgeHash[id] = constructedEdge;
          }
          else {
            edgeHash[id].weight = edgeHash[id].weight + constructedEdge.weight;
          }
        });
      } else {
        console.log('edges for MxN'); 
        edges.forEach(function(edge) {
          var constructedEdge = {source: edge.source, target: edge.target, weight: edgeWeight(edge), value: edge.value};
          if (typeof edge.source == "number") {
            constructedEdge.source = nodesX[edge.source];
          }
          if (typeof edge.target == "number") {
            constructedEdge.target = nodesY[edge.target];
          }
         // var id = "X_"+nodeID(constructedEdge.target) + "-" + "Y_"+nodeID(constructedEdge.source) ;
          var id = "X_"+nodeID(constructedEdge.source) + "-" + "Y_"+nodeID(constructedEdge.target) ;
          if (!edgeHash[id]) {
            edgeHash[id] = [];
            edgeHash[id].push(constructedEdge);
          } else {
            edgeHash[id].push(constructedEdge);
            //edgeHash[id].weight = edgeHash[id].weight + constructedEdge.weight;
          }
        });
      }

      //console.log("nodes", nodes, nodes.length);

      if(square) {
        nodes.forEach(function (sourceNode, a) {
          nodes.forEach(function (targetNode, b) {
            var grid = {id: nodeID(sourceNode) + "-" + nodeID(targetNode), source: sourceNode, target: targetNode, x: xScale(b), y: yScale(a), weight: 0, height: nodeHeight, width: nodeWidth};
            var edgeWeight = 0;
            if (edgeHash[grid.id]) {
              edgeWeight = edgeHash[grid.id].weight;
              grid.weight = edgeWeight;
            }
            if (directed === true || b < a) {
              matrix.push(grid);
              if (directed === false) {
                var mirrorGrid = {id: nodeID(sourceNode) + "-" + nodeID(targetNode), source: sourceNode, target: targetNode, x: xScale(a), y: yScale(b), weight: 0, height: nodeHeight, width: nodeWidth};
                mirrorGrid.weight = edgeWeight;
                matrix.push(mirrorGrid);
              }
            }
          });
        });
      } else {
        nodesX.forEach(function (sourceNode, a) {
          nodesY.forEach(function (targetNode, b) {
            var grid = {id: "X_"+nodeID(sourceNode) + "-" +"Y_"+nodeID(targetNode), source: sourceNode, target: targetNode, x: xScale(a), y: yScale(b), weight: 0, height: nodeHeight, width: nodeWidth};
            var edgeWeight = 0;
            if (edgeHash[grid.id]) {
              _.forEach(edgeHash[grid.id], function(evNode, key){
                var xNode = {
                  id: grid.id, 
                  source: grid.source, 
                  target: grid.target, 
                  x: grid.x, 
                  y: grid.y, 
                  weight: evNode.weight, 
                  height: grid.height, 
                  width: grid.width, 
                  value: evNode.value
                };
                matrix.push(xNode);
              });
              //grid.value = edgeHash[grid.id].value;
              //edgeWeight = edgeHash[grid.id].weight;
              //grid.weight = edgeWeight;
            } else {
              matrix.push(grid);
            }
          });
        });
      }

      console.log("matrix", matrix, matrix.length);

      return matrix;
    }

    matrix.directed = function(x) {
      if (!arguments.length) return directed;
      directed = x;
      return matrix;
    };

    matrix.square = function(x) {
      if (!arguments.length) return square;
      square = x;
      return matrix;
    };

    matrix.size = function(x) {
      if (!arguments.length) return size;
      size = x;
      return matrix;
    };

    matrix.nodes = function(x) {
      if (!arguments.length) return nodes;
      nodes = x;
      return matrix;
    };

    matrix.nodesX = function(x) {
      if (!arguments.length) return nodes;
      nodesX = x;
      return matrix;
    };

    matrix.nodesY = function(x) {
      if (!arguments.length) return nodes;
      nodesY = x;
      return matrix;
    };

    matrix.links = function(x) {
      if (!arguments.length) return edges;
      edges = x;
      return matrix;
    };

    matrix.renderAs3D = function(x) {
      if (!arguments.length) return render3D;
      render3D = x;
      return matrix;
    };

    matrix.edgeWeight = function(x) {
      if (!arguments.length) return edgeWeight;
      if (typeof x === "function") {
        edgeWeight = x;
      }
      else {
        edgeWeight = function () { return x; };
      }
      return matrix;
    };

    matrix.nodeID = function(x) {
      if (!arguments.length) return nodeID;
      if (typeof x === "function") {
        nodeID = x;
      }
      return matrix;
    };

    matrix.xAxis = function(calledG) {
      var nameScale = d3.scale.ordinal()
      .domain(nodesX.map(nodeID))
      .rangePoints([0,size[0]],1);

      var xAxis = d3.svg.axis().scale(nameScale).orient("bottom").tickSize(4);

      calledG
      .append("g")
      .attr("class", "am-xAxis am-axis")
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("transform", "translate(-10,-10) rotate(90)");

    };

    matrix.yAxis = function(calledG) {
      var nameScale = d3.scale.ordinal()
      .domain(nodesY.map(nodeID))
      .rangePoints([0,size[1]],1);

      yAxis = d3.svg.axis().scale(nameScale)
      .orient("left")
      .tickSize(4);

      calledG.append("g")
      .attr("class", "am-yAxis am-axis")
      .call(yAxis);
    };

    matrix.yScale = function() {
      if(square)
        return d3.scale.linear().domain([0,nodes.length]).range([0,size[1]]);
      else
        return d3.scale.linear().domain([0,nodesY.length]).range([0,size[1]]);  
    };
    matrix.xScale = function() {
      if(square)
        return d3.scale.linear().domain([0,nodes.length]).range([0,size[0]]);
      else
        return d3.scale.linear().domain([0,nodesX.length]).range([0,size[0]]);
    };


    return matrix;
  };

})();