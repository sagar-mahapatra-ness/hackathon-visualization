package com.app;

import java.io.File;
import java.io.IOException;

import com.fasterxml.jackson.core.JsonGenerationException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.util.DefaultPrettyPrinter;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;

public class JSONManipulater {
	private String fileName = "";
	public  JSONManipulater(String fileName){
		this.fileName = fileName;
	}
  
	public JsonNode readJson(){
		String workingDir = System.getProperty("user.dir");
		ObjectMapper mapper = new ObjectMapper();
		JsonNode root = null;
		try {
			root = mapper.readTree(new File(workingDir+"\\"+this.fileName));
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return root;
	}
	
	
	
	public void writeJson(JsonNode jsonDataObject){
		ObjectMapper mapper = new ObjectMapper();
		ObjectWriter writer = mapper.writer();
		String workingDir = System.getProperty("user.dir");
		try {
			writer.writeValue(new File(workingDir+"\\"+this.fileName), jsonDataObject);
		} catch (JsonGenerationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (JsonMappingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	public String getJsonString(JsonNode jsonDataObject){
		ObjectMapper mapper = new ObjectMapper();
		String result = "";
		try {
			result = mapper.writer().writeValueAsString(jsonDataObject);
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return result;
	}
}
