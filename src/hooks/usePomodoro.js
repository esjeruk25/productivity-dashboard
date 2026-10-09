import { useState, useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import useLocalStorage from './useLocalStorage'

export const MODES = {
  focus: { label: 'Fokus' },
  short: { label: 'Istirahat' },
  long: { label: 'Istirahat panjang' },
}

export const formatTime = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

// Bunyi tiga nada saat sesi selesai (tanpa file audio)
function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    const ctx = new Ctx()
    ;[660, 880, 1100].forEach((freq, i) => {
      const start = ctx.currentTime + i * 0.25
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.2, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.22)
    })
  } catch {
    /* audio diblokir, abaikan */
  }
}

// Timer ada di App supaya tetap jalan saat pindah halaman
export default function usePomodoro(tasks) {
  const [durations, setDurations] = useLocalStorage('focusboard-durations', {
    focus: 25,
    short: 5,
    long: 15,
  })
  const [sessions, setSessions] = useLocalStorage('focusboard-sessions', [])
  const [muted, setMuted] = useLocalStorage('focusboard-muted', false)
  const [mode, setMode] = useState('focus')
  const [secondsLeft, setSecondsLeft] = useState(durations.focus * 60)
  const [running, setRunning] = useState(false)
  const [focusTaskId, setFocusTaskId] = useState(null)
  const endAt = useRef(0)

  useEffect(() => {
    if (!running) return

    const finish = () => {
      setRunning(false)
      if (!muted) beep()
      let next = 'focus'
      if (mode === 'focus') {
        const task = tasks.find((t) => t.id === focusTaskId)
        const entry = {
          id: Date.now(),
          finishedAt: new Date().toISOString(),
          minutes: durations.focus,
          taskText: task ? task.text : null,
        }
        const updated = [entry, ...sessions]
        setSessions(updated)
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
        const today = new Date().toDateString()
        const count = updated.filter((s) => new Date(s.finishedAt).toDateString() === today).length
        next = count % 4 === 0 ? 'long' : 'short'
      }
      setMode(next)
      setSecondsLeft(durations[next] * 60)
    }

    const id = setInterval(() => {
      const remaining = Math.max(0, Math.round((endAt.current - Date.now()) / 1000))
      setSecondsLeft(remaining)
      if (remaining === 0) {
        clearInterval(id)
        finish()
      }
    }, 250)
    return () => clearInterval(id)
  }, [running, mode, durations, muted, focusTaskId, tasks, sessions, setSessions])

  useEffect(() => {
    document.title = running ? `${formatTime(secondsLeft)} · ${MODES[mode].label}` : 'FocusBoard'
  }, [running, secondsLeft, mode])

  const start = () => {
    endAt.current = Date.now() + secondsLeft * 1000
    setRunning(true)
  }
  const toggle = () => (running ? setRunning(false) : start())
  const switchMode = (m) => {
    setRunning(false)
    setMode(m)
    setSecondsLeft(durations[m] * 60)
  }
  const reset = () => {
    setRunning(false)
    setSecondsLeft(durations[mode] * 60)
  }
  const skip = () => switchMode(mode === 'focus' ? 'short' : 'focus')
  const changeDuration = (m, delta) => {
    const v = Math.min(60, Math.max(1, durations[m] + delta))
    setDurations({ ...durations, [m]: v })
    if (m === mode && !running) setSecondsLeft(v * 60)
  }

  const today = new Date().toDateString()
  const todaySessions = sessions.filter((s) => new Date(s.finishedAt).toDateString() === today)

  return {
    mode, secondsLeft, running, durations, muted, setMuted,
    focusTaskId, setFocusTaskId, todaySessions, sessions,
    toggle, reset, skip, switchMode, changeDuration,
  }
}