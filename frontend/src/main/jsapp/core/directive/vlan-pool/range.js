function Range(){
	this.startRange = null;
	this.endRange = null;
}

Range.prototype.diserialize = function(range){
   if(typeof range === "string"){
	   var index = range.indexOf("-");	
	   if(index != -1){
	   	 this.startRange = parseInt(range.substring(0, index));
	   	 this.endRange = parseInt(range.substring(index+1));
	   }
  	} else {
  		this.startRange = range.startRange;
	    this.endRange = range.endRange;
  	}
};

Range.prototype.serialize = function(range){
  return ""+this.startRange+"-"+this.endRange;
};

Range.prototype.isPopulated = function(){
  if(this.startRange === null || this.startRange === ""){
     return false;
  }

  if(this.endRange === null || this.endRange === ""){
     return false;
  }

  return true;
};