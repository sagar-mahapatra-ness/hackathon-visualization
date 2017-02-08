function GroupInfo(){
 this.id = "";
 this.name = "";
}

GroupInfo.prototype.init = function( arg){
	this.id = arg.id;
    this.name = arg.name;
};

GroupInfo.prototype.clone = function(){
   var groupInfo = new GroupInfo();
   groupInfo.id = this.id;
   groupInfo.name = this.name;
   return groupInfo;
 };

GroupInfo.prototype.equal = function(arg){
  return ((this.id === arg.id) && (this.name === arg.name));
};


function ASPInfo(){
 this.id = "";
 this.name = "";
}

ASPInfo.prototype.init = function( arg){
	this.id = arg.id;
    this.name = arg.name;
};

ASPInfo.prototype.equal = function( arg ){
  return (this.id === arg.id && this.name === arg.name);
};

ASPInfo.prototype.clone = function(){
   var aspInfo = new ASPInfo();
   aspInfo.id = this.id;
   aspInfo.name = this.name;
   return aspInfo;
 };

function NetworkInfo() {
	this.id = "";
    this.name = "";
}

NetworkInfo.prototype.init = function(arg){
    this.id = arg.id;
    this.name = arg.name;
};

 NetworkInfo.prototype.clone = function(){
   var netInfo = new NetworkInfo();
   netInfo.id = this.id;
   netInfo.name = this.name;
   return netInfo;
 };

 NetworkInfo.prototype.equal = function(arg){
  return ((this.id === arg.id) && (this.name === arg.name));
 };

function SORuleDesc(){
  this.ruleAttribute = "";
  this.matchingCritaria = "";
  this.networkSpec = "";
  this.networkCount = "";
  this.networks = [];
  this.deleted = false;
  this.belongToAGroup = false;
 }
 SORuleDesc.prototype.init = function( arg){
  this.ruleAttribute = arg.ruleAttribute;
  this.matchingCritaria = arg.matchingCritaria;
  this.networkSpec = arg.networkSpec;
  //Use n/w for everything except CIDR which has value 1
  if(arg.ruleAttribute != "1"){
    this.networkCount = arg.networkCount;
    this.networks = [];
      for(var i = 0; i < arg.networks.length; i++ ){
      	var network = new NetworkInfo();
      	 network.init(arg.networks[i]);
      	 this.networks.push(network);
    }
  }
  this.deleted = arg.deleted;
 };



  SORuleDesc.prototype.getJSONDataForPOST = function(){
    var memberList = [];
    switch(this.ruleAttribute){
      case "0":
        /*for(var i=0; i < this.networks.length; i++){
          memberList.push({"id": 0, "networkId": this.networks[i].id, "networkName": this.networks[i].name});  
        }*/
        break;
      case "1":
          console.log("data to create case 1 ",this);
          memberList.push({"id": 0, "cidr": this.networkSpec});
          break;
      case "2":
//          console.log("data to create case 2 ",this);
//          memberList.push({"id": 0, "vmId": this.networkSpec});
          /*for(var j=0; i < this.networks.length; j++){
              memberList.push({"id": 0, "vmId": this.networks[j].id});  
            }*/
          break;
  }
  

  return memberList;
    
 };

 SORuleDesc.prototype.getRegExFormat = function(){
 	var regEx = "";
 	console.log(" this.matchingCritaria "+this.matchingCritaria);
 	if(this.matchingCritaria === SORule.matchingCritarias.IS.id){
 		regEx = "name=\'"+this.networkSpec+"\'";
 	}else if(this.matchingCritaria === SORule.matchingCritarias.BEGIN_WITH.id){
 		regEx = "name=\'"+this.networkSpec+".*\'";
 	}else if(this.matchingCritaria === SORule.matchingCritarias.CONTAINS.id){
 		regEx = "name='\.*"+this.networkSpec+".*\'";
 	}	

 	return regEx;
 };

 SORuleDesc.prototype.getMatchingCritaria = function(reg) {
	//var totalRegex = data.regex.split(";");
	//for(var i=0;i<totalRegex.length-1;i++){
		var conatinsRegex = new RegExp("^[^*]*(?:\\*[^*]*){2}$");
		var startsRegex = new RegExp("^[^*]*(?:\\*[^*]*){1}$");
		var conatinsRegexIs = conatinsRegex.test(reg);
		var startsRegexIs  = startsRegex.test(reg);
		if(conatinsRegexIs){
			this.matchingCritaria = SORule.matchingCritarias.CONTAINS.id;
			this.networkSpec =    reg.substring(8, reg.length-3);
		}else if(startsRegexIs){
			this.matchingCritaria = SORule.matchingCritarias.BEGIN_WITH.id;
			this.networkSpec =    reg.substring(6, reg.length-3);
		}else{
			this.matchingCritaria = SORule.matchingCritarias.IS.id;
			this.networkSpec =    reg.substring(6, reg.length-1);
		}
	//}
	
};

SORuleDesc.prototype.setMatchingCritariaAndNetworkSpec = function(matchingCritaria, networkSpec,ruleAttribute){
	this.matchingCritaria = matchingCritaria;
	this.networkSpec =    networkSpec;
  if(ruleAttribute)
  this.ruleAttribute =  ruleAttribute;
};

SORuleDesc.prototype.initializeFromExistingGroup = function(memberList, ruleAttribute){
       // this.getMatchingCritaria(regEx);
        this.networks = [];
        for(var i =0; i < memberList.length; i++){
          var mem = memberList[i];	
          var netInfo = new NetworkInfo();
          if(ruleAttribute === 0)
            netInfo.id = mem.networkId;
          else if(ruleAttribute >= 2)
            netInfo.id = mem.vmId;
          netInfo.name = mem.networkName;
          this.networks.push(netInfo);
        }
		this.networkCount = this.networks.length;
		
};

SORuleDesc.prototype.clone = function(){
  var sdc = new SORuleDesc();

  sdc.ruleAttribute = this.ruleAttribute;
  sdc.matchingCritaria = this.matchingCritaria;
  sdc.networkSpec = this.networkSpec;
  sdc.networkCount = this.networkCount;
  sdc.networks = [];
  for(var i =0; i< this.networks.length; i++){
     sdc.networks.push(this.networks[i].clone());
  }
  sdc.deleted = this.deleted;
  sdc.belongToAGroup = this.belongToAGroup;

  return sdc;
};

SORuleDesc.prototype.equal = function(arg){
  if(this.ruleAttribute !== arg.ruleAttribute)
  {
    return false;
  }

  if(this.matchingCritaria !== arg.matchingCritaria)
  {
    return false;
  }

  if(this.networkSpec !== arg.networkSpec)
  {
    return false;
  }
  
  if(this.networks.length !== arg.networks.length){
    return false;
  }
  for(var i =0; i<this.networks.length; i++){
    if(!this.networks[i].equal(arg.networks[i]))
    {
         return false;
    }
  }

  return true;
  
};

function SORule(){
	this.dirty = false;
	this.id = "";
	this.ruleDesc = [];
	this.resourceGroupProxy = new ResourceGroups();
	this.groupInfo = new GroupInfo();
	this.aspInfo = new ASPInfo();
	this.precedence = -1;
	this.tempId =  "";
  this.inline = false;
	this.trunkMode = false;
  this.deleted = false;
  this.resourceType = "";
}

SORule.prototype.setDiryFlag = function(arg){
   this.dirty = arg;
};

SORule.ruleAttribute ={
	NETWORK:{name:"Network of workload", id:"0", link:"NETWORK",icon:"share"},
        CIDR : {name:"CIDR", id:"1", link:"CIDR",icon:"language"},
        WORKLOAD:{name:"Workload Name", id:"2", link:"WORKLOAD",icon:"layers"},
        WORKLOAD_APP:{name:"Workload AppID", id:"3", link:"WORKLOAD",icon:"settings_applications"},
        WORKLOAD_OS:{name:"Workload OS", id:"4", link:"WORKLOAD",icon:"",svgpath:"images/ic_os.svg"}
};

SORule.matchingCritarias ={
	IS:{name:"Equals",id:"1", img:"images/ic_equals.svg"},
	CONTAINS:{name:"Contains",id:"2", img:"images/contains.svg"},
	BEGIN_WITH:{name:"Begins With",id:"3", img:"images/ic_begins_with.svg"}
};
SORule.ruleAttributeArray = [SORule.ruleAttribute.NETWORK, SORule.ruleAttribute.CIDR, SORule.ruleAttribute.WORKLOAD,SORule.ruleAttribute.WORKLOAD_APP,SORule.ruleAttribute.WORKLOAD_OS];
SORule.matchingCritariaArray =[SORule.matchingCritarias.IS, SORule.matchingCritarias.CONTAINS, SORule.matchingCritarias.BEGIN_WITH];

SORule.prototype.addSORuleDesc = function(arg) {
  if(this.ruleDesc.length > 0){
   var existing_group = _.find(this.ruleDesc,function(val){
        return  val.networkSpec === arg.networkSpec;
   });
   if(existing_group === undefined){
    this.ruleDesc.push(arg);
   }
  }else{
    this.ruleDesc.push(arg);
  }
 	
};


SORule.prototype.init =  function(arg) {

	this.id = arg.id;
	this.ruleDesc = [];
	for(var i = 0; i < arg.ruleDesc.length; i++ ){
	  var rd = new SORuleDesc();
	  rd.init(arg.ruleDesc[i]);	
      this.ruleDesc.push(rd);
	}
	
	this.resourceGroupProxy = new ResourceGroups();

	this.groupInfo = new GroupInfo();
	this.groupInfo.init(arg.groupInfo);

	this.aspInfo = new ASPInfo();
	this.aspInfo.init(arg.aspInfo);
  this.dirty = arg.dirty;
	this.precedence = arg.precedence;
	this.tempId =  arg.tempId;
  this.inline =  arg.inline;
	this.trunkMode =  arg.trunkMode;
  this.deleted = arg.deleted;
};

SORule.prototype.deleteSORuleDesc = function(arg) {
	
};

SORule.prototype.setResourceGroup = function( arg ) {
	this.resourceGroupProxy = new ResourceGroups();
};
SORule.prototype.equal = function(arg){
  var equalRes = true;

  if(this.ruleDesc.length !== arg.ruleDesc.length){
    return false;
  }

  for(var i =0; i<this.ruleDesc.length; i++){
    if(!this.ruleDesc[i].equal(arg.ruleDesc[i]))
    {
         return false;
    }
  }
  
  if(!(this.groupInfo.equal(arg.groupInfo))){
    return false;
  }

  /*if(!(this.aspInfo.equal(arg.aspInfo))){
    return false;
  }*/
  
  if(this.precedence !== arg.precedence){
    return false;
  }

  
  return true;
};
SORule.prototype.clone = function(){
  var rule = new SORule();
  rule.dirty = this.dirty;
  rule.id = this.id;
  rule.ruleDesc = [];
  for(var i = 0; i< this.ruleDesc.length; i++){
    var tempDesc = this.ruleDesc[i].clone();
    rule.ruleDesc.push(tempDesc);
  }
  rule.resourceGroupProxy = new ResourceGroups();
  rule.groupInfo = this.groupInfo.clone();
  rule.aspInfo = this.aspInfo.clone();
  rule.precedence = this.precedence;
  rule.tempId =  this.tempId;
  rule.inline = this.inline;
  rule.trunkMode = this.trunkMode;
  return rule;
};



SORule.prototype.getResourceGroup = function() {
	this.group = new ResourceGroups();
	return this.group;
};

SORule.prototype.setResourceGroup = function( arg ) {
	this.group = arg;
};

SORule.prototype.getJSONDataForPOST = function(cloudId, tenantId){

   console.log(" SORule getJSONData"); 

    var memberList = [];
    var regEx = "";
    //"name='.*backplane.*';"

    for(var i =0; i < this.ruleDesc.length; i++){
      var memberlistDesc = 	this.ruleDesc[i].getJSONDataForPOST();
      memberList = memberList.concat(memberlistDesc);
      //regEx = regEx + this.ruleDesc[i].getRegExFormat() + ";";
    } 

    
    var resourceType = "";
    var dynamic = true;
    /*switch(this.ruleDesc[0].ruleAttribute){
      case "0":
        resourceType = "NETWORK";
        break;
      case "1":
        resourceType = "CIDR";
        dynamic = false;
        break;
      case "2":
        resourceType = "VM";
        break;

    }*/
    // >=2 checks for VM based 3 conditions  viz. name,appid and os
    if(this.ruleDesc[0].ruleAttribute == "0"){
      resourceType = "NETWORK";
    } else if(this.ruleDesc[0].ruleAttribute == "1"){
      resourceType = "CIDR";
      dynamic = false;
    } else if(this.ruleDesc[0].ruleAttribute >= 2){
      resourceType = "VM";
 
    }
    this.resourceType = resourceType;
    regEx = this.genarateRegExFromRuleDesc(resourceType);
    console.log(" memberList >> "); 
    console.dir(memberList);
    console.log(" regEx >> "+regEx); 

    var data =	{
	  "cloudId": parseInt(cloudId),
	  "dynamic": dynamic,
	  "id": 0,
	  "memberList": memberList,
	  "name": this.groupInfo.name,
	  "precedence": this.precedence,
	  "regex": regEx,
	  "resourceType": resourceType,
	  "tenantId": parseInt(tenantId)
	};

	console.log(" data >> "); 
    console.dir(data);

	return data;
};
SORule.prototype.generateRuleDescFromObject = function(memberList){
  var newRuleDesc = null;
  for (var i = 0; i < memberList.length; i++) {
    newRuleDesc = new SORuleDesc();
    newRuleDesc.setMatchingCritariaAndNetworkSpec(SORule.matchingCritarias.IS.id,memberList[i].cidr);
    this.addNewSORuleDesc(newRuleDesc);
  }
};
function generateArrayData(conditionArray){
    var containCriteriaString = "";
    var startsCriteriaString = "";
    var equalCriteriaString = "";
    var remainingCriterias = [];
    var startsCriteriaArray = [];
    var equalCriteriaArray = [];
    var containCriteriaArray = [];
    //string matches contains criteria if length is 2 else no contains criteria is set
      if(conditionArray.length == 2){
        if(conditionArray[0].indexOf(")") === -1){ 
          //closing bracket checks presence of multiple networks
          containCriteriaString = conditionArray[0].substring(2,conditionArray[0].length);
        } else{
          containCriteriaString = conditionArray[0].substring(3,conditionArray[0].length-1);
        }
        console.log("contains criteria string is ",containCriteriaString);
        containCriteriaArray = containCriteriaString.split("|");
        console.log("contains criteria selected are ",containCriteriaArray);
            
        if(conditionArray[1].indexOf(")|(") === -1){
          //single instance of one of the rules
          if(conditionArray[1].indexOf(")|") !== -1){
            remainingCriterias = conditionArray[1].split(")|");
          } else if(conditionArray[1].indexOf("|(") !== -1) {
            remainingCriterias = conditionArray[1].split("|(");
          } else if(conditionArray[1].indexOf("|") !== -1) {
            remainingCriterias = conditionArray[1].split("|");
          } else {
            remainingCriterias = [conditionArray[1]];
          }
          console.log(conditionArray);
        } else{
            remainingCriterias = conditionArray[1].split(")|(");
            console.log("remaining criteria ",remainingCriterias);
            
        }
        if(remainingCriterias.length == 2){
            if(remainingCriterias[0].indexOf("(") !== -1){
              equalCriteriaArray = remainingCriterias[0].substring(1,remainingCriterias[0].length).split("|");
            } else {
              equalCriteriaArray = remainingCriterias[0].split("|");
            }
            console.log(equalCriteriaArray);
            if(remainingCriterias[1].indexOf(")") !== -1)
              startsCriteriaString = remainingCriterias[1].substring(0,remainingCriterias[1].length-3);
            else
              startsCriteriaString = remainingCriterias[1].substring(0,remainingCriterias[1].length-2);
            console.log("starts criteria ",startsCriteriaString);
            startsCriteriaArray = startsCriteriaString.split("|");
            console.log("start criteria array ",startsCriteriaArray);
          } else {
            //presence of ").*" indicates begins with criteria is present
            if(remainingCriterias[0].indexOf(".*") !== -1){
                startsCriteriaString = remainingCriterias[0].substring(0,remainingCriterias[0].length-2);
                console.log("starts criteria single ",startsCriteriaString);
                startsCriteriaArray = startsCriteriaString.split("|");
                console.log("start criteria array single ",startsCriteriaArray);
              } else {
                equalCriteriaString = remainingCriterias[0].substring(0,remainingCriterias[0].length);
                console.log("equal criteria single ",equalCriteriaString);
                equalCriteriaArray = equalCriteriaString.split("|");
                console.log("equal criteria array single ",equalCriteriaArray);
              }
          }
      } else {
      if(conditionArray[0].indexOf(")|(") === -1){
        //single instance of one of the rules
        if(conditionArray[0].indexOf(")|") !== -1){
          remainingCriterias = conditionArray[0].split(")|");
        } else if(conditionArray[0].indexOf("|(") !== -1) {
          remainingCriterias = conditionArray[0].split("|(");
        } else {
          remainingCriterias = conditionArray;
        }
        console.log(conditionArray);
      } else{
          remainingCriterias = conditionArray[0].split(")|(");
          console.log("remaining criteria ",remainingCriterias);
      }
      if(remainingCriterias.length == 2){
        equalCriteriaArray = remainingCriterias[0].split("|");
        console.log(equalCriteriaArray);
        startsCriteriaString = remainingCriterias[1].substring(0,remainingCriterias[1].length-3);
        console.log("starts criteria ",startsCriteriaString);
        startsCriteriaArray = startsCriteriaString.split("|");
        console.log("start criteria array ",startsCriteriaArray);
      } else {
          //presence of ").*" indicates begins with criteria is present
          if(remainingCriterias[0].indexOf(".*") !== -1 && remainingCriterias[0].indexOf(".*") === 0){
            if(remainingCriterias[0].indexOf("(") !== -1)
              containCriteriaString = remainingCriterias[0].substring(3,remainingCriterias[0].length-3);
            else
              containCriteriaString = remainingCriterias[0].substring(2,remainingCriterias[0].length-2);
              console.log("contains criteria single ",containCriteriaString);
              containCriteriaArray = containCriteriaString.split("|");
              console.log("contain criteria array single ",containCriteriaArray);
            } else if(remainingCriterias[0].indexOf(".*") !== -1){
              if(remainingCriterias[0].indexOf("(") !== -1)
                startsCriteriaString = remainingCriterias[0].substring(1,remainingCriterias[0].length-3);
              else
                startsCriteriaString = remainingCriterias[0].substring(0,remainingCriterias[0].length-2);
              console.log("starts criteria single ",startsCriteriaString);
              startsCriteriaArray = startsCriteriaString.split("|");
              console.log("start criteria array single ",startsCriteriaArray);
            }else {
              if(remainingCriterias[0].indexOf("(") !== -1)
                equalCriteriaString = remainingCriterias[0].substring(1,remainingCriterias[0].length-1);
              else
                equalCriteriaString = remainingCriterias[0];
              console.log("equal criteria single ",equalCriteriaString);
              equalCriteriaArray = equalCriteriaString.split("|");
              console.log("equal criteria array single ",equalCriteriaArray);
            }
        }
      }
        return {'equalCriteriaArray':equalCriteriaArray,'startsCriteriaArray':startsCriteriaArray,'containCriteriaArray':containCriteriaArray};
}
SORule.prototype.generateRuleDescFromRegex = function(regEx,resourceType){
  var newRuleDesc = null;
    var res = regEx.substring(6, regEx.length-2);
    var conditionArray = res.split(".*|");
    //var conditionArray = res.split(").*|(");
    console.log("condition is ",conditionArray);
    var parentDataObj = {};
    if(resourceType === "NETWORK"){
        parentDataObj = generateArrayData(conditionArray);
      for (var i = 0; i < parentDataObj.equalCriteriaArray.length; i++) {
        newRuleDesc = new SORuleDesc();
        newRuleDesc.setMatchingCritariaAndNetworkSpec(SORule.matchingCritarias.IS.id,parentDataObj.equalCriteriaArray[i]);
        this.addNewSORuleDesc(newRuleDesc);
      }
      for (i = 0; i < parentDataObj.startsCriteriaArray.length; i++) {
        newRuleDesc = new SORuleDesc();
        newRuleDesc.setMatchingCritariaAndNetworkSpec(SORule.matchingCritarias.BEGIN_WITH.id,parentDataObj.startsCriteriaArray[i]);
        this.addNewSORuleDesc(newRuleDesc);
      }
      for (i = 0; i < parentDataObj.containCriteriaArray.length; i++) {
        newRuleDesc = new SORuleDesc();
        newRuleDesc.setMatchingCritariaAndNetworkSpec(SORule.matchingCritarias.CONTAINS.id,parentDataObj.containCriteriaArray[i]);
        this.addNewSORuleDesc(newRuleDesc);
      }
    }else if(resourceType === "VM") {
      if(regEx === "name='.*';"){
        this.generateSOdec(['.*'],SORule.matchingCritarias.IS.id,SORule.ruleAttribute.WORKLOAD.id);
      } else {
        var expressionArray = regEx.split(";");
        var mappedString = "";
        var equalCriteriaArrayOS = [];
        var startsCriteriaArrayOS = [];
        var containCriteriaArrayOS = [];
        var equalCriteriaArrayApp = [];
        var startsCriteriaArrayApp = [];
        var containCriteriaArrayApp = [];
        var equalCriteriaArrayName = [];
        var startsCriteriaArrayName = [];
        var containCriteriaArrayName = [];
        var innerArray = [];
        var innerCounter = 0;
        for (var k = expressionArray.length - 1; k >= 0; k--) {
            //this will check if os/app/name is present or not
            var osStartindex = expressionArray[k].indexOf("os");
            var appStartindex = expressionArray[k].indexOf("application");
            var nameStartindex = expressionArray[k].indexOf("name");
            var presentornot = -1;
            var stringTocheck = "";
            if(osStartindex !== -1){
              //presence of ?= shows multiple os present
              if(expressionArray[k].indexOf("?=") !== -1){
                innerArray = expressionArray[k].split("(?=.*os='");
                for (innerCounter = innerArray.length - 1; innerCounter >= 0; innerCounter--) {
                    //means this is the first iteration from end i.e. the last item
                    if(innerArray[innerCounter] !== ""){
                      if(innerCounter === (innerArray.length - 1) ){
                        stringTocheck = innerArray[innerCounter].substring(0,innerArray[innerCounter].length-4);
                      } else {
                        stringTocheck = innerArray[innerCounter].substring(0,innerArray[innerCounter].length-2);
                      }
                      presentornot = stringTocheck.indexOf(".*");
                      if(presentornot === -1){
                        //it is the final string with equal to condition
                        mappedString = stringTocheck;
                        equalCriteriaArrayOS.push(mappedString);
                      } else if(presentornot === 0){ //4 matches os=' these 4 characters
                        console.log(stringTocheck+" :missed value: ");
                        mappedString = stringTocheck.substring(2,stringTocheck.length-2);
                        containCriteriaArrayOS.push(mappedString);
                      } else if(presentornot > 0){ //>4 indicates string is with something like os='a.*'
                        mappedString = stringTocheck.substring(0,stringTocheck.length-2);
                        startsCriteriaArrayOS.push(mappedString);
                      }
                    }
                }

              } else {
                //absence shows single os is present
                presentornot = expressionArray[k].indexOf(".*");
                if(presentornot === -1){
                  //it is the final string with equal to condition
                  mappedString = expressionArray[k].substring(osStartindex+4,expressionArray[k].length-1);
                  equalCriteriaArrayOS.push(mappedString);
                } else if(presentornot === 4){ //4 matches os=' these 4 characters
                  mappedString = expressionArray[k].substring(osStartindex+6,expressionArray[k].length-3);
                  containCriteriaArrayOS.push(mappedString);
                } else if(presentornot > 4){ //>4 indicates string is with something like os='a.*'
                  mappedString = expressionArray[k].substring(osStartindex+4,expressionArray[k].length-3);
                  startsCriteriaArrayOS.push(mappedString);
                }
              }
            }
            else if(appStartindex !== -1){
            //this will check if application is present or not
              if(expressionArray[k].indexOf("?=") !== -1){
                innerArray = expressionArray[k].split("(?=.*application='");
                for (innerCounter = innerArray.length - 1; innerCounter >= 0; innerCounter--) {
                    //means this is the first iteration from end i.e. the last item
                    if(innerArray[innerCounter] !== ""){
                      if(innerArray[innerCounter] !== ""){
                      if(innerCounter === (innerArray.length - 1) ){
                        stringTocheck = innerArray[innerCounter].substring(0,innerArray[innerCounter].length-4);
                      } else {
                        stringTocheck = innerArray[innerCounter].substring(0,innerArray[innerCounter].length-2);
                      }
                      presentornot = stringTocheck.indexOf(".*");
                        console.log("asdfasdf "+stringTocheck);
                      if(presentornot === -1){
                        //it is the final string with equal to condition
                        mappedString = stringTocheck;
                        equalCriteriaArrayApp.push(mappedString);
                      } else if(presentornot === 0){ //4 matches os=' these 4 characters
                        mappedString = stringTocheck.substring(2,stringTocheck.length-2);
                        containCriteriaArrayApp.push(mappedString);
                      } else if(presentornot > 0){ //>4 indicates string is with something like os='a.*'
                        mappedString = stringTocheck.substring(0,stringTocheck.length-2);
                        startsCriteriaArrayApp.push(mappedString);
                      }
                    }
                    }
                }

              } else {
                //absence shows single app is present
                presentornot = expressionArray[k].indexOf(".*");
                if(presentornot === -1){
                  //it is the final string with equal to condition
                  mappedString = expressionArray[k].substring(appStartindex+13,expressionArray[k].length-1);
                  equalCriteriaArrayApp.push(mappedString);
                } else if(presentornot === 13){ //13 matches application=' these 13 characters
                  mappedString = expressionArray[k].substring(appStartindex+15,expressionArray[k].length-3);
                  containCriteriaArrayApp.push(mappedString);
                } else if(presentornot > 13){ //>13 indicates string is with something like os='a.*'
                  mappedString = expressionArray[k].substring(appStartindex+13,expressionArray[k].length-3);
                  startsCriteriaArrayApp.push(mappedString);
                }
              }
            } else if(nameStartindex !== -1){
              /*console.log(nameStartindex+" nameStartindex");
              //absence shows single os is present
                presentornot = expressionArray[k].indexOf(".*");
              console.log("new value s "+expressionArray[k]);
                if(presentornot === -1){
                  //it is the final string with equal to condition
                  mappedString = expressionArray[k].substring(nameStartindex+6,expressionArray[k].length-1);
                  equalCriteriaArrayName.push(mappedString);
                } else if(presentornot === 6){ //13 matches name=' these 13 characters
                  mappedString = expressionArray[k].substring(nameStartindex+8,expressionArray[k].length-3);
                  containCriteriaArrayName.push(mappedString);
                } else if(presentornot > 6){ //>6 indicates string is with something like name='a.*'
                  mappedString = expressionArray[k].substring(nameStartindex+6,expressionArray[k].length-3);
                  startsCriteriaArrayName.push(mappedString);
                }*/
                var arrayData = expressionArray[k].substring(nameStartindex+6,expressionArray[k].length-1).split(".*|");
                parentDataObj = generateArrayData(arrayData);
              }
            }

        //generate sodesc now 
        this.generateSOdec(equalCriteriaArrayOS,SORule.matchingCritarias.IS.id,SORule.ruleAttribute.WORKLOAD_OS.id);
        this.generateSOdec(startsCriteriaArrayOS,SORule.matchingCritarias.BEGIN_WITH.id,SORule.ruleAttribute.WORKLOAD_OS.id);
        this.generateSOdec(containCriteriaArrayOS,SORule.matchingCritarias.CONTAINS.id,SORule.ruleAttribute.WORKLOAD_OS.id);

        this.generateSOdec(equalCriteriaArrayApp,SORule.matchingCritarias.IS.id,SORule.ruleAttribute.WORKLOAD_APP.id);
        this.generateSOdec(startsCriteriaArrayApp,SORule.matchingCritarias.BEGIN_WITH.id,SORule.ruleAttribute.WORKLOAD_APP.id);
        this.generateSOdec(containCriteriaArrayApp,SORule.matchingCritarias.CONTAINS.id,SORule.ruleAttribute.WORKLOAD_APP.id);


        this.generateSOdec(parentDataObj.equalCriteriaArray,SORule.matchingCritarias.IS.id,SORule.ruleAttribute.WORKLOAD.id);
        this.generateSOdec(parentDataObj.startsCriteriaArray,SORule.matchingCritarias.BEGIN_WITH.id,SORule.ruleAttribute.WORKLOAD.id);
        this.generateSOdec(parentDataObj.containCriteriaArray,SORule.matchingCritarias.CONTAINS.id,SORule.ruleAttribute.WORKLOAD.id);
      }


    }
    

};
SORule.prototype.generateSOdec = function(arraytoIterate,matchCriteria,ruleAttribute){
  for (var i = 0; i < arraytoIterate.length; i++) {
    newRuleDesc = new SORuleDesc();
    newRuleDesc.setMatchingCritariaAndNetworkSpec(matchCriteria,arraytoIterate[i],ruleAttribute);
    this.addNewSORuleDesc(newRuleDesc);
  }
};
      
SORule.prototype.genarateRegExFromRuleDesc = function(resourceType)
{
  //CIDR does not require any regex as it is static type of group
  if(resourceType === "CIDR")
    return ;
	/*if(this.matchingCritaria === SORule.matchingCritarias.IS.id){
 		regEx = "name=\'"+this.networkSpec+"\'";
 	}else if(this.matchingCritaria === SORule.matchingCritarias.BEGIN_WITH.id){
 		regEx = "name=\'"+this.networkSpec+".*\'";
 	}else if(this.matchingCritaria === SORule.matchingCritarias.CONTAINS.id){
 		regEx = "name='\.*"+this.networkSpec+".*\'";
 	}*/

 	var isRegexStr = "";	
  var containRegex = "";
  var beginWithRegex = "";
  var matchCtr = "";  
  var networkSpec = "";  
  if(resourceType === "NETWORK"){
       for(var i =0; i < this.ruleDesc.length; i++){
       	    matchCtr = this.ruleDesc[i].matchingCritaria;
            networkSpec =  this.ruleDesc[i].networkSpec;
            if( matchCtr === SORule.matchingCritarias.IS.id){
            	if(isRegexStr === ""){
            		isRegexStr = isRegexStr + networkSpec;
            	}else
            	{
            		isRegexStr = isRegexStr +"|"+ networkSpec;
            	}
            } else if(matchCtr === SORule.matchingCritarias.CONTAINS.id){
                if(containRegex === ""){
            		containRegex = containRegex + networkSpec;
            	}else
            	{
            		containRegex = containRegex +"|"+ networkSpec;
            	}
            }else if(matchCtr === SORule.matchingCritarias.BEGIN_WITH.id){
                if(beginWithRegex === ""){
            		beginWithRegex = beginWithRegex + networkSpec;
            	}else
            	{
            		beginWithRegex = beginWithRegex +"|"+ networkSpec;
            	}
            }
        }

        var finalRegex = "";
        if(containRegex !== ""){
          if(containRegex.indexOf("|") !== -1)
           finalRegex = ".*("+containRegex+").*";
          else
           finalRegex = ".*"+containRegex+".*";
        }

        if(isRegexStr !== ""){
          var isReg = ""; 
         
          if(isRegexStr.indexOf("|") !== -1)
           isReg = "("+isRegexStr+")";
          else
           isReg = isRegexStr;

          if(finalRegex !== ""){
          finalRegex = finalRegex+"|"+isReg;
            } else{
              finalRegex = isReg;
            }
        }

        if(beginWithRegex !== ""){
           var bgRe = "";

           if(beginWithRegex.indexOf("|") !== -1)
           bgRe = "("+beginWithRegex+").*";
          else
           bgRe = ""+beginWithRegex+".*";
         
           if(finalRegex !== ""){
             finalRegex = finalRegex+"|"+bgRe;
            } else{
              finalRegex = bgRe;
            }
        }

    //name='(database|app|web).*';
      var nameRegex = "name=\'"+finalRegex+"\';";
       return nameRegex;
     }
  else if(resourceType === "VM"){
    var nameVM = "";
    var osVM = "";
    var appVM = "";
    var osVMis ="";
    var osVMbegins ="";
    var osVMcontains ="";
    var appVMis ="";
    var appVMbegins ="";
    var appVMcontains ="";
    for(var j =0; j < this.ruleDesc.length; j++){
            matchCtr = this.ruleDesc[j].matchingCritaria;
            networkSpec =  this.ruleDesc[j].networkSpec;
            //ruleAttribute 2 is for workload name
            if(this.ruleDesc[j].ruleAttribute == "2"){
              if( matchCtr === SORule.matchingCritarias.IS.id){
                if(isRegexStr === ""){
                  isRegexStr = isRegexStr + networkSpec;
                }else
                {
                  isRegexStr = isRegexStr +"|"+ networkSpec;
                }
              } else if(matchCtr === SORule.matchingCritarias.CONTAINS.id){
                  if(containRegex === ""){
                  containRegex = containRegex + networkSpec;
                }else
                {
                  containRegex = containRegex +"|"+ networkSpec;
                }
              }else if(matchCtr === SORule.matchingCritarias.BEGIN_WITH.id){
                  if(beginWithRegex === ""){
                  beginWithRegex = beginWithRegex + networkSpec;
                }else
                {
                  beginWithRegex = beginWithRegex +"|"+ networkSpec;
                }
              }
            }else if(this.ruleDesc[j].ruleAttribute == "3"){
              
              if( matchCtr === SORule.matchingCritarias.IS.id){
                if(appVM === ""){
                  appVM = "application='"+ networkSpec + "'";
                }else
                {
                  if(appVM.indexOf("?=") === -1)
                    appVM = "(?=.*"+ appVM + ")";

                  appVM = appVM + "(?=.*application='"+networkSpec+"')";
                }
              } else if(matchCtr === SORule.matchingCritarias.CONTAINS.id){
                  if(appVM === ""){
                    appVM = "application='.*"+ networkSpec + ".*'";
                }else
                {
                  if(appVM.indexOf("?=") === -1)
                    appVM = "(?=.*"+ appVM + ")";

                  appVM = appVM + "(?=.*application='.*"+ networkSpec + ".*')";
                }
              }else if(matchCtr === SORule.matchingCritarias.BEGIN_WITH.id){
                  if(appVM === ""){
                  appVM = "application='"+ networkSpec + ".*'";
                }else
                {
                  if(appVM.indexOf("?=") === -1)
                    appVM = "(?=.*"+ appVM + ")";

                  appVM = appVM + "(?=.*application='"+ networkSpec + ".*')";
                }
              }

            }else if(this.ruleDesc[j].ruleAttribute == "4"){
              if( matchCtr === SORule.matchingCritarias.IS.id){
                if(osVM === ""){
                  osVM = "os='"+ networkSpec + "'";
                }else
                {
                  if(osVM.indexOf("?=") === -1)
                    osVM = "(?=.*"+ osVM + ")";

                  osVM = osVM + "(?=.*os='"+networkSpec+"')";
                }
              } else if(matchCtr === SORule.matchingCritarias.CONTAINS.id){
                  if(osVM === ""){
                    osVM = "os='.*"+ networkSpec + ".*'";
                }else
                {
                  if(osVM.indexOf("?=") === -1)
                    osVM = "(?=.*"+ osVM + ")";

                  osVM = osVM + "(?=.*os='.*"+ networkSpec + ".*')";
                }
              }else if(matchCtr === SORule.matchingCritarias.BEGIN_WITH.id){
                  if(osVM === ""){
                  osVM = "os='"+ networkSpec + ".*'";
                }else
                {
                  if(osVM.indexOf("?=") === -1)
                    osVM = "(?=.*"+ osVM + ")";

                  osVM = osVM + "(?=.*os='"+ networkSpec + ".*')";
                }
              }
            }
        }
      var finalRegexVMName = "";
      if(containRegex !== ""){
          if(containRegex.indexOf("|") !== -1)
           finalRegexVMName = ".*("+containRegex+").*";
          else
           finalRegexVMName = ".*"+containRegex+".*";
        }

        if(isRegexStr !== ""){
          var isRegVM = ""; 
         
          if(isRegexStr.indexOf("|") !== -1)
           isRegVM = "("+isRegexStr+")";
          else
           isRegVM = isRegexStr;

          if(finalRegexVMName !== ""){
          finalRegexVMName = finalRegexVMName+"|"+isRegVM;
            } else{
              finalRegexVMName = isRegVM;
            }
        }

        if(beginWithRegex !== ""){
           var bgReVM = "";

           if(beginWithRegex.indexOf("|") !== -1)
           bgReVM = "("+beginWithRegex+").*";
          else
           bgReVM = ""+beginWithRegex+".*";
         
           if(finalRegexVMName !== ""){
             finalRegexVMName = finalRegexVMName+"|"+bgReVM;
            } else{
              finalRegexVMName = bgReVM;
            }
        }

      if(finalRegexVMName !== "")
        nameVM = "name=\'"+finalRegexVMName+"\';";
      if(appVM !== ""){
        if(appVM.indexOf("?") === -1){
          appVM = appVM + ";";
        } else {
          appVM = appVM + ".*;";
        }
      }
      if(osVM !== ""){
        if(osVM.indexOf("?") === -1){
          osVM = osVM + ";";
        } else {
          osVM = osVM + ".*;";
        }
      }
      return nameVM+appVM+osVM;
    }     
    
};

SORule.prototype.addNewSORuleDesc =function(rds){
  var findDs = _.find(this.ruleDesc,function(desc){
      return (desc.networkSpec === rds.networkSpec) && (desc.matchingCritaria === rds.matchingCritaria);
  });

  if(!findDs){
    this.ruleDesc.push(rds);
  }
};

SORule.prototype.genarateRuleDescFromRegEx = function( regex )
{
   //regex = '.*(VM Network 21|VM Network 23).*| (VM Network 19|VM Network 9)';
   var newRuleDesc = null;
	
   var conatinsRegex = new RegExp("^[^*]*(?:\\*[^*]*){2}$");
   var containsRegEx = /(\.\*\().*(\)\.\*)/;

    if(containsRegEx.test(regex)){
    	var containsVal = containsRegEx.exec(regex);
        console.log(" genarateRuleDescFromRegEx >>>>>>>>>>>> 1");
        console.dir(containsVal);
        if(containsVal.length === 3){
        	var containReg = containsVal[0].substring(3,containsVal[0].length-3);
        	if(containReg.indexOf("|") -1){
               var containRegArray =  containReg.split("|");
                for(var i = 0; i < containRegArray.length; i++){
                    newRuleDesc = new SORuleDesc();
        		        newRuleDesc.setMatchingCritariaAndNetworkSpec(SORule.matchingCritarias.CONTAINS.id,containRegArray[i]);
                    this.addNewSORuleDesc(newRuleDesc);
                }
        	} else{
        		newRuleDesc = new SORuleDesc();
        		newRuleDesc.setMatchingCritariaAndNetworkSpec(SORule.matchingCritarias.CONTAINS.id,containReg);
            this.addNewSORuleDesc(newRuleDesc);
        	}
        }

        regex = regex.substring(containsVal[0].length);
    } 

    // Begins with 
      var beginsWithRegEx = /(\().*(\)\.\*)/;
      if(beginsWithRegEx.test(regex)){
    	var beginsWithVal = beginsWithRegEx.exec(regex);
        console.log(" genarateRuleDescFromRegEx >>>>>>>>>>>> 2");
        console.dir(beginsWithVal);
        if(beginsWithVal.length === 3){
        	var beginWithReg = beginsWithVal[0].substring(1,beginsWithVal[0].length-3);
        	if(beginWithReg.indexOf("|") -1){
               var beginWithRegArray =  beginWithReg.split("|");
                for(var k = 0; k < beginWithRegArray.length; k++){
                 newRuleDesc = new SORuleDesc();
        		 newRuleDesc.setMatchingCritariaAndNetworkSpec(SORule.matchingCritarias.BEGIN_WITH.id, beginWithRegArray[k]);
                 this.addNewSORuleDesc(newRuleDesc);
                }
        	} else{
        		newRuleDesc = new SORuleDesc();
        		newRuleDesc.setMatchingCritariaAndNetworkSpec(SORule.matchingCritarias.BEGIN_WITH.id, beginWithReg);
                this.addNewSORuleDesc(newRuleDesc);
        	}
        }

        regex = regex.substring(beginsWithVal[0].length);
    } 

    var isRegEx = /(\().*(\))/;
      if(isRegEx.test(regex)){
    	var isRegExVal = isRegEx.exec(regex);
        console.log(" genarateRuleDescFromRegEx >>>>>>>>>>>> 3");
        console.dir(isRegExVal);
        if(isRegExVal.length === 3){
        	var isReg = isRegExVal[0].substring(1,isRegExVal[0].length-1);
        	if(isReg.indexOf("|") -1){
               var isRegArray =  isReg.split("|");
                for(var l = 0; l < isRegArray.length; l++){
                  newRuleDesc = new SORuleDesc();
        		      newRuleDesc.setMatchingCritariaAndNetworkSpec(SORule.matchingCritarias.IS.id, isRegArray[l]);
                 this.addNewSORuleDesc(newRuleDesc);
                }
        	} else{
        		newRuleDesc = new SORuleDesc();
        		newRuleDesc.setMatchingCritariaAndNetworkSpec(SORule.matchingCritarias.IS.id, isReg);
            this.raddNewSORuleDesc(newRuleDesc);
        	}
        }

        regex = regex.substring(isRegExVal[0].length);
    } 
    
   console.log(" genarateRuleDescFromRegEx final >>>>>>>>>>> ");
   console.dir(this.ruleDesc);
      
   return this.ruleDesc;
};

SORule.prototype.mergeExistingGroup = function( group ) {

	// clean up if existing group info before merging
    _.remove(this.ruleDesc, function (rd) {
	  return rd.belongToAGroup;
	});
    var resourceTypeId = SORule.ruleAttribute.NETWORK.id;
	/*if(group.resourceType)
	{*/
      _.forOwn(SORule.ruleAttribute, function(value, key) {
		  console.log(key);
		}); 
	//}

	//this.genarateRuleDescFromRegEx(group.regex);
  if(typeof group.resourceType !== "undefined" && group.resourceType === "CIDR"){
    this.generateRuleDescFromObject(group.memberList);
  } else {
    this.generateRuleDescFromRegex(group.regex,group.resourceType);
  }
	/*var totalRegex = group.regex.split(";");
	for(var i=0;i<totalRegex.length-1;i++){
		var newRuleDesc = new SORuleDesc();
		newRuleDesc.belongToAGroup = true;
		newRuleDesc.initializeFromExistingGroup(totalRegex[i], group.memberList, resourceTypeId);
		newRuleDesc.ruleAttribute = 0;
		this.ruleDesc.push(newRuleDesc);
	}*/
  var ruleAttribute = 0;
  switch(group.resourceType){
    case "CIDR" :
      ruleAttribute = 1;
      break;
    case "VM" :
      ruleAttribute = 2;
      break;
  }
	for(var i=0; i < this.ruleDesc.length; i++){
		var newRuleDesc = this.ruleDesc[i];
    
    if(!newRuleDesc.networks.length)
      newRuleDesc.initializeFromExistingGroup(group.memberList,ruleAttribute);

		newRuleDesc.belongToAGroup = true;
    if(!newRuleDesc.ruleAttribute)
		  newRuleDesc.ruleAttribute = ruleAttribute;
	}

	this.groupInfo = new GroupInfo();
	this.groupInfo.id = group.id;
	this.groupInfo.name = group.name;
	this.id = group.id;
	this.precedence = group.precedence;
};

function SORuleUtil(){

}
SORuleUtil.getExistingVitrialChassisJSON = function(vcId, VcName, datapathDeploySpecId,  SORulesRef, exitSubscriptionList){

	console.log("getExistingVitrialChassisJSON exitSubscriptionList ");
	console.dir(exitSubscriptionList);

	var subscriptionList = [];

	/* jshint ignore:start */
	for(var i = 0 ; i < SORulesRef.length; i++){
         var SORuleRef = SORulesRef[i];
         var subDataId = null;
         var subFind = _.find(exitSubscriptionList, function(sl){
         	return SORuleRef.groupInfo.id === sl.resourceGroupId;
         });

         if(subFind){
             subDataId = subFind.id; 
         }
         var subData = {
		      "id": subDataId,
          "inline": SORuleRef.inline,
		      "trunk": SORuleRef.trunkMode,
		      "resourceGroupId": SORuleRef.groupInfo.id,
		      "spsId": SORuleRef.aspInfo.id
		 };

		 subscriptionList.push(subData);
	}
	/* jshint ignore:end */

	var data = {
	  "datapathDeploySpecId": datapathDeploySpecId,
	  "descr": "string",
	  "id": vcId,
	  "name": VcName,
	  "subscriptionList": subscriptionList
	};

	console.log(" SORuleUtil getExistingVitrialChassisJSON ");
	console.dir(data);	

    return data;

};
SORuleUtil.getNewVitrialChassisJSON = function(VcName, datapathDeploySpecId,  SORulesRef){
	
	var subscriptionList = [];
	for(var i = 0 ; i < SORulesRef.length; i++){
         var SORuleRef = SORulesRef[i];
         
         var subData = {
		      "id": 0,
          "inline": SORuleRef.inline,
		      "trunk": SORuleRef.trunkMode,
		      "resourceGroupId": SORuleRef.groupInfo.id,
		      "spsId": SORuleRef.aspInfo.id
		 };

		 subscriptionList.push(subData);
	}

	var data = {
	  "datapathDeploySpecId": datapathDeploySpecId,
	  "descr": "string",
	  "id": 0,
	  "name": VcName,
	  "subscriptionList": subscriptionList
	};

	console.log(" SORuleUtil getVitrialChassisJSON ");
	console.dir(data);	

    return data;
};


