package com.yash.copilot;

import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class QuestionCatalog {
	private final List<InterviewQuestion> questions = List.of(
			new InterviewQuestion("behavioral-1", "behavioral", "Tell me about yourself.",
					"Connect your recent experience, strongest skills, and what you want to do next.", 2),
			new InterviewQuestion("behavioral-2", "behavioral", "Tell me about a challenging problem you solved.",
					"Use STAR: explain the situation, your responsibility, the actions you took, and the result.", 3),
			new InterviewQuestion("behavioral-3", "behavioral", "Describe a time you received difficult feedback.",
					"Show how you listened, acted on the feedback, and measured what changed.", 2),
			new InterviewQuestion("behavioral-4", "behavioral", "Tell me about a time you made a mistake.",
					"Take ownership, explain how you fixed it, and share what you changed afterward.", 2),
			new InterviewQuestion("behavioral-5", "behavioral", "How do you prioritize when everything feels urgent?",
					"Explain how you assess impact, communicate trade-offs, and revisit priorities.", 2),
			new InterviewQuestion("behavioral-6", "behavioral", "Describe a disagreement with a teammate.",
					"Focus on understanding their perspective and finding an outcome tied to shared goals.", 2),
			new InterviewQuestion("technical-1", "technical", "How would you design a service that handles a sudden 10x increase in traffic?",
					"Clarify requirements first, then discuss bottlenecks, scaling, resilience, and trade-offs.", 5),
			new InterviewQuestion("technical-2", "technical", "Walk me through how you would debug a slow API endpoint.",
					"Describe how you would measure latency, isolate the bottleneck, and verify a fix.", 3),
			new InterviewQuestion("technical-3", "technical", "How do you decide between SQL and a NoSQL database?",
					"Compare access patterns, consistency, data shape, operational complexity, and scale.", 3),
			new InterviewQuestion("technical-4", "technical", "What happens when you enter a URL in a browser?",
					"Trace the request from DNS and networking through the server and browser rendering.", 4),
			new InterviewQuestion("technical-5", "technical", "How would you make a background job safe to retry?",
					"Cover idempotency, deduplication, failure handling, observability, and delivery guarantees.", 3),
			new InterviewQuestion("technical-6", "technical", "How do you approach testing a change that spans several services?",
					"Explain unit, integration, and contract coverage, plus safe rollout and monitoring.", 3),
			new InterviewQuestion("leadership-1", "leadership", "How do you help a team deliver when priorities keep changing?",
					"Explain how you create clarity, protect focus, and communicate changes and trade-offs.", 3),
			new InterviewQuestion("leadership-2", "leadership", "Tell me about a decision you made without all the information.",
					"Describe how you assessed risk, sought input, made the call, and adapted as you learned.", 3),
			new InterviewQuestion("leadership-3", "leadership", "How do you support someone who is struggling on your team?",
					"Balance empathy with clear expectations, practical support, and regular follow-up.", 3),
			new InterviewQuestion("leadership-4", "leadership", "How do you resolve conflict between two teammates?",
					"Listen impartially, surface the underlying issue, and agree on specific next steps.", 3),
			new InterviewQuestion("leadership-5", "leadership", "How do you measure whether your team is successful?",
					"Connect outcomes to customer or business impact rather than activity alone.", 3),
			new InterviewQuestion("leadership-6", "leadership", "Describe a time you had to influence without authority.",
					"Show how you built alignment, handled concerns, and moved toward a shared outcome.", 3));

	public List<InterviewQuestion> getQuestions(String category) {
		InterviewCategory selected;
		try {
			selected = InterviewCategory.fromValue(category);
		} catch (IllegalArgumentException exception) {
			throw new InvalidCategoryException(exception.getMessage());
		}
		return questions.stream()
				.filter(question -> question.category().equals(selected.value()))
				.toList();
	}

	public List<CategoryResponse> getCategories() {
		return List.of(InterviewCategory.values()).stream()
				.map(category -> new CategoryResponse(category.value(), category.label()))
				.toList();
	}

	public record CategoryResponse(String id, String label) {
	}

	public static class InvalidCategoryException extends RuntimeException {
		public InvalidCategoryException(String message) {
			super(message);
		}
	}
}
