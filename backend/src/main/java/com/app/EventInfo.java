package com.app;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class EventInfo {
	private String transactionid = "123";
	private String type    = "gold";
	private String area    = "MH";
	private String value   = "500";
	private String region  =  "Mumbai";
	private String time = "37434";
	
	private String Widgetype="def";
	
	public String getWidgetype() {
		return Widgetype;
	}
	public void setWidgetype(String widgetype) {
		Widgetype = widgetype;
	}
	public String getTransactionid() {
		return transactionid;
	}
	public void setTransactionid(String transactionid) {
		this.transactionid = transactionid;
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public String getArea() {
		return area;
	}
	public void setArea(String area) {
		this.area = area;
	}
	public String getValue() {
		return value;
	}
	public void setValue(String value) {
		this.value = value;
	}
	public String getRegion() {
		return region;
	}
	public void setRegion(String region) {
		this.region = region;
	}
	public String getTime() {
		return time;
	}
	public void setTime(String time) {
		this.time = time;
	}
	public ObjectNode mapToObject(){
		ObjectMapper mapper = new ObjectMapper();
		ObjectNode eventinfo = mapper.createObjectNode();
		eventinfo.put("transactionid", this.getTransactionid());
		eventinfo.put("type", this.getType());
		eventinfo.put("area", this.getArea());
		eventinfo.put("value", this.getValue());
		eventinfo.put("region", this.getRegion());
		eventinfo.put("time",this.getTime());
		return eventinfo;
	}
	public String toJson(){
		return  "\"transactionid\":"+this.transactionid+",\"type\":"+this.type+",\"area\":"+this.area+",\"value\":"+this.value+",\"region\":"+this.region+",\"time\":"+this.time;
	}
}
