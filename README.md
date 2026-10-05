# goodanswer — AI interview practice

A full-stack interview practice app with a React and Vite frontend and a Spring Boot API. Candidates can choose an interview focus, work through timed questions, draft answers, and request constructive AI feedback.

## Requirements

- Java 21
- Node.js 20.19+ or 22.12+
- An OpenAI API key for AI-generated feedback (optional for question practice)

## Run the backend

From the project root, configure your OpenAI key in the environment and start Spring Boot:

```powershell
$env:OPENAI_API_KEY = "your-key"
.\mvnw.cmd spring-boot:run
```

The API starts at `http://localhost:8081` by default. Set `OPENAI_MODEL` to override the default `gpt-4o-mini` model. Keep API keys on the backend; never put them in frontend environment variables or commit them to source control.

Without `OPENAI_API_KEY`, question practice remains available and the feedback endpoint returns a clear configuration message.

## Run the frontend

In a second terminal:

```powershell
cd ai-interview-copilot
npm install
npm run dev
```

Open the Vite URL printed in the terminal (usually `http://localhost:5173`). During local development, Vite proxies `/api` requests to the backend on port 8081. To use a different backend URL, set `BACKEND_URL` before starting Vite.

## API

- `GET /api/categories` — available interview categories
- `GET /api/questions?category=behavioral` — questions for `behavioral`, `technical`, or `leadership`
- `POST /api/feedback` — AI coach feedback for a role, category, question, and candidate answer

Example feedback request:

```json
{
  "role": "Product designer",
  "category": "Behavioral",
  "question": "Tell me about yourself.",
  "answer": "I am a product designer who..."
}
```

Feedback includes a score from 1 to 10, a summary, strengths, actionable improvements, and an example answer structure. Drafts are held in the browser session and are not stored by the backend.

## Validate

```powershell
.\mvnw.cmd test
```

```powershell
cd ai-interview-copilot
npm run build
```
