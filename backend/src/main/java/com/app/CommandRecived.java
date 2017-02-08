package com.app;

public class CommandRecived {
	private String command = "";
	private String data = "";
	public CommandRecived(){
		this.command = "";
		this.data = "";
	}
	public CommandRecived(String command, String data){
		this.command = command;
		this.data = data;
	}
	public String getCommand() {
		return command;
	}
	public void setCommand(String command) {
		this.command = command;
	}
	public String getData() {
		return data;
	}
	public void setData(String data) {
		this.data = data;
	}
}
