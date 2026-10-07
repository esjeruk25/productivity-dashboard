import { useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Play, Pause, RotateCcw, SkipForward, Volume2, VolumeX, Minus, Plus, Target } from 'lucide-react'
import AnimatedNumber from './AnimatedNumber'
import { MODES, formatTime } from '../hooks/usePomodoro'

const THEME = {
  focus: { stroke: 'stroke-indigo-500', btn: 'bg-indigo-600 hover:bg-indigo-700', glow: 'bg-indigo-500' },
  short: { stroke: 'stroke-emerald-500', btn: 'bg-emerald-600 hover:bg-emerald-700', glow: 'bg-emerald-500' },
  long: { stroke: 'stroke-sky-500', btn: 'bg-sky-600 hover:bg-sky-700', glow: 'bg-sky-500' },
}
const R = 120
const C = 2 * Math.PI * R

// Satu digit yang bergulir saat angkanya berganti
function Digit({ value }) {
  return (
    <span className="relative inline-block w-[0.62em] overflow-hidden text-center">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: '-60%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '60%', opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="inline-block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export default function PomodoroPage({ pomo, tasks }) {
  const { mode, secondsLeft, running, durations, muted, focusTaskId, todaySessions } = pomo
  const t = THEME[mode]
  const total = durations[mode] * 60
  const activeTasks = tasks.filter((x) => !x.done).slice(0, 6)
  const count = todaySessions.length
  const cycle = count === 0 ? 0 : count % 4 === 0 ? 4 : count % 4
  const started = secondsLeft < total

  // Spasi = mulai/jeda (kecuali saat sedang mengetik atau fokus di tombol)
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'Space') return
      if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(e.target.tagName)) return
      e.preventDefault()
      pomo.toggle()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pomo])

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Pomodoro</h2>
          <p className="mt-1 text-slate-500">
            Fokus penuh, lalu istirahat. Tekan <kbd className="rounded border border-slate-300 px-1.5 text-xs">Spasi</kbd> untuk mulai atau jeda.
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => pomo.setMuted(!muted)}
          aria-label="Bunyi"
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
        >
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </motion.button>
      </div>

      <div className="mt-6 flex justify-center gap-1 rounded-full bg-slate-100 p-1">
        {Object.entries(MODES).map(([id, m]) => (
          <button
            key={id}
            onClick={() => pomo.switchMode(id)}
            className={`relative flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              mode === id ? 'text-white' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            {mode === id && (
              <motion.span
                layoutId="pomo-mode"
                className="absolute inset-0 rounded-full bg-indigo-600"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative">{m.label}</span>
          </button>
        ))}
      </div>

      <div className="relative mx-auto mt-8 h-72 w-72">
        <motion.div
          className={`absolute inset-6 rounded-full blur-3xl ${t.glow}`}
          animate={running ? { opacity: [0.15, 0.35, 0.15], scale: [1, 1.1, 1] } : { opacity: 0.08, scale: 1 }}
          transition={running ? { repeat: Infinity, duration: 2.5 } : { duration: 0.4 }}
        />
        <svg viewBox="0 0 280 280" className="relative h-full w-full -rotate-90">
          <circle cx="140" cy="140" r={R} fill="none" strokeWidth="12" className="stroke-slate-100" />
          <motion.circle
            cx="140"
            cy="140"
            r={R}
            fill="none"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={C}
            animate={{ strokeDashoffset: C * (1 - secondsLeft / total) }}
            transition={{ duration: 0.5, ease: 'linear' }}
            className={t.stroke}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex text-6xl font-light tabular-nums">
            {formatTime(secondsLeft).split('').map((ch, i) =>
              ch === ':' ? <span key={i} className={running ? 'animate-pulse' : ''}>:</span> : <Digit key={i} value={ch} />,
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">{MODES[mode].label}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <motion.button
          whileTap={{ scale: 0.85, rotate: -90 }}
          onClick={pomo.reset}
          aria-label="Reset"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
        >
          <RotateCcw size={18} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.93 }}
          onClick={pomo.toggle}
          className={`flex h-16 items-center gap-2 rounded-full px-8 font-semibold text-white shadow-lg transition-colors ${t.btn}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={running ? 'pause' : 'play'}
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 45 }}
              transition={{ duration: 0.15 }}
            >
              {running ? <Pause size={22} /> : <Play size={22} />}
            </motion.span>
          </AnimatePresence>
          {running ? 'Jeda' : started ? 'Lanjut' : 'Mulai'}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.85, x: 4 }}
          onClick={pomo.skip}
          aria-label="Lewati"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
        >
          <SkipForward size={18} />
        </motion.button>
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-4">
        <p className="flex items-center gap-2 text-sm font-medium">
          <Target size={16} className="text-indigo-600" />
          Fokus pada tugas
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[{ id: null, text: 'Tanpa tugas' }, ...activeTasks].map((task) => (
            <motion.button
              key={task.id ?? 'none'}
              whileTap={{ scale: 0.94 }}
              onClick={() => pomo.setFocusTaskId(task.id)}
              className={`max-w-[12rem] truncate rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                focusTaskId === task.id
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-600'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {task.text}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {Object.entries(MODES).map(([id, m]) => (
          <div key={id} className="rounded-xl border border-slate-200 bg-white p-3 text-center">
            <p className="text-xs text-slate-500">{m.label}</p>
            <div className="mt-2 flex items-center justify-between">
              <motion.button
                whileTap={{ scale: 0.8 }}
                disabled={running}
                onClick={() => pomo.changeDuration(id, -1)}
                className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30"
              >
                <Minus size={16} />
              </motion.button>
              <span className="text-lg font-semibold tabular-nums">
                <AnimatedNumber value={durations[id]} />
                <span className="ml-0.5 text-xs font-normal text-slate-400">mnt</span>
              </span>
              <motion.button
                whileTap={{ scale: 0.8 }}
                disabled={running}
                onClick={() => pomo.changeDuration(id, 1)}
                className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30"
              >
                <Plus size={16} />
              </motion.button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Sesi hari ini</h3>
          <div className="flex gap-1.5" title="4 sesi fokus = istirahat panjang">
            {[0, 1, 2, 3].map((i) => (
              <motion.span
                key={i}
                animate={{ scale: i < cycle ? 1 : 0.8 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                className={`h-3 w-3 rounded-full ${i < cycle ? 'bg-indigo-500' : 'bg-slate-200'}`}
              />
            ))}
          </div>
        </div>
        {count === 0 ? (
          <p className="mt-3 text-sm text-slate-400">Belum ada sesi fokus selesai. Ayo mulai!</p>
        ) : (
          <ul className="mt-3 space-y-1">
            <AnimatePresence initial={false}>
              {todaySessions.slice(0, 6).map((s) => (
                <motion.li
                  key={s.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50"
                >
                  <span className="truncate">{s.taskText ?? 'Tanpa tugas'}</span>
                  <span className="shrink-0 text-xs text-slate-400">
                    {s.minutes} mnt ·{' '}
                    {new Date(s.finishedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  )
}