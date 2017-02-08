function Vlan(){
	this.id = "";
	this.name = "";
	this.discription = "";
	this.ranges = [];
}



Vlan.prototype.addRange= function(range){
  this.ranges.push(range);
};

Vlan.prototype.removeRange= function(range){
  
};

Vlan.prototype.diserialize = function(data){
	 // console.log("diserialize ");
	 // console.dir(data);
	 this.id = data.id;
	 this.name = data.name;

	 if(data.ranges)
	 {
	 	var rangesAr = data.ranges;
	 	if(typeof data.ranges === "string"){
	 	 rangesAr = data.ranges.split(",");
	 	}
	 	this.ranges = [];
	 	for(var i=0; i < rangesAr.length; i++){
	 		var range = new Range();
	 		range.diserialize(rangesAr[i]);
	 		this.ranges.push(range);
	 	     //console.log("diserialize 2");
	 	     //console.dir(range);
	 	}
	 }
};

Vlan.prototype.isPopulated = function(){
	if(this.name === ""){
      return false;
	}
	if(this.ranges.length === 0){
	  return false;
	}
    for(var i =0; i < this.ranges.length; i++){
         var range =  this.ranges[i];
         if(!range.isPopulated()){
           return false;
         }
    }  
	return true;
};

Vlan.prototype.serializeRanges = function(){
    var ret = "";
    var appender = "";
	for(var i=0; i < this.ranges.length; i++){
		var range = this.ranges[i];
		if(i===0){
			appender = "";
		} else {
			appender = ",";
		}
		ret = ret +appender+ range.serialize(); 	
	}

	return ret;
};