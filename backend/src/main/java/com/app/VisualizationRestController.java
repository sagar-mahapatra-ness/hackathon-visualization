package com.app;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

@RestController
@RequestMapping("/event")
public class VisualizationRestController {
	
	 @Autowired
	 private  SimpMessagingTemplate messageSender;

	@RequestMapping(method = RequestMethod.POST)
	void captureEvent(@RequestBody EventInfo eventinfo) {
		String filename="";
		System.out.println("eventinfo "+eventinfo.getWidgetype());
		/*if(eventinfo.getWidgetype().equals("one"))
				{
			filename="one.json";
				}
		else if(eventinfo.getWidgetype().equals("two"))
				{
			filename="two.json";
				}		
		else if(eventinfo.getWidgetype().equals("three"))
				{
			filename="three.json";
				}		
		else if(eventinfo.getWidgetype().equals("four"))
				{
			filename="four.json";
				}		
		else if(eventinfo.getWidgetype().equals("five"))
				{
			filename="five.json";
				}		
		else if(eventinfo.getWidgetype().equals("six"))
				{
			filename="six.json";
				}
		else if(eventinfo.getWidgetype().equals("seven"))
				{
			filename="seven.json";
				}*/		
		
			filename = eventinfo.getWidgetype()+".json";
			JSONManipulater fr = new JSONManipulater(filename);
			String data = eventinfo.toJson();
			JsonNode nc = fr.readJson();
			ObjectNode on = eventinfo.mapToObject(); 
			((ArrayNode) nc).add(on);
			String newVal = fr.getJsonString(nc);
			//fr.writeJson(nc);
		if(AppData.instance.getDisplayType().equals(eventinfo.getWidgetype())){	
			messageSender.convertAndSend("/topic/outgoing", new ClientData(fr.getJsonString(on)));
		}
	}

}
