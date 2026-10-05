package com.yash.copilot;

import java.util.List;

public record FeedbackResponse(
		int score,
		String summary,
		List<String> strengths,
		List<String> improvements,
		String sampleAnswer) {
}
