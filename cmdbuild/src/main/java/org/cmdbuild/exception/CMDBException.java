package org.cmdbuild.exception;

public abstract class CMDBException extends RuntimeException {
	private static final long serialVersionUID = 1L;
	protected String[] parameters;

	public abstract String getExceptionTypeText();
	public String[] getExceptionParameters() {
		return parameters;
	}
	
	public String getMessage() {
		String message = getExceptionTypeText();
		for(String p:parameters){
			message+=" "+p;
		}
		return message;
	}
}
