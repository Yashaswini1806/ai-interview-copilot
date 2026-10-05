import { useEffect, useMemo, useState } from 'react'

type Category = { id: string; label: string }
type Question = {
  id: string
  category: string
  title: string
  guidance: string
  suggestedMinutes: number
}
type Feedback = {
  score: number
  summary: string
  strengths: string[]
  improvements: string[]
  sampleAnswer: string
}
type ApiError = { message?: string }

const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

async function readError(response: Response) {
  try {
    const body = (await response.json()) as ApiError
    return body.message || `Request failed (${response.status}).`
  } catch {
    return `Request failed (${response.status}).`
  }
}

export default function Practice() {
  const [categories, setCategories] = useState<Category[]>([])
  const [category, setCategory] = useState('behavioral')
  const [role, setRole] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [feedback, setFeedback] = useState<Record<string, Feedback>>({})
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [error, setError] = useState('')
  const [screen, setScreen] = useState<'setup' | 'practice' | 'complete'>('setup')

  useEffect(() => {
    let active = true
    fetch('/api/categories')
      .then(async (response) => {
        if (!response.ok) throw new Error(await readError(response))
        return (await response.json()) as Category[]
      })
      .then((items) => {
        if (active) setCategories(items)
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(
            cause instanceof Error
              ? `${cause.message} Make sure the backend is running.`
              : 'Could not connect to the backend.',
          )
        }
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [running])

  const currentQuestion = questions[index]
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] || '' : ''
  const completedCount = useMemo(
    () => questions.filter((question) => (answers[question.id] || '').trim()).length,
    [answers, questions],
  )
  const feedbackCount = useMemo(
    () => questions.filter((question) => feedback[question.id]).length,
    [feedback, questions],
  )

  async function startPractice() {
    if (!role.trim()) {
      setError('Add a role or job title to personalize your practice.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const response = await fetch(`/api/questions?category=${encodeURIComponent(category)}`)
      if (!response.ok) throw new Error(await readError(response))
      const items = (await response.json()) as Question[]
      if (items.length === 0) throw new Error('No questions are available for this interview type.')
      setQuestions(items)
      setIndex(0)
      setAnswers({})
      setFeedback({})
      setSeconds(0)
      setRunning(true)
      setScreen('practice')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load interview questions.')
    } finally {
      setLoading(false)
    }
  }

  async function requestFeedback() {
    if (!currentQuestion || !currentAnswer.trim()) {
      setError('Write an answer first, then ask your coach for feedback.')
      return
    }
    setError('')
    setFeedbackLoading(true)
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: role.trim(),
          category: categories.find((item) => item.id === category)?.label || category,
          question: currentQuestion.title,
          answer: currentAnswer.trim(),
        }),
      })
      if (!response.ok) throw new Error(await readError(response))
      const result = (await response.json()) as Feedback
      setFeedback((previous) => ({ ...previous, [currentQuestion.id]: result }))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not generate feedback.')
    } finally {
      setFeedbackLoading(false)
    }
  }

  function moveToQuestion(nextIndex: number) {
    setIndex(nextIndex)
    setError('')
  }

  function finishPractice() {
    setRunning(false)
    setScreen('complete')
  }

  function resetPractice() {
    setScreen('setup')
    setQuestions([])
    setAnswers({})
    setFeedback({})
    setSeconds(0)
    setError('')
  }

  if (screen === 'setup') {
    return (
      <main className="page-content">
        <section className="welcome-panel">
          <div className="welcome-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> YOUR NEXT INTERVIEW, BETTER PREPARED</span>
            <h2>Make your next answer <span>your best one.</span></h2>
            <p>Practice out loud or in writing, build a clear story, and get thoughtful AI coaching on what to improve.</p>
            <div className="welcome-points">
              <div><span className="point-icon">01</span><span>Practice at your own pace</span></div>
              <div><span className="point-icon">02</span><span>Get feedback that moves you forward</span></div>
              <div><span className="point-icon">03</span><span>Your answers stay in this session</span></div>
            </div>
          </div>
          <div className="setup-card">
            <div className="card-kicker">LET'S GET STARTED</div>
            <h3>Set up your practice</h3>
            <p className="setup-description">A little context makes your coaching more relevant.</p>
            <label className="field-label" htmlFor="role">Role or job title</label>
            <input
              id="role"
              className="text-input"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !loading) void startPractice()
              }}
              placeholder="e.g. Product designer"
              maxLength={120}
            />
            <label className="field-label" htmlFor="category">Interview focus</label>
            <select
              id="category"
              className="text-input select-input"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              disabled={!categories.length}
            >
              {categories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              {!categories.length && <option value="behavioral">Loading interview types…</option>}
            </select>
            {error && <div className="error-message" role="alert">{error}</div>}
            <button className="btn primary setup-submit" onClick={() => void startPractice()} disabled={loading || !categories.length}>
              {loading ? 'Getting your questions…' : 'Start practicing'} <span aria-hidden="true">→</span>
            </button>
            <div className="setup-footnote"><span aria-hidden="true">✦</span> No pressure. This is practice, not a test.</div>
          </div>
        </section>
        <section className="stats-row" aria-label="Practice features">
          <div className="stat-item"><strong>18</strong><span>curated questions</span></div>
          <div className="stat-divider" />
          <div className="stat-item"><strong>3</strong><span>interview styles</span></div>
          <div className="stat-divider" />
          <div className="stat-item"><strong>1:1</strong><span>personal AI coaching</span></div>
          <div className="stats-note">A calmer way to get interview-ready.</div>
        </section>
      </main>
    )
  }

  if (screen === 'complete') {
    return (
      <main className="page-content completion-wrap">
        <section className="completion-card">
          <div className="completion-icon" aria-hidden="true">✓</div>
          <span className="eyebrow">PRACTICE COMPLETE</span>
          <h2>That was a good use of your time.</h2>
          <p>You showed up and put in the work. That is how confident answers are built.</p>
          <div className="completion-stats">
            <div><strong>{completedCount}<span>/{questions.length}</span></strong><small>answers drafted</small></div>
            <div><strong>{feedbackCount}<span>/{questions.length}</span></strong><small>coach reviews</small></div>
            <div><strong>{formatTime(seconds)}</strong><small>practice time</small></div>
          </div>
          <button className="btn primary setup-submit" onClick={resetPractice}>Practice again <span aria-hidden="true">→</span></button>
        </section>
      </main>
    )
  }

  const currentFeedback = currentQuestion ? feedback[currentQuestion.id] : undefined

  return (
    <main className="page-content practice-page">
      <div className="practice-heading">
        <div>
          <button className="back-link" onClick={resetPractice}>← <span>Back to setup</span></button>
          <h2>Your practice <span>session</span></h2>
          <p>{role} <span className="meta-separator">·</span> {categories.find((item) => item.id === category)?.label} interview</p>
        </div>
        <div className={`session-timer${running ? ' timer-running' : ''}`}>
          <span className="timer-indicator" />
          <div><small>SESSION TIME</small><strong>{formatTime(seconds)}</strong></div>
          <button className="timer-toggle" onClick={() => setRunning((value) => !value)} aria-label={running ? 'Pause timer' : 'Resume timer'}>
            {running ? 'Ⅱ' : '▶'}
          </button>
        </div>
      </div>

      <div className="progress-track" aria-label={`Question ${index + 1} of ${questions.length}`}>
        <div className="progress-fill" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
      </div>

      {error && <div className="error-message practice-error" role="alert">{error}</div>}

      <div className="practice-grid">
        <section className="card question-card" aria-labelledby="question-title">
          <div className="question-meta">
            <span className="question-count">QUESTION {String(index + 1).padStart(2, '0')} <span>/ {String(questions.length).padStart(2, '0')}</span></span>
            <span className="time-estimate"><span aria-hidden="true">◷</span> About {currentQuestion?.suggestedMinutes} min</span>
          </div>
          <h3 id="question-title">{currentQuestion?.title}</h3>
          <div className="guidance-box"><span className="guidance-sparkle" aria-hidden="true">✦</span><p>{currentQuestion?.guidance}</p></div>
          <label className="field-label answer-label" htmlFor="answer">Your answer <span>Take a moment to think it through.</span></label>
          <textarea
            id="answer"
            className="answer-input"
            value={currentAnswer}
            onChange={(event) => {
              if (currentQuestion) {
                setAnswers((previous) => ({ ...previous, [currentQuestion.id]: event.target.value }))
                setFeedback((previous) => {
                  const next = { ...previous }
                  delete next[currentQuestion.id]
                  return next
                })
              }
            }}
            placeholder="Start wherever feels natural. There are no wrong first drafts…"
            maxLength={12000}
          />
          <div className="answer-footer"><span>{currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0} words</span><span>Your draft is only kept in this session</span></div>

          {currentFeedback && (
            <section className="feedback-panel" aria-live="polite">
              <div className="feedback-topline">
                <div><span className="card-kicker">YOUR COACH'S NOTES</span><h4>Good work. Here's how to make it even stronger.</h4></div>
                <div className="score-badge"><strong>{currentFeedback.score}</strong><span>/ 10</span></div>
              </div>
              <p className="feedback-summary">{currentFeedback.summary}</p>
              <div className="feedback-columns">
                <div><h5><span className="feedback-check">✓</span> What worked</h5><ul>{currentFeedback.strengths.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}</ul></div>
                <div><h5><span className="feedback-arrow">↗</span> Try next time</h5><ul>{currentFeedback.improvements.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}</ul></div>
              </div>
              <div className="sample-answer"><span className="card-kicker">A STRONGER STRUCTURE</span><p>{currentFeedback.sampleAnswer}</p></div>
            </section>
          )}

          <div className="question-actions">
            <button className="btn feedback-button" onClick={() => void requestFeedback()} disabled={feedbackLoading || !currentAnswer.trim()}>
              <span aria-hidden="true">✦</span> {feedbackLoading ? 'Your coach is thinking…' : currentFeedback ? 'Get fresh feedback' : 'Get AI feedback'}
            </button>
            <div className="question-nav">
              <button className="btn nav-button" onClick={() => moveToQuestion(Math.max(0, index - 1))} disabled={index === 0}>←</button>
              {index < questions.length - 1 ? (
                <button className="btn primary next-button" onClick={() => moveToQuestion(index + 1)}>Next question <span aria-hidden="true">→</span></button>
              ) : (
                <button className="btn primary next-button" onClick={finishPractice}>Finish session <span aria-hidden="true">✓</span></button>
              )}
            </div>
          </div>
        </section>

        <aside className="session-sidebar">
          <section className="card sidebar-card">
            <div className="sidebar-title"><div><span className="card-kicker">YOUR SESSION</span><h3>Question list</h3></div><span className="list-count">{questions.length}</span></div>
            <nav className="question-list" aria-label="Interview questions">
              {questions.map((question, questionIndex) => (
                <button
                  className={`question-list-item${questionIndex === index ? ' selected' : ''}`}
                  key={question.id}
                  onClick={() => moveToQuestion(questionIndex)}
                  aria-current={questionIndex === index ? 'step' : undefined}
                >
                  <span className={`list-number${answers[question.id]?.trim() ? ' answered' : ''}`}>{answers[question.id]?.trim() ? '✓' : String(questionIndex + 1).padStart(2, '0')}</span>
                  <span className="list-question">{question.title}</span>
                  {feedback[question.id] && <span className="feedback-dot" aria-label="Feedback received" />}
                </button>
              ))}
            </nav>
            <div className="sidebar-progress">
              <div className="sidebar-progress-label"><span>YOUR PROGRESS</span><strong>{completedCount} of {questions.length} answered</strong></div>
              <div className="mini-progress"><span style={{ width: `${(completedCount / questions.length) * 100}%` }} /></div>
            </div>
          </section>
          <section className="coach-tip">
            <div className="tip-icon" aria-hidden="true">✦</div>
            <span className="card-kicker">A LITTLE REMINDER</span>
            <p>Specific examples make memorable answers. Whenever you can, share the <strong>impact</strong> of what you did.</p>
          </section>
          <button className="finish-link" onClick={finishPractice}>End practice session <span aria-hidden="true">→</span></button>
        </aside>
      </div>
    </main>
  )
}
