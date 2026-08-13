const paths = {
  career: <><path d="M5 20V8l7-4 7 4v12" /><path d="M9 20v-6h6v6M9 9h.01M15 9h.01" /></>,
  projects: <><path d="M3 6h7l2 2h9v11H3z" /><path d="M3 10h18" /></>,
  studio: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="10" r="2" /><path d="M3 20c0-4 2-7 6-7s6 3 6 7M15 15c3 0 5 2 5 5" /></>,
  market: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /><path d="m3 8 6-5 6 6 6-5" /></>,
  licenses: <><circle cx="8" cy="12" r="5" /><path d="m13 12 8 0M18 12v3M21 12v2" /></>,
  industry: <><path d="M3 21V9l6 4V9l6 4V5h4v16z" /><path d="M7 18h.01M12 18h.01M17 18h.01" /></>,
  charts: <><path d="M4 20V11h4v9M10 20V4h4v16M16 20v-6h4v6M2 20h20" /></>,
  history: <><circle cx="12" cy="12" r="9" /><path d="M12 7v6l4 2M5 4 3 2" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19 13.5v-3l-2-.7-.7-1.7.9-1.9-2.1-2.1-1.9.9-1.7-.7L10.5 2h-3l-.7 2-1.7.7-1.9-.9-2.1 2.1.9 1.9-.7 1.7-2 .7v3l2 .7.7 1.7-.9 1.9 2.1 2.1 1.9-.9 1.7.7.7 2h3l.7-2 1.7-.7 1.9.9 2.1-2.1-.9-1.9.7-1.7z" transform="translate(2.25 0) scale(.82)" /></>,
  speaker: <><path d="M4 10v4h4l5 4V6l-5 4z" /><path d="M16 9c1.5 1.5 1.5 4.5 0 6M19 6c3 3 3 9 0 12" /></>,
  speakerOff: <><path d="M4 10v4h4l5 4V6l-5 4zM17 10l5 5M22 10l-5 5" /></>,
  play: <path d="m8 5 11 7-11 7z" fill="currentColor" stroke="none" />,
  pause: <><path d="M7 5h4v14H7zM14 5h4v14h-4z" fill="currentColor" stroke="none" /></>,
  edit: <><path d="m4 20 4.5-1 10-10-3.5-3.5-10 10zM13.5 7l3.5 3.5" /><path d="M4 20h6" /></>,
  close: <path d="m6 6 12 12M18 6 6 18" />,
}

export function Icon({ name, size = 20, className = '' }) {
  return (
    <svg className={`ui-icon ${className}`.trim()} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {paths[name] ?? paths.projects}
    </svg>
  )
}
