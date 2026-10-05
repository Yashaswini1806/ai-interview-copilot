package com.yash.copilot;

public record InterviewQuestion(
		String id,
		String category,
		String title,
		String guidance,
		int suggestedMinutes) {
}
