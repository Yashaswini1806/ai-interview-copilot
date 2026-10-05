import React from 'react'

export default function Header(){
  return (
    <header className="header" role="banner">
      <div className="brand">
        <svg className="brand-mark" width="38" height="38" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
          <rect width="40" height="40" rx="13" fill="#c8f169" />
          <path d="M12 27.5 19.6 12h1l7.4 15.5h-4.3l-1.4-3.1h-5.1l-1.3 3.1H12Zm6.5-6.2h2.9L20 17.8l-1.5 3.5Z" fill="#15231c" />
        </svg>
        <h1>good<span>answer</span></h1>
      </div>
      <div className="header-note"><span className="privacy-dot" /> A little practice goes a long way</div>
    </header>
  )
}
