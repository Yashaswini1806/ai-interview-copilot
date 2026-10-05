package com.yash.copilot;

import java.util.List;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class InterviewController {
	private final QuestionCatalog questionCatalog;
	private final InterviewService interviewService;

	public InterviewController(QuestionCatalog questionCatalog, InterviewService interviewService) {
		this.questionCatalog = questionCatalog;
		this.interviewService = interviewService;
	}

	@GetMapping("/categories")
	public List<QuestionCatalog.CategoryResponse> getCategories() {
		return questionCatalog.getCategories();
	}

	@GetMapping("/questions")
	public List<InterviewQuestion> getQuestions(@RequestParam(defaultValue = "behavioral") String category) {
		try {
			return questionCatalog.getQuestions(category);
		} catch (QuestionCatalog.InvalidCategoryException exception) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage());
		}
	}

	@PostMapping("/feedback")
	public FeedbackResponse getFeedback(@Valid @RequestBody FeedbackRequest request) {
		return interviewService.getFeedback(request);
	}
}
