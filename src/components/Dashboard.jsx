import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { CheckCircle2, Circle, ListTodo, Layers, Flag, Timer, StickyNote } from 'lucide-react'
import AnimatedNumber from './AnimatedNumber'

const CATEGORIES = [
  { id: 'kuliah', label: 'Kuliah', bar: 'bg-sky-500' },
  { id: 'pribadi', label: 'Pribadi', bar: 'bg-emerald-500' },
  { id: 'proyek', label: 'Proyek', bar: 'bg-violet-500' },
]
const RANK = { tinggi: 0, sedang: 1, rendah: 2 }
const FLAG = { tinggi: 'text-red-500', sedang: 'text-amber-500', rendah: 'text-slate-400' }
const RING_R = 52
const RING_C = 2 * Math.PI * RING_R

function greeting(hour) {
  if (hour < 11) return 'Selamat pagi'
  if (hour < 15) return 'Selamat siang'
  if (hour < 18) return 'Selamat sore'
  return 'Selamat malam'
}

export default function Dashboard({ tasks, setTasks, goTo, sessionsToday = 0, notesCount = 0 }) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const total = tasks.length
  const done = tasks.filter((t) => t.done).length
  const remaining = total - done
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)

  const urgent = tasks
    .filter((t) => !t.done)
    .sort((a, b) => (RANK[a.priority] ?? 1) - (RANK[b.priority] ?? 1))
    .slice(0, 4)

  const toggle = (id) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))

  const stats = [
    { label: 'Tugas tersisa', value: remaining, icon: ListTodo, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Selesai', value: done, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Total tugas', value: total, icon: Layers, color: 'bg-slate-100 text-slate-600' },
  ]

  const card = 'rounded-xl border border-slate-200 bg-white p-5'

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-semibold">{greeting(now.getHours())}!</h2>
          <p className="mt-1 text-slate-500">
            {now.toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <p className="text-3xl font-light tabular-nums text-indigo-600">
          {now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            className={`${card} flex items-center gap-4`}
          >
            <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${color}`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold">
                <AnimatedNumber value={value} />
              </p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${card} flex items-center gap-6`}
        >
          <div className="relative h-32 w-32 shrink-0">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
              <circle cx="60" cy="60" r={RING_R} fill="none" strokeWidth="10" className="stroke-slate-100" />
              <motion.circle
                cx="60"
                cy="60"
                r={RING_R}
                fill="none"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={RING_C}
                initial={{ strokeDashoffset: RING_C }}
                animate={{ strokeDashoffset: RING_C * (1 - percent / 100) }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={percent === 100 ? 'stroke-emerald-500' : 'stroke-indigo-500'}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
              <AnimatedNumber value={percent} />%
            </div>
          </div>
          <div>
            <h3 className="font-semibold">Progres hari ini</h3>
            <p className="mt-1 text-sm text-slate-500">
              {total === 0
                ? 'Belum ada tugas. Mulai dari menu Tugas.'
                : percent === 100
                  ? 'Semua tugas selesai. Kerja bagus!'
                  : `${done} dari ${total} tugas sudah selesai.`}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className={card}
        >
          <h3 className="font-semibold">Per kategori</h3>
          <div className="mt-4 space-y-3">
            {CATEGORIES.map((c) => {
              const all = tasks.filter((t) => t.category === c.id)
              const finished = all.filter((t) => t.done).length
              const pct = all.length === 0 ? 0 : (finished / all.length) * 100
              return (
                <div key={c.id}>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{c.label}</span>
                    <span>
                      {finished}/{all.length}
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      className={`h-full rounded-full ${c.bar}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.46 }}
        className={`${card} mt-4`}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Prioritaskan ini dulu</h3>
          <button onClick={() => goTo('tasks')} className="text-sm text-indigo-600 hover:underline">
            Lihat semua
          </button>
        </div>
        {urgent.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">Tidak ada tugas aktif saat ini.</p>
        ) : (
          <ul className="mt-3 space-y-1">
            {urgent.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => toggle(t.id)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-slate-50"
                >
                  <Circle size={18} className="text-slate-300" />
                  <span className="flex-1 text-sm">{t.text}</span>
                  <Flag size={14} className={FLAG[t.priority] ?? FLAG.sedang} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </motion.div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {[
          { id: 'pomodoro', label: 'Pomodoro Timer', hint: `${sessionsToday} sesi fokus hari ini`, icon: Timer },
          { id: 'notes', label: 'Catatan', hint: `${notesCount} catatan tersimpan`, icon: StickyNote },
        ].map(({ id, label, hint, icon: Icon }) => (
          <motion.button
            key={id}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => goTo(id)}
            className={`${card} flex items-center gap-3 text-left`}
          >
            <Icon size={20} className="text-slate-400" />
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-slate-400">{hint}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}