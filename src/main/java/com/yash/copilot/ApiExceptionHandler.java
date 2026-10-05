package com.yash.copilot;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException exception) {
		String message = exception.getBindingResult().getFieldErrors().stream()
				.findFirst()
				.map(error -> error.getField() + " " + error.getDefaultMessage())
				.orElse("Request validation failed.");
		return ResponseEntity.badRequest().body(Map.of("message", message));
	}

	@ExceptionHandler(InterviewService.AiServiceException.class)
	public ResponseEntity<Map<String, String>> handleAiService(InterviewService.AiServiceException exception) {
		HttpStatus status = exception.getMessage().startsWith("AI feedback is not configured")
				? HttpStatus.SERVICE_UNAVAILABLE
				: HttpStatus.BAD_GATEWAY;
		return ResponseEntity.status(status).body(Map.of("message", exception.getMessage()));
	}
}
