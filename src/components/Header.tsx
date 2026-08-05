import React from 'react'

export default function Header(){
  return (
    <header className="header" role="banner">
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <svg width="36" height="36" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="10" fill="#0ea5e9" />
          <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#021429">AI</text>
        </svg>
        <h1>AI Interview Copilot</h1>
      </div>
      <nav aria-label="top navigation">
        <a href="#" style={{color:'var(--muted)',textDecoration:'none'}}>Docs</a>
      </nav>
    </header>
  )
}
