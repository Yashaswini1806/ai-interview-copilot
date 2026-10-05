package com.yash.copilot;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AiInterviewCopilotApplicationTests {
	@Autowired
	private MockMvc mockMvc;

	@Test
	void contextLoads() {
	}

	@Test
	void listsInterviewCategories() throws Exception {
		mockMvc.perform(get("/api/categories"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(3)))
				.andExpect(jsonPath("$[0].id").value("behavioral"));
	}

	@Test
	void listsQuestionsForSelectedCategory() throws Exception {
		mockMvc.perform(get("/api/questions").param("category", "technical"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(6)))
				.andExpect(jsonPath("$[0].category").value("technical"));
	}

	@Test
	void rejectsUnknownQuestionCategory() throws Exception {
		mockMvc.perform(get("/api/questions").param("category", "unknown"))
				.andExpect(status().isBadRequest());
	}

	@Test
	void validatesFeedbackRequest() throws Exception {
		mockMvc.perform(post("/api/feedback")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"role":"","category":"Behavioral","question":"Question?","answer":"Answer"}
								"""))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").exists());
	}

	@Test
	void reportsMissingOpenAiKeyForFeedback() throws Exception {
		mockMvc.perform(post("/api/feedback")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"role":"Engineer","category":"Behavioral","question":"Question?","answer":"Answer"}
								"""))
				.andExpect(status().isServiceUnavailable())
				.andExpect(jsonPath("$.message").value(
						"AI feedback is not configured. Set OPENAI_API_KEY on the backend."));
	}
}
