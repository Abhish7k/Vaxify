package com.vaxify.app.exception;

public class ResourceNotFoundException extends RuntimeException{
    
    public ResourceNotFoundException(String message) {
		super(message);
	}
}
