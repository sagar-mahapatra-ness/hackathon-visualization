package com.app;

public class AppData {
	
	public static final AppData instance = new AppData();

	private String displayType = "one";

	private AppData() {

	}

	public synchronized  String getDisplayType() {
		return displayType;
	}

	public synchronized void setDisplayType(String displayType) {
		this.displayType = displayType;
	}
}
