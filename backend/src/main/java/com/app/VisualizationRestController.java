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
		System.out.println("eventinfo");
		JSONManipulater fr = new JSONManipulater("creditcardinf.json");
		String data = eventinfo.toJson();
		JsonNode nc = fr.readJson();
		ObjectNode on = eventinfo.mapToObject(); 
		((ArrayNode) nc).add(on);
		String newVal = fr.getJsonString(nc);
		fr.writeJson(nc);
		messageSender.convertAndSend("/topic/outgoing", new ClientData(newVal));
	}

}
