import { Sparkles, Trophy, Target, Flame, Zap, NotebookPen, Crown, Timer } from 'lucide-react'

// 'YYYY-MM-DD' menurut jam lokal
export const dayKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// n hari terakhir, urut dari yang terlama sampai hari ini
export function lastDays(n) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push({ key: dayKey(d), date: d })
  }
  return days
}

// Hitung aktivitas per hari: sesi fokus, menit fokus, tugas selesai
export function dailyCounts(tasks, sessions) {
  const focus = {}
  const minutes = {}
  const done = {}
  sessions.forEach((s) => {
    const k = dayKey(new Date(s.finishedAt))
    focus[k] = (focus[k] || 0) + 1
    minutes[k] = (minutes[k] || 0) + s.minutes
  })
  tasks.forEach((t) => {
    if (t.done && t.doneAt) {
      const k = dayKey(new Date(t.doneAt))
      done[k] = (done[k] || 0) + 1
    }
  })
  return { focus, minutes, done }
}

// Hari beruntun yang punya aktivitas. Kalau hari ini belum ada, streak masih hidup sampai kemarin.
export function currentStreak(counts) {
  const active = (k) => (counts.focus[k] || 0) + (counts.done[k] || 0) > 0
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  if (!active(dayKey(d))) d.setDate(d.getDate() - 1)
  let n = 0
  while (active(dayKey(d))) {
    n++
    d.setDate(d.getDate() - 1)
  }
  return n
}

export const ACHIEVEMENTS = [
  { id: 'first-task', title: 'Langkah Pertama', desc: 'Selesaikan 1 tugas', icon: Sparkles, target: 1, value: (c) => c.tasksDone },
  { id: 'ten-tasks', title: 'Produktif', desc: 'Selesaikan 10 tugas', icon: Trophy, target: 10, value: (c) => c.tasksDone },
  { id: 'first-focus', title: 'Fokus Perdana', desc: 'Selesaikan 1 sesi fokus', icon: Target, target: 1, value: (c) => c.sessionsTotal },
  { id: 'deep-work', title: 'Deep Work', desc: '4 sesi fokus dalam sehari', icon: Zap, target: 4, value: (c) => c.maxSessionsDay },
  { id: 'marathon', title: 'Maraton Fokus', desc: 'Total 300 menit fokus', icon: Timer, target: 300, value: (c) => c.minutesTotal },
  { id: 'streak-3', title: 'Konsisten', desc: 'Aktif 3 hari beruntun', icon: Flame, target: 3, value: (c) => c.streak },
  { id: 'writer', title: 'Penulis', desc: 'Buat 5 catatan', icon: NotebookPen, target: 5, value: (c) => c.notesCount },
  { id: 'perfect', title: 'Perfeksionis', desc: 'Selesaikan semua tugas (min. 3)', icon: Crown, target: 1, value: (c) => c.allDone },
]

export function buildContext(tasks, notes, sessions) {
  const counts = dailyCounts(tasks, sessions)
  return {
    counts,
    tasksDone: tasks.filter((t) => t.done).length,
    sessionsTotal: sessions.length,
    minutesTotal: sessions.reduce((sum, s) => sum + s.minutes, 0),
    maxSessionsDay: Math.max(0, ...Object.values(counts.focus)),
    streak: currentStreak(counts),
    notesCount: notes.length,
    allDone: tasks.length >= 3 && tasks.every((t) => t.done) ? 1 : 0,
  }
}

export function evaluate(ctx) {
  return ACHIEVEMENTS.map((a) => {
    const current = Math.min(a.value(ctx), a.target)
    return { ...a, current, unlocked: current >= a.target }
  })
}