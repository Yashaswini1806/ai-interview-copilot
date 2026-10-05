package com.yash.copilot;

public enum InterviewCategory {
	BEHAVIORAL("behavioral", "Behavioral"),
	TECHNICAL("technical", "Technical"),
	LEADERSHIP("leadership", "Leadership");

	private final String value;
	private final String label;

	InterviewCategory(String value, String label) {
		this.value = value;
		this.label = label;
	}

	public String value() {
		return value;
	}

	public String label() {
		return label;
	}

	public static InterviewCategory fromValue(String value) {
		for (InterviewCategory category : values()) {
			if (category.value.equalsIgnoreCase(value)) {
				return category;
			}
		}
		throw new IllegalArgumentException("Unknown interview category: " + value);
	}
}
