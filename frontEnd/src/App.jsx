import { useState, useRef, useEffect } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  FOUND: 'found',
  NOT_FOUND: 'not_found',
  ERROR: 'error',
  DOWNLOADING: 'downloading',
  SUCCESS: 'success',
}

export default function App() {
  const [studentId, setStudentId]     = useState('')
  const [status, setStatus]           = useState(STATUS.IDLE)
  const [touched, setTouched]         = useState(false)
  const [studentData, setStudentData] = useState(null)
  const inputRef                      = useRef(null)
  const debounceRef                   = useRef(null)

  const isEmpty = studentId.trim() === ''

  // ── Debounced lookup ──────────────────────────────────────────────────────
  useEffect(() => {
    if (isEmpty) {
      setStatus(STATUS.IDLE)
      setStudentData(null)
      return
    }

    setStatus(STATUS.LOADING)
    setStudentData(null)

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/students/${encodeURIComponent(studentId.trim())}`
        )
        if (res.ok) {
          const json = await res.json()
          setStudentData(json.data)
          setStatus(STATUS.FOUND)
        } else if (res.status === 404) {
          setStudentData(null)
          setStatus(STATUS.NOT_FOUND)
        } else {
          setStudentData(null)
          setStatus(STATUS.ERROR)
        }
      } catch {
        setStudentData(null)
        setStatus(STATUS.ERROR)
      }
    }, 600)

    return () => clearTimeout(debounceRef.current)
  }, [studentId, isEmpty])

  // ── Form submit ───────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched(true)
    if (isEmpty || status !== STATUS.FOUND) return

    setStatus(STATUS.DOWNLOADING)

    try {
      const res = await fetch(
        `${API_BASE}/students/${encodeURIComponent(studentId.trim())}/download`
      )

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        alert(json.message || 'Failed to generate PDF.')
        setStatus(STATUS.FOUND)
        return
      }

      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href     = url
      link.download = `RGUKT_Registration_${studentId.trim()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setStatus(STATUS.SUCCESS)
      setTimeout(() => setStatus(STATUS.FOUND), 3000)
    } catch {
      alert('Could not reach the server. Is the backend running?')
      setStatus(STATUS.FOUND)
    }
  }

  // ── Status message ────────────────────────────────────────────────────────
  const getStatusText = () => {
    if (isEmpty && !touched)                 return { text: 'Enter an ID to begin lookup.',     cls: '' }
    if (status === STATUS.LOADING)           return { text: 'Searching student database…',      cls: '' }
    if (status === STATUS.FOUND && studentData)
      return { text: `Matched: ${studentData.name} (${studentData.section})`, cls: 'success' }
    if (status === STATUS.NOT_FOUND)         return { text: 'ID not found in the database.',    cls: 'error' }
    if (status === STATUS.ERROR)             return { text: 'Could not reach the server.',      cls: 'error' }
    if (status === STATUS.DOWNLOADING)       return { text: 'Generating PDF…',                  cls: '' }
    if (status === STATUS.SUCCESS)           return { text: 'PDF downloaded successfully!',     cls: 'success' }
    return { text: 'Ready for lookup.', cls: '' }
  }

  const { text: statusText, cls: statusCls } = getStatusText()

  const btnDisabled =
    status === STATUS.LOADING    ||
    status === STATUS.DOWNLOADING ||
    status === STATUS.NOT_FOUND  ||
    status === STATUS.ERROR      ||
    isEmpty

  return (
    <div className="page">
      <div className="form-card">
        <h3 className="card-title">Student Registration Panel</h3>

        <form id="student-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="studentId">Enter Student ID No.:</label>
            <input
              ref={inputRef}
              id="studentId"
              type="text"
              placeholder="e.g., O251349"
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value.toUpperCase())
                setTouched(true)
              }}
              autoComplete="off"
              spellCheck="false"
              aria-describedby="status-msg"
            />
            <div
              id="status-msg"
              className={`status-msg ${statusCls}`}
              aria-live="polite"
            >
              {statusText}
            </div>
          </div>

          <button
            id="downloadBtn"
            type="submit"
            className="download-btn"
            disabled={btnDisabled}
          >
            {status === STATUS.DOWNLOADING
              ? 'Generating PDF…'
              : status === STATUS.SUCCESS
              ? '✓ PDF Downloaded!'
              : 'Download Form PDF'}
          </button>
        </form>
      </div>
    </div>
  )
}
