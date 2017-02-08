package com.app;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import com.fasterxml.jackson.databind.JsonNode;



@Controller
public class WSController {
    @MessageMapping("/incoming")
    @SendTo("/topic/outgoing")
    public ClientData greeting(CommandRecived message) throws Exception {
    	JSONManipulater fr = new JSONManipulater("creditcardinf.json");
    	JsonNode jn = fr.readJson();
    	String data = fr.getJsonString(jn);
    	System.out.println("command recived >> ");
        return new ClientData(data);
    }

}
