package com.yash.copilot;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FeedbackRequest(
		@NotBlank @Size(max = 120) String role,
		@NotBlank @Size(max = 40) String category,
		@NotBlank @Size(max = 1000) String question,
		@NotBlank @Size(max = 12000) String answer) {
}
