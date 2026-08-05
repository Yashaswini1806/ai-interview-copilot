import React, {useState, useEffect, useRef} from 'react'
import {questions} from '../data/questions'

export default function Practice(){
  const [index,setIndex] = useState(0)
  const [running,setRunning] = useState(false)
  const [seconds,setSeconds] = useState(0)
  const timerRef = useRef<number | null>(null)
  const headingRef = useRef<HTMLHeadingElement | null>(null)

  useEffect(()=>{
    if(running){
      timerRef.current = window.setInterval(()=>{
        setSeconds(s=>s+1)
      },1000)
    }
    return ()=>{
      if(timerRef.current) window.clearInterval(timerRef.current)
    }
  },[running])

  useEffect(()=>{
    setSeconds(0)
    setRunning(false)
    // move focus to the question heading for screen reader users
    if(headingRef.current){
      // defer to after paint so focus is reliable
      window.setTimeout(()=>headingRef.current && headingRef.current.focus(), 0)
    }
  },[index])

  const cur = questions[index]

  return (
    <div className="practice-grid">
      <section className="card" aria-labelledby="q-title">
        <h2 id="q-title" tabIndex={-1} ref={headingRef}>Question</h2>
        <p className="question">{cur.title}</p>
        <div className="controls" role="toolbar" aria-label="practice controls">
          <button className="btn" onClick={()=>setIndex(i=>Math.max(0,i-1))} aria-label="previous question">Prev</button>
          <button className="btn primary" onClick={()=>setRunning(r=>!r)} aria-pressed={running}>{running? 'Pause':'Start'}</button>
          <button className="btn" onClick={()=>setIndex(i=>(i+1)%questions.length)} aria-label="next question">Next</button>
        </div>
        <div style={{marginTop:12}}>
          <div className="timer" aria-live="polite" aria-atomic="true">Time: {Math.floor(seconds/60)}:{String(seconds%60).padStart(2,'0')}</div>
        </div>
        <details style={{marginTop:12}}>
          <summary>Guidance</summary>
          <p>{cur.guidance}</p>
        </details>
      </section>

      <aside className="card">
        <h3>Session</h3>
        <p style={{color:'var(--muted)'}}>Question {index+1} / {questions.length}</p>
        <div style={{marginTop:12}}>
          <label htmlFor="notes" style={{display:'block',marginBottom:6}}>Notes (private)</label>
          <textarea id="notes" rows={8} style={{width:'100%',borderRadius:8,padding:8,background:'#071628',color:'var(--text)',border:'1px solid rgba(255,255,255,0.04)'}} />
        </div>
        <div style={{marginTop:12}}>
          <p style={{margin:0}} className="sr-only">Accessibility tip: use keyboard to navigate controls</p>
        </div>
      </aside>
    </div>
  )
}
