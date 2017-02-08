function MethodBridge(){
	this.proxy = null;
}

MethodBridge.prototype.registerBridge= function(arg){
  this.proxy = arg;
};

MethodBridge.prototype.call = function(arg){
	if(this.proxy !== null){
		this.proxy(arg);
	}
};