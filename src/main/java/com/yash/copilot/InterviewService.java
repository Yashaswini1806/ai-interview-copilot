package com.yash.copilot;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class InterviewService {
	private final HttpClient httpClient = HttpClient.newBuilder()
			.connectTimeout(Duration.ofSeconds(10))
			.build();
	private final ObjectMapper objectMapper;
	private final String apiKey;
	private final String model;
	private final String baseUrl;

	public InterviewService(
			ObjectMapper objectMapper,
			@Value("${openai.api-key:}") String apiKey,
			@Value("${openai.model:gpt-4o-mini}") String model,
			@Value("${openai.base-url:https://api.openai.com/v1}") String baseUrl) {
		this.objectMapper = objectMapper;
		this.apiKey = apiKey;
		this.model = model;
		this.baseUrl = baseUrl;
	}

	public FeedbackResponse getFeedback(FeedbackRequest request) {
		if (apiKey.isBlank()) {
			throw new AiServiceException("AI feedback is not configured. Set OPENAI_API_KEY on the backend.");
		}

		String prompt = """
				You are a kind, practical interview coach. Evaluate the candidate's answer for the role and question below.
				Return only a JSON object with these fields: score (integer 1-10), summary (one concise paragraph),
				strengths (array of 2-3 concise strings), improvements (array of 2-3 actionable strings),
				sampleAnswer (a short example structure that does not invent facts about the candidate).
				Be specific, constructive, and fair. Do not reward length over clarity.

				Role: %s
				Interview type: %s
				Question: %s
				Candidate answer:
				%s
				""".formatted(request.role(), request.category(), request.question(), request.answer());

		try {
			String body = objectMapper.writeValueAsString(Map.of(
					"model", model,
					"input", prompt,
					"max_output_tokens", 700));
			HttpRequest httpRequest = HttpRequest.newBuilder()
					.uri(URI.create(baseUrl.replaceAll("/+$", "") + "/responses"))
					.timeout(Duration.ofSeconds(60))
					.header("Authorization", "Bearer " + apiKey)
					.header("Content-Type", "application/json")
					.POST(HttpRequest.BodyPublishers.ofString(body))
					.build();
			HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
			if (response.statusCode() < 200 || response.statusCode() >= 300) {
				throw new AiServiceException(providerError(response));
			}
			return parseFeedback(extractText(objectMapper.readTree(response.body())));
		} catch (InterruptedException exception) {
			Thread.currentThread().interrupt();
			throw new AiServiceException("The AI feedback request was interrupted.", exception);
		} catch (IOException | IllegalArgumentException exception) {
			throw new AiServiceException("Could not read a valid response from the AI provider.", exception);
		}
	}

	private String providerError(HttpResponse<String> response) {
		try {
			String providerMessage = objectMapper.readTree(response.body())
					.path("error")
					.path("message")
					.asText();
			if (!providerMessage.isBlank()) {
				return "The AI provider returned HTTP " + response.statusCode() + ": " + providerMessage;
			}
		} catch (IOException exception) {
			return "The AI provider returned HTTP " + response.statusCode()
					+ " with an unreadable error response.";
		}
		return "The AI provider returned HTTP " + response.statusCode() + ".";
	}

	private String extractText(JsonNode response) {
		for (JsonNode output : response.path("output")) {
			for (JsonNode content : output.path("content")) {
				if ("output_text".equals(content.path("type").asText())) {
					return content.path("text").asText();
				}
			}
		}
		throw new AiServiceException("The AI provider returned no feedback text.");
	}

	private FeedbackResponse parseFeedback(String text) {
		try {
			JsonNode feedback = objectMapper.readTree(text);
			int score = feedback.path("score").asInt(0);
			if (score < 1 || score > 10
					|| feedback.path("summary").asText().isBlank()
					|| feedback.path("sampleAnswer").asText().isBlank()) {
				throw new AiServiceException("The AI provider returned incomplete feedback.");
			}
			return new FeedbackResponse(
					score,
					feedback.path("summary").asText(),
					readStringList(feedback.path("strengths")),
					readStringList(feedback.path("improvements")),
					feedback.path("sampleAnswer").asText());
		} catch (IOException exception) {
			throw new AiServiceException("The AI provider returned feedback in an unexpected format.", exception);
		}
	}

	private List<String> readStringList(JsonNode values) {
		if (!values.isArray()) {
			throw new AiServiceException("The AI provider returned incomplete feedback.");
		}
		return objectMapper.convertValue(values, objectMapper.getTypeFactory()
				.constructCollectionType(List.class, String.class));
	}

	public static class AiServiceException extends RuntimeException {
		public AiServiceException(String message) {
			super(message);
		}

		public AiServiceException(String message, Throwable cause) {
			super(message, cause);
		}
	}
}
