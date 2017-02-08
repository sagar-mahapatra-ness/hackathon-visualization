
function OSRuleConfig(inlineMode,showSps,mode){

	if(typeof(inlineMode) != "undefined" ){
		this.inlineMode = inlineMode; 
	}else
	{
		this.inlineMode = false;
	}

	if(typeof(showSps) != "undefined"){
		this.showSps = showSps; 
	}else
	{
		this.showSps = true;
	}

	if(typeof(mode) != "undefined"){
      this.mode = mode;
	}else {
	  this.mode = OSRuleConfig.modes.WIZARD_MODE;
	}
}

OSRuleConfig.modes = {
	ADD_VC:"add_vc",
	EDIT_VC:"edit_vc",
	ADD_RC:"add_rc",
	EDIT_RC:"edit_rc",
	WIZARD_MODE:"wizardMode"
}; 